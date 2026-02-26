"""
game/router.py
FastAPI router with all RGS-style endpoints:
  POST /authenticate
  POST /play
  POST /endround
  GET  /balance/{session_id}
"""
from __future__ import annotations

from fastapi import APIRouter, HTTPException

from .config import REEL_STRIPS, BONUS_REEL_STRIPS
from .engine import calculate_win, random_stop_indices, SpinResult, WinLine as EngineWinLine
from .models import (
    AuthRequest, AuthResponse,
    PlayRequest, PlayResponse, WinLine as ModelWinLine, WinPosition as ModelWinPosition,
    EndRoundRequest, EndRoundResponse,
    BalanceResponse,
)
from . import session as session_store

router = APIRouter()


# ── /authenticate ─────────────────────────────────────────────────────────────

@router.post("/authenticate", response_model=AuthResponse)
def authenticate(req: AuthRequest) -> AuthResponse:
    """
    Create a new player session and return the starting balance.
    Equivalent to RGSClient.Authenticate() in the ts-client.
    """
    sid = session_store.create_session(
        player_id=req.player_id,
        currency=req.currency,
    )
    data = session_store.get_session(sid)
    assert data is not None

    return AuthResponse(
        session_id=sid,
        player_id=req.player_id,
        balance=data["balance"],
        currency=data["currency"],
    )


# ── /play ────────────────────────────────────────────────────────────────────

@router.post("/play", response_model=PlayResponse)
def play(req: PlayRequest) -> PlayResponse:
    """
    Execute one spin round.
    - Validates session and balance
    - Deducts bet (or consumes one free spin)
    - Runs the math engine
    - Credits winnings and any free-spin awards
    - Returns full spin result
    """
    # ── Validate session ──────────────────────────────────────────────────────
    data = session_store.get_session(req.session_id)
    if data is None:
        raise HTTPException(status_code=404, detail="Session not found. Call /authenticate first.")

    is_free_spin = data["free_spins"] > 0 or req.mode == "freespin"
    active_strips = BONUS_REEL_STRIPS if is_free_spin else REEL_STRIPS
    
    # Calculate effective bet taking feature buys into account
    effective_multiplier = 1
    if req.feature_buy == "free_kick":
        effective_multiplier = 100
    elif req.feature_buy == "extra_time":
        effective_multiplier = 300
    elif req.feature_buy == "bonus_boost":
        effective_multiplier = 2
        
    bet = req.amount * effective_multiplier

    # ── Balance / free-spin check ─────────────────────────────────────────────
    if is_free_spin:
        if data["free_spins"] <= 0:
            raise HTTPException(status_code=400, detail="No free spins remaining.")
        session_store.consume_free_spin(req.session_id)
    else:
        if data["balance"] < bet:
            raise HTTPException(status_code=400, detail="Insufficient balance.")
        session_store.update_balance(req.session_id, -bet)

    # Refresh data after mutation
    data = session_store.get_session(req.session_id)
    assert data is not None

    # ── Spin ──────────────────────────────────────────────────────────────────
    session_store.open_round(req.session_id)
    raw_stops = random_stop_indices(active_strips)
    result: SpinResult = calculate_win(
        stop_indices=raw_stops,
        bet=req.amount,  # Win calculations are based on the BASE bet, not the effective bet
        reel_strips=active_strips,
        is_free_spin=is_free_spin,
        feature_buy=req.feature_buy,
    )

    # ── Credit winnings ───────────────────────────────────────────────────────
    if result.total_win > 0:
        session_store.update_balance(req.session_id, result.total_win)

    # ── Award free spins ──────────────────────────────────────────────────────
    if result.free_spins > 0:
        session_store.add_free_spins(req.session_id, result.free_spins)

    # Refresh again after crediting
    data = session_store.get_session(req.session_id)
    assert data is not None

    # ── Convert internal engine types → Pydantic models ───────────────────────
    def _convert_line(line: EngineWinLine) -> ModelWinLine:
        return ModelWinLine(
            symbol_id=line.symbol_id,
            symbol_name=line.symbol_name,
            count=line.count,
            win_amount=round(line.win_amount, 2),
            ways=line.ways,
            path=[ModelWinPosition(col=p.col, row=p.row) for p in line.path],
        )

    winning_positions_model = [
        [ModelWinPosition(col=wp.col, row=wp.row) for wp in col_list]
        for col_list in result.winning_positions
    ]

    return PlayResponse(
        session_id=req.session_id,
        stop_indices=result.stop_indices,
        grid=result.grid,
        winning_lines=[_convert_line(l) for l in result.winning_lines],
        winning_positions=winning_positions_model,
        total_win=round(result.total_win, 2),
        free_spins_awarded=result.free_spins,
        free_spins_remaining=data["free_spins"],
        balance=data["balance"],
        mode="freespin" if is_free_spin else "base",
    )


# ── /endround ─────────────────────────────────────────────────────────────────

@router.post("/endround", response_model=EndRoundResponse)
def endround(req: EndRoundRequest) -> EndRoundResponse:
    """
    Mark the current round as complete.
    Equivalent to RGSClient.EndRound() in the ts-client.
    """
    data = session_store.get_session(req.session_id)
    if data is None:
        raise HTTPException(status_code=404, detail="Session not found.")

    session_store.close_round(req.session_id)

    return EndRoundResponse(
        session_id=req.session_id,
        balance=data["balance"],
    )


# ── /balance/{session_id} ─────────────────────────────────────────────────────

@router.get("/balance/{session_id}", response_model=BalanceResponse)
def balance(session_id: str) -> BalanceResponse:
    """
    Return the current balance for a session.
    Equivalent to the balance polling used by the ts-client's idle timer.
    """
    data = session_store.get_session(session_id)
    if data is None:
        raise HTTPException(status_code=404, detail="Session not found.")

    return BalanceResponse(
        session_id=session_id,
        balance=data["balance"],
        currency=data["currency"],
    )
