import { useState, useEffect, useMemo } from 'react';
import { FiAward, FiZap, FiChevronRight, FiRotateCcw, FiStar, FiGift, FiUsers, FiCheckCircle } from 'react-icons/fi';
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
        className="relative w-full h-full min-h-125 flex flex-col items-center justify-center overflow-hidden rounded-3xl text-center animate-winner-pop shadow-2xl"
        style={{ background: 'linear-gradient(150deg, #0d3d7a 0%, var(--color-brand-blue) 50%, #0d3d7a 100%)' }}
      >
        {/* Confetti */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden>
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
        <div className="relative z-10 px-6 sm:px-8 py-10 w-full max-w-lg mx-auto flex flex-col items-center">
          
          <div className="w-20 h-20 bg-brand-blue/20 rounded-full flex items-center justify-center mb-6 text-brand-surface border border-brand-blue/30 shadow-[0_0_30px_rgba(59,136,216,0.3)]">
            <FiAward className="text-4xl" />
          </div>

          <h2 className="text-sm font-black uppercase tracking-[0.4em] mb-8 text-brand-surface">
            Tenemos un ganador
          </h2>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 sm:p-8 w-full shadow-xl relative">
            {headers[0] && (
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2 text-white/80">
                {headers[0]}
              </p>
            )}
            <p className="text-4xl md:text-5xl font-black mb-2 text-brand-white tracking-tight">
              {winner.data[0]}
            </p>
            {winner.data[1]?.trim() && (
              <p className="text-xl font-medium mb-3 text-white/80">
                {winner.data[1]}
              </p>
            )}
            {winner.data[2]?.trim() && (
              <p className="text-sm italic mb-4 text-white/80">
                "{winner.data[2]}"
              </p>
            )}
            
            <div className="mt-8 flex items-center justify-center gap-2 border-t border-white/10 pt-6">
              <FiGift className="text-brand-surface" />
              <p className="text-lg font-bold text-brand-white">
                {prize}
              </p>
            </div>
            
            {winner.numero !== undefined && (
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-brand-blue/20 text-brand-surface text-[10px] sm:text-xs font-black tracking-widest px-3 py-1 rounded-full border border-brand-blue/30">
                #{String(winner.numero).padStart(4, '0')}
              </div>
            )}
          </div>

          <button
            onClick={onReset}
            className="mt-10 rounded-full px-8 py-4 text-sm font-bold uppercase tracking-widest transition-all hover:-translate-y-1 hover:bg-white/15 active:translate-y-0 cursor-pointer bg-white/10 text-brand-white border border-white/20 flex items-center gap-3"
          >
            <FiRotateCcw className="text-lg" />
            <span className="mt-0.5">Nuevo Sorteo</span>
          </button>
        </div>
      </div>
    );
  }

  // ── Slot machine / idle display ──────────────────────────────────────────
  return (
    <div
      className={`relative w-full h-full min-h-100 flex flex-col items-center justify-center rounded-3xl overflow-hidden transition-all duration-700
      ${isRaffling ? 'bg-brand-surface border-2 border-brand-blue shadow-[0_0_40px_rgba(24,108,195,0.2)] scale-[1.02]' : 'bg-brand-bg border border-brand-border/40 shadow-sm'}
      `}
    >
      {/* Subtle grid background for tech/minimalist feel */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--color-brand-blue) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

      {isRaffling && (
        <div className="absolute top-8 text-xs font-black uppercase tracking-[0.3em] text-brand-blue animate-pulse flex items-center gap-2">
          <FiZap /> Sorteando
        </div>
      )}

      <div className="flex flex-col items-center justify-center px-6 py-12 z-10 w-full overflow-hidden">

        {/* ── Idle: no participants ── */}
        {participants.length === 0 && !isRaffling && (
          <div className="flex flex-col items-center text-center gap-5 animate-fade-in-up">
            <div className="w-20 h-20 rounded-full bg-brand-blue/8 border border-brand-blue/15 flex items-center justify-center shadow-sm">
              <FiStar className="text-3xl text-brand-blue/50" />
            </div>
            <div>
              <h3 className="text-2xl lg:text-3xl font-black text-brand-text tracking-tight mb-3">¡Comienza la magia!</h3>
              <p className="text-brand-mauve/80 text-sm md:text-base max-w-xs mx-auto leading-relaxed">
                Sube tu listado de participantes y define el premio en el panel izquierdo para empezar.
              </p>
            </div>
            <div className="flex items-center gap-6 mt-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-brand-mauve/50 uppercase tracking-widest">
                <FiUsers className="text-base" /> Participantes
              </div>
              <div className="w-px h-4 bg-brand-border/50"></div>
              <div className="flex items-center gap-2 text-xs font-semibold text-brand-mauve/50 uppercase tracking-widest">
                <FiGift className="text-base" /> Premio
              </div>
            </div>
          </div>
        )}

        {/* ── Idle: participants loaded, but no prize yet ── */}
        {participants.length > 0 && !prize.trim() && !isRaffling && !current && (
          <div className="flex flex-col items-center text-center gap-5 animate-fade-in-up">
            <div className="w-20 h-20 rounded-full bg-brand-blue/8 border border-brand-blue/15 flex items-center justify-center shadow-sm">
              <FiGift className="text-3xl text-brand-blue/50" />
            </div>
            <div>
              <h3 className="text-2xl lg:text-3xl font-black text-brand-text tracking-tight mb-3">
                <span className="text-brand-blue">{participants.length}</span> participantes listos
              </h3>
              <p className="text-brand-mauve/80 text-sm md:text-base max-w-xs mx-auto leading-relaxed">
                Solo falta definir el premio para poder iniciar el sorteo.
              </p>
            </div>
          </div>
        )}

        {/* ── Idle: everything ready ── */}
        {participants.length > 0 && prize.trim() && !isRaffling && !current && (
          <div className="flex flex-col items-center text-center gap-5 animate-fade-in-up">
            <div className="w-20 h-20 rounded-full bg-brand-blue/15 border-2 border-brand-blue/30 flex items-center justify-center shadow-md shadow-brand-blue/10">
              <FiCheckCircle className="text-4xl text-brand-blue" />
            </div>
            <div>
              <h3 className="text-3xl lg:text-4xl font-black text-brand-text tracking-tight mb-3">Todo listo</h3>
              <p className="text-brand-mauve/80 font-medium text-base max-w-xs mx-auto leading-relaxed">
                Haz clic en <span className="font-black text-brand-blue">Iniciar Sorteo</span> para descubrir al ganador.
              </p>
            </div>
            <div className="mt-1 bg-brand-blue/6 border border-brand-blue/15 rounded-2xl px-5 py-3 flex items-center gap-3">
              <FiGift className="text-brand-blue text-lg shrink-0" />
              <p className="text-sm font-semibold text-brand-text truncate max-w-50">{prize}</p>
            </div>
          </div>
        )}

        {/* ── Slot machine cycling ── */}
        {(isRaffling || current) && (
          <>
            {current?.numero !== undefined && (
              <span
                key={`num-${animKey}`}
                className="text-sm font-bold tracking-[0.4em] tabular-nums text-brand-blue/80 animate-slot-in bg-brand-blue/5 px-4 py-1.5 rounded-full border border-brand-blue/10 mb-4"
              >
                N.° {String(current.numero).padStart(4, '0')}
              </span>
            )}
            <div
              key={`name-${animKey}`}
              className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-center leading-tight tracking-tight text-brand-text w-full
              ${isRaffling ? 'animate-slot-in blur-[0.5px]' : ''} mb-4 px-2`}
              style={{
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                hyphens: 'auto'
              }}
            >
              {displayName}
            </div>
            {displayDesc && (
              <div
                key={`desc-${animKey}`}
                className="text-lg md:text-xl text-center text-brand-mauve font-medium animate-slot-in mt-2"
              >
                {displayDesc}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
