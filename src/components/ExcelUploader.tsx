import { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { FiUsers, FiUploadCloud, FiList, FiCheck, FiTrash2 } from 'react-icons/fi';
import type { Participant } from './SorteoApp';

type InputMode = 'excel' | 'manual';

interface Props {
  onParticipantsLoaded: (participants: Participant[], headers: string[]) => void;
  participants: Participant[];
  headers: string[];
}

export default function ExcelUploader({ onParticipantsLoaded, participants, headers }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [inputMode, setInputMode] = useState<InputMode>('excel');
  const [manualText, setManualText] = useState('');

  const switchMode = (mode: InputMode) => {
    if (mode === inputMode) return;
    setInputMode(mode);
    onParticipantsLoaded([], []);
    setManualText('');
    setFileName('');
  };

  const handleManualChange = (text: string) => {
    setManualText(text);
    const lines = text.split('\n').filter(l => l.trim() !== '');
    if (lines.length === 0) { onParticipantsLoaded([], []); return; }
    const data: Participant[] = lines.map((line, i) => ({ id: i + 1, data: [line.trim()] }));
    onParticipantsLoaded(data, ['Nombre']);
  };

  const parseFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const raw = evt.target?.result;
      if (!raw) return;
      const workbook = XLSX.read(raw, { type: 'binary' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];

      if (rows.length < 2) return;

      const hdrs = (rows[0] as (string | number | null | undefined)[]).map(cell => String(cell ?? ''));
      const data: Participant[] = rows
        .slice(1)
        .map((row, i) => ({
          id: i + 1,
          data: (row as (string | number | null | undefined)[]).map(cell => String(cell ?? '')),
        }))
        .filter(p => p.data[0]?.trim() !== '');

      onParticipantsLoaded(data, hdrs);
    };
    reader.readAsBinaryString(file);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) parseFile(file);
  };

  return (
    <div className="flex flex-col gap-5 rounded-3xl p-6 lg:p-8 flex-1 bg-brand-bg border border-brand-border/40 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue">
            <FiUsers className="text-xl" />
          </div>
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-brand-mauve">
            Participantes
          </h2>
        </div>
        
        <div className="flex bg-brand-surface/60 rounded-full p-1 border border-brand-border/30">
          <button
            title="Subir Archivo Excel"
            onClick={() => switchMode('excel')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 ${inputMode === 'excel' ? 'bg-brand-white text-brand-blue shadow-sm' : 'text-brand-mauve hover:text-brand-text'}`}
          >
            <FiUploadCloud className="text-base" /> <span className="hidden sm:inline">Excel</span>
          </button>
          <button
            title="Añadir Manualmente"
            onClick={() => switchMode('manual')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 ${inputMode === 'manual' ? 'bg-brand-white text-brand-blue shadow-sm' : 'text-brand-mauve hover:text-brand-text'}`}
          >
            <FiList className="text-base" /> <span className="hidden sm:inline">Manual</span>
          </button>
        </div>
      </div>

      {inputMode === 'excel' ? (
        <div
          role="button"
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed py-10 px-6 cursor-pointer transition-all duration-300 group
            ${isDragging ? 'border-brand-blue bg-brand-blue/5 scale-[1.02]' : 'border-brand-border hover:border-brand-blue/50 hover:bg-brand-surface/30'}
          `}
        >
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleInput} className="hidden" />
          
          <div className={`p-4 rounded-full transition-colors duration-300 ${participants.length > 0 ? 'bg-green-100 text-green-600' : 'bg-brand-surface text-brand-blue group-hover:scale-110'}`}>
            {participants.length > 0 ? <FiCheck className="text-3xl" /> : <FiUploadCloud className="text-3xl" />}
          </div>

          <div className="text-center">
            {participants.length > 0 ? (
              <>
                <p className="text-base text-brand-text font-medium">Doc: {fileName}</p>
                <p className="text-sm text-brand-blue font-bold mt-1">{participants.length} personas listas</p>
              </>
            ) : (
              <>
                <p className="text-base text-brand-text font-medium">Arrastra tu Excel aquí</p>
                <p className="text-xs text-brand-text-muted mt-2 uppercase tracking-widest">o haz clic para explorar</p>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-50 flex flex-col">
          <textarea
            placeholder={`Un participante por línea...\nEjemplo:\nJuan Pérez\nMaría Estévez\n...`}
            value={manualText}
            onChange={e => handleManualChange(e.target.value)}
            className="flex-1 w-full rounded-2xl border-2 border-brand-border/50 p-5 resize-none text-sm transition-all duration-300 focus:outline-none focus:border-brand-blue focus:bg-brand-surface/30 bg-brand-surface/10 text-brand-text font-medium"
          />
          {participants.length > 0 && (
            <p className="text-xs text-brand-blue font-bold mt-3 text-right">
              {participants.length} participantes detectados
            </p>
          )}
        </div>
      )}

      {/* Participants List Summary (Minimalist) */}
      {participants.length > 0 && (
        <div className="mt-2 flex items-center justify-between bg-brand-surface2/40 px-5 py-3 rounded-xl border border-brand-border/30">
           <span className="text-xs font-semibold text-brand-mauve uppercase tracking-widest">
             Datos cargados
           </span>
           <button 
             onClick={(e) => { e.stopPropagation(); onParticipantsLoaded([], []); setFileName(''); setManualText(''); }} 
             className="text-xs text-red-500 hover:text-red-600 font-bold flex items-center gap-1 transition-colors"
           >
             <FiTrash2 className="text-sm" /> Limpiar
           </button>
        </div>
      )}
    </div>
  );
}
