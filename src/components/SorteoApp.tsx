import { useState } from 'react';
import { FiLoader, FiShuffle } from 'react-icons/fi';
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

  const canRaffle = participants.length > 0 && prize.trim() !== '' && !isRaffling;

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
      setTimeout(() => setWinnerRevealed(true), 100);
    }, RAFFLE_DURATION_MS);
  };

  const handleReset = () => {
    setWinner(null);
    setWinnerRevealed(false);
  };

  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">

        {/* ── Header ── */}
        <header className="text-center pt-4 pb-2">
          <h1
            className="font-black text-7xl select-none animate-logo-reveal tracking-[0.15em] bg-clip-text text-transparent"
            style={{
              background: 'linear-gradient(135deg, var(--color-brand-blue) 0%, var(--color-brand-blue-light) 60%, var(--color-brand-blue) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            CHUSEN
          </h1>
          <p className="mt-2 text-xs font-medium tracking-widest uppercase text-brand-mauve">
            La suerte decide, nosotros la mostramos.
          </p>
        </header>

        {/* ── Slot machine / Winner zone — only while raffling or winner exists ── */}
        {(isRaffling || winner) && (
          <WinnerDisplay
            participants={participants}
            winner={winner}
            winnerRevealed={winnerRevealed}
            isRaffling={isRaffling}
            prize={prize}
            headers={headers}
            onReset={handleReset}
          />
        )}

        {/* ── Sortear button — hidden once winner is revealed ── */}
        {!winnerRevealed && (
          <div className="flex justify-center">
            <button
              onClick={handleRaffle}
              disabled={!canRaffle}
              className={[
                'px-16 py-4 text-lg font-black rounded-2xl uppercase tracking-widest',
                'transition-all duration-300 select-none',
                canRaffle
                  ? 'cursor-pointer hover:scale-105 active:scale-95 text-brand-white'
                  : 'cursor-not-allowed opacity-40 bg-brand-surface2 text-brand-mauve',
              ].join(' ')}
              style={canRaffle ? {
                background: 'linear-gradient(135deg, var(--color-brand-blue) 0%, var(--color-brand-blue-light) 100%)',
                boxShadow: '0 4px 28px rgba(24,108,195,0.50)',
              } : undefined}
            >
              {isRaffling
                ? <><FiLoader className="inline-block mr-2 animate-spin" />Sorteando…</>
                : <><FiShuffle className="inline-block mr-2" />Sortear</>}
            </button>
          </div>
        )}

        {/* ── Inputs: Excel uploader + Prize ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
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
          <div className="lg:col-span-1">
            <PrizeInput prize={prize} onPrizeChange={setPrize} />
          </div>
        </div>

      </div>
    </div>
  );
}
