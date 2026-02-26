import { useState, useRef, useEffect, useCallback } from 'react';
import { ASSETS, REEL_STRIPS, BONUS_REEL_STRIPS } from './assets/assetMap';
import SlotMachine, { type SlotMachineHandle } from './components/slot/SlotMachine';
import ControlPanel from './components/ControlPanel';
import GoldenFrame from './components/ui/GoldenFrame';
import Mascot from './components/ui/Mascot';
import WinEffects from './components/slot/WinEffects';
import BuyBonusModal, { type BuyBonusChoice } from './components/modals/BuyBonusModal';
import AutoSpinModal from './components/modals/AutoSpinModal';
import PayTableModal from './components/modals/PayTableModal';
import type { WinResult, WinningPosition } from './slot/winLogic';
import {
  emitBalanceUpdate,
  emitRoundActive,
  fromMicroUnits,
} from './stake/stakeEngineHelpers';
import type { Balance } from 'stake-engine';
import { StakeEngineClient, fromRGSAmount } from './stake/stakeEngineClient';

// ── API config ────────────────────────────────────────────────────────────────
// Used only for the local FastAPI dev backend (fallback when no rgs_url param).
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

// ── Bet levels (display dollars) ──────────────────────────────────────────────
const BET_LEVELS = [1.00, 2.00, 5.00, 10.00, 20.00, 50.00, 100.00];
const DEFAULT_BET_INDEX = 2; // $5.00

// ── API response types ────────────────────────────────────────────────────────

interface ApiWinPosition { col: number; row: number }
interface ApiWinLine {
  symbol_id: number;
  symbol_name: string;
  count: number;
  win_amount: number;
  ways: number;
  path: ApiWinPosition[];
}
interface PlayResponse {
  session_id: string;
  stop_indices: number[];
  grid: number[][];
  winning_lines: ApiWinLine[];
  winning_positions: ApiWinPosition[][];
  total_win: number;
  free_spins_awarded: number;
  free_spins_remaining: number;
  balance: number;
  mode: string;
}

// ── Map API response → WinResult (used by visual components) ─────────────────
function mapToWinResult(resp: PlayResponse): WinResult {
  return {
    totalWin: resp.total_win,
    freeSpins: resp.free_spins_awarded,
    adjustedStopIndices: resp.stop_indices,
    winningLines: resp.winning_lines.map(l => ({
      symbolId: l.symbol_id,
      symbolName: l.symbol_name,
      count: l.count,
      winAmount: l.win_amount,
      ways: l.ways,
      path: l.path.map(p => ({ col: p.col, row: p.row })),
    })),
    winningPositions: resp.winning_positions.map(colList =>
      colList.map((p: ApiWinPosition): WinningPosition => ({ col: p.col, row: p.row }))
    ),
  };
}

// ─────────────────────────────────────────────────────────────────────────────

function App() {
  // --- Session / Balance from server ---
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [balance, setBalance] = useState(10000);
  const [currentBetIndex, setCurrentBetIndex] = useState(DEFAULT_BET_INDEX);
  const currentBet = BET_LEVELS[currentBetIndex];
  const [, setLastWin] = useState(0);
  const [winResult, setWinResult] = useState<WinResult | null>(null);
  const [lastStopIndices, setLastStopIndices] = useState<number[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinCount] = useState(5);

  // Free Spins State (synced from server)
  const [freeSpinsRemaining, setFreeSpinsRemaining] = useState(0);
  const [lastFreeSpinsWon, setLastFreeSpinsWon] = useState(0);

  // UI State
  const [buyBonusOpen, setBuyBonusOpen] = useState(false);
  const [autoSpinEnabled, setAutoSpinEnabled] = useState(false);
  const [, setAutoSpinRemaining] = useState<number | null>(null);
  const [autoSpinModalOpen, setAutoSpinModalOpen] = useState(false);
  const [_statusMessage, setStatusMessage] = useState<string>('GRADIATOR');
  const [payTableOpen, setPayTableOpen] = useState(false);
  const [boostActive] = useState(false);
  
  // Audio State
  const [isMuted, setIsMuted] = useState(false);

  // Track which visual strips to use (for SlotMachine animation)
  const [currentStrips, setCurrentStrips] = useState<number[][]>(REEL_STRIPS);

  const bonusStartBetMultiplierRef = useRef<number>(1);
  const slotMachineRef = useRef<SlotMachineHandle>(null);
  const pendingWinRef = useRef<number>(0);
  const pendingWinResultRef = useRef<WinResult | null>(null);
  const pendingFreeSpinsRef = useRef<number>(0);
  const autoSpinRef = useRef(false);
  const autoSpinRemainingRef = useRef<number | null>(null);
  // Holds the StakeEngineClient instance when launched via a real casino operator URL.
  const rgsClientRef = useRef<StakeEngineClient | null>(null);

  // ── Audio References ───────────────────────────────────────────────────────
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const spinStartAudioRef = useRef<HTMLAudioElement | null>(null);
  const spinStopAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioInitializedRef = useRef(false);

  // Initialize Audio Elements
  useEffect(() => {
    bgMusicRef.current = new Audio(ASSETS.audio.bgMusic);
    bgMusicRef.current.loop = true;
    bgMusicRef.current.volume = 0.3; // Lower volume for BGM

    spinStartAudioRef.current = new Audio(ASSETS.audio.spinStart);
    spinStartAudioRef.current.volume = 0.7;

    spinStopAudioRef.current = new Audio(ASSETS.audio.spinStop);
    spinStopAudioRef.current.volume = 0.7;

    return () => {
      bgMusicRef.current?.pause();
      spinStartAudioRef.current?.pause();
      spinStopAudioRef.current?.pause();
    };
  }, []);

  // Sync mute state to audio elements
  useEffect(() => {
    if (bgMusicRef.current) bgMusicRef.current.muted = isMuted;
    if (spinStartAudioRef.current) spinStartAudioRef.current.muted = isMuted;
    if (spinStopAudioRef.current) spinStopAudioRef.current.muted = isMuted;
  }, [isMuted]);

  const initAudio = useCallback(() => {
    if (!audioInitializedRef.current && bgMusicRef.current) {
      bgMusicRef.current.play().catch(console.error);
      audioInitializedRef.current = true;
    }
  }, []);

  // ── Authenticate on mount ──────────────────────────────────────────────────
  // Also subscribe to stake-engine balanceUpdate events so external tools
  // (e.g. stake-engine idle timer) can push balance refreshes into our state.
  useEffect(() => {
    const onBalanceUpdate = (e: Event) => {
      const ev = e as CustomEvent<Balance>;
      // Convert micro-units back to dollars
      setBalance(fromMicroUnits(ev.detail.amount));
    };
    window.addEventListener('balanceUpdate', onBalanceUpdate);
    return () => window.removeEventListener('balanceUpdate', onBalanceUpdate);
  }, []);

  useEffect(() => {
    const authenticate = async () => {
      // ── Tier 1: Real Stake Engine RGS (casino operator URL params) ────────
      const rgsClient = StakeEngineClient.fromURL();
      if (rgsClient) {
        try {
          const authResp = await rgsClient.authenticate();
          rgsClientRef.current = rgsClient;
          const dollarBalance = fromRGSAmount(authResp.balance.amount);
          setSessionId(authResp.balance.currency); // use currency as a session key token
          setBalance(dollarBalance);
          emitBalanceUpdate(dollarBalance, authResp.balance.currency);
          console.info('[Gradiator] Authenticated via Stake Engine RGS.');
          return;
        } catch (err) {
          console.warn('[Gradiator] Stake Engine RGS auth failed, trying local backend:', err);
        }
      }

      // ── Tier 2: Local FastAPI dev backend ────────────────────────────────
      try {
        const res = await fetch(`${API_URL}/authenticate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ player_id: 'player_' + Date.now(), currency: 'USD' }),
        });
        if (!res.ok) throw new Error('Auth failed');
        const data = await res.json();
        setSessionId(data.session_id);
        setBalance(data.balance);
        emitBalanceUpdate(data.balance, data.currency ?? 'USD');
        console.info('[Gradiator] Authenticated via local FastAPI backend.');
      } catch (err) {
        // ── Tier 3: Offline fallback ────────────────────────────────────────
        console.error('[Gradiator] Auth error — playing offline with local balance:', err);
        setSessionId(null);
        emitBalanceUpdate(10000, 'USD');
      }
    };
    authenticate();
  }, []);

  // ── Bet controls ──────────────────────────────────────────────────────────
  const increaseBet = () => setCurrentBetIndex(prev => Math.min(prev + 1, BET_LEVELS.length - 1));
  const decreaseBet = () => setCurrentBetIndex(prev => Math.max(0, prev - 1));

  // ── Auto-spin controls ────────────────────────────────────────────────────
  const startAutoSpin = (count: number | null) => {
    autoSpinRef.current = true;
    autoSpinRemainingRef.current = count;
    setAutoSpinRemaining(count);
    setAutoSpinEnabled(true);
    setAutoSpinModalOpen(false);
    if (!isSpinning) handleSpinStart();
  };

  const stopAutoSpin = useCallback(() => {
    autoSpinRef.current = false;
    autoSpinRemainingRef.current = null;
    setAutoSpinRemaining(null);
    setAutoSpinEnabled(false);
  }, []);

  // ── Spin start ────────────────────────────────────────────────────────────
  const handleSpinStart = useCallback(async (featureBuy: string = 'none') => {
    initAudio(); // Ensure audio context is started on first interaction
    if (isSpinning) return;
    
    // Play Spin Start Sound
    if (spinStartAudioRef.current) {
      spinStartAudioRef.current.currentTime = 0;
      spinStartAudioRef.current.play().catch(console.error);
    }
    
    setLastFreeSpinsWon(0);
    setStatusMessage('Good luck!');

    // For Bonus Buys (free_kick / extra_time), we trigger a base spin internally
    // that forces the scatters to land. So it counts as a base spin for the math engine.
    const isFreeSpin = freeSpinsRemaining > 0 && featureBuy === 'none';
    const activeStrips = isFreeSpin ? BONUS_REEL_STRIPS : REEL_STRIPS;
    setCurrentStrips(activeStrips);
    
    // Determine the effective bet cost
    let effectiveBetMultiplier = 1;
    if (isFreeSpin) {
      effectiveBetMultiplier = bonusStartBetMultiplierRef.current;
    } else if (featureBuy === 'free_kick') {
      effectiveBetMultiplier = 100;
    } else if (featureBuy === 'extra_time') {
      effectiveBetMultiplier = 300;
    } else if (featureBuy === 'bonus_boost') {
      // Bonus boost implies 2x cost only if not buying a feature
      effectiveBetMultiplier = 2;
    }

    const effectiveCost = currentBet * effectiveBetMultiplier;

    if (!isFreeSpin && balance < effectiveCost) {
      alert('Insufficient Funds!');
      return;
    }

    setWinResult(null);
    setIsSpinning(true);
    emitRoundActive(true); // notify stake-engine listeners

    // ── Use server if session exists, else fall back to local ──────────────
    if (sessionId) {
      try {
        const res = await fetch(`${API_URL}/play`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            amount: currentBet, // Base bet is passed. Backend multiplies if feature_buy is used.
            mode: isFreeSpin ? 'freespin' : 'base',
            feature_buy: featureBuy
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail ?? 'Spin failed');
        }

        const data: PlayResponse = await res.json();
        const winRes = mapToWinResult(data);

        // Sync state from server response + emit stake-engine balance event
        setBalance(data.balance);
        setFreeSpinsRemaining(data.free_spins_remaining);
        emitBalanceUpdate(data.balance, 'USD');

        pendingWinRef.current = data.total_win;
        pendingWinResultRef.current = winRes;
        pendingFreeSpinsRef.current = data.free_spins_awarded;

        const finalStops = data.stop_indices;
        setLastStopIndices(finalStops);

        if (slotMachineRef.current) {
          slotMachineRef.current.spin(finalStops, spinCount);
        }

        // End round asynchronously (fire-and-forget)
        fetch(`${API_URL}/endround`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId }),
        }).catch(() => {});

      } catch (err) {
        console.error('[Gradiator] Play error:', err);
        setIsSpinning(false);
        alert(String(err));
      }
    } else {
      // ── Offline fallback (no backend) ──────────────────────────────────
      const { calculateWin } = await import('./slot/winLogic');
      if (!isFreeSpin) setBalance(prev => prev - effectiveCost);
      else setFreeSpinsRemaining(prev => prev - 1);

      const stopIndices = activeStrips.map(strip => Math.floor(Math.random() * strip.length));
      const result = calculateWin(stopIndices, currentBet, activeStrips, isFreeSpin, featureBuy);
      const finalStops = result.adjustedStopIndices || stopIndices;

      pendingWinRef.current = result.totalWin;
      pendingWinResultRef.current = result;
      pendingFreeSpinsRef.current = result.freeSpins || 0;

      setLastStopIndices(finalStops);
      if (slotMachineRef.current) {
        slotMachineRef.current.spin(finalStops, spinCount);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSpinning, freeSpinsRemaining, balance, currentBet, sessionId, spinCount]);

  // ── Spin complete ─────────────────────────────────────────────────────────
  const handleSpinComplete = useCallback(() => {
    setIsSpinning(false);
    emitRoundActive(false); // round finished — re-enable UI via event
    const winAmount = pendingWinRef.current;
    const wonFreeSpins = pendingFreeSpinsRef.current;
    const result = pendingWinResultRef.current;

    if (winAmount > 0) {
      setLastWin(winAmount);
      setWinResult(result);
    }

    if (wonFreeSpins > 0) setLastFreeSpinsWon(wonFreeSpins);

    if (winAmount > 0 || wonFreeSpins > 0) {
      const parts: string[] = [];
      if (winAmount > 0) parts.push(`You have won $${winAmount.toLocaleString('en-US')}`);
      if (wonFreeSpins > 0) parts.push(`You received ${wonFreeSpins} free spins`);
      setStatusMessage(parts.join(' • '));
    } else {
      setStatusMessage('GRADIATOR');
    }

    // Auto-spin continuation
    if (autoSpinRef.current) {
      if (autoSpinRemainingRef.current !== null) {
        const next = (autoSpinRemainingRef.current ?? 0) - 1;
        autoSpinRemainingRef.current = next;
        setAutoSpinRemaining(next);
        if (next < 0) { stopAutoSpin(); return; }
      }
      
      // Play Spin Stop Sound
      if (spinStopAudioRef.current) {
          spinStopAudioRef.current.currentTime = 0;
          spinStopAudioRef.current.play().catch(console.error);
      }
      
      const fsLeft = freeSpinsRemaining + wonFreeSpins;
      const nextBal = balance + winAmount;
      const enoughFunds = fsLeft > 0 || nextBal >= currentBet;
      if (enoughFunds) {
        setTimeout(() => { if (autoSpinRef.current) handleSpinStart(); }, 600);
      } else {
        stopAutoSpin();
      }
    } else {
        // Play Spin Stop Sound
        if (spinStopAudioRef.current) {
            spinStopAudioRef.current.currentTime = 0;
            spinStopAudioRef.current.play().catch(console.error);
        }
        
        if (freeSpinsRemaining + wonFreeSpins > 0) {
            setTimeout(() => handleSpinStart(), 1500);
        }
    }
  }, [balance, currentBet, freeSpinsRemaining, handleSpinStart, stopAutoSpin]);

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div
      className="app-layout"
      style={{
        width: '90vw',
        height: '100vh',
        margin: 'auto',
        boxSizing: 'border-box',
        overflow: 'hidden',
        backgroundImage: `url(${ASSETS.background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* ── Slot Machine Board ─────────────────────────────────────────── */}
      <div className="flex items-stretch justify-center w-full max-w-[1400px]">
        <div className="w-[80%] lg:w-[50%] max-w-[1000px] relative">
          <GoldenFrame width="100%" maxWidth="100%">
            <SlotMachine
              ref={slotMachineRef}
              onSpinComplete={handleSpinComplete}
              boostActive={boostActive}
              winResult={winResult}
              reelStrips={currentStrips}
            />
            <WinEffects
              winResult={winResult}
              stopIndices={lastStopIndices}
              freeSpinsWon={lastFreeSpinsWon}
            />
          </GoldenFrame>
          
          <Mascot isWinning={!!winResult && winResult.totalWin > 0} />
        </div>
      </div>

      {/* ── Control Bar ───────────────────────────────────────────────── */}
      <ControlPanel
        balance={balance}
        currentBet={currentBet}
        betLevels={BET_LEVELS}
        currentBetIndex={currentBetIndex}
        spinning={isSpinning}
        autoSpinEnabled={autoSpinEnabled}
        freeSpinsRemaining={freeSpinsRemaining}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(prev => !prev)}
        onSpin={() => handleSpinStart('none')}
        onIncreaseBet={increaseBet}
        onDecreaseBet={decreaseBet}
        onBuyBonus={() => setBuyBonusOpen(true)}
        onToggleAutoSpin={() =>
          autoSpinModalOpen
            ? setAutoSpinModalOpen(false)
            : autoSpinEnabled
            ? stopAutoSpin()
            : setAutoSpinModalOpen(true)
        }
        onOpenPaytable={() => setPayTableOpen(true)}
      />

      {/* ── Modals ────────────────────────────────────────────────────── */}
      <BuyBonusModal
        open={buyBonusOpen}
        onClose={() => setBuyBonusOpen(false)}
        balance={balance}
        currentBet={currentBet}
        onIncreaseBet={increaseBet}
        onDecreaseBet={decreaseBet}
        onBuy={(choice: BuyBonusChoice) => {
          const cost = currentBet * choice.costMultiplier;
          if (isSpinning || freeSpinsRemaining > 0 || balance < cost) {
            if (balance < cost) alert('Insufficient Funds!');
            return;
          }
          // Do NOT statically set spins and balance here anymore,
          // because we are forcing a real spin that visually lands scatters
          // which will report the win and free spins.
          bonusStartBetMultiplierRef.current = choice.startBetMultiplier;
          setBuyBonusOpen(false);
          
          // Trigger the spin with the feature id.
          handleSpinStart(choice.id);
        }}
      />

      <AutoSpinModal
        open={autoSpinModalOpen}
        onClose={() => setAutoSpinModalOpen(false)}
        onSelect={startAutoSpin}
      />

      <PayTableModal
        open={payTableOpen}
        onClose={() => setPayTableOpen(false)}
      />
    </div>
  );
}

export default App;
