import { FiGift, FiAward, FiCheckCircle } from 'react-icons/fi';

interface Props {
  prize: string;
  onPrizeChange: (value: string) => void;
}

export default function PrizeInput({ prize, onPrizeChange }: Props) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl p-6 lg:p-8 bg-brand-bg border border-brand-border/40 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue">
          <FiGift className="text-xl" />
        </div>
        <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-brand-mauve">
          Premio a Sortear
        </h2>
      </div>

      <div className="relative group flex flex-col gap-2">
        <input
          id="prize-input"
          type="text"
          value={prize}
          onChange={e => onPrizeChange(e.target.value)}
          placeholder="Ej: Viaje a la playa, Consola..."
          maxLength={120}
          className="w-full bg-brand-surface/50 border-b-2 border-brand-border/50 px-4 py-4 text-brand-text placeholder-brand-text-muted/60 focus:outline-none focus:border-brand-blue focus:bg-brand-surface transition-all duration-300 text-lg font-medium rounded-t-xl"
        />
        {prize.trim() && (
           <FiCheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 mt-1 text-brand-blue animate-fade-in-up" />
        )}
      </div>

      <p className="text-xs font-medium text-brand-text-muted/80 ml-1">
        Define el premio antes de comenzar.
      </p>
    </div>
  );
}
