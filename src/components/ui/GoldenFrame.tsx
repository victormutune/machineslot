import React from 'react';

interface GoldenFrameProps {
  children: React.ReactNode;
  width?: string;
  maxWidth?: string;
  height?: string;
  maxHeight?: string;
  isBonus?: boolean;
}

const GoldenFrame: React.FC<GoldenFrameProps> = ({ 
  children, 
  width = '50%', 
  maxWidth = '1250px', 
  height = 'auto', 
  maxHeight = '60vh',
  isBonus = false
}) => {
  return (
    <div 
      style={{
        position: 'relative',
        width, 
        maxWidth,
        height, 
        maxHeight,
        aspectRatio: '5/4', // Match 5 reels x 4 rows
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        transition: 'all 0.5s ease',
        
        // Fancy Border & Background - Football Green Theme
        border: isBonus ? '5px ridge #FFD700' : '4px ridge #166534', 
        borderRadius: '15px',
        background: isBonus 
          ? 'linear-gradient(to bottom, #2a1a05, #493105)' 
          : 'linear-gradient(to bottom, rgba(66, 30, 10, 0.9), rgba(20, 10, 5, 0.95))', 
        boxShadow: isBonus 
          ? `
            0 0 0 2px #FFD700,
            0 0 0 5px #ff4500,
            0 0 40px rgba(255, 215, 0, 0.6),
            inset 0 0 30px rgba(255, 69, 0, 0.5)
          `
          : `
            0 0 0 2px #000000,
            0 0 0 5px #000000,
            0 0 25px rgba(0, 0, 0, 0.8),
            inset 0 0 20px rgba(0, 0, 0, 0.8)
          `,
        padding: '8px', 
      }}
    >
      <div style={{
         width: '100%', 
         height: '100%',
         backgroundColor: 'rgba(0,0,0,0.8)',
         borderRadius: '10px',
         boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)',
         display: 'flex',
         justifyContent: 'center',
         alignItems: 'center',
         padding: '4px'
      }}>
         {children}
      </div>
    </div>
  );
};

export default GoldenFrame;
