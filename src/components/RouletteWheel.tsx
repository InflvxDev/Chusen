import { useEffect, useRef, useMemo } from 'react';
import type { Participant } from './SorteoApp';

interface Props {
  participants: Participant[];
  winner: Participant | null;
  isRaffling: boolean;
}

const WHEEL_COLORS = ['#186cc3', '#0d3d7a', '#3b88d8'];
const MAX_SEGMENTS = 36;

function buildSegPath(i: number, n: number, R: number, cx: number, cy: number): string {
  const seg = 360 / n;
  const a1 = ((i * seg) - 90) * (Math.PI / 180);
  const a2 = (((i + 1) * seg) - 90) * (Math.PI / 180);
  const x1 = cx + R * Math.cos(a1);
  const y1 = cy + R * Math.sin(a1);
  const x2 = cx + R * Math.cos(a2);
  const y2 = cy + R * Math.sin(a2);
  return `M${cx},${cy} L${x1.toFixed(2)},${y1.toFixed(2)} A${R},${R} 0 ${seg > 180 ? 1 : 0},1 ${x2.toFixed(2)},${y2.toFixed(2)} Z`;
}

export default function RouletteWheel({ participants, winner, isRaffling }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const angleRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  // Stable random sample — only recalculates when the participants array changes
  const baseSample = useMemo(() => {
    if (participants.length <= MAX_SEGMENTS) return participants;
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, MAX_SEGMENTS);
  }, [participants]);

  // Inject winner into the visible set once known (without reshuffling the base)
  const visibleParticipants = useMemo(() => {
    if (!winner) return baseSample;
    const hasWinner = baseSample.some(p => p.id === winner.id);
    if (hasWinner) return baseSample;
    return [...baseSample.slice(0, baseSample.length - 1), winner];
  }, [baseSample, winner]);

  const isSampled = participants.length > MAX_SEGMENTS;
  const N = visibleParticipants.length;
  const segAngle = N > 0 ? 360 / N : 360;
  const CX = 210, CY = 210, R = 196;

  // ── Spin during raffling ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isRaffling) return;
    const el = wrapperRef.current;
    if (!el) return;
    el.style.transition = 'none';

    const startTs = performance.now();
    let lastTs = startTs;

    const tick = (ts: number) => {
      const dt = Math.min(ts - lastTs, 50); // cap to avoid jumps on tab focus
      lastTs = ts;
      const elapsed = ts - startTs;
      const speed = elapsed < 2000 ? 1 + (elapsed / 2000) * 7 : 8; // deg/ms, ramp to 8
      angleRef.current += speed * dt;
      el.style.transform = `rotate(${angleRef.current}deg)`;
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    };
  }, [isRaffling]);

  // ── Land on winner when raffle ends ─────────────────────────────────────
  useEffect(() => {
    if (isRaffling || !winner) return;
    if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }

    const winnerIdx = visibleParticipants.findIndex(p => p.id === winner.id);
    if (winnerIdx < 0) return;

    // Bring the center of the winner segment to the top pointer (0° = top)
    const segCenter = winnerIdx * segAngle + segAngle / 2;
    const targetInCycle = (360 - (segCenter % 360) + 360) % 360;
    const currentMod = ((angleRef.current % 360) + 360) % 360;
    let delta = targetInCycle - currentMod;
    if (delta < 30) delta += 360;
    const finalAngle = angleRef.current + delta + 5 * 360; // 5 extra full rotations

    requestAnimationFrame(() => {
      const el = wrapperRef.current;
      if (!el) return;
      el.style.transition = 'transform 4s cubic-bezier(0.23, 1, 0.32, 1)';
      el.style.transform = `rotate(${finalAngle}deg)`;
      angleRef.current = finalAngle;
    });
  }, [winner, isRaffling, visibleParticipants, segAngle]);

  if (N === 0) return null;

  const showText = segAngle >= 4;
  const fontSize = Math.min(12, Math.max(5, segAngle * 0.45));

  return (
    <div className="flex flex-col items-center gap-3">
      {isSampled && (
        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-mauve/60 bg-brand-surface border border-brand-border/40 rounded-full px-3 py-1">
          Mostrando {MAX_SEGMENTS} de {participants.length} participantes
        </p>
      )}
      <div className="relative" style={{ width: 420, height: 420 }}>
      {/* Pointer arrow at top, pointing down into the wheel */}
      <div
        className="absolute left-1/2 -translate-x-1/2 z-20"
        style={{
          top: -2,
          width: 0,
          height: 0,
          borderLeft: '9px solid transparent',
          borderRight: '9px solid transparent',
          borderTop: '18px solid var(--color-brand-blue)',
          filter: 'drop-shadow(0 2px 4px rgba(24,108,195,0.5))',
        }}
      />

      {/* Outer decorative ring */}
      <div className="absolute inset-0 rounded-full border-[3px] border-brand-blue/30 shadow-[0_0_30px_rgba(24,108,195,0.12)] pointer-events-none z-10" />

      {/* Spinning wheel */}
      <div
        ref={wrapperRef}
        className="absolute inset-0 rounded-full overflow-hidden"
        style={{ transformOrigin: '50% 50%' }}
      >
        <svg viewBox="0 0 420 420" width="420" height="420">
          {visibleParticipants.map((p, i) => {
            const midRad = ((i * segAngle + segAngle / 2) - 90) * (Math.PI / 180);
            const lr = R * 0.62;
            const lx = CX + lr * Math.cos(midRad);
            const ly = CY + lr * Math.sin(midRad);
            const label = p.numero !== undefined
              ? String(p.numero).padStart(2, '0')
              : String(i + 1).padStart(2, '0');
            const rotDeg = i * segAngle + segAngle / 2 - 90;

            return (
              <g key={p.id}>
                <path
                  d={buildSegPath(i, N, R, CX, CY)}
                  fill={WHEEL_COLORS[N % 2 === 1 && i === N - 1 ? 2 : i % 2]}
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth="0.5"
                />
                {showText && (
                  <text
                    x={lx}
                    y={ly}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="rgba(255,255,255,0.9)"
                    fontSize={fontSize}
                    fontWeight="800"
                    transform={`rotate(${rotDeg}, ${lx}, ${ly})`}
                  >
                    {label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Center hub */}
          <circle cx={CX} cy={CY} r={28} fill="#eef4fb" stroke="rgba(24,108,195,0.3)" strokeWidth="2" />
          <circle cx={CX} cy={CY} r={11} fill="var(--color-brand-blue)" />
        </svg>
      </div>
    </div>
    </div>
  );
}
