import React, { useEffect, useRef, useState } from 'react';
import { type WinningLine } from '../../utils/winLogic';

interface PaylineOverlayProps {
  winningLines: WinningLine[];
  onPhaseChange?: (phase: 'flowing' | 'complete') => void;
}

/** Convert array of {x,y} points into a smooth SVG cubic bezier path (Catmull-Rom like) */
function pointsToSmoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length === 0) return '';
  if (pts.length === 1) return `M ${pts[0].x},${pts[0].y}`;
  if (pts.length === 2) return `M ${pts[0].x},${pts[0].y} L ${pts[1].x},${pts[1].y}`;

  let d = `M ${pts[0].x},${pts[0].y}`;
  const tension = 0.1; // higher = more dramatic curves

  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, pts.length - 1)];

    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;

    d += ` C ${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
  }

  return d;
}

const CYCLE_MS = 4000; // full loop duration in ms

const PaylineOverlay: React.FC<PaylineOverlayProps> = ({ winningLines, onPhaseChange }) => {
  const [linePaths, setLinePaths] = useState<{ id: string; d: string }[]>([]);
  const [pathLengths, setPathLengths] = useState<Map<string, number>>(new Map());
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRefs = useRef<Map<string, SVGPathElement>>(new Map());

  // Calculate SVG paths from grid positions
  useEffect(() => {
    if (winningLines.length === 0) {
      setLinePaths([]);
      return;
    }

    const totalExpected = winningLines.reduce((sum, l) => sum + (l.path?.length ?? 0), 0);

    const calculate = () => {
      const svg = svgRef.current;
      if (!svg) return false;
      const svgRect = svg.getBoundingClientRect();
      const newPaths: { id: string; d: string }[] = [];
      let found = 0;

      winningLines.forEach((line, i) => {
        if (!line.path) return;
        const pts = line.path.map(pos => {
          const el = document.querySelector<HTMLElement>(`[data-grid-coord="${pos.col},${pos.row}"]`);
          if (el) {
            found++;
            const r = el.getBoundingClientRect();
            return { x: r.left + r.width / 2 - svgRect.left, y: r.top + r.height / 2 - svgRect.top };
          }
          return null;
        }).filter(Boolean) as { x: number; y: number }[];

        if (pts.length > 0) {
          newPaths.push({ id: `wl-${line.symbolId}-${i}`, d: pointsToSmoothPath(pts) });
        }
      });

      setLinePaths(newPaths);
      return found >= totalExpected;
    };

    let attempts = 0;
    const retry = () => {
      const done = calculate();
      if (!done && attempts++ < 10) setTimeout(retry, 60);
    };
    retry();

    window.addEventListener('resize', calculate);
    return () => window.removeEventListener('resize', calculate);
  }, [winningLines]);

  // After paths render, read their true SVG lengths
  useEffect(() => {
    if (linePaths.length === 0) return;
    requestAnimationFrame(() => {
      const lengths = new Map<string, number>();
      pathRefs.current.forEach((el, id) => {
        if (el) lengths.set(id, el.getTotalLength());
      });
      setPathLengths(lengths);
    });
  }, [linePaths]);

  // Notify parent of phase changes (for syncing win amount)
  useEffect(() => {
    if (!onPhaseChange || winningLines.length === 0) return;
    // Phase: 'flowing' during draw, 'complete' when snake finishes each loop
    // draw occupies 0→60% of CYCLE_MS, complete is 60→80%, erase 80→100%
    const drawEnd = CYCLE_MS * 0.60;
    const completeEnd = CYCLE_MS * 0.80;

    let phase: 'flowing' | 'complete' = 'flowing';
    onPhaseChange('flowing');

    const tick = (elapsed: number) => {
      const t = elapsed % CYCLE_MS;
      const newPhase: 'flowing' | 'complete' = (t >= drawEnd && t < completeEnd) ? 'complete' : 'flowing';
      if (newPhase !== phase) {
        phase = newPhase;
        onPhaseChange(newPhase);
      }
    };

    const start = performance.now();
    let raf: number;
    const loop = (now: number) => {
      tick(now - start);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [winningLines, onPhaseChange]);

  if (winningLines.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-30">
      <svg ref={svgRef} width="100%" height="100%" className="overflow-visible">
        <defs>
          <filter id="glow-snake" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {linePaths.map((line) => {
          const len = pathLengths.get(line.id);
          if (!len) {
            // Render invisible path so we can measure it
            return (
              <path
                key={line.id}
                ref={el => { if (el) pathRefs.current.set(line.id, el); else pathRefs.current.delete(line.id); }}
                d={line.d}
                fill="none"
                stroke="transparent"
                strokeWidth="1"
              />
            );
          }

          // Snake segment = 55% of total path length
          const segLen = len * 0.55;
          // dasharray: segment, gap (rest of line)
          const dashArray = `${segLen} ${len - segLen}`;
          // Animate dashoffset: starts at len (segment at start), ends at -(len) (segment past end)
          const animId = line.id.replace(/[^a-zA-Z0-9]/g, '_');

          return (
            <g key={line.id}>
              {/* Inject keyframes via a style tag inside SVG defs (supported) */}
              <defs>
                <style>{`
                  @keyframes snake_${animId} {
                    0%   { stroke-dashoffset: ${len.toFixed(1)}; opacity: 0; }
                    8%   { opacity: 1; }
                    60%  { stroke-dashoffset: ${(-len * 0.8).toFixed(1)}; opacity: 1; }
                    70%  { stroke-dashoffset: ${(-len * 0.8).toFixed(1)}; opacity: 1; }
                    92%  { stroke-dashoffset: ${(-len).toFixed(1)}; opacity: 0; }
                    100% { stroke-dashoffset: ${len.toFixed(1)}; opacity: 0; }
                  }
                `}</style>
              </defs>

              {/* Dim track underneath */}
              <path
                d={line.d}
                fill="none"
                stroke="#FFD70030"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Animated snake */}
              <path
                ref={el => { if (el) pathRefs.current.set(line.id, el); else pathRefs.current.delete(line.id); }}
                d={line.d}
                fill="none"
                stroke="#FFD700"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#glow-snake)"
                strokeDasharray={dashArray}
                strokeDashoffset={len}
                style={{
                  animation: `snake_${animId} ${CYCLE_MS}ms cubic-bezier(0.4, 0, 0.2, 1) infinite`,
                }}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default PaylineOverlay;
