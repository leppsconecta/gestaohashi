
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Share2,
  Settings,
  Plus,
  ChevronDown,
  ChevronRight as ChevronRightIcon,
  Image as ImageIcon,
  Copy,
  ArrowRight,
  GripVertical,
  Clock,
  Printer,
  Check,
  CheckCircle2,
  MapPin,
  X,
  Trash2,
  CalendarDays,
  Download,
  Calendar,
  User as UserIcon,
  Info,
  RotateCcw,
  FileText
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import Modal from '../components/UI/Modal';
import { Funcionario, TurnoConfig, ModalType } from '../types';
import { DBService } from '../lib/db';

const formatName = (name: string) => {
  const parts = name.trim().split(' ');
  if (parts.length <= 2) return name;
  return `${parts[0]} ${parts[1]}`;
};

const formatNameForPDF = (name: string) => {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0];
  const firstName = parts[0];
  const secondInitial = parts[1].charAt(0).toUpperCase();
  return `${firstName} ${secondInitial}.`;
};

const formatNameForText = (name: string) => {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return name;
  return `${parts[0]} ${parts[1].charAt(0)}.`;
};

const getMonday = (d: Date) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setHours(0, 0, 0, 0)).setDate(diff);
};

const SelectTurnoModal: React.FC<{
  turnos: TurnoConfig[],
  onSelect: (turnoId: string) => void,
  employeeName: string
}> = ({ turnos, onSelect, employeeName }) => (
  <div className="space-y-6 py-2">
    <div className="space-y-1">
      <p className="text-sm text-slate-500 font-medium">Escolha o turno para escalar:</p>
      <p className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{employeeName}</p>
    </div>
    <div className="grid grid-cols-1 gap-3">
      {turnos.map(turno => (
        <button
          key={turno.id}
          onClick={() => onSelect(turno.id)}
          className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between group active:scale-[0.98] ${turno.bgClass} ${turno.borderClass} hover:shadow-lg hover:brightness-95 dark:bg-slate-900/40 dark:border-slate-700`}
        >
          <div className="flex flex-col items-start text-left">
            <span className={`text-xs font-bold ${turno.colorClass}`}>{turno.label}</span>
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{turno.id === 't4' ? turno.inicio : `Das ${turno.inicio} às ${turno.fim}`}</span>
          </div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-slate-800 shadow-sm border ${turno.borderClass} group-hover:scale-110 transition-transform`}>
            <ArrowRight size={16} className={turno.colorClass} />
          </div>
        </button>
      ))}
    </div>
  </div>
);

const MobileEmployeeSelector: React.FC<{
  onSelect: (employeeId: string) => void,
  employees: Funcionario[]
}> = ({ onSelect, employees }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = useMemo(() => {
    const s = searchTerm.toLowerCase();
    return employees.filter(f => f.nome.toLowerCase().includes(s) || f.funcao.toLowerCase().includes(s));
  }, [searchTerm, employees]);

  return (
    <div className="space-y-5">
      <div className="relative group px-1">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none" size={18} />
        <input
          type="text"
          placeholder="Buscar por nome ou função..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[1.5rem] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-bold text-slate-800 dark:text-white placeholder:font-medium shadow-inner"
        />
      </div>

      <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
        {filtered.length > 0 ? filtered.map(f => (
          <button
            key={f.id}
            onClick={() => onSelect(f.id)}
            className="w-full p-4 flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl hover:border-indigo-200 transition-all text-left shadow-sm active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-xs shadow-sm border border-indigo-100 dark:border-indigo-800/50">
                {f.nome.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <h5 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{f.nome}</h5>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{f.funcao}</p>
              </div>
            </div>
            <ChevronRightIcon size={20} className="text-slate-300" />
          </button>
        )) : (
          <div className="py-12 text-center opacity-40 flex flex-col items-center gap-2">
            <Search size={32} />
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Nenhum resultado</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ConfigTurnosForm: React.FC<{ turnos: TurnoConfig[], onChange: (t: TurnoConfig[]) => void }> = ({ turnos, onChange }) => {
  const [localTurnos, setLocalTurnos] = useState<TurnoConfig[]>(turnos);

  const updateTurno = (id: string, field: 'inicio' | 'fim', value: string) => {
    const updated = localTurnos.map(t => t.id === id ? { ...t, [field]: value } : t);
    setLocalTurnos(updated);
    onChange(updated);
  };

  const inputTimeClass = "flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 text-center shadow-sm";

  return (
    <div className="space-y-5 py-2">
      <div className="space-y-1 ml-1">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Horários de Operação</h4>
      </div>

      <div className="space-y-3">
        {localTurnos.map((turno) => (
          <div
            key={turno.id}
            className={`p-5 rounded-[1.5rem] border ${turno.borderClass} ${turno.bgClass} dark:bg-slate-900/40 dark:border-slate-800 transition-all flex flex-col gap-3 shadow-sm`}
          >
            <span className={`text-[11px] font-black uppercase tracking-wider ${turno.colorClass}`}>
              {turno.label}
            </span>

            <div className="flex items-center gap-3">
              {turno.id === 't4' ? (
                <div className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-300 dark:text-slate-600 italic shadow-sm">
                  {turno.inicio}
                </div>
              ) : (
                <>
                  <input
                    type="time"
                    value={turno.inicio}
                    onChange={(e) => updateTurno(turno.id, 'inicio', e.target.value)}
                    className={inputTimeClass}
                  />
                  <ArrowRight size={16} className="text-slate-300 shrink-0" />
                  <input
                    type="time"
                    value={turno.fim}
                    onChange={(e) => updateTurno(turno.id, 'fim', e.target.value)}
                    className={inputTimeClass}
                  />
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ShareEscalaModal: React.FC<{ onDownload: () => void, onCopyText: () => void }> = ({ onDownload, onCopyText }) => (
  <div className="space-y-4 py-2">
    <button onClick={onDownload} className="w-full p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group shadow-md active:scale-95">
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 shadow-inner">
          <FileText size={28} />
        </div>
        <div className="text-left">
          <h4 className="font-bold text-slate-900 dark:text-white tracking-tight">Baixar PDF</h4>
          <p className="text-xs text-slate-500 font-medium">Formato A4 pronto para impressão</p>
        </div>
      </div>
      <Download size={24} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
    </button>
    <button onClick={onCopyText} className="w-full p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group shadow-md active:scale-95">
      <div className="flex items-center gap-5"><div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 shadow-inner"><Copy size={28} /></div><div className="text-left"><h4 className="font-bold text-slate-900 dark:text-white tracking-tight">Copiar Texto</h4><p className="text-xs text-slate-500 font-medium">Formatado para WhatsApp</p></div></div>
      <ChevronRight size={24} className="text-slate-300 group-hover:text-emerald-600 transition-colors" />
    </button>
  </div>
);

const EditTextModal: React.FC<{
  initialText: string,
  onCopy: (txt: string) => void,
  onReset: () => string
}> = ({ initialText, onCopy, onReset }) => {
  const [text, setText] = useState(initialText);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setText(initialText);
  }, [initialText]);

  const handleCopyAction = () => {
    onCopy(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleResetAction = () => {
    const originalText = onReset();
    setText(originalText);
  };

  return (
    <div className="space-y-4 py-1 flex flex-col">
      <div className="space-y-2 flex flex-col min-h-0">
        <div className="flex items-center justify-between ml-1 shrink-0">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Conteúdo da Escala</label>
          <button
            onClick={handleResetAction}
            className="flex items-center gap-1 text-[10px] font-medium text-indigo-600 hover:text-indigo-700 uppercase tracking-widest transition-colors"
            title="Restaurar texto original do sistema"
          >
            <RotateCcw size={12} strokeWidth={2.5} /> Restaurar
          </button>
        </div>
        <textarea
          className="w-full h-[45vh] sm:h-[55vh] max-h-[550px] p-5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none resize-none leading-relaxed text-slate-700 dark:text-slate-300 custom-scrollbar overflow-y-auto shadow-inner"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="A escala aparecerá aqui..."
        />
      </div>

      <div className="shrink-0 space-y-3 pt-2">
        {copied && (
          <div className="flex items-center justify-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-[0.2em] animate-in fade-in slide-in-from-bottom-1">
            <CheckCircle2 size={14} strokeWidth={3} /> Copiado com sucesso!
          </div>
        )}

        <button
          onClick={handleCopyAction}
          className={`w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg dark:shadow-none ${copied ? 'bg-emerald-500 text-white shadow-emerald-100' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100'
            }`}
        >
          {copied ? <Check size={18} strokeWidth={3} /> : <Copy size={18} strokeWidth={3} />}
          {copied ? 'Conteúdo Copiado!' : 'Copiar para o WhatsApp'}
        </button>

        <p className="text-[9px] text-slate-400 font-bold text-center italic tracking-tight">Você pode editar o texto acima antes de copiar.</p>
      </div>
    </div>
  );
};


const ReportTemplate: React.FC<{
  mode: 'semanal' | 'pontual';
  weekDays: any[];
  pontualDate: Date;
  turnos: TurnoConfig[];
  escala: Record<string, string[]>;
  reportRef: React.RefObject<HTMLDivElement | null>;
  employees: Funcionario[];
}> = ({ mode, weekDays, pontualDate, turnos, escala, reportRef, employees }) => {
  const now = new Date();
  const timestamp = now.toLocaleString('pt-BR');

  const renderHeader = (title: string, subtitle: string) => (
    <div className="flex items-end justify-between border-b-2 border-slate-900 pb-5 mb-4">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
      <div className="text-right">
        <h2 className="text-lg font-semibold text-slate-700">{subtitle}</h2>
        <p className="text-[10px] text-slate-400 font-medium">Emitido em: {timestamp}</p>
      </div>
    </div>
  );

  const renderFooter = () => (
    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400 font-semibold tracking-wider">
      <span className="uppercase">Sistema de Gestão Autoconect</span>
      <span className="uppercase">Hashi Tecnologia</span>
    </div>
  );

  if (mode === 'pontual') {
    const dayId = pontualDate.setHours(0, 0, 0, 0);
    const dateStr = pontualDate.toLocaleDateString('pt-BR');

    return (
      <div className="absolute -left-[5000px] top-0">
        <div ref={reportRef} style={{ width: '794px' }} className="bg-white p-12 flex flex-col text-slate-900 font-sans min-h-0">
          {renderHeader('Escala Diária', dateStr)}

          <div className="grid grid-cols-2 gap-6 flex-1">
            {turnos.map((t) => {
              const escaladosIds = escala[`${dayId}-${t.id}`] || [];
              return (
                <div key={t.id} className="border border-slate-200 rounded-2xl overflow-hidden flex flex-col min-h-0 bg-slate-50/20">
                  <div className="bg-slate-900 text-white p-4">
                    <h4 className="text-sm font-medium tracking-wide">{t.label}</h4>
                    <p className="text-[10px] font-medium text-slate-400 mt-0.5">{t.id === 't4' ? t.inicio : `${t.inicio} às ${t.fim}`}</p>
                  </div>
                  <div className="flex-1 p-4 flex flex-col gap-3">
                    {escaladosIds.length > 0 ? escaladosIds.map(fId => {
                      const func = employees.find(f => f.id === fId);
                      if (!func) return null;
                      return (
                        <div key={fId} className="flex flex-col border-b border-slate-100 pb-2 last:border-b-0">
                          <span className="text-xs font-medium text-slate-800">{formatNameForPDF(func.nome)}</span>
                          <span className="text-[10px] text-slate-400 font-medium">{func.funcao}</span>
                        </div>
                      );
                    }) : (
                      <p className="text-[10px] text-slate-300 italic">Nenhum funcionário escalado</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {renderFooter()}
        </div>
      </div>
    );
  }

  return (
    <div className="absolute -left-[5000px] top-0">
      <div ref={reportRef} style={{ width: '1123px' }} className="bg-white p-10 flex flex-col text-slate-900 font-sans min-h-0">
        {renderHeader('Escala Semanal', `${weekDays[0].dia}/${weekDays[0].fullDate.getMonth() + 1} a ${weekDays[6].dia}/${weekDays[6].fullDate.getMonth() + 1}`)}

        <div className="grid grid-cols-7 gap-2 flex-1">
          {weekDays.map(dia => {
            return (
              <div key={dia.id} className="flex flex-col border border-slate-200 rounded-xl overflow-hidden bg-slate-50/20">
                <div className="bg-slate-900 text-white p-2.5 text-center">
                  <h4 className="text-[11px] font-medium tracking-tight leading-none">{dia.label}</h4>
                  <p className="text-[9px] text-slate-400 mt-1">{dia.dia}/{dia.fullDate.getMonth() + 1}</p>
                </div>

                <div className="flex-1 p-2 space-y-4">
                  {turnos.map(t => {
                    const escaladosIds = escala[`${dia.id}-${t.id}`] || [];
                    if (escaladosIds.length === 0) return null;

                    return (
                      <div key={t.id} className="space-y-2">
                        <div className="border-b border-slate-100 pb-0.5 mb-1">
                          <p className="text-[8px] font-bold text-indigo-600/80 leading-none">{t.label}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                          {escaladosIds.map(fId => {
                            const func = employees.find(f => f.id === fId);
                            if (!func) return null;
                            return (
                              <div key={fId} className="flex flex-col">
                                <span className="text-[9px] font-medium text-slate-700 leading-tight">
                                  {formatNameForPDF(func.nome)}
                                </span>
                                <span className="text-[7px] text-slate-400 font-medium leading-none">
                                  {func.funcao}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        {renderFooter()}
      </div>
    </div>
  );
};

const EscalaPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'semanal' | 'pontual'>('semanal');
  const [currentWeekMonday, setCurrentWeekMonday] = useState(new Date(getMonday(new Date())));
  const [pontualDate, setPontualDate] = useState(new Date(new Date().setHours(0, 0, 0, 0)));
  const [turnosConfigs, setTurnosConfigs] = useState<TurnoConfig[]>([]);
  const [tempTurnos, setTempTurnos] = useState<TurnoConfig[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTurns, setExpandedTurns] = useState<Record<string, boolean>>({});
  const [escala, setEscala] = useState<Record<string, string[]>>({});
  const [draggedEmployeeId, setDraggedEmployeeId] = useState<string | null>(null);

  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [currentWeekMonday, activeTab, pontualDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Employees
      const funcs = await DBService.funcionarios.getAll();
      setFuncionarios(funcs);

      // 2. Fetch Turnos
      let turnos = await DBService.turnos.getAll();
      if (!turnos || turnos.length === 0) {
        // Fallback for initial load if DB is empty? Should not happen if SQL ran.
        turnos = [
          { id: 't1', label: '1º Turno', inicio: '08:00', fim: '16:00', colorClass: 'text-blue-700', bgClass: 'bg-blue-50/50', borderClass: 'border-blue-200' },
          { id: 't2', label: '2º Turno', inicio: '16:00', fim: '00:00', colorClass: 'text-amber-700', bgClass: 'bg-amber-50/50', borderClass: 'border-amber-200' },
          { id: 't3', label: '3º Turno', inicio: '00:00', fim: '08:00', colorClass: 'text-fuchsia-700', bgClass: 'bg-fuchsia-50/50', borderClass: 'border-fuchsia-200' },
          { id: 't4', label: 'Personalizado', inicio: 'Horário Variável / Plantão', fim: '', colorClass: 'text-slate-700', bgClass: 'bg-slate-50/50', borderClass: 'border-slate-200' },
        ];
      }
      setTurnosConfigs(turnos);
      setTempTurnos(turnos);

      // 3. Fetch Escala for range
      let startDate, endDate;
      if (activeTab === 'semanal') {
        startDate = new Date(currentWeekMonday);
        const end = new Date(currentWeekMonday);
        end.setDate(end.getDate() + 6);
        endDate = end;
      } else {
        startDate = pontualDate;
        endDate = pontualDate;
      }

      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];

      const assignments = await DBService.escala.getByRange(startStr, endStr);

      // Transform assignments to Record<string, string[]> map
      // Key: dayTimestamp-turnoId
      const newEscala: Record<string, string[]> = {};

      assignments.forEach((a: any) => {
        // 'a.data' is YYYY-MM-DD
        // We need to convert it to the timestamp used by the UI (setHours(0,0,0,0))
        // Be careful with timezone. The UI uses local midnight timestamp.
        // Let's parse YYYY-MM-DD to local date
        const [y, m, d] = a.data.split('-').map(Number);
        const dateObj = new Date(y, m - 1, d);
        dateObj.setHours(0, 0, 0, 0);
        const dayId = dateObj.getTime();

        const key = `${dayId}-${a.turno_id}`;
        if (!newEscala[key]) newEscala[key] = [];
        if (!newEscala[key].includes(a.funcionario_id)) {
          newEscala[key].push(a.funcionario_id);
        }
      });
      setEscala(newEscala);

    } catch (error) {
      console.error('Error fetching escala data:', error);
    } finally {
      setLoading(false);
    }
  };

  const [textSemanal, setTextSemanal] = useState<string>('');
  const [textPontual, setTextPontual] = useState<string>('');

  const reportRef = useRef<HTMLDivElement>(null);
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean, title: string, content: React.ReactNode, type: ModalType, maxWidth?: string, onConfirm?: () => void }>({ isOpen: false, title: '', content: null, type: 'view-content' });

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(currentWeekMonday);
      date.setDate(currentWeekMonday.getDate() + i);
      const labels = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
      return { label: labels[i], dia: date.getDate(), id: date.getTime(), fullDate: date };
    });
  }, [currentWeekMonday]);

  const dateText = useMemo(() => {
    let str = "";
    if (activeTab === 'semanal') {
      str = `${weekDays[0].dia} a ${weekDays[6].dia} de ${weekDays[0].fullDate.toLocaleString('pt-BR', { month: 'long' })}`;
    } else {
      str = pontualDate.toLocaleDateString('pt-BR');
    }
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }, [activeTab, weekDays, pontualDate]);

  const filteredFuncionarios = useMemo(() => {
    if (!searchTerm.trim()) return funcionarios;
    const search = searchTerm.toLowerCase();
    return funcionarios.filter(f => f.nome.toLowerCase().includes(search) || f.codigo.toLowerCase().includes(search) || f.funcao.toLowerCase().includes(search));
  }, [searchTerm, funcionarios]);

  const changeWeek = (direction: number) => {
    const newMonday = new Date(currentWeekMonday);
    newMonday.setDate(currentWeekMonday.getDate() + (direction * 7));
    setCurrentWeekMonday(newMonday);
  };

  const changeDay = (direction: number) => {
    const newDate = new Date(pontualDate);
    newDate.setDate(pontualDate.getDate() + direction);
    setPontualDate(newDate);
  };

  const toggleTurn = (dayId: number, turnoId: string) => { const key = `${dayId}-${turnoId}`; setExpandedTurns(prev => ({ ...prev, [key]: !prev[key] })); };

  const completeAssignment = async (dayId: number, turnoId: string, employeeId: string) => {
    const key = `${dayId}-${turnoId}`;

    // Optimistic Update
    setEscala(prev => {
      const currentList = prev[key] || [];
      if (currentList.includes(employeeId)) return prev;
      return { ...prev, [key]: [...currentList, employeeId] };
    });
    setExpandedTurns(prev => ({ ...prev, [key]: true }));
    setDraggedEmployeeId(null);

    // DB Save
    const date = new Date(dayId);
    const dataStr = date.toLocaleDateString('pt-BR').split('/').reverse().join('-'); // YYYY-MM-DD
    await DBService.escala.add(dataStr, turnoId, employeeId);
  };

  const removeFuncionarioFromEscala = async (dayId: number, turnoId: string, employeeId: string) => {
    const key = `${dayId}-${turnoId}`;

    // Optimistic Update
    setEscala(prev => ({ ...prev, [key]: (prev[key] || []).filter(id => id !== employeeId) }));

    // DB Remove
    const date = new Date(dayId);
    const dataStr = date.toLocaleDateString('pt-BR').split('/').reverse().join('-'); // YYYY-MM-DD
    await DBService.escala.remove(dataStr, turnoId, employeeId);
  };

  const handleMobileAdd = (dayId: number) => {
    setModalConfig({
      isOpen: true,
      title: 'Escalar Funcionário',
      type: 'view-content',
      maxWidth: 'max-w-md',
      content: (
        <MobileEmployeeSelector
          employees={funcionarios}
          onSelect={(employeeId) => handleDropOnDay(dayId, employeeId)}
        />
      )
    });
  };

  const handleDropOnDay = (dayId: number, employeeId: string) => {
    const employee = funcionarios.find(f => f.id === employeeId);
    if (!employee) return;
    setModalConfig({
      isOpen: true,
      title: 'Escalar Funcionário',
      type: 'view-content',
      maxWidth: 'max-w-md',
      content: (
        <SelectTurnoModal
          turnos={turnosConfigs}
          employeeName={employee.nome}
          onSelect={(turnoId) => {
            completeAssignment(dayId, turnoId, employeeId);
            setModalConfig(prev => ({ ...prev, isOpen: false }));
          }}
        />
      )
    });
  };

  const openEmployeeSelectorForTurn = (dayId: number, turnoId: string) => {
    setModalConfig({
      isOpen: true,
      title: 'Adicionar à Escala',
      type: 'view-content',
      maxWidth: 'max-w-md',
      content: (
        <MobileEmployeeSelector
          employees={funcionarios}
          onSelect={(employeeId) => {
            completeAssignment(dayId, turnoId, employeeId);
            setModalConfig(p => ({ ...p, isOpen: false }));
          }}
        />
      )
    });
  };

  const handleDownloadReport = async () => {
    if (!reportRef.current) return;
    try {
      const orientation = activeTab === 'semanal' ? 'landscape' : 'portrait';
      const format = 'a4';
      const pdf = new jsPDF(orientation, 'pt', format);

      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = orientation === 'landscape' ? 841.89 : 595.28;
      const pdfHeight = orientation === 'landscape' ? 595.28 : 841.89;

      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 100) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const fileName = activeTab === 'semanal'
        ? `escala-semanal-${currentWeekMonday.toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`
        : `escala-pontual-${pontualDate.toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`;

      pdf.save(fileName);
    } catch (error) {
      console.error('Falha ao gerar PDF:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin"></div></div>;
  }

  const generateSnapshotText = (mode: 'semanal' | 'pontual') => {
    let textContent = "";
    if (mode === 'pontual') {
      const dayId = pontualDate.setHours(0, 0, 0, 0);
      const dateStr = pontualDate.toLocaleDateString('pt-BR');
      textContent = `Escala do dia *${dateStr}*\n`;
      textContent += `--------------------------------------------\n`;

      turnosConfigs.forEach(t => {
        const escaladosIds = escala[`${dayId}-${t.id}`] || [];
        if (escaladosIds.length > 0) {
          const timeStr = t.id === 't4' ? t.inicio : `${t.inicio} às ${t.fim}h`;
          textContent += `\n🠖 ${t.label}: ${timeStr}\n`;
          escaladosIds.forEach(fId => {
            const func = funcionarios.find(f => f.id === fId);
            if (func) {
              textContent += `* *${formatNameForText(func.nome)}* - _${func.funcao}_\n`;
            }
          });
        }
      });
    } else {
      textContent = `📅 *Escala Semanal*\n`;
      textContent += `--------------------------------------------\n`;
      weekDays.forEach(dia => {
        const hasEscalados = turnosConfigs.some(t => (escala[`${dia.id}-${t.id}`] || []).length > 0);
        if (!hasEscalados) return;

        textContent += `\n📍 *${dia.label} (${dia.dia}/${dia.fullDate.getMonth() + 1})*\n`;
        turnosConfigs.forEach(t => {
          const escaladosIds = escala[`${dia.id}-${t.id}`] || [];
          if (escaladosIds.length > 0) {
            const timeStr = t.id === 't4' ? t.inicio : `${t.inicio} - ${t.fim}h`;
            textContent += `\n🠖 ${t.label} (${timeStr}):\n`;
            escaladosIds.forEach(fId => {
              const func = funcionarios.find(f => f.id === fId);
              if (func) {
                textContent += `* *${formatNameForText(func.nome)}* - _${func.funcao}_\n`;
              }
            });
          }
        });
        textContent += `\n--------------------------------------------\n`;
      });
    }
    return textContent;
  };

  const handleShareText = () => {
    const currentText = activeTab === 'pontual' ? textPontual : textSemanal;
    const initialText = currentText || generateSnapshotText(activeTab);

    setModalConfig({
      isOpen: true,
      title: 'Editar e Copiar Texto',
      type: 'view-content',
      maxWidth: 'max-w-2xl',
      content: (
        <EditTextModal
          initialText={initialText}
          onCopy={(finalText) => {
            navigator.clipboard.writeText(finalText);
            if (activeTab === 'pontual') setTextPontual(finalText);
            else setTextSemanal(finalText);
          }}
          onReset={() => {
            const freshText = generateSnapshotText(activeTab);
            if (activeTab === 'pontual') setTextPontual(freshText);
            else setTextSemanal(freshText);
            return freshText;
          }}
        />
      )
    });
  };

  const handleSaveTurnos = async () => {
    const updated = [...tempTurnos];
    setTurnosConfigs(updated);

    // Persist to DB
    await DBService.turnos.saveAll(updated);
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  const renderDayCard = (dia: typeof weekDays[0]) => {
    const isToday = dia.fullDate.toDateString() === new Date().toDateString();
    return (
      <div
        key={dia.id}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); if (draggedEmployeeId) handleDropOnDay(dia.id, draggedEmployeeId); }}
        className={`bg-white dark:bg-slate-900 rounded-[2.5rem] border transition-all duration-300 flex flex-col gap-4 min-h-[320px] shadow-sm p-6 overflow-hidden ${isToday ? 'border-indigo-600 ring-8 ring-indigo-500/10 shadow-md' : 'border-slate-200 dark:border-slate-800'}`}
      >
        <div className="flex items-center justify-between">
          <h3 className={`text-sm font-bold ${isToday ? 'text-indigo-600' : 'text-slate-800 dark:text-white'}`}>{dia.label}</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleMobileAdd(dia.id)}
              className="lg:hidden p-1.5 bg-indigo-50 text-indigo-600 rounded-lg active:scale-95 transition-all shadow-sm"
            >
              <Plus size={14} strokeWidth={3} />
            </button>
            <span className={`text-base font-bold ${isToday ? 'text-indigo-600' : 'text-slate-400'}`}>{dia.dia}</span>
          </div>
        </div>
        <div className="h-[1px] bg-slate-100 dark:bg-slate-800 w-full" />
        <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar pr-1">
          {turnosConfigs.map((turno) => {
            const key = `${dia.id}-${turno.id}`;
            const isExpanded = expandedTurns[key] || false;
            const escalados = escala[key] || [];
            if (escalados.length === 0) return null;
            return (
              <div key={turno.id} className="space-y-2 animate-in fade-in duration-300">
                <div onClick={() => toggleTurn(dia.id, turno.id)} className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer hover:shadow-sm ${turno.bgClass} ${turno.borderClass}`}>
                  <div className="flex items-center gap-2">
                    {isExpanded ? <ChevronDown size={14} className={turno.colorClass} /> : <ChevronRightIcon size={14} className={turno.colorClass} />}
                    <span className={`text-[10px] font-bold ${turno.colorClass}`}>{turno.label}</span>
                  </div>
                  <span className="w-5 h-5 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-800 dark:text-slate-200 shadow-sm border border-slate-100 dark:border-slate-700">{escalados.length}</span>
                </div>
                {isExpanded && (
                  <div className="space-y-2 pl-1 animate-in slide-in-from-top-1 duration-200">
                    {escalados.map(fId => {
                      const func = funcionarios.find(f => f.id === fId);
                      if (!func) return null;
                      return (
                        <div key={fId} className="bg-white dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3 relative group">
                          <div className={`w-1.5 h-1.5 rounded-full ${turno.colorClass.replace('text', 'bg')} flex-shrink-0`} />
                          <div className="overflow-hidden flex-1">
                            <h5 className="text-xs font-bold text-slate-900 dark:text-slate-200 truncate tracking-tight">{formatName(func.nome)}</h5>
                            <p className="text-[9px] font-medium text-slate-400 truncate tracking-wide">{func.funcao}</p>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); removeFuncionarioFromEscala(dia.id, turno.id, fId); }}
                            className="p-1.5 text-slate-300 hover:text-red-600 transition-all opacity-100 bg-white dark:bg-slate-900 rounded-lg shadow-sm"
                            title="Remover"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          {!turnosConfigs.some(t => escala[`${dia.id}-${t.id}`]?.length > 0) && (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center opacity-40">
              <CalendarDays size={28} className="text-slate-400 mb-2" />
              <p className="text-[10px] font-medium text-slate-500">Vazio</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPontualView = () => {
    const dayId = pontualDate.setHours(0, 0, 0, 0);

    return (
      <div className="flex-1 flex flex-col lg:flex-row gap-4 no-scrollbar pb-6 min-h-0 lg:overflow-x-auto overflow-y-auto">
        {turnosConfigs.map((turno) => {
          const key = `${dayId}-${turno.id}`;
          const escalados = escala[key] || [];

          return (
            <div
              key={turno.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); if (draggedEmployeeId) completeAssignment(dayId, turno.id, draggedEmployeeId); }}
              className={`flex-none lg:flex-1 min-w-0 bg-white dark:bg-slate-900 border rounded-[2rem] flex flex-col transition-all duration-300 shadow-sm overflow-hidden ${turno.borderClass.replace('border-', 'border-opacity-20 border-')}`}
            >
              <div className="p-5 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`text-base font-bold ${turno.colorClass} truncate`}>{turno.label}</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEmployeeSelectorForTurn(dayId, turno.id)}
                      className="lg:hidden p-1.5 bg-indigo-50 text-indigo-600 rounded-lg active:scale-95 transition-all shadow-sm"
                    >
                      <Plus size={14} strokeWidth={3} />
                    </button>
                    <span className="w-6 h-6 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-800 dark:text-slate-200 shadow-sm border border-slate-100 dark:border-slate-700 shrink-0">
                      {escalados.length}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-medium">
                  <Clock size={12} />
                  <span>{turno.id === 't4' ? turno.inicio : `${turno.inicio} - ${turno.fim}`}</span>
                </div>
              </div>

              <div className="flex-1 p-3 space-y-2 overflow-y-auto no-scrollbar min-h-[100px]">
                {escalados.length > 0 ? (
                  escalados.map(fId => {
                    const func = funcionarios.find(f => f.id === fId);
                    if (!func) return null;
                    return (
                      <div key={fId} className="bg-white dark:bg-slate-950 p-3 rounded-2xl border border-slate-50 dark:border-slate-800 shadow-sm flex items-center gap-3 relative group animate-in slide-in-from-bottom-2">
                        <div className={`w-8 h-8 rounded-full ${turno.bgClass} flex items-center justify-center text-[9px] font-black ${turno.colorClass} border shrink-0`}>
                          {func.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                        </div>
                        <div className="overflow-hidden flex-1">
                          <h5 className="text-[11px] font-bold text-slate-900 dark:text-slate-200 truncate tracking-tight">
                            {formatName(func.nome)}
                          </h5>
                          <p className="text-[9px] font-medium text-slate-400 truncate tracking-wide">
                            {func.funcao}
                          </p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); removeFuncionarioFromEscala(dayId, turno.id, fId); }}
                          className="p-1 text-slate-300 hover:text-red-600 transition-all opacity-100 shrink-0"
                          title="Remover"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-20 p-4">
                    <UserIcon size={32} className="text-slate-300 mb-2" />
                    <p className="text-[9px] font-bold text-slate-400">Arraste aqui</p>
                  </div>
                )}
              </div>

              <div className="p-3 bg-slate-50/50 dark:bg-slate-800/10 border-t border-slate-50 dark:border-slate-800 lg:hidden">
                <button
                  onClick={() => openEmployeeSelectorForTurn(dayId, turno.id)}
                  className={`w-full py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold text-[10px] transition-all active:scale-95 ${turno.colorClass} hover:bg-white dark:hover:bg-slate-900 border border-transparent hover:shadow-sm`}
                >
                  <Plus size={14} /> Adicionar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] gap-4 overflow-hidden relative">
      <div className="flex flex-1 gap-6 overflow-hidden">
        <ReportTemplate
          mode={activeTab}
          weekDays={weekDays}
          pontualDate={pontualDate}
          turnos={turnosConfigs}
          escala={escala}
          reportRef={reportRef}
          employees={funcionarios}
        />

        <aside className="hidden lg:flex w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] flex flex-col shadow-sm flex-shrink-0 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4 flex-shrink-0"><Users size={20} className="text-indigo-600" /><h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Equipe</h2></div>
          <div className="px-6 py-4 shrink-0">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none" size={16} />
              <input
                type="text"
                placeholder="Buscar na equipe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl text-xs font-bold text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400 tracking-tight shadow-sm"
              />
            </div>
          </div>
          <div className="flex-1 px-4 pb-6 space-y-3 overflow-y-auto no-scrollbar">{filteredFuncionarios.length > 0 ? (filteredFuncionarios.map(func => (<div key={func.id} draggable onDragStart={() => setDraggedEmployeeId(func.id)} onDragEnd={() => setDraggedEmployeeId(null)} className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] flex items-center justify-between hover:shadow-md hover:border-indigo-200 transition-all cursor-grab active:cursor-grabbing group"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">{func.nome.charAt(0)}{func.nome.split(' ')[1]?.charAt(0) || ''}</div><div className="overflow-hidden"><h4 className="text-[11px] font-bold text-slate-900 dark:text-white truncate">{formatName(func.nome)}</h4><p className="text-[9px] font-medium text-slate-400 tracking-tight truncate">{func.funcao}</p></div></div><GripVertical size={16} className="text-slate-300 group-hover:text-indigo-400 transition-colors" /></div>))) : (<div className="py-20 text-center flex flex-col items-center gap-3"><Users size={32} className="text-slate-200" /><p className="text-[10px] font-medium text-slate-300 tracking-wide">Nenhum Resultado</p></div>)}</div>
        </aside>

        <main className="flex-1 flex flex-col gap-6 overflow-hidden">
          <div className="bg-white dark:bg-slate-900 px-6 py-4 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row items-center justify-between shadow-sm flex-shrink-0 gap-4">
            <div className="flex justify-center lg:justify-start w-full lg:w-auto">
              <div className="flex bg-slate-50/80 dark:bg-slate-800/80 p-1.5 rounded-2xl gap-1 shadow-inner border border-slate-100/50 dark:border-slate-700/50 w-auto">
                <button
                  onClick={() => setActiveTab('semanal')}
                  className={`px-4 lg:px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 whitespace-nowrap ${activeTab === 'semanal' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-md ring-1 ring-slate-200/50 dark:ring-slate-700' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Semanal
                </button>
                <button
                  onClick={() => setActiveTab('pontual')}
                  className={`px-4 lg:px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all duration-200 whitespace-nowrap ${activeTab === 'pontual' ? 'bg-white dark:bg-slate-900 text-[#e30613] shadow-md ring-1 ring-slate-200/50 dark:ring-slate-700' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <MapPin size={12} strokeWidth={3} className={activeTab === 'pontual' ? 'text-[#e30613]' : 'text-slate-300'} /> Pontual
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-900 dark:text-white justify-center order-first lg:order-none">
              <button
                onClick={() => activeTab === 'semanal' ? changeWeek(-1) : changeDay(-1)}
                className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-all active:scale-90 text-slate-400 hover:text-slate-900"
              >
                <ChevronLeft size={20} strokeWidth={2.5} />
              </button>

              <div className="flex items-center gap-2 px-1">
                <span className="text-sm tracking-tight text-slate-800 dark:text-slate-100 font-medium text-center">
                  {dateText}
                </span>
                {activeTab === 'pontual' && <Calendar size={14} className="text-slate-300" />}
              </div>

              <button
                onClick={() => activeTab === 'semanal' ? changeWeek(1) : changeDay(1)}
                className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-all active:scale-90 text-slate-400 hover:text-slate-900"
              >
                <ChevronRight size={20} strokeWidth={2.5} />
              </button>
            </div>

            <div className="flex justify-end items-center gap-3 w-full lg:w-auto">
              <button
                onClick={() => setModalConfig({ isOpen: true, title: 'Compartilhar Escala', type: 'view-content', maxWidth: 'max-w-xl', content: <ShareEscalaModal onDownload={handleDownloadReport} onCopyText={handleShareText} /> })}
                className="flex-1 lg:flex-none bg-[#e30613] hover:bg-[#c00511] text-white font-black text-[10px] uppercase tracking-widest px-4 lg:px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-red-100 dark:shadow-none active:scale-95"
              >
                <Share2 size={16} strokeWidth={3} /> <span className="hidden sm:inline">Compartilhar</span>
              </button>
              <button
                onClick={() => {
                  setTempTurnos([...turnosConfigs]);
                  setModalConfig({
                    isOpen: true,
                    title: 'Configurar Turnos',
                    type: 'confirm-update',
                    maxWidth: 'max-w-md',
                    content: <ConfigTurnosForm turnos={turnosConfigs} onChange={setTempTurnos} />,
                    onConfirm: handleSaveTurnos
                  });
                }}
                className="flex-1 lg:flex-none px-4 lg:px-6 py-3.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-95"
              >
                <Settings size={16} strokeWidth={3} /> <span className="hidden sm:inline">Configurar</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col pt-2">
            {activeTab === 'semanal' ? (
              <div className="flex-1 overflow-y-auto space-y-6 pb-12 no-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                  {weekDays.map(dia => renderDayCard(dia))}
                  <div className="hidden xl:flex bg-slate-100/30 dark:bg-slate-800/20 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-700 items-center justify-center opacity-30 hover:opacity-50 transition-opacity min-h-[320px]">
                    <Plus size={40} className="text-slate-400" />
                  </div>
                </div>
              </div>
            ) : (
              renderPontualView()
            )}
          </div>
        </main>
      </div>

      <Modal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        type={modalConfig.type}
        maxWidth={modalConfig.maxWidth}
        content={modalConfig.content}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={modalConfig.onConfirm}
      />
    </div>
  );
};

export default EscalaPage;
