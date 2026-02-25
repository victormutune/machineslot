"""
game/config.py
Reel strips, symbols, paylines, and game constants.
Ported exactly from src/assets/assetMap.ts
"""

# ── Symbols ──────────────────────────────────────────────────────────────────
# id → { name, payouts: { 3: x, 4: y, 5: z } }
SYMBOLS: dict[int, dict] = {
    0: {"name": "Yellowcard", "payouts": {3: 15,   4: 90,  5: 450}},
    4: {"name": "Football",   "payouts": {3: 0,    4: 0,   5: 0}},   # scatter
    3: {"name": "Flag",       "payouts": {3: 5,    4: 25,  5: 100}},
    2: {"name": "Boot",       "payouts": {3: 4,    4: 20,  5: 80}},
    8: {"name": "Trophy",     "payouts": {3: 2.8,  4: 14,  5: 55}},
    7: {"name": "Glove",      "payouts": {3: 1.8,  4: 9,   5: 35}},
    6: {"name": "K",          "payouts": {3: 0.6,  4: 4.2, 5: 17}},
    1: {"name": "A",          "payouts": {3: 0.6,  4: 4.2, 5: 17}},
    5: {"name": "Armband",    "payouts": {3: 0.35, 4: 2.2, 5: 8.5}},
    9: {"name": "Whistle",    "payouts": {3: 0.35, 4: 2.2, 5: 8.5}},
}

SCATTER_ID = 4

# ── Reel Strips ───────────────────────────────────────────────────────────────
REEL_1 = [
    6, 1, 5, 9, 6, 1, 5, 9, 6, 1, 5, 9,
    2, 6, 3, 1, 7, 5, 0, 9, 8,
    4, 5, 9, 6, 1, 1, 2, 2,
    9, 6, 7, 5, 3, 1, 0, 8,
    1, 5, 5, 6, 6, 9, 9, 4,
    2, 6, 3, 1, 7, 5, 8, 8, 0,
]

REEL_2 = [
    6, 1, 5, 9, 6, 1, 5, 9, 6, 1, 5, 9,
    2, 6, 3, 1, 7, 5, 0, 9, 8,
    4, 5, 9, 6, 1, 1, 2, 2,
    9, 6, 7, 5, 3, 1, 0, 8,
    1, 5, 5, 6, 6, 9, 9, 7,
    2, 6, 3, 1, 7, 5, 8, 8, 0,
]

REEL_3 = [
    6, 1, 5, 9, 6, 1, 5, 9, 6, 1, 5, 9,
    2, 6, 3, 1, 7, 5, 0, 9, 8,
    5, 5, 9, 6, 1, 1, 2, 2, 4,
    9, 6, 7, 5, 3, 1, 0, 8,
    1, 5, 5, 6, 6, 9, 9, 7,
    2, 6, 3, 1, 7, 5, 8, 8, 0,
]

REEL_4 = [
    6, 1, 5, 9, 6, 1, 5, 9, 6, 1, 5, 9,
    2, 2, 3, 3, 7, 7, 0, 8, 8,
    5, 5, 6, 6, 1, 1, 2, 2, 7,
    9, 9, 7, 7, 3, 3, 0, 8, 8,
    1, 1, 5, 5, 6, 6, 9, 9, 4,
    2, 2, 3, 3, 7, 7, 8, 8, 0,
]

REEL_5 = [
    6, 1, 5, 9, 6, 1, 5, 9, 6, 1, 5, 9,
    2, 2, 3, 3, 7, 7, 0, 8, 8,
    5, 5, 6, 6, 1, 1, 2, 2, 7,
    9, 9, 7, 7, 3, 3, 0, 8, 8,
    1, 1, 5, 5, 6, 6, 9, 9, 4,
    2, 2, 3, 3, 7, 7, 8, 8, 0,
]

REEL_STRIPS: list[list[int]] = [REEL_1, REEL_2, REEL_3, REEL_4, REEL_5]

# Bonus strips (replace low symbols with higher ones, same as assetMap.ts)
BONUS_REEL_1 = [0 if s in (1, 9) else s for s in REEL_1]
BONUS_REEL_2 = [6 if s in (3, 5) else s for s in REEL_2]
BONUS_REEL_3 = [8 if s in (2, 7) else s for s in REEL_3]
BONUS_REEL_4 = [0 if s in (1, 9) else s for s in REEL_4]
BONUS_REEL_5 = [6 if s in (3, 5) else s for s in REEL_5]

BONUS_REEL_STRIPS: list[list[int]] = [
    BONUS_REEL_1, BONUS_REEL_2, BONUS_REEL_3, BONUS_REEL_4, BONUS_REEL_5
]

# ── Grid constants ────────────────────────────────────────────────────────────
ROWS = 4
COLS = 5

# ── Paylines (16 lines) ───────────────────────────────────────────────────────
# Each entry is a list of row-indices [col0_row, col1_row, col2_row, col3_row, col4_row]
PAYLINES: list[list[int]] = [
    [0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1],
    [2, 2, 2, 2, 2],
    [3, 3, 3, 3, 3],
    [0, 1, 2, 1, 0],
    [3, 2, 1, 2, 3],
    [1, 2, 3, 2, 1],
    [2, 1, 0, 1, 2],
    [0, 1, 0, 1, 0],
    [1, 0, 1, 0, 1],
    [2, 3, 2, 3, 2],
    [3, 2, 3, 2, 3],
    [0, 1, 2, 3, 2],
    [2, 1, 2, 1, 2],
    [1, 2, 1, 2, 1],
    [2, 1, 2, 1, 2],
]

# ── Starting balance (for new sessions) ──────────────────────────────────────
DEFAULT_BALANCE = 10_000.0
DEFAULT_CURRENCY = "USD"
