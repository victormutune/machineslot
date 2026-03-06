import React, { useState, useEffect } from 'react';
import { ASSETS } from '../../assets/assetMap';

interface MascotProps {
  isWinning: boolean;
}

const Mascot: React.FC<MascotProps> = ({ isWinning }) => {
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    let interval: number;
    if (isWinning) {
      // Fast animation when winning
      interval = window.setInterval(() => {
        setFrameIndex((prev) => (prev + 1) % ASSETS.mascot.length);
      }, 150); // 150ms per frame
    } else {
      // Reset to idle (first frame) when not winning
      setFrameIndex(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isWinning]);

  return (
    <div 
      className="mascot-container"
      style={{
        position: 'absolute',
        right: '-22%', // Snap it right next to the frame
        bottom: '9%', // Anchor to the bottom
        width: '25%', // Size relative to the slot machine container
        height: 'auto',
        zIndex: 50, // Ensure it's in front of the frame
        pointerEvents: 'none', // Don't block clicks on the slot machine
        transition: 'transform 0.3s ease',
        transform: isWinning ? 'scale(1.1) translateY(-10px)' : 'scale(1) translateY(0)',
      }}
    >
      <img 
        src={ASSETS.mascot[frameIndex]} 
        alt="Slot Mascot" 
        style={{
          width: '100%',
          height: 'auto',
          objectFit: 'contain',
          filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.5))'
        }}
        draggable="false"
      />
    </div>
  );
};

export default Mascot;
