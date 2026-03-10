import { FiGift, FiAward } from 'react-icons/fi';

interface Props {
  prize: string;
  onPrizeChange: (value: string) => void;
}

export default function PrizeInput({ prize, onPrizeChange }: Props) {
  return (
    <div
      className="flex flex-col gap-5 rounded-2xl p-5"
      style={{ background: 'var(--brand-surface)', border: '1px solid var(--brand-border)' }}
    >
      <h2
        className="text-xs font-bold flex items-center gap-2 uppercase tracking-widest"
        style={{ color: 'var(--brand-mauve)' }}
      >
        <FiGift className="inline-block mr-1" /> Premio a Sortear
      </h2>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="prize-input"
          className="text-xs font-medium uppercase tracking-widest"
          style={{ color: 'var(--brand-mauve)' }}
        >
          ¿Qué se va a sortear?
        </label>
        <input
          id="prize-input"
          type="text"
          value={prize}
          onChange={e => onPrizeChange(e.target.value)}
          placeholder="Ej: Televisor 55'', Viaje…"
          maxLength={120}
          className="w-full rounded-xl px-4 py-3 transition-all focus:outline-none"
          style={{
            background: 'var(--brand-surface2)',
            border: '1px solid var(--brand-border)',
            color: 'var(--brand-text)',
          }}
          onFocus={e => {
            e.currentTarget.style.borderColor = 'var(--brand-blue)';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(24,108,195,0.20)';
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = 'var(--brand-border)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
      </div>

      {prize.trim() && (
        <div
          className="flex items-center gap-3 rounded-xl px-4 py-3"
          style={{
            animation: 'fade-in-up 0.25s ease-out',
            background: 'rgba(24,108,195,0.12)',
            border: '1px solid rgba(24,108,195,0.35)',
          }}
        >
          <FiAward className="text-xl" style={{ color: 'var(--brand-blue)' }} />
          <div>
            <p className="font-bold leading-snug" style={{ color: 'var(--brand-text)' }}>{prize}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--brand-blue-light)' }}>Premio confirmado</p>
          </div>
        </div>
      )}

      <p className="text-xs mt-auto" style={{ color: 'var(--brand-text-muted)' }}>
        Ingresa el nombre del premio antes de iniciar el sorteo.
      </p>
    </div>
  );
}
