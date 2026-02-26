"""
game/models.py
Pydantic request / response models, mirroring the StakeEngine RGS API shape.
"""
from __future__ import annotations
from pydantic import BaseModel, Field


# ── Auth ──────────────────────────────────────────────────────────────────────

class AuthRequest(BaseModel):
    player_id: str
    currency: str = "USD"


class AuthResponse(BaseModel):
    session_id: str
    player_id: str
    balance: float
    currency: str


# ── Play ──────────────────────────────────────────────────────────────────────

class PlayRequest(BaseModel):
    session_id: str
    amount: float = Field(gt=0, description="Bet amount (must be positive)")
    mode: str = "base"  # "base" | "freespin"
    feature_buy: str = "none"


class WinPosition(BaseModel):
    col: int
    row: int


class WinLine(BaseModel):
    symbol_id: int
    symbol_name: str
    count: int
    win_amount: float
    ways: int = 1
    path: list[WinPosition] = []


class PlayResponse(BaseModel):
    session_id: str
    stop_indices: list[int]                  # final reel stop positions
    grid: list[list[int]]                    # grid[col][row] = symbol_id
    winning_lines: list[WinLine]
    winning_positions: list[list[WinPosition]]  # per-column winning rows
    total_win: float
    free_spins_awarded: int                  # from scatter
    free_spins_remaining: int                # total left in session
    balance: float
    mode: str


# ── End Round ─────────────────────────────────────────────────────────────────

class EndRoundRequest(BaseModel):
    session_id: str


class EndRoundResponse(BaseModel):
    session_id: str
    balance: float


# ── Balance ───────────────────────────────────────────────────────────────────

class BalanceResponse(BaseModel):
    session_id: str
    balance: float
    currency: str


# ── Error ─────────────────────────────────────────────────────────────────────

class ErrorResponse(BaseModel):
    detail: str
