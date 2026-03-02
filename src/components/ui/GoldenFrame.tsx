import React from 'react'
import { ASSETS } from '../../assets/assetMap';

interface GoldenFrameProps {
  children: React.ReactNode;
  width?: string;
  maxWidth?: string;
  height?: string;
  maxHeight?: string;
}

const GoldenFrame: React.FC<GoldenFrameProps> = ({
  children,
  width = '550%',
  maxWidth = '1250px',
  height = 'auto',
  maxHeight = '100vh'
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
        padding: '0', // Reset padding on wrapper
      }}
    >
      {/* ── Background Behind Reels (Optional but good) ── */}
      <div style={{
        position: 'absolute',
        width: '80%',
        height: '80%',
        backgroundColor: 'rgba(0,0,0)',
        borderRadius: '10px',
        boxShadow: 'inset 0 0 0px rgba(0,0,0,0.8)',
        zIndex: 10, // Back layer
      }} />

      {/* ── Slot Machine Reels (Children) ── */}
      <div style={{
        position: 'relative',
        width: '80%',
        height: '80%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20, // Middle layer
        padding: '10px'
      }}>
        {children}
      </div>

      {/* ── The Golden Frame Over Everything ── */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: `url(${ASSETS.frame})`,
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        pointerEvents: 'none', // Allow clicking through the clear parts of the frame image
        zIndex: 50, // Front layer
      }} />
    </div>
  );
};

export default GoldenFrame;
