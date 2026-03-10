import { useState, useEffect, useMemo } from 'react';
import type { Participant } from './SorteoApp';

interface Props {
  participants: Participant[];
  winner: Participant | null;
  winnerRevealed: boolean;
  isRaffling: boolean;
  prize: string;
  headers: string[];
  onReset: () => void;
}

const CONFETTI_COLORS = [
  '#186cc3', '#fffefe', '#b2989b',
  '#3b88d8', '#5da8f0', '#d4c8ca', '#82b8e8',
];

export default function WinnerDisplay({
  participants,
  winner,
  winnerRevealed,
  isRaffling,
  prize,
  headers,
  onReset,
}: Props) {
  const [current, setCurrent] = useState<Participant | null>(null);
  const [animKey, setAnimKey] = useState(0);

  // ── Slot-machine cycling animation ──────────────────────────────────────
  useEffect(() => {
    if (!isRaffling || participants.length === 0) return;
    let timeoutId: ReturnType<typeof setTimeout>;
    const startTime = performance.now();

    const cycle = () => {
      const elapsed = performance.now() - startTime;
      const idx = Math.floor(Math.random() * participants.length);
      setCurrent(participants[idx]);
      setAnimKey(k => k + 1);

      let delay = 60;
      if      (elapsed > 4000) delay = 600;
      else if (elapsed > 3000) delay = 350;
      else if (elapsed > 2000) delay = 160;
      else if (elapsed > 1000) delay = 90;

      timeoutId = setTimeout(cycle, delay);
    };

    timeoutId = setTimeout(cycle, 60);
    return () => clearTimeout(timeoutId);
  }, [isRaffling, participants]);

  // ── Sync current with winner / reset ────────────────────────────────────
  useEffect(() => {
    if (!winner) { setCurrent(null); return; }
    setCurrent(winner);
  }, [winner]);

  // ── Confetti pieces (stable across renders) ────────────────────────────
  const confetti = useMemo(() =>
    Array.from({ length: 90 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2.5,
      duration: 2.5 + Math.random() * 2,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: 6 + Math.floor(Math.random() * 8),
      isCircle: Math.random() > 0.5,
    })),
  []);

  const displayName = current
    ? [current.data[0], current.data[1]].filter(v => v?.trim()).join('  ')
    : '· · ·';
  const displayDesc = current?.data[2]?.trim() ?? '';

  // ── Winner revealed: show card only ─────────────────────────────────────
  if (winnerRevealed && winner) {
    return (
      <div
        className="relative overflow-hidden rounded-3xl text-center"
        style={{
          background: 'linear-gradient(150deg, #0d3d7a 0%, var(--brand-blue) 50%, #0d3d7a 100%)',
          animation: 'winner-pop 0.65s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        }}
      >
        {/* Confetti */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
          {confetti.map(p => (
            <div
              key={p.id}
              className="absolute top-0"
              style={{
                left: `${p.left}%`,
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                borderRadius: p.isCircle ? '50%' : '2px',
                animation: `confetti-fall ${p.duration}s ${p.delay}s ease-in both`,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 px-8 py-12" style={{ color: 'var(--brand-white)' }}>
          <div className="text-7xl mb-3">🏆</div>
          <h2
            className="text-xl font-black uppercase tracking-widest mb-6"
            style={{ color: 'var(--brand-mauve)' }}
          >
            ¡Ganador!
          </h2>

          {headers[0] && (
            <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: 'var(--brand-mauve)' }}>
              {headers[0]}
            </p>
          )}
          <p className="text-4xl font-black mb-1" style={{ color: 'var(--brand-white)' }}>
            {winner.data[0]}
          </p>
          {winner.data[1]?.trim() && (
            <p className="text-2xl font-bold mb-4" style={{ color: 'rgba(255,254,254,0.80)' }}>
              {winner.data[1]}
            </p>
          )}
          {winner.data[2]?.trim() && (
            <p className="text-base italic mb-4" style={{ color: 'rgba(255,254,254,0.65)' }}>
              "{winner.data[2]}"
            </p>
          )}
          {winner.numero !== undefined && (
            <p className="text-sm font-semibold mb-4" style={{ color: 'var(--brand-mauve)' }}>
              Número asignado:{' '}
              <span className="font-black" style={{ color: 'var(--brand-white)' }}>
                #{String(winner.numero).padStart(4, '0')}
              </span>
            </p>
          )}

          <div className="mt-6 pt-6 border-t" style={{ borderColor: 'rgba(255,254,254,0.15)' }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--brand-mauve)' }}>
              Premio
            </p>
            <p className="text-3xl font-black" style={{ color: 'var(--brand-white)' }}>
              {prize}
            </p>
          </div>

          <button
            onClick={onReset}
            className="mt-8 rounded-xl px-8 py-3 font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer"
            style={{
              background: 'rgba(255,254,254,0.12)',
              color: 'var(--brand-white)',
              border: '1px solid rgba(255,254,254,0.20)',
            }}
          >
            Nuevo Sorteo
          </button>
        </div>
      </div>
    );
  }

  // ── Slot machine / idle display ──────────────────────────────────────────
  return (
    <div
      className="relative w-full rounded-3xl overflow-hidden transition-all duration-500"
      style={{
        background: 'var(--brand-surface)',
        border: `2px solid ${isRaffling ? 'var(--brand-blue)' : 'var(--brand-border)'}`,
        ...(isRaffling ? { animation: 'glow-border 1s ease-in-out infinite' } : {}),
      }}
    >
      {/* Top label */}
      <div
        className="flex justify-center py-3 border-b"
        style={{ background: 'var(--brand-surface2)', borderColor: 'var(--brand-border)' }}
      >
        <span
          className={['text-xs font-black uppercase tracking-widest', isRaffling ? 'animate-pulse' : ''].join(' ')}
          style={{ color: isRaffling ? 'var(--brand-blue-light)' : 'var(--brand-mauve)' }}
        >
          {isRaffling
            ? '⚡ sorteando participante…'
            : participants.length > 0
              ? '▸ listo para sortear'
              : '▸ en espera'}
        </span>
      </div>

      <div className="flex flex-col items-center justify-center gap-3 px-8 py-12 min-h-50">
        {current?.numero !== undefined && (
          <span
            key={`num-${animKey}`}
            className="text-sm font-bold tracking-widest tabular-nums"
            style={{ animation: 'slot-in 0.14s ease-out', color: 'var(--brand-blue)' }}
          >
            N.° {String(current.numero).padStart(4, '0')}
          </span>
        )}

        <div
          key={`name-${animKey}`}
          className="text-4xl font-black text-center leading-tight"
          style={{ animation: 'slot-in 0.14s ease-out', color: 'var(--brand-text)' }}
        >
          {displayName}
        </div>

        {displayDesc && (
          <div
            key={`desc-${animKey}`}
            className="text-lg text-center"
            style={{ animation: 'slot-in 0.14s ease-out', color: 'var(--brand-mauve)' }}
          >
            {displayDesc}
          </div>
        )}
      </div>
    </div>
  );
}
