import { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { FiUsers, FiUploadCloud, FiList } from 'react-icons/fi';
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
    <div className="flex flex-col gap-5 rounded-2xl p-5 h-full bg-brand-surface border border-brand-border">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold flex items-center gap-2 uppercase tracking-widest text-brand-mauve">
          <FiUsers className="inline-block mr-1" /> Participantes
        </h2>
        <div className="flex rounded-lg overflow-hidden border border-brand-border">
          <button
            title="Subir Excel"
            onClick={() => switchMode('excel')}
            className={`px-2.5 py-1.5 transition-colors duration-200 ${inputMode === 'excel' ? 'bg-brand-blue text-white' : 'bg-transparent text-brand-mauve'}`}
          >
            <FiUploadCloud />
          </button>
          <button
            title="Escribir lista"
            onClick={() => switchMode('manual')}
            className={`px-2.5 py-1.5 transition-colors duration-200 ${inputMode === 'manual' ? 'bg-brand-blue text-white' : 'bg-transparent text-brand-mauve'}`}
          >
            <FiList />
          </button>
        </div>
      </div>

      {/* Drop zone / Manual input */}
      {inputMode === 'excel' ? (
        <div
          role="button"
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-7 cursor-pointer transition-all duration-200 select-none ${isDragging ? 'border-brand-blue bg-brand-blue/8' : 'border-brand-mauve/30 bg-transparent'}`}
        >
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleInput} className="hidden" />
          <FiUploadCloud className="text-3xl text-brand-blue" />
          <p className="text-sm font-semibold text-center leading-snug px-4 text-brand-mauve">
            {participants.length > 0
              ? <><span className="font-black text-brand-blue">{participants.length}</span> participantes · <span className="text-brand-text-muted">{fileName}</span></>
              : 'Clic o arrastra tu Excel aquí'}
          </p>
          <p className="text-xs text-brand-text-muted">.xlsx · .xls</p>
        </div>
      ) : (
        <textarea
          placeholder={`Un participante por línea\nEj:\nJuan Pérez\nMaría García`}
          value={manualText}
          onChange={e => handleManualChange(e.target.value)}
          rows={8}
          className="w-full rounded-xl border-2 border-brand-mauve/30 px-4 py-3 resize-none text-sm transition-all duration-200 focus:outline-none focus:border-brand-blue focus:ring-3 focus:ring-brand-blue/15 bg-brand-bg text-brand-text"
        />
      )}

      {/* Participants table */}
      {participants.length > 0 && (
        <div className="overflow-auto rounded-xl max-h-72 border border-brand-border">
          <table className="w-full text-sm min-w-max">
            <thead className="sticky top-0 bg-brand-surface2">
              <tr>
                <th className="px-3 py-2 text-left font-semibold whitespace-nowrap text-brand-mauve">#</th>
                {headers.map((h, i) => (
                  <th key={i} className="px-3 py-2 text-left font-semibold whitespace-nowrap text-brand-mauve">
                    {h || `Columna ${i + 1}`}
                  </th>
                ))}
                {participants[0]?.numero !== undefined && (
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap text-brand-blue-light">Número</th>
                )}
              </tr>
            </thead>
            <tbody>
              {participants.map((p, rowIdx) => (
                <tr
                  key={p.id}
                  className={`border-t border-brand-border transition-colors hover:bg-brand-blue/10 ${rowIdx % 2 !== 0 ? 'bg-brand-blue/4' : ''}`}
                >
                  <td className="px-3 py-2 tabular-nums text-brand-text-muted">{p.id}</td>
                  {p.data.map((val, i) => (
                    <td key={i} className="px-3 py-2 whitespace-nowrap text-brand-text">{val}</td>
                  ))}
                  {p.numero !== undefined && (
                    <td className="px-3 py-2 font-bold tabular-nums text-brand-blue-light">
                      #{String(p.numero).padStart(4, '0')}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
