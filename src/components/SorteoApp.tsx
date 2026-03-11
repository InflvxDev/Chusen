import { useState, useEffect } from 'react';
import { FiLoader, FiShuffle, FiZap, FiDisc } from 'react-icons/fi';
import ExcelUploader from './ExcelUploader';
import PrizeInput from './PrizeInput';
import WinnerDisplay from './WinnerDisplay';

export interface Participant {
  id: number;
  data: string[];
  numero?: number;
}

const RAFFLE_DURATION_MS = 12000;

export default function SorteoApp() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [prize, setPrize] = useState('');
  const [winner, setWinner] = useState<Participant | null>(null);
  const [isRaffling, setIsRaffling] = useState(false);
  const [winnerRevealed, setWinnerRevealed] = useState(false);
  const [visualMode, setVisualMode] = useState<'slots' | 'roulette'>('slots');

  // Force slots when participants exceed the roulette limit
  const canUseRoulette = participants.length <= 24;

  useEffect(() => {
    if (!canUseRoulette) setVisualMode('slots');
  }, [canUseRoulette]);

  const canRaffle = participants.length > 1 && prize.trim() !== '' && !isRaffling;

  const handleRaffle = () => {
    if (!canRaffle) return;

    const withNumbers: Participant[] = participants.map(p => ({
      ...p,
      numero: p.id,
    }));
    setParticipants(withNumbers);

    const winnerIndex = Math.floor(Math.random() * withNumbers.length);
    const selected = withNumbers[winnerIndex];

    setWinner(null);
    setWinnerRevealed(false);
    setIsRaffling(true);

    setTimeout(() => {
      setIsRaffling(false);
      setWinner(selected);
      setTimeout(() => setWinnerRevealed(true), visualMode === 'roulette' ? 4500 : 100);
    }, RAFFLE_DURATION_MS);
  };

  const handleReset = () => {
    setWinner(null);
    setWinnerRevealed(false);
  };

  return (
    <div className="min-h-screen bg-brand-bg relative overflow-hidden flex flex-col font-sans text-brand-text">
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 flex flex-col">
        
        {/* ── Header ── */}
        <header className="w-full flex justify-center items-center mb-8 lg:mb-12">
          <div className="text-center">
            <h1
              className="font-black text-5xl md:text-6xl select-none animate-logo-reveal tracking-[0.2em] bg-clip-text text-transparent"
              style={{
                background: 'linear-gradient(135deg, var(--color-brand-blue) 0%, var(--color-brand-blue-light) 60%, var(--color-brand-blue) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              CHUSEN
            </h1>
            <p className="mt-3 text-xs md:text-sm font-semibold tracking-[0.3em] uppercase text-brand-mauve opacity-80">
              La suerte decide, nosotros la mostramos
            </p>
          </div>
        </header>

        {/* ── Main content grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 flex-1 items-stretch">
          
          {/* ── Left Column: Config (Inputs) ── */}
          <div className={`lg:col-span-5 flex flex-col gap-6 transition-all duration-500 ease-in-out ${isRaffling || winnerRevealed ? 'opacity-40 grayscale-[0.5] pointer-events-none' : 'opacity-100'}`}>
            <PrizeInput prize={prize} onPrizeChange={setPrize} />
            <ExcelUploader
              onParticipantsLoaded={(data: Participant[], hdrs: string[]) => {
                setParticipants(data);
                setHeaders(hdrs);
                setWinner(null);
                setWinnerRevealed(false);
              }}
              participants={participants}
              headers={headers}
            />
          </div>

          {/* ── Right Column: Display Stage & Actions ── */}
          <div className="lg:col-span-7 flex flex-col h-full relative">
            
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 -m-20 w-64 h-64 bg-brand-blue/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -m-20 w-64 h-64 bg-brand-mauve/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex-1 flex flex-col justify-center relative z-10 w-full min-h-125">
              <WinnerDisplay
                participants={participants}
                winner={winner}
                winnerRevealed={winnerRevealed}
                isRaffling={isRaffling}
                prize={prize}
                headers={headers}
                onReset={handleReset}
                visualMode={visualMode}
              />
            </div>

            {/* ── Sortear button ── */}
            {!winnerRevealed && (
              <div className="relative z-10">
                {/* Mode selector: only when idle and roulette is feasible */}
                {!isRaffling && !winner && canUseRoulette && (
                  <div className="mt-5 flex flex-col items-center gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold uppercase tracking-widest text-brand-mauve/60">Modo</span>
                      <div className="flex bg-brand-surface/60 rounded-full p-1 border border-brand-border/30">
                        <button
                          onClick={() => setVisualMode('slots')}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 ${visualMode === 'slots' ? 'bg-brand-white text-brand-blue shadow-sm' : 'text-brand-mauve hover:text-brand-text'}`}
                        >
                          <FiZap className="text-sm" /> Tragaperras
                        </button>
                        <button
                          onClick={() => setVisualMode('roulette')}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 ${visualMode === 'roulette' ? 'bg-brand-white text-brand-blue shadow-sm' : 'text-brand-mauve hover:text-brand-text'}`}
                        >
                          <FiDisc className="text-sm" /> Ruleta
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] text-brand-mauve/70 uppercase tracking-widest">
                      Ruleta disponible con 24 o menos participantes
                    </p>
                  </div>
                )}

                {/* Message when too many participants for roulette */}
                {!isRaffling && !winner && !canUseRoulette && participants.length > 0 && (
                  <div className="mt-5 text-center">
                    <p className="text-xs font-semibold text-brand-mauve/80">
                      Modo automático: <span className="text-brand-blue font-bold">Tragaperras</span>
                    </p>
                    <p className="text-[10px] text-brand-mauve/60 uppercase tracking-widest mt-1">
                      (Ruleta requiere 24 o menos participantes)
                    </p>
                  </div>
                )}

                <div className={`${!isRaffling && !winner && participants.length > 0 ? 'mt-4' : 'mt-8'} flex justify-center`}>
                <button
                  onClick={handleRaffle}
                  disabled={!canRaffle}
                  className={`
                    group relative flex items-center justify-center gap-3 px-12 py-5 text-lg font-black rounded-full uppercase tracking-widest
                    transition-all duration-300 select-none overflow-hidden
                    ${canRaffle 
                      ? 'cursor-pointer hover:-translate-y-1 hover:shadow-xl active:translate-y-0 text-brand-white' 
                      : 'cursor-not-allowed opacity-50 bg-brand-surface border-2 border-brand-border text-brand-mauve'}
                  `}
                  style={canRaffle ? {
                    background: 'linear-gradient(135deg, var(--color-brand-blue) 0%, var(--color-brand-blue-light) 100%)',
                    boxShadow: '0 8px 32px rgba(24,108,195,0.3)',
                  } : undefined}
                >
                  {isRaffling ? (
                    <><FiLoader className="text-2xl animate-spin" /> <span className="relative z-10">Sorteando...</span></>
                  ) : (
                    <>
                      <FiShuffle className="text-2xl transition-transform group-hover:rotate-180 duration-500" />
                      <span className="relative z-10">Iniciar Sorteo</span>
                    </>
                  )}
                  {canRaffle && (
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
                  )}
                </button>
                </div>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
