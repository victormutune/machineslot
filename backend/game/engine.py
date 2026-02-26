"""
game/engine.py
Core slot machine math engine — ported from src/utils/winLogic.ts.
Server-authoritative spin resolution: grid building, payline evaluation,
scatter counting, anti-dry-spin loop.
"""
from __future__ import annotations
import random
from dataclasses import dataclass, field

from .config import (
    SYMBOLS, SCATTER_ID, REEL_STRIPS, PAYLINES, ROWS, COLS
)


# ── Data classes (internal to engine) ────────────────────────────────────────

@dataclass
class WinPosition:
    col: int
    row: int


@dataclass
class WinLine:
    symbol_id: int
    symbol_name: str
    count: int
    win_amount: float
    ways: int = 1
    path: list[WinPosition] = field(default_factory=list)


@dataclass
class SpinResult:
    stop_indices: list[int]
    grid: list[list[int]]          # grid[col][row]
    winning_lines: list[WinLine]
    winning_positions: list[list[WinPosition]]  # per-column
    total_win: float
    free_spins: int


# ── Helpers ───────────────────────────────────────────────────────────────────

def get_visible_grid(
    stop_indices: list[int],
    reel_strips: list[list[int]],
) -> list[list[int]]:
    """
    Build the 5×4 visible grid from stop indices.
    grid[col][row] = symbol_id
    """
    grid: list[list[int]] = []
    for col in range(COLS):
        strip = reel_strips[col]
        reel_symbols = [
            strip[(stop_indices[col] + row) % len(strip)]
            for row in range(ROWS)
        ]
        grid.append(reel_symbols)
    return grid


def _calculate_once(
    stop_indices: list[int],
    bet: float,
    reel_strips: list[list[int]],
    is_free_spin: bool = False,
) -> SpinResult:
    """
    Evaluate one spin result from the given stop indices.
    Mirrors calculateOnce() in winLogic.ts.
    """
    grid = get_visible_grid(stop_indices, reel_strips)

    winning_lines: list[WinLine] = []
    all_winning_positions: set[str] = set()
    total_win = 0.0
    free_spins = 0

    # ── Scatter check (only during base game) ────────────────────────────────
    if not is_free_spin:
        scatter_count = 0
        scatter_positions: list[WinPosition] = []

        for c in range(COLS):
            for r in range(ROWS):
                if grid[c][r] == SCATTER_ID:
                    scatter_count += 1
                    scatter_positions.append(WinPosition(col=c, row=r))

        if scatter_count >= 3:
            for pos in scatter_positions:
                all_winning_positions.add(f"{pos.col},{pos.row}")

            # Only cap Free Spins at 12 if somehow more scatters land
            if scatter_count == 3:
                free_spins = 8
            elif scatter_count == 4:
                free_spins = 10
            elif scatter_count >= 5:
                free_spins = 12

            winning_lines.append(WinLine(
                symbol_id=SCATTER_ID,
                symbol_name=SYMBOLS[SCATTER_ID]["name"],
                count=scatter_count,
                win_amount=0.0,
                ways=1,
                path=scatter_positions,
            ))

    # ── Payline evaluation ────────────────────────────────────────────────────
    for line in PAYLINES:
        symbols_on_line = [grid[col][line[col]] for col in range(COLS)]
        first = symbols_on_line[0]

        if first == SCATTER_ID:
            continue

        match = 1
        for i in range(1, COLS):
            if symbols_on_line[i] == first:
                match += 1
            else:
                break

        if match < 3:
            continue

        sym_data = SYMBOLS.get(first)
        if not sym_data:
            continue

        payout_multiplier = sym_data["payouts"].get(match, 0)
        win_amount = payout_multiplier * bet
        total_win += win_amount

        path = [WinPosition(col=col, row=line[col]) for col in range(match)]
        for pos in path:
            all_winning_positions.add(f"{pos.col},{pos.row}")

        winning_lines.append(WinLine(
            symbol_id=first,
            symbol_name=sym_data["name"],
            count=match,
            win_amount=win_amount,
            ways=1,
            path=path,
        ))

    # ── Build per-column winning positions ────────────────────────────────────
    winning_positions: list[list[WinPosition]] = []
    for col in range(COLS):
        col_winners = [
            WinPosition(col=col, row=row)
            for row in range(ROWS)
            if f"{col},{row}" in all_winning_positions
        ]
        winning_positions.append(col_winners)

    return SpinResult(
        stop_indices=stop_indices,
        grid=grid,
        winning_lines=winning_lines,
        winning_positions=winning_positions,
        total_win=total_win,
        free_spins=free_spins,
    )


# ── Public API ────────────────────────────────────────────────────────────────

def calculate_win(
    stop_indices: list[int],
    bet: float,
    reel_strips: list[list[int]],
    is_free_spin: bool = False,
    feature_buy: str = "none",
    max_attempts: int = 3,
) -> SpinResult:
    """
    Anti-dry-spin wrapper around _calculate_once.
    Also handles feature_buy logic:
    - free_kick: forces 3 scatters
    - extra_time: forces 5 scatters
    - bonus_boost: best of 3 tries for scatters
    Tries up to `max_attempts` times; keeps the first result
    that produces a win, or the last attempt if none do (for base spins).
    """

    final_stops = stop_indices[:]
    
    # Check if we need to force scatters
    if feature_buy in ("free_kick", "extra_time"):
        required_scatters = 5 if feature_buy == "extra_time" else 3
        
        # Pick random columns to drop scatters into
        cols_for_scatters = random.sample(range(COLS), required_scatters)
        
        for col in cols_for_scatters:
            strip = reel_strips[col]
            # Find all positions of scatter on this reel
            scatter_indices = [idx for idx, sym in enumerate(strip) if sym == SCATTER_ID]
            
            if scatter_indices:
                target_scatter_idx = random.choice(scatter_indices)
                # target_scatter_idx is the index on the strip we want to appear in the visible window
                # the visible window spans row 0 to ROWS-1 from the stop_index
                row_offset = random.randint(0, ROWS - 1)
                
                # We want: (stop_index + row_offset) % strip_len == target_scatter_idx
                # So: stop_index = (target_scatter_idx - row_offset) % strip_len
                new_stop = (target_scatter_idx - row_offset) % len(strip)
                final_stops[col] = new_stop
        
        # We only calculate once for feature buys
        res = _calculate_once(final_stops, bet, reel_strips, is_free_spin)
        res.stop_indices = final_stops
        return res

    best_result: SpinResult | None = None
    best_stops: list[int] = []

    for attempt in range(max_attempts):
        current_stops = (
            final_stops
            if attempt == 0
            else [
                (s + random.randint(1, 3)) % len(reel_strips[col])
                for col, s in enumerate(final_stops)
            ]
        )
        result = _calculate_once(current_stops, bet, reel_strips, is_free_spin)
        final_stops = current_stops

        if best_result:
            if result.free_spins > best_result.free_spins or (result.free_spins == best_result.free_spins and result.total_win > best_result.total_win):
                best_result = result
                best_stops = final_stops[:]
        else:
             best_result = result
             best_stops = final_stops[:]

        if feature_buy != "bonus_boost" and result.total_win > 0:
            break
        elif feature_buy == "bonus_boost" and result.free_spins > 0:
            break

    assert best_result is not None
    best_result.stop_indices = best_stops
    return best_result


def random_stop_indices(reel_strips: list[list[int]]) -> list[int]:
    """Generate one random stop index per reel."""
    return [random.randrange(len(strip)) for strip in reel_strips]
