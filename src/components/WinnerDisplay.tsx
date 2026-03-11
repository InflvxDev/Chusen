import { useState, useEffect, useMemo } from 'react';
import { FiAward, FiZap, FiChevronRight, FiRotateCcw } from 'react-icons/fi';
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
      if      (elapsed > 10000) delay = 800;
      else if (elapsed > 8500)  delay = 500;
      else if (elapsed > 7000)  delay = 260;
      else if (elapsed > 5000)  delay = 130;
      else if (elapsed > 2500)  delay = 80;

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
        className="relative overflow-hidden rounded-3xl text-center animate-winner-pop"
        style={{ background: 'linear-gradient(150deg, #0d3d7a 0%, var(--color-brand-blue) 50%, #0d3d7a 100%)' }}
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
        <div className="relative z-10 px-8 py-12 text-brand-white">
          <FiAward className="mx-auto mb-3 text-brand-white" style={{ fontSize: '5rem' }} />
          <h2 className="text-xl font-black uppercase tracking-widest mb-6 text-white/85">
            ¡Ganador!
          </h2>

          {headers[0] && (
            <p className="text-xs font-bold uppercase tracking-widest mb-0.5 text-white/75">
              {headers[0]}
            </p>
          )}
          <p className="text-4xl font-black mb-1 text-brand-white">
            {winner.data[0]}
          </p>
          {winner.data[1]?.trim() && (
            <p className="text-2xl font-bold mb-4 text-white/80">
              {winner.data[1]}
            </p>
          )}
          {winner.data[2]?.trim() && (
            <p className="text-base italic mb-4 text-white/65">
              "{winner.data[2]}"
            </p>
          )}
          {winner.numero !== undefined && (
            <p className="text-sm font-semibold mb-4 text-white/75">
              Número asignado:{' '}
              <span className="font-black text-brand-white">
                #{String(winner.numero).padStart(4, '0')}
              </span>
            </p>
          )}

          <div className="mt-6 pt-6 border-t border-white/15">
            <p className="text-xs font-bold uppercase tracking-widest mb-1 text-white/75">
              Premio
            </p>
            <p className="text-3xl font-black text-brand-white">
              {prize}
            </p>
          </div>

          <button
            onClick={onReset}
            className="mt-8 rounded-xl px-8 py-3 font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer bg-white/12 text-brand-white border border-white/20"
          >
            <FiRotateCcw className="inline-block mr-2" />
            Nuevo Sorteo
          </button>
        </div>
      </div>
    );
  }

  // ── Slot machine / idle display ──────────────────────────────────────────
  return (
    <div
      className={`relative w-full rounded-3xl overflow-hidden transition-all duration-500 bg-brand-surface border-2 ${isRaffling ? 'border-brand-blue animate-glow-border' : 'border-brand-border'}`}
    >
      {/* Top label */}
      <div className="flex justify-center py-3 border-b border-brand-border bg-brand-surface2">
        <span
          className={`text-xs font-black uppercase tracking-widest ${isRaffling ? 'animate-pulse text-brand-blue-light' : 'text-brand-mauve'}`}
        >
          {isRaffling
            ? <><FiZap className="inline-block mr-1" />sorteando participante…</>
            : participants.length > 0
              ? <><FiChevronRight className="inline-block mr-1" />listo para sortear</>
              : <><FiChevronRight className="inline-block mr-1" />en espera</>}
        </span>
      </div>

      <div className="flex flex-col items-center justify-center gap-3 px-8 py-12 min-h-50">
        {current?.numero !== undefined && (
          <span
            key={`num-${animKey}`}
            className="text-sm font-bold tracking-widest tabular-nums animate-slot-in text-brand-blue"
          >
            N.° {String(current.numero).padStart(4, '0')}
          </span>
        )}

        <div
          key={`name-${animKey}`}
          className="text-4xl font-black text-center leading-tight animate-slot-in text-brand-text"
        >
          {displayName}
        </div>

        {displayDesc && (
          <div
            key={`desc-${animKey}`}
            className="text-lg text-center animate-slot-in text-brand-mauve"
          >
            {displayDesc}
          </div>
        )}
      </div>
    </div>
  );
}
