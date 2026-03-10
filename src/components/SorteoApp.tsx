import { useState } from 'react';
import ExcelUploader from './ExcelUploader';
import PrizeInput from './PrizeInput';
import WinnerDisplay from './WinnerDisplay';

export interface Participant {
  id: number;
  data: string[];
  numero?: number;
}

const RAFFLE_DURATION_MS = 5000;

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
      numero: Math.floor(Math.random() * 9999) + 1,
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
    <div className="min-h-screen" style={{ background: 'var(--brand-bg)' }}>
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">

        {/* ── Header ── */}
        <header className="text-center pt-4 pb-2">
          <h1
            className="font-black text-7xl select-none"
            style={{
              animation: 'logo-reveal 0.8s ease-out both',
              letterSpacing: '0.15em',
              background: 'linear-gradient(135deg, var(--brand-blue) 0%, var(--brand-blue-light) 60%, var(--brand-blue) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            CHUSEN
          </h1>
          <p className="mt-2 text-xs font-medium tracking-widest uppercase" style={{ color: 'var(--brand-mauve)' }}>
            Sistema de sorteos en vivo
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
                  ? 'cursor-pointer hover:scale-105 active:scale-95'
                  : 'cursor-not-allowed opacity-40',
              ].join(' ')}
              style={canRaffle ? {
                background: 'linear-gradient(135deg, var(--brand-blue) 0%, var(--brand-blue-light) 100%)',
                color: 'var(--brand-white)',
                boxShadow: '0 4px 28px rgba(24,108,195,0.50)',
              } : {
                background: 'var(--brand-surface2)',
                color: 'var(--brand-mauve)',
              }}
            >
              {isRaffling ? '⏳ Sorteando…' : '🎲 Sortear'}
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
