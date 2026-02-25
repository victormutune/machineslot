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

            # Scatter pays 0 coins, grants free spins
            free_spins = (
                2 if scatter_count == 3 else
                3 if scatter_count == 4 else
                4   # 5+ scatters
            )

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
    max_attempts: int = 3,
) -> SpinResult:
    """
    Anti-dry-spin wrapper around _calculate_once.
    Tries up to `max_attempts` times; keeps the first result
    that produces a win, or the last attempt if none do.
    Mirrors calculateWin() in winLogic.ts.
    """
    result: SpinResult | None = None
    final_stops = stop_indices[:]

    for attempt in range(max_attempts):
        current_stops = (
            stop_indices
            if attempt == 0
            else [
                (s + random.randint(1, 3)) % len(reel_strips[col])
                for col, s in enumerate(stop_indices)
            ]
        )
        result = _calculate_once(current_stops, bet, reel_strips, is_free_spin)
        final_stops = current_stops

        if result.total_win > 0:
            break

    assert result is not None
    result.stop_indices = final_stops
    return result


def random_stop_indices(reel_strips: list[list[int]]) -> list[int]:
    """Generate one random stop index per reel."""
    return [random.randrange(len(strip)) for strip in reel_strips]
