import { FiGift, FiAward } from 'react-icons/fi';

interface Props {
  prize: string;
  onPrizeChange: (value: string) => void;
}

export default function PrizeInput({ prize, onPrizeChange }: Props) {
  return (
    <div className="flex flex-col gap-5 rounded-2xl p-5 bg-brand-surface border border-brand-border">
      <h2 className="text-xs font-bold flex items-center gap-2 uppercase tracking-widest text-brand-mauve">
        <FiGift className="inline-block mr-1" /> Premio a Sortear
      </h2>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="prize-input"
          className="text-xs font-medium uppercase tracking-widest text-brand-mauve"
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
          className="w-full rounded-xl px-4 py-3 transition-all focus:outline-none bg-brand-surface2 border border-brand-border text-brand-text focus:border-brand-blue focus:ring-3 focus:ring-brand-blue/20"
        />
      </div>

      {prize.trim() && (
        <div className="flex items-center gap-3 rounded-xl px-4 py-3 animate-fade-in-up bg-brand-blue/12 border border-brand-blue/35">
          <FiAward className="text-xl text-brand-blue" />
          <div>
            <p className="font-bold leading-snug text-brand-text">{prize}</p>
            <p className="text-xs mt-0.5 text-brand-blue-light">Premio confirmado</p>
          </div>
        </div>
      )}

      <p className="text-xs mt-auto text-brand-text-muted">
        Ingresa el nombre del premio antes de iniciar el sorteo.
      </p>
    </div>
  );
}
