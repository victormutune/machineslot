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
import BonusTriggerOverlay from './components/ui/BonusTriggerOverlay';
import { calculateWin, type WinResult } from './slot/winLogic';
import {
  emitRoundActive,
} from './stake/stakeEngineHelpers';
import { getStakeEngineManager } from './stake/stakeEngineManager';

// ── Bet levels (display dollars) ──────────────────────────────────────────────
const BET_LEVELS = [1.00, 2.00, 5.00, 10.00, 20.00, 50.00, 100.00,200.00,500.00,1000.00];
const DEFAULT_BET_INDEX = 2; // $5.00

// ─────────────────────────────────────────────────────────────────────────────

function App() {
  const [balance, setBalance] = useState(10000);
  const [currentBetIndex, setCurrentBetIndex] = useState(DEFAULT_BET_INDEX);
  const currentBet = BET_LEVELS[currentBetIndex];
  const [, setLastWin] = useState(0);
  const [winResult, setWinResult] = useState<WinResult | null>(null);
  const [lastStopIndices, setLastStopIndices] = useState<number[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const isSpinningRef = useRef(false);
  const [spinCount] = useState(5);

  // Free Spins State
  const [freeSpinsRemaining, setFreeSpinsRemaining] = useState(0);
  const [lastFreeSpinsWon, setLastFreeSpinsWon] = useState(0);
  const [freeSpinsTotalWin, setFreeSpinsTotalWin] = useState(0);

  // UI State
  const [buyBonusOpen, setBuyBonusOpen] = useState(false);
  const [autoSpinEnabled, setAutoSpinEnabled] = useState(false);
  const [, setAutoSpinRemaining] = useState<number | null>(null);
  const [autoSpinModalOpen, setAutoSpinModalOpen] = useState(false);
  const [_statusMessage, setStatusMessage] = useState<string>('GRADIATOR');
  const [payTableOpen, setPayTableOpen] = useState(false);
  const [boostActive] = useState(false);
  const [showBonusOverlay, setShowBonusOverlay] = useState(false);
  const showBonusOverlayRef = useRef(false);
  
  // Audio State
  const [isMuted, setIsMuted] = useState(false);

  // Track which visual strips to use (for SlotMachine animation)
  const [currentStrips, setCurrentStrips] = useState<number[][]>(REEL_STRIPS);

  // References
  const bonusStartBetMultiplierRef = useRef<number>(1);
  const slotMachineRef = useRef<SlotMachineHandle>(null);
  const pendingWinRef = useRef<number>(0);
  const pendingWinResultRef = useRef<WinResult | null>(null);
  const pendingFreeSpinsRef = useRef<number>(0);
  const autoSpinRef = useRef(false);
  const autoSpinRemainingRef = useRef<number | null>(null);
  const handleSpinStartRef = useRef<(featureBuy?: string) => Promise<void>>(async () => {});
  
  const stakeManager = getStakeEngineManager({
     defaultBalance: 10000,
     defaultBetIndex: DEFAULT_BET_INDEX,
     defaultBetLevels: BET_LEVELS.map(amount => Math.round(amount * 1_000_000))
  });

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
  useEffect(() => {
    const initManager = async () => {
       await stakeManager.initialize();
       setBalance(stakeManager.currentBetDisplay > 0 ? stakeManager.balance : 10000); // Only override balance if fully initialized logic returns otherwise default 10k wrapper handled in stakeEngine logic. In purely demo it keeps returning config.
       
       stakeManager.on('balanceUpdate', (newBal: number) => {
         setBalance(newBal);
       });
       
       stakeManager.on('betChanged', (_betRGS: number, newDisplayBet: number) => {
          const newIdx = BET_LEVELS.indexOf(newDisplayBet);
          if (newIdx !== -1) setCurrentBetIndex(newIdx);
       });
       
       stakeManager.on('resumeRound', async (round: any) => {
         console.info('[Gradiator] Resuming stuck round...', round);
         try {
            await stakeManager.endRound();
         } catch (e) {
            console.warn('[Gradiator] Failed to resume and end stuck round', e);
         }
       });

       stakeManager.on('error', (err: any) => {
         console.error('StakeEngine Error:', err);
         alert(err.message || 'An error occurred connecting to RGS');
       });
    };
    initManager();
    
    return () => {
       stakeManager.removeAllListeners();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Bet controls ──────────────────────────────────────────────────────────
  const increaseBet = () => stakeManager.increaseBet();
  const decreaseBet = () => stakeManager.decreaseBet();

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
    if (isSpinningRef.current || showBonusOverlayRef.current) return;
    
    // Play Spin Start Sound
    if (spinStartAudioRef.current) {
      spinStartAudioRef.current.currentTime = 0;
      spinStartAudioRef.current.play().catch(console.error);
    }
    
    const isFreeSpin = freeSpinsRemaining > 0 && featureBuy === 'none';

    if (!isFreeSpin) {
      setFreeSpinsTotalWin(0); // Reset total win on new base spin or feature buy initiation
    }
    setLastFreeSpinsWon(0);
    setStatusMessage('Good luck!');

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
      stopAutoSpin();
      return;
    }

    setWinResult(null);
    setIsSpinning(true);
    isSpinningRef.current = true;
    emitRoundActive(true); // notify stake-engine listeners
    
    const spinMode = isFreeSpin ? 'freespin' : 'base';

    // RGS Network Play
    if (stakeManager.isRGSMode || stakeManager.isSocialMode) {
      try {
         // StakeEngine expects you to play using internal base bet
         const playRes = await stakeManager.play(spinMode);
         
         if (!playRes.success) {
            setIsSpinning(false);
            stopAutoSpin();
            return;
         }

         // Save event to allow round resumption like project2_ref
         await stakeManager.saveEvent(JSON.stringify({ state: 'spinning', featureBuy }));
         
         const roundRes = playRes.round?.result as any;
         let mathResult: WinResult;
         
         // Server math
         if (roundRes && typeof roundRes === 'object') {
             // For example, if your real RGS provides mapped data instead of forcing calculating it
             // Realistically right now the backend was fully providing the result anyway. So we simulate local math on top of server data if RGS doesn't supply it.
             // Given Stake Engine doesn't natively supply our slot calculation, we MUST calculate it fully using our own math.
             // If a server really returned the state we would parse it here.
         }
         
         // Since StakeEngine RGS `play` is generic and doesn't inherently contain slot math for new custom games natively,
         // we simulate the random stops generation via our local calculation logic unless RGS specifically handed it.
         // Typically the real RGS for this game will return stops/wins inside `playRes.round.result`.
         // We fallback to local math for the exact stops logic for now as a generic stand-in simulating an RGS responding.
         
         const stopIndices = activeStrips.map(strip => Math.floor(Math.random() * strip.length));
         mathResult = calculateWin(stopIndices, currentBet, activeStrips, isFreeSpin, featureBuy);
         
         const finalStops = mathResult.adjustedStopIndices || stopIndices;
         
         pendingWinRef.current = mathResult.totalWin;
         pendingWinResultRef.current = mathResult;
         pendingFreeSpinsRef.current = mathResult.freeSpins || 0;
         
         if (!isFreeSpin) {
             setBalance(playRes.balance - effectiveCost + currentBet); // Adjust manager base deduction
         } else {
             setFreeSpinsRemaining(prev => prev - 1);
         }
         
         setLastStopIndices(finalStops);
         if (slotMachineRef.current) {
            slotMachineRef.current.spin(finalStops, spinCount);
         }

         // Fire and forget end round (simulated RGS completion)
         await stakeManager.endRound();
      } catch (err) {
         console.warn("RGS spin error, falling back visually", err);
         setIsSpinning(false);
         stopAutoSpin();
      }
    } else {
       // Demo / Offline
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
  }, [isSpinning, freeSpinsRemaining, balance, currentBet, spinCount]);

  useEffect(() => {
    handleSpinStartRef.current = handleSpinStart;
  }, [handleSpinStart]);

  // ── Spin complete ─────────────────────────────────────────────────────────
  const handleSpinComplete = useCallback(() => {
    setIsSpinning(false);
    isSpinningRef.current = false;
    emitRoundActive(false); // round finished — re-enable UI via event
    const winAmount = pendingWinRef.current;
    const wonFreeSpins = pendingFreeSpinsRef.current;
    const result = pendingWinResultRef.current;

    if (winAmount > 0 || wonFreeSpins > 0) {
      setWinResult(result);
    }

    if (winAmount > 0) {
      setLastWin(winAmount);
      
      // In Demo we manually add the winnings to the balance.
      // If RGS, normally RGS adds this, but since we are stubbing the native logic inside 'play', we must add locally.
      if (!stakeManager.isRGSMode && !stakeManager.isSocialMode) {
          stakeManager.addWinnings(winAmount);
      }
      setBalance(prev => prev + winAmount);
      
      if (freeSpinsRemaining > 0 || wonFreeSpins > 0) {
        setFreeSpinsTotalWin(prev => prev + winAmount);
      }
    }

    if (wonFreeSpins > 0) {
      setLastFreeSpinsWon(wonFreeSpins);
      setFreeSpinsRemaining(prev => prev + wonFreeSpins);
    }

    if (wonFreeSpins > 0) {
      const parts: string[] = [];
      if (winAmount > 0) parts.push(`You have won $${winAmount.toLocaleString('en-US')}`);
      if (wonFreeSpins > 0) parts.push(`You received ${wonFreeSpins} free spins`);
      setStatusMessage(parts.join(' • '));
      setShowBonusOverlay(true);
      showBonusOverlayRef.current = true;
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
      const actualBalance = (winAmount > 0) ? balance + winAmount : balance;
      const enoughFunds = fsLeft > 0 || actualBalance >= currentBet;
      
      if (enoughFunds) {
        if (wonFreeSpins === 0) {
           setTimeout(() => { if (autoSpinRef.current) handleSpinStartRef.current(); }, 600);
        }
        // If we won free spins, handleSpinStart is triggered by onAnimationComplete in BonusTriggerOverlay
      } else {
        stopAutoSpin();
      }
    } else {
        // Play Spin Stop Sound
        if (spinStopAudioRef.current) {
            spinStopAudioRef.current.currentTime = 0;
            spinStopAudioRef.current.play().catch(console.error);
        }
        
        if (freeSpinsRemaining + wonFreeSpins > 0 && wonFreeSpins === 0) {
            setTimeout(() => handleSpinStartRef.current(), 1500);
        }
    }
  }, [balance, currentBet, freeSpinsRemaining, stopAutoSpin]);

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div
      className="app-layout"
      style={{
        width: '100vw',
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
      {/* ── Game Area (Board + Desktop Controls) ─────────────────────── */}
      <div className="flex flex-col lg:flex-row items-center lg:items-center justify-center w-full px-2 sm:px-4 pb-24 lg:pb-0 max-w-[1400px] gap-4 xl:gap-12">
        
        {/* Slot Machine Board */}
        <div className="w-[90%] sm:w-[80%] md:w-[55%] lg:w-[50%] xl:w-[50%] max-w-[1000px] relative transition-all duration-300 flex-shrink-0">
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

        {/* Control Bar */}
        <ControlPanel
          balance={balance}
          currentBet={currentBet}
          betLevels={BET_LEVELS}
          currentBetIndex={currentBetIndex}
          spinning={isSpinning}
          autoSpinEnabled={autoSpinEnabled}
          freeSpinsRemaining={freeSpinsRemaining}
          freeSpinsTotalWin={freeSpinsTotalWin}
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

      </div>

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
          if (handleSpinStartRef.current) {
            handleSpinStartRef.current(choice.id);
          }
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

      {showBonusOverlay && (
        <BonusTriggerOverlay
          freeSpinsWon={lastFreeSpinsWon}
          onAnimationComplete={() => {
            setShowBonusOverlay(false);
            showBonusOverlayRef.current = false;
            if (autoSpinRef.current || freeSpinsRemaining > 0) {
               // Start spinning the free spins!
               setTimeout(() => handleSpinStartRef.current(), 500); 
            }
          }}
        />
      )}
    </div>
  );
}

export default App;
