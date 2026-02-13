import { useState, useRef } from 'react';
import { ASSETS, REEL_STRIPS, BONUS_REEL_STRIPS } from './assets/assetMap';
import SlotMachine, { type SlotMachineHandle } from './components/SlotMachine';
import ControlPanel from './components/ControlPanel';
import GoldenFrame from './components/ui/GoldenFrame';
import WinEffects from './components/WinEffects';
import BuyBonusModal, { type BuyBonusChoice } from './components/BuyBonusModal';
import AutoSpinModal from './components/AutoSpinModal';

import { calculateWin, type WinResult } from './utils/winLogic';
import PayTableModal from './components/PayTableModal';

function App() {
  // --- Game State ---
  const [balance, setBalance] = useState(10000);
  const [currentBet, setCurrentBet] = useState(100);
  const [, setLastWin] = useState(0);
  const [winResult, setWinResult] = useState<WinResult | null>(null);
  const [lastStopIndices, setLastStopIndices] = useState<number[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinCount] = useState(5);
  // Free Spins State
  const [freeSpinsRemaining, setFreeSpinsRemaining] = useState(0);
  const [lastFreeSpinsWon, setLastFreeSpinsWon] = useState(0);
  const [buyBonusOpen, setBuyBonusOpen] = useState(false);
  const [autoSpinEnabled, setAutoSpinEnabled] = useState(false);
  const [, setAutoSpinRemaining] = useState<number | null>(null);
  const [autoSpinModalOpen, setAutoSpinModalOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('GRADIATOR');
  const [payTableOpen, setPayTableOpen] = useState(false);
  const [boostActive] = useState(false);
  
  // Bonus/Logic State
  const [currentStrips, setCurrentStrips] = useState<number[][]>(REEL_STRIPS); // Track which strips are active
  const bonusStartBetMultiplierRef = useRef<number>(1);

  // Ref to the slot machine to trigger spins
  const slotMachineRef = useRef<SlotMachineHandle>(null);
  
  // Store the pending win amount for the current spin
  const pendingWinRef = useRef<number>(0);
  const pendingWinResultRef = useRef<WinResult | null>(null);
  const pendingFreeSpinsRef = useRef<number>(0);
  const autoSpinRef = useRef(false);
  const autoSpinRemainingRef = useRef<number | null>(null);
  

  // --- Event Handlers ---

  const increaseBet = () => {
    setCurrentBet(prev => Math.min(prev + 10, balance)); 
  };

  const decreaseBet = () => {
    setCurrentBet(prev => Math.max(10, prev - 10)); 
  };



  const startAutoSpin = (count: number | null) => {
    autoSpinRef.current = true;
    autoSpinRemainingRef.current = count;
    setAutoSpinRemaining(count);
    setAutoSpinEnabled(true);
    setAutoSpinModalOpen(false);

    if (!isSpinning) {
      handleSpinStart();
    }
  };

  const stopAutoSpin = () => {
    autoSpinRef.current = false;
    autoSpinRemainingRef.current = null;
    setAutoSpinRemaining(null);
    setAutoSpinEnabled(false);
  };



  /**
   * Called when the Spin Button is clicked in ControlPanel.
   */
  const handleSpinStart = () => {
    if (isSpinning) return;
    setLastFreeSpinsWon(0);
    setStatusMessage('Good luck!');

    // Check if we can spin (Balance or Free Spins)
    const isFreeSpin = freeSpinsRemaining > 0;
    
    // Select Strip based on Free Spin Status
    const activeStrips = isFreeSpin ? BONUS_REEL_STRIPS : REEL_STRIPS;
    setCurrentStrips(activeStrips); // Update UI/Logic state

    const effectiveBetMultiplier = isFreeSpin ? bonusStartBetMultiplierRef.current : 1;
    const effectiveBet = currentBet * effectiveBetMultiplier;

    if (isFreeSpin || balance >= effectiveBet) {
      // Deduct Bet if NOT free spin
      if (!isFreeSpin) {
          setBalance(prev => prev - effectiveBet);
      } else {
          setFreeSpinsRemaining(prev => prev - 1);
          // Apply the "2x Start" only on the first free spin after purchase.
          bonusStartBetMultiplierRef.current = 1;
      }

      setLastWin(0); 
      setIsSpinning(true);

      // 1. Generate Random Results (Stop Indices 0-length for each reel)
      const stopIndices = activeStrips.map(strip => Math.floor(Math.random() * strip.length));
      setLastStopIndices(stopIndices);

      // 2. Calculate the Result IMMEDIATELY using the ACTIVE STRIPS
      const result = calculateWin(stopIndices, effectiveBet, activeStrips);
      
      // ✅ Use adjustedStopIndices (from anti-dry logic) if available, else original
      const finalStopIndices = result.adjustedStopIndices || stopIndices;
      
      pendingWinRef.current = result.totalWin;
      pendingWinResultRef.current = result;
      pendingFreeSpinsRef.current = result.freeSpins || 0;

      // Clear previous win display
      setWinResult(null);

      // 3. Trigger the Animation
      if (slotMachineRef.current) {
        // Use the FINAL indices for the visual spin
        slotMachineRef.current.spin(finalStopIndices, spinCount);
        setLastStopIndices(finalStopIndices); // Update state with final positions
      }
    } else {
      alert("Insufficient Funds!");
    }
  };

  /**
   * Called when the SlotMachine finishes its animation.
   * Updates balance with any winnings.
   */
  const handleSpinComplete = () => {
    setIsSpinning(false);
    const winAmount = pendingWinRef.current;
    const wonFreeSpins = pendingFreeSpinsRef.current;
    const result = pendingWinResultRef.current;
    
    // Add Winnings
    if (winAmount > 0) {
      setBalance(prev => prev + winAmount);
      setLastWin(winAmount);
      setWinResult(result); // Show visualizations
    }

    // Add Free Spins
    if (wonFreeSpins > 0) {
        setFreeSpinsRemaining(prev => prev + wonFreeSpins);
        setLastFreeSpinsWon(wonFreeSpins);
    }

    // Update dynamic title message
    if (winAmount > 0 || wonFreeSpins > 0) {
      const messageParts: string[] = [];
      if (winAmount > 0) {
        messageParts.push(`You have won $${winAmount.toLocaleString('en-US')}`);
      }
      if (wonFreeSpins > 0) {
        messageParts.push(`You have received ${wonFreeSpins} free spins`);
      }
      setStatusMessage(messageParts.join(' • '));
    } else {
      setStatusMessage('GRADIATOR');
    }

    // Auto-spin: schedule next spin if enabled and funds/free spins available
    if (autoSpinRef.current) {
      // Decrement remaining count if finite
      if (autoSpinRemainingRef.current !== null) {
        const nextRemaining = (autoSpinRemainingRef.current ?? 0) - 1;
        autoSpinRemainingRef.current = nextRemaining;
        setAutoSpinRemaining(nextRemaining);

        if (nextRemaining <= 0) {
          stopAutoSpin();
          return;
        }
      }

      const isFreeSpinAvailable = freeSpinsRemaining + wonFreeSpins > 0;
      const effectiveBetMultiplier = isFreeSpinAvailable ? bonusStartBetMultiplierRef.current : 1;
      const effectiveBet = currentBet * effectiveBetMultiplier;
      const nextBalance = balance + winAmount;

      if (isFreeSpinAvailable || nextBalance >= effectiveBet) {
        setTimeout(() => {
          if (!autoSpinRef.current) return;
          handleSpinStart();
        }, 600);
      } else {
        stopAutoSpin();
      }
    }

    // Auto-Trigger Next Free Spin?
    // Usually there's a delay, we can use an effect or just wait for user?
    // Most slots auto-play free spins.
    // We can't call handleSpinStart directly if it relies on state that hasn't updated yet?
    // But we updated local state (not yet rendered).
    // Let's rely on an effect or just let user click for now to avoid rapid fire issues without proper delay.
    // Or simpler:
    /*
    if (freeSpinsRemaining > 0 || wonFreeSpins > 0) {
         setTimeout(() => handleSpinStart(), 1000); // Simple auto-play
    }
    */
  };

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
        flexDirection: 'column', // BACK TO VERTICAL
        justifyContent: 'center',
        alignItems: 'center' 
      }}
    >


     

      {/* 1. SLOT MACHINE BOARD */}
      <div className="flex items-stretch justify-center w-full max-w-[1400px]">
        

        <div className="w-[90%] lg:w-[60%] max-w-[1250px] relative">
            <GoldenFrame width="100%" maxWidth="100%" isBonus={freeSpinsRemaining > 0}>
                <SlotMachine 
                ref={slotMachineRef}
                onSpinComplete={handleSpinComplete}
                boostActive={boostActive}
                winResult={winResult}
                reelStrips={currentStrips}
                />
                <WinEffects winResult={winResult} stopIndices={lastStopIndices} freeSpinsWon={lastFreeSpinsWon} />
            </GoldenFrame>
        </div>

        {/* SidebarControlPanel Removed */}
      </div>

      {/* 2. CONTROL BAR (Under the frame) */}

      
      <ControlPanel 
        balance={balance}
        currentBet={currentBet}
        spinning={isSpinning}
        autoSpinEnabled={autoSpinEnabled}
        onSpin={handleSpinStart}
        onIncreaseBet={increaseBet}
        onDecreaseBet={decreaseBet}
        onBuyBonus={() => setBuyBonusOpen(true)}
        onToggleAutoSpin={() => autoSpinModalOpen ? setAutoSpinModalOpen(false) : (autoSpinEnabled ? stopAutoSpin() : setAutoSpinModalOpen(true))}
        onOpenPaytable={() => setPayTableOpen(true)}
      />

      <BuyBonusModal
        open={buyBonusOpen}
        onClose={() => setBuyBonusOpen(false)}
        balance={balance}
        currentBet={currentBet}
        onIncreaseBet={increaseBet}
        onDecreaseBet={decreaseBet}
        onBuy={(choice: BuyBonusChoice) => {
          const cost = currentBet * choice.costMultiplier;
          if (isSpinning) return;
          if (freeSpinsRemaining > 0) return; // avoid buying mid-bonus
          if (balance < cost) {
            alert('Insufficient Funds!');
            return;
          }

          setBalance((prev) => prev - cost);
          setFreeSpinsRemaining(choice.freeSpins);
          bonusStartBetMultiplierRef.current = choice.startBetMultiplier;
          setBuyBonusOpen(false);
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

