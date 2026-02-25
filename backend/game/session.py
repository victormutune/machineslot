"""
game/session.py
In-memory session store.
Each session holds player identity, balance, currency, free-spin count,
and a flag tracking whether a round is currently open.
"""
from __future__ import annotations
import uuid
from typing import TypedDict

from .config import DEFAULT_BALANCE, DEFAULT_CURRENCY


class SessionData(TypedDict):
    player_id: str
    balance: float
    currency: str
    free_spins: int
    round_open: bool


# Module-level store — keyed by session_id string
_sessions: dict[str, SessionData] = {}


# ── CRUD ──────────────────────────────────────────────────────────────────────

def create_session(
    player_id: str,
    currency: str = DEFAULT_CURRENCY,
    starting_balance: float = DEFAULT_BALANCE,
) -> str:
    """Create a new session and return its ID."""
    session_id = str(uuid.uuid4())
    _sessions[session_id] = SessionData(
        player_id=player_id,
        balance=starting_balance,
        currency=currency,
        free_spins=0,
        round_open=False,
    )
    return session_id


def get_session(session_id: str) -> SessionData | None:
    """Return session data or None if not found."""
    return _sessions.get(session_id)


def require_session(session_id: str) -> SessionData:
    """Return session data or raise KeyError."""
    session = _sessions.get(session_id)
    if session is None:
        raise KeyError(f"Session '{session_id}' not found")
    return session


def update_balance(session_id: str, delta: float) -> float:
    """
    Add `delta` to the session balance (use negative delta to deduct).
    Returns the new balance.
    """
    session = require_session(session_id)
    session["balance"] = round(session["balance"] + delta, 2)
    return session["balance"]


def set_free_spins(session_id: str, count: int) -> None:
    """Set absolute free-spin count for a session."""
    require_session(session_id)["free_spins"] = max(0, count)


def add_free_spins(session_id: str, count: int) -> int:
    """Add free spins and return new total."""
    session = require_session(session_id)
    session["free_spins"] = max(0, session["free_spins"] + count)
    return session["free_spins"]


def consume_free_spin(session_id: str) -> int:
    """
    Decrement free-spin count by 1.
    Returns remaining free spins.
    Raises ValueError if no free spins left.
    """
    session = require_session(session_id)
    if session["free_spins"] <= 0:
        raise ValueError("No free spins remaining")
    session["free_spins"] -= 1
    return session["free_spins"]


def open_round(session_id: str) -> None:
    require_session(session_id)["round_open"] = True


def close_round(session_id: str) -> None:
    require_session(session_id)["round_open"] = False


def delete_session(session_id: str) -> None:
    _sessions.pop(session_id, None)
