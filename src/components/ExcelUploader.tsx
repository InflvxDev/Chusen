import { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import type { Participant } from './SorteoApp';

interface Props {
  onParticipantsLoaded: (participants: Participant[], headers: string[]) => void;
  participants: Participant[];
  headers: string[];
}

export default function ExcelUploader({ onParticipantsLoaded, participants, headers }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');

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
    <div
      className="flex flex-col gap-5 rounded-2xl p-5 h-full"
      style={{ background: 'var(--brand-surface)', border: '1px solid var(--brand-border)' }}
    >
      <h2
        className="text-xs font-bold flex items-center gap-2 uppercase tracking-widest"
        style={{ color: 'var(--brand-mauve)' }}
      >
        <span>📋</span> Participantes
      </h2>

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-7 cursor-pointer transition-all duration-200 select-none"
        style={{
          borderColor: isDragging ? 'var(--brand-blue)' : 'rgba(178,152,155,0.30)',
          background: isDragging ? 'rgba(24,108,195,0.08)' : 'transparent',
        }}
      >
        <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleInput} className="hidden" />
        <span className="text-3xl">📁</span>
        <p className="text-sm font-semibold text-center leading-snug px-4" style={{ color: 'var(--brand-mauve)' }}>
          {participants.length > 0
            ? <><span className="font-black" style={{ color: 'var(--brand-blue)' }}>{participants.length}</span> participantes · <span style={{ color: 'var(--brand-text-muted)' }}>{fileName}</span></>
            : 'Clic o arrastra tu Excel aquí'}
        </p>
        <p className="text-xs" style={{ color: 'var(--brand-text-muted)' }}>.xlsx · .xls</p>
      </div>

      {/* Participants table */}
      {participants.length > 0 && (
        <div className="overflow-auto rounded-xl max-h-72" style={{ border: '1px solid var(--brand-border)' }}>
          <table className="w-full text-sm min-w-max">
            <thead className="sticky top-0" style={{ background: 'var(--brand-surface2)' }}>
              <tr>
                <th className="px-3 py-2 text-left font-semibold whitespace-nowrap" style={{ color: 'var(--brand-mauve)' }}>#</th>
                {headers.map((h, i) => (
                  <th key={i} className="px-3 py-2 text-left font-semibold whitespace-nowrap" style={{ color: 'var(--brand-mauve)' }}>
                    {h || `Columna ${i + 1}`}
                  </th>
                ))}
                {participants[0]?.numero !== undefined && (
                  <th className="px-3 py-2 text-left font-semibold whitespace-nowrap" style={{ color: 'var(--brand-blue-light)' }}>Número</th>
                )}
              </tr>
            </thead>
            <tbody>
              {participants.map((p, rowIdx) => (
                <tr
                  key={p.id}
                  className="transition-colors"
                  style={{
                    borderTop: '1px solid var(--brand-border)',
                    background: rowIdx % 2 !== 0 ? 'rgba(24,108,195,0.04)' : 'transparent',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(24,108,195,0.10)')}
                  onMouseLeave={e => (e.currentTarget.style.background = rowIdx % 2 !== 0 ? 'rgba(24,108,195,0.04)' : 'transparent')}
                >
                  <td className="px-3 py-2 tabular-nums" style={{ color: 'var(--brand-text-muted)' }}>{p.id}</td>
                  {p.data.map((val, i) => (
                    <td key={i} className="px-3 py-2 whitespace-nowrap" style={{ color: 'var(--brand-text)' }}>{val}</td>
                  ))}
                  {p.numero !== undefined && (
                    <td className="px-3 py-2 font-bold tabular-nums" style={{ color: 'var(--brand-blue-light)' }}>
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
