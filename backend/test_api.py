"""
test_api.py - Quick smoke test for all Gradiator RGS API endpoints.
Run with: python test_api.py
"""
import json
import urllib.request
import urllib.error

BASE = "http://localhost:8000"

def post(path, data):
    body = json.dumps(data).encode()
    req = urllib.request.Request(
        f"{BASE}{path}",
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())

def get(path):
    with urllib.request.urlopen(f"{BASE}{path}") as resp:
        return json.loads(resp.read())


print("=" * 60)
print("Gradiator RGS API - Smoke Test")
print("=" * 60)

# 1. Root
root = get("/")
print(f"\n[1] GET /  ->  {root}")

# 2. Authenticate
auth = post("/authenticate", {"player_id": "smoke_test_player", "currency": "USD"})
print(f"\n[2] POST /authenticate")
print(f"    session_id : {auth['session_id']}")
print(f"    balance    : {auth['balance']}")
print(f"    currency   : {auth['currency']}")
sid = auth["session_id"]

# 3. Balance check
bal = get(f"/balance/{sid}")
print(f"\n[3] GET /balance/{{session_id}}")
print(f"    balance    : {bal['balance']}")

# 4. Play (base spin)
play = post("/play", {"session_id": sid, "amount": 100, "mode": "base"})
print(f"\n[4] POST /play  (base, bet=100)")
print(f"    total_win          : {play['total_win']}")
print(f"    balance            : {play['balance']}")
print(f"    free_spins_awarded : {play['free_spins_awarded']}")
print(f"    free_spins_remaining: {play['free_spins_remaining']}")
print(f"    stop_indices       : {play['stop_indices']}")
print(f"    winning_lines      : {len(play['winning_lines'])} line(s)")
for line in play["winning_lines"]:
    print(f"      → {line['count']}x {line['symbol_name']}  win={line['win_amount']}")

# 5. End Round
er = post("/endround", {"session_id": sid})
print(f"\n[5] POST /endround")
print(f"    balance    : {er['balance']}")

# 6. Play again - verify balance updated correctly
play2 = post("/play", {"session_id": sid, "amount": 100, "mode": "base"})
print(f"\n[6] POST /play  (second spin)")
print(f"    total_win  : {play2['total_win']}")
print(f"    balance    : {play2['balance']}")
expected = 10000 - 100 + play['total_win'] - 100 + play2['total_win']
ok = abs(play2['balance'] - expected) < 0.01
print(f"    balance OK : {ok}  (expected {expected:.2f})")

print("\n" + "=" * 60)
print("✅  All endpoints responded successfully!" if ok else "⚠️  Balance mismatch - check logic")
print("=" * 60)
