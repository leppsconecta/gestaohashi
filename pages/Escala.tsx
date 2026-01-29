
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
  ArrowRight,
  GripVertical,
  Clock,
  MapPin,
  Trash2,
  CalendarDays,
  Download,
  Calendar,
  User as UserIcon,
  RotateCcw,
  FileText,
  Copy,
  CheckCircle2
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import Modal from '../components/UI/Modal';
import { Funcionario, TurnoConfig } from '../types';
import { DBService } from '../lib/db';
import { turnosConfigs as INITIAL_TURNOS } from '../constants'; // Fallback

// --- UTILS ---
const formatName = (name: string) => {
  const parts = name.trim().split(' ');
  if (parts.length <= 2) return name;
  return `${parts[0]} ${parts[1]}`;
};

const getMonday = (d: Date) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setHours(0, 0, 0, 0)).setDate(diff);
};

// --- MODAL COMPONENTS ---

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
          className={`w-full p-4 rounded-xl border transition-all flex items-center justify-between group active:scale-[0.98] ${turno.bgClass} ${turno.borderClass} hover:shadow-lg hover:brightness-95 dark:bg-slate-900/40 dark:border-slate-700`}
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

  const filtered = employees.filter(f =>
    f.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.funcao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          type="text"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-red-500 text-sm"
        />
      </div>
      <div className="max-h-[300px] overflow-y-auto space-y-2">
        {filtered.map(f => (
          <button
            key={f.id}
            onClick={() => onSelect(f.id)}
            className="w-full p-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 font-bold text-xs flex items-center justify-center">
              {f.nome?.charAt(0)}
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-900 dark:text-white">{formatName(f.nome)}</p>
              <p className="text-[10px] text-slate-500">{f.funcao}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

const ConfigTurnosForm: React.FC<{ turnos: TurnoConfig[], onChange: (t: TurnoConfig[]) => void }> = ({ turnos, onChange }) => {
  const handleTimeChange = (id: string, field: 'inicio' | 'fim', value: string) => {
    const updated = turnos.map(t => t.id === id ? { ...t, [field]: value } : t);
    onChange(updated);
  };
  return (
    <div className="space-y-4 py-2">
      {turnos.map(t => (
        <div key={t.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className={`w-2 h-8 rounded-full ${t.bgClass} ${t.colorClass.replace('text', 'bg')}`} />
          <div className="flex-1">
            <p className={`text-xs font-bold ${t.colorClass} mb-1`}>{t.label}</p>
            <div className="flex items-center gap-2">
              <input type="time" value={t.inicio} onChange={e => handleTimeChange(t.id, 'inicio', e.target.value)} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-center w-20 outline-none focus:border-red-500" />
              <span className="text-slate-400 font-bold text-xs">às</span>
              <input type="time" value={t.fim} onChange={e => handleTimeChange(t.id, 'fim', e.target.value)} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-center w-20 outline-none focus:border-red-500" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const ShareEscalaModal: React.FC<{ onDownload: () => void, onCopyText: () => void }> = ({ onDownload, onCopyText }) => (
  <div className="grid grid-cols-2 gap-4 py-4">
    <button onClick={onDownload} className="flex flex-col items-center justify-center gap-3 p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-white hover:shadow-lg hover:border-red-100 transition-all group">
      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
        <Download size={24} />
      </div>
      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Baixar PDF</span>
    </button>
    <button onClick={onCopyText} className="flex flex-col items-center justify-center gap-3 p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-white hover:shadow-lg hover:border-emerald-100 transition-all group">
      <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
        <Copy size={24} />
      </div>
      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Copiar Texto</span>
    </button>
  </div>
);

// --- MAIN COMPONENT ---

const EscalaPage: React.FC = () => {
  // State
  const [activeTab, setActiveTab] = useState<'semanal' | 'pontual'>('semanal');
  const [currentWeekMonday, setCurrentWeekMonday] = useState(getMonday(new Date()));
  const [pontualDate, setPontualDate] = useState(new Date());

  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [escala, setEscala] = useState<Record<string, string[]>>({});
  const [turnosConfigs, setTurnosConfigs] = useState<TurnoConfig[]>(INITIAL_TURNOS);
  const [tempTurnos, setTempTurnos] = useState<TurnoConfig[]>(INITIAL_TURNOS);

  const [draggedEmployeeId, setDraggedEmployeeId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    type: any;
    content: React.ReactNode;
    onConfirm?: () => void;
    maxWidth?: string;
  }>({
    isOpen: false,
    title: '',
    type: 'view-content',
    content: null,
  });

  const reportRef = useRef<HTMLDivElement>(null);

  // --- DATA FETCHING ---
  const fetchData = async () => {
    try {
      // 1. Fetch Funcionarios (Real DB)
      const funcList = await DBService.funcionarios.getAll();
      setFuncionarios(funcList); // Assuming DB returns correct mapping

      // 2. Fetch Turnos (Real DB) - Using hardcoded for now if DB empty, but let's try fetch
      const dbTurnos = await DBService.turnos.getAll();
      if (dbTurnos && dbTurnos.length > 0) {
        setTurnosConfigs(dbTurnos);
      }

      // 3. Fetch Escala Range
      // Calculate range based on activeTab
      let start, end;
      if (activeTab === 'semanal') {
        const d = new Date(currentWeekMonday);
        start = d.toISOString().split('T')[0];
        const e = new Date(d);
        e.setDate(d.getDate() + 6);
        end = e.toISOString().split('T')[0];
      } else {
        start = pontualDate.toISOString().split('T')[0];
        end = start;
      }

      const dbEscala = await DBService.escala.getByRange(start, end);

      // Transform DB Escala (array) to Map
      // DB: { data: '2023-10-27', turno_id: 't1', funcionario_id: 'abc' }
      // Map: { 'dayTimestamp-turnoId': ['abc', 'def'] }
      const newEscalaMap: Record<string, string[]> = {};

      dbEscala.forEach((entry: any) => {
        // Convert DB date string to local Midnight timestamp for ID consistency with UI
        const entryDate = new Date(entry.data + 'T00:00:00'); // Force local midnight
        const dayId = entryDate.setHours(0, 0, 0, 0);
        const key = `${dayId}-${entry.turno_id}`;

        if (!newEscalaMap[key]) newEscalaMap[key] = [];
        newEscalaMap[key].push(entry.funcionario_id);
      });

      setEscala(newEscalaMap);

    } catch (e) {
      console.error("Error fetching data:", e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentWeekMonday, activeTab, pontualDate]);


  // --- COMPUTED ---
  const weekDays = useMemo(() => {
    const days = [];
    const mon = new Date(currentWeekMonday);
    for (let i = 0; i < 7; i++) {
      const d = new Date(mon);
      d.setDate(mon.getDate() + i);
      days.push({
        id: d.setHours(0, 0, 0, 0),
        dia: d.getDate(),
        label: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][d.getDay()],
        fullDate: d
      });
    }
    return days;
  }, [currentWeekMonday]);

  const dateText = useMemo(() => {
    if (activeTab === 'pontual') {
      return pontualDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
    }
    const start = new Date(currentWeekMonday);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const m1 = start.toLocaleDateString('pt-BR', { month: 'long' });
    const m2 = end.toLocaleDateString('pt-BR', { month: 'long' });
    if (m1 === m2) return `${start.getDate()} a ${end.getDate()} de ${m1}`;
    return `${start.getDate()} de ${m1} a ${end.getDate()} de ${m2}`;
  }, [currentWeekMonday, activeTab, pontualDate]);

  const filteredFuncionarios = useMemo(() => {
    if (!searchTerm.trim()) return funcionarios;
    const term = searchTerm.toLowerCase();
    return funcionarios.filter(f =>
      f.nome?.toLowerCase().includes(term) ||
      f.funcao?.toLowerCase().includes(term)
    );
  }, [searchTerm, funcionarios]);


  // --- HANDLERS ---
  const changeWeek = (dir: number) => {
    const d = new Date(currentWeekMonday);
    d.setDate(d.getDate() + (dir * 7));
    setCurrentWeekMonday(d.getTime());
  };

  const changeDay = (dir: number) => {
    const d = new Date(pontualDate);
    d.setDate(d.getDate() + dir);
    setPontualDate(d);
  };

  const handleDropOnDay = (dayId: number, employeeId: string) => {
    // Open standard modal for turn selection
    const emp = funcionarios.find(f => f.id === employeeId);
    if (!emp) return;

    setModalConfig({
      isOpen: true,
      title: 'Atribuir Turno',
      type: 'view-content',
      maxWidth: 'max-w-md',
      content: (
        <SelectTurnoModal
          turnos={turnosConfigs}
          employeeName={emp.nome}
          onSelect={async (turnoId) => {
            await completeAssignment(dayId, turnoId, employeeId);
            setModalConfig(prev => ({ ...prev, isOpen: false }));
          }}
        />
      )
    });
  };

  const completeAssignment = async (dayId: number, turnoId: string, employeeId: string) => {
    // Optimistic Update
    const key = `${dayId}-${turnoId}`;
    const currentList = escala[key] || [];

    if (currentList.includes(employeeId)) return; // No duplicates

    const newList = [...currentList, employeeId];
    setEscala(prev => ({ ...prev, [key]: newList }));

    // DB Persist
    const dateStr = new Date(dayId).toISOString().split('T')[0];
    await DBService.escala.add(dateStr, turnoId, employeeId);
  };

  const removeFuncionarioFromEscala = async (dayId: number, turnoId: string, employeeId: string) => {
    const key = `${dayId}-${turnoId}`;
    const currentList = escala[key] || [];
    const newList = currentList.filter(id => id !== employeeId);

    setEscala(prev => ({ ...prev, [key]: newList })); // Optimistic

    // DB Persist
    const dateStr = new Date(dayId).toISOString().split('T')[0];
    await DBService.escala.remove(dateStr, turnoId, employeeId);
  };

  // --- RENDERERS ---

  const renderDayCard = (day: typeof weekDays[0]) => {
    const isToday = day.fullDate.toDateString() === new Date().toDateString();

    // Check if day is hidden on mobile/active logic if needed (skipping for complexity, showing all)

    return (
      <div
        key={day.id}
        onDragOver={e => e.preventDefault()}
        onDrop={e => {
          e.preventDefault();
          if (draggedEmployeeId) handleDropOnDay(day.id, draggedEmployeeId);
        }}
        className={`flex flex-col rounded-2xl border transition-all duration-200 overflow-hidden relative group
          ${isToday
            ? 'bg-white dark:bg-slate-900 border-red-500 shadow-lg shadow-red-500/10 ring-1 ring-red-500'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }
        `}
      >
        {/* Header */}
        <div className={`p-4 border-b ${isToday ? 'border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-sm font-bold uppercase tracking-wider ${isToday ? 'text-red-700 dark:text-red-400' : 'text-slate-500'}`}>
              {day.label.slice(0, 3)}
            </span>
            <span className={`text-xl font-black ${isToday ? 'text-red-700 dark:text-red-400' : 'text-slate-800 dark:text-white'}`}>
              {day.dia}
            </span>
          </div>
        </div>

        {/* Turnos Slots */}
        <div className="flex-1 p-2 space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
          {turnosConfigs.map(turno => {
            const key = `${day.id}-${turno.id}`;
            const assigned = escala[key] || [];
            const isEmpty = assigned.length === 0;

            return (
              <div key={turno.id} className="relative">
                {/* Turno Label (Only show if has people OR is hovering group to reduce noise? showing always for structure) */}
                <div className={`flex items-center gap-2 mb-1.5 px-2 ${isEmpty ? 'opacity-50' : 'opacity-100'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${turno.bgClass.replace('bg-', 'bg-')}`} style={{ backgroundColor: 'currentColor' }} />
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${turno.colorClass}`}>{turno.label}</span>
                  <span className="text-[9px] text-slate-300 font-mono ml-auto">{assigned.length || '-'}</span>
                  <button onClick={() => {
                    setModalConfig({
                      isOpen: true,
                      title: `${turno.label} - ${day.label}`,
                      type: 'view-content',
                      content: <MobileEmployeeSelector employees={funcionarios} onSelect={(empId) => {
                        completeAssignment(day.id, turno.id, empId);
                        setModalConfig(prev => ({ ...prev, isOpen: false }));
                      }} />
                    })
                  }} className="lg:hidden p-1 text-red-500"><Plus size={12} /></button>
                </div>

                {/* Assigned List */}
                <div className="space-y-1.5 min-h-[20px]">
                  {assigned.map(empId => {
                    const f = funcionarios.find(x => x.id === empId);
                    if (!f) return null;
                    return (
                      <div key={empId} className="group/item flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 hover:border-red-200 dark:hover:border-red-900/50 transition-colors">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate w-32">{formatName(f.nome)}</span>
                        <button
                          onClick={() => removeFuncionarioFromEscala(day.id, turno.id, empId)}
                          className="opacity-0 group-hover/item:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all scale-90 hover:scale-100"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )
                  })}
                  {isEmpty && (
                    <div className="h-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-center">
                      <span className="text-[9px] text-slate-300 select-none">Vazio</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    );
  };

  // --- LAYOUT ---
  return (
    <div className="flex bg-slate-50 dark:bg-slate-950 h-screen overflow-hidden">
      {/* 1. SIDEBAR (Internal) */}
      <div className="hidden lg:flex flex-col w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-30 shadow-xl">
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center shadow-lg shadow-red-500/20">
              <Users size={16} className="text-white" />
            </div>
            <h2 className="font-bold text-slate-900 dark:text-white tracking-tight">Funcionários</h2>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-600 transition-colors" size={16} />
            <input
              type="text"
              placeholder="Buscar equipe..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
            />
          </div>
        </div>

        {/* Employee List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
          {filteredFuncionarios.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-2">
              <Users size={24} className="opacity-50" />
              <span className="text-xs">Nenhum funcionário</span>
            </div>
          ) : (
            filteredFuncionarios.map(f => (
              <div
                key={f.id}
                draggable
                onDragStart={() => setDraggedEmployeeId(f.id)}
                onDragEnd={() => setDraggedEmployeeId(null)}
                className="group flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl hover:border-red-200 hover:shadow-md cursor-grab active:cursor-grabbing transition-all select-none"
              >
                <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 uppercase">
                  {f.nome?.charAt(0)}{f.nome?.split(' ')[1]?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate">{formatName(f.nome)}</h4>
                  <p className="text-[10px] text-slate-500 truncate">{f.funcao}</p>
                </div>
                <GripVertical size={14} className="text-slate-300 group-hover:text-red-400" />
              </div>
            ))
          )}
        </div>
      </div>

      {/* 2. MAIN CONTENT PAGE */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        {/* HEADER BAR */}
        <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
          {/* Left: Toggles */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('semanal')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'semanal' ? 'bg-white dark:bg-slate-900 shadow-sm text-red-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Semanal
            </button>
            <button
              onClick={() => setActiveTab('pontual')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'pontual' ? 'bg-white dark:bg-slate-900 shadow-sm text-red-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Pontual
            </button>
          </div>

          {/* Center: Navigation */}
          <div className="flex items-center gap-4">
            <button onClick={() => activeTab === 'semanal' ? changeWeek(-1) : changeDay(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
              <ChevronLeft size={20} />
            </button>
            <div className="flex flex-col items-center">
              <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{dateText}</span>
              {activeTab === 'semanal' && (
                <span onClick={() => setCurrentWeekMonday(getMonday(new Date()))} className="text-[10px] text-red-600 font-bold cursor-pointer hover:underline">Ir para hoje</span>
              )}
            </div>
            <button onClick={() => activeTab === 'semanal' ? changeWeek(1) : changeDay(1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setModalConfig({ isOpen: true, title: 'Compartilhar', type: 'view-content', content: <ShareEscalaModal onDownload={() => { }} onCopyText={() => { }} /> })}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-red-600/20 active:scale-95"
            >
              <Share2 size={16} /> Compartilhar
            </button>
            <button
              onClick={() => setModalConfig({ isOpen: true, title: 'Configurar', type: 'confirm-update', content: <ConfigTurnosForm turnos={turnosConfigs} onChange={setTempTurnos} />, onConfirm: () => setTurnosConfigs(tempTurnos) })}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
            >
              <Settings size={20} />
            </button>
          </div>
        </header>

        {/* CANVAS */}
        <main className="flex-1 overflow-y-auto p-6 scroll-smooth custom-scrollbar bg-slate-50 dark:bg-slate-950">
          {activeTab === 'semanal' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7 gap-4">
              {weekDays.map(day => renderDayCard(day))}
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {/* Pontual View implementation - Simplified generic logic reuse or custom horizontal scroller */}
              {turnosConfigs.map(t => (
                <div key={t.id} className="min-w-[300px] flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
                  <h3 className={`font-bold ${t.colorClass} mb-4`}>{t.label}</h3>
                  {/* Same logic as day card but for specific turn across all day? No, pontual is usually single day */}
                  <div className="border-t border-slate-100 pt-4 text-center text-slate-400 text-xs">
                    Visualização Pontual Simplificada
                  </div>
                </div>
              ))}
            </div>
          )}
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
