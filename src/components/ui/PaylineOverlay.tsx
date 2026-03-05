import React, { useEffect, useRef, useState } from 'react';
import { type WinningLine, type WinningPosition } from '../../slot/winLogic';

interface PaylineOverlayProps {
  winningLines: WinningLine[];
  winKey: number;
  onPhaseChange?: (phase: 'flowing' | 'complete' | 'idle') => void;
  onSweepColumn?: (col: number) => void;
}

function pointsToSmoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length === 0) return '';
  if (pts.length === 1) return `M ${pts[0].x},${pts[0].y}`;
  if (pts.length === 2) return `M ${pts[0].x},${pts[0].y} L ${pts[1].x},${pts[1].y}`;
  let d = `M ${pts[0].x},${pts[0].y}`;
  const t = 0.1;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, pts.length - 1)];
    const cp1x = p1.x + (p2.x - p0.x) * t;
    const cp1y = p1.y + (p2.y - p0.y) * t;
    const cp2x = p2.x - (p3.x - p1.x) * t;
    const cp2y = p2.y - (p3.y - p1.y) * t;
    d += ` C ${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
  }
  return d;
}

// ─── Timing ─────────────────────────────────────────────────────────────────
// Snake travels from first symbol → last symbol, then 2 s pause, then repeats.
const TRAVEL_MS     = 1900;  // how long the snake takes to cross the full path
const PAUSE_MS      = 2000;  // dark gap between passes
const CYCLE_MS      = TRAVEL_MS + PAUSE_MS;
const SYMBOL_ZOOM_MS = 1100; // must match POP_HOLD_MS in SlotMachine.tsx

// Snake body = 65% of path length (longer = more visible)
const SNAKE_RATIO = 0.65;

type Phase = 'idle' | 'travel' | 'pause';
type LineEntry = { id: string; d: string; len: number; cols: number[] };

const PaylineOverlay: React.FC<PaylineOverlayProps> = ({
  winningLines,
  winKey,
  onPhaseChange,
  onSweepColumn,
}) => {
  const svgRef    = useRef<SVGSVGElement>(null);
  const pathRefs  = useRef<Map<string, SVGPathElement>>(new Map());
  const timers    = useRef<ReturnType<typeof setTimeout>[]>([]);
  const activeRef = useRef<number>(-1);

  const [lines,     setLines]     = useState<LineEntry[]>([]);
  const [phase,     setPhase]     = useState<Phase>('idle');
  const [animCycle, setAnimCycle] = useState(0);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  // ─── Fire column pop callbacks as snake sweeps through ────────────────────
  // Snake head reaches column k at ~(k/totalCols) * 85% of TRAVEL_MS
  // (the 85% accounts for the snake entering/exiting fade window)
  const fireSweepCols = (entries: LineEntry[]) => {
    const colSet = new Set<number>();
    entries.forEach(l => l.cols.forEach(c => colSet.add(c)));
    const cols = Array.from(colSet).sort((a, b) => a - b);
    const n = cols.length;
    cols.forEach((col, idx) => {
      // Head enters at ~8% of TRAVEL_MS, reaches last col at ~88%
      const frac  = n <= 1 ? 0.5 : idx / (n - 1);
      const delay = Math.round((0.08 + frac * 0.80) * TRAVEL_MS);
      timers.current.push(setTimeout(() => onSweepColumn?.(col), delay));
    });
  };

  // ─── One full cycle: travel → pause → repeat ─────────────────────────────
  const startCycle = (entries: LineEntry[], myKey: number) => {
    if (activeRef.current !== myKey) return;

    setAnimCycle(c => c + 1);  // new key → CSS animation restarts fresh
    setPhase('travel');
    onPhaseChange?.('flowing');
    fireSweepCols(entries);

    // Snake finished crossing → show win amount + enter pause
    timers.current.push(setTimeout(() => {
      if (activeRef.current !== myKey) return;
      setPhase('pause');
      onPhaseChange?.('complete');  // amount appears as snake exits
    }, TRAVEL_MS));

    // Symbols finish zooming out → hide win amount
    timers.current.push(setTimeout(() => {
      if (activeRef.current !== myKey) return;
      onPhaseChange?.('idle');      // amount disappears
    }, TRAVEL_MS + SYMBOL_ZOOM_MS));

    // After pause → next cycle
    timers.current.push(setTimeout(() => {
      if (activeRef.current !== myKey) return;
      startCycle(entries, myKey);
    }, CYCLE_MS));
  };

  // ─── Reset when a new win arrives ────────────────────────────────────────
  useEffect(() => {
    clearTimers();
    pathRefs.current.clear();
    setLines([]);
    setPhase('idle');
    activeRef.current = -1;
    onPhaseChange?.('idle');

    if (winKey === 0 || winningLines.length === 0) return;

    const linesWithPath = winningLines.filter(l => l.path && l.path.length > 0);
    if (linesWithPath.length === 0) return;

    const myKey = winKey;
    activeRef.current = myKey;
    let attempts = 0;

    const tryBuild = () => {
      if (activeRef.current !== myKey) return;
      const svg = svgRef.current;
      if (!svg) {
        if (attempts++ < 25) timers.current.push(setTimeout(tryBuild, 60));
        return;
      }
      const svgRect = svg.getBoundingClientRect();
      const built: LineEntry[] = [];

      for (let i = 0; i < linesWithPath.length; i++) {
        const line = linesWithPath[i];
        const pts = (line.path as WinningPosition[]).map(pos => {
          const el = document.querySelector<HTMLElement>(
            `[data-grid-coord="${pos.col},${pos.row}"]`
          );
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return {
            x: r.left + r.width  / 2 - svgRect.left,
            y: r.top  + r.height / 2 - svgRect.top,
          };
        });
        if (pts.some(p => p === null)) {
          if (attempts++ < 25) timers.current.push(setTimeout(tryBuild, 60));
          return;
        }
        built.push({
          id:   `wl-${myKey}-${line.symbolId}-${i}`,
          d:    pointsToSmoothPath(pts as { x: number; y: number }[]),
          len:  0,
          cols: (line.path as WinningPosition[]).map(p => p.col),
        });
      }
      setLines(built);
    };

    timers.current.push(setTimeout(tryBuild, 60));

    return () => {
      activeRef.current = -1;
      clearTimers();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [winKey]);

  // ─── Measure path lengths then kick off first cycle ───────────────────────
  useEffect(() => {
    if (lines.length === 0 || lines[0].len > 0) return;
    const myKey = activeRef.current;

    const measure = () => {
      if (activeRef.current !== myKey) return;
      let allOk = true;
      const updated = lines.map(entry => {
        const el = pathRefs.current.get(entry.id);
        if (!el) { allOk = false; return entry; }
        try {
          const len = el.getTotalLength();
          if (len <= 0) { allOk = false; return entry; }
          return { ...entry, len };
        } catch { allOk = false; return entry; }
      });
      if (!allOk) {
        timers.current.push(setTimeout(() => setLines(prev => [...prev]), 80));
        return;
      }
      setLines(updated);
      timers.current.push(setTimeout(() => startCycle(updated, myKey), 50));
    };

    const raf = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(raf);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines]);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 30 }}>
      <svg ref={svgRef} width="100%" height="100%" style={{ overflow: 'visible' }}>
        <defs>
          <filter id="po-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {lines.map(entry => {
          // Invisible measurement path
          if (entry.len <= 0) {
            return (
              <path
                key={entry.id}
                ref={el => {
                  if (el) pathRefs.current.set(entry.id, el);
                  else    pathRefs.current.delete(entry.id);
                }}
                d={entry.d}
                fill="none"
                stroke="transparent"
                strokeWidth="1"
              />
            );
          }

          if (phase !== 'travel') return null;

          const L       = entry.len;
          const S       = L * SNAKE_RATIO;          // snake body length
          const animId  = `${entry.id}_${animCycle}`.replace(/[^a-zA-Z0-9]/g, '_');
          const trvSec  = (TRAVEL_MS / 1000).toFixed(3);

          // ── Stroke-dash snake animation ──────────────────────────────────
          //
          // dashArray = [S, huge gap] — only ONE snake body on the path at a time
          // dashoffset journey:
          //   start  = S      → snake tail is at position 0 (just entering), head at S
          //   end    = -(L)   → snake head is at L+S (exited), tail at L (just past end)
          //
          // Visible on path when dashoffset ∈ [-L, S]  → that's exactly TRAVEL_MS
          //
          // Opacity: 0→1 at 8%, 1→0 at 90%, to give soft enter/exit at path ends

          const dashArray  = `${S.toFixed(1)} ${(L * 3).toFixed(1)}`;
          const offsetFrom = S.toFixed(1);
          const offsetTo   = (-L).toFixed(1);

          return (
            <g key={`${entry.id}-${animCycle}`}>
              <defs>
                <style>{`
                  @keyframes snake_${animId} {
                    0%   { stroke-dashoffset: ${offsetFrom};  opacity: 0; }
                    8%   { stroke-dashoffset: ${(S * 0.9).toFixed(1)}; opacity: 1; }
                    90%  { stroke-dashoffset: ${(-L * 0.9).toFixed(1)}; opacity: 1; }
                    100% { stroke-dashoffset: ${offsetTo};   opacity: 0; }
                  }
                `}</style>
              </defs>

              {/* Outer golden glow */}
              <path
                ref={el => {
                  if (el) pathRefs.current.set(entry.id, el);
                  else    pathRefs.current.delete(entry.id);
                }}
                d={entry.d}
                fill="none"
                stroke="#FFD700"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#po-glow)"
                strokeDasharray={dashArray}
                style={{
                  animation: `snake_${animId} ${trvSec}s cubic-bezier(0.4,0,0.6,1) forwards`,
                }}
              />

              {/* Bright white core — makes the snake crisp */}
              <path
                d={entry.d}
                fill="none"
                stroke="rgba(255,255,200,0.9)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={dashArray}
                style={{
                  animation: `snake_${animId} ${trvSec}s cubic-bezier(0.4,0,0.6,1) forwards`,
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
