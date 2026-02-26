import sys
import os

# Set up path to access backend imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

from game.router import play, authenticate
from game.models import PlayRequest, AuthRequest

def print_result(res):
    print(f"Total Win: {res.total_win}")
    print(f"Free Spins Awarded: {res.free_spins_awarded}")
    print(f"Balance: {res.balance}")
    print("-" * 20)

print("Authenticating...")
auth_res = authenticate(AuthRequest(player_id="test_user", currency="USD"))
sid = auth_res.session_id
print(f"Initial Balance: {auth_res.balance}\n")

print("1. Standard Spin ($1)")
res = play(PlayRequest(session_id=sid, amount=1.0, mode="base", feature_buy="none"))
print_result(res)

print("2. Bonus Boost ($1 Base -> $2 Cost)")
res = play(PlayRequest(session_id=sid, amount=1.0, mode="base", feature_buy="bonus_boost"))
print_result(res)

print("3. Free Kick ($100 Cost, Forces 3 Scatters -> 8 FS)")
res = play(PlayRequest(session_id=sid, amount=1.0, mode="base", feature_buy="free_kick"))
print_result(res)

print("Playing through 1 free spin to check it works properly...")
res = play(PlayRequest(session_id=sid, amount=1.0, mode="freespin", feature_buy="none"))
print_result(res)

print("4. Extra Time ($300 Cost, Forces 5 Scatters -> 12 FS)")
res = play(PlayRequest(session_id=sid, amount=1.0, mode="base", feature_buy="extra_time"))
print_result(res)
