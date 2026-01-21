
import React, { useState } from 'react';
import { Plus, Eye, Edit3, Trash2, StickyNote, Calendar as CalendarIcon, Clock, User, Users, Phone, Activity, FileText, Bookmark } from 'lucide-react';
import Table from '../components/UI/Table';
import Modal from '../components/UI/Modal';
import { Reserva, ReservaStatus, ModalType } from '../types';

// Mock Data Helpers
const MOCK_NAMES = ["Roberto Oliveira", "Amanda Souza", "Fernando Lima", "Juliana Silva", "Carlos Mendes", "Patrícia Santos", "Bruno Ferreira", "Luciana Costa"];
const TIPOS_RESERVA = ["Aniver", "Confra", "Evento", "Outro"];

const generateReservaCodigo = () => {
  const nums = Math.floor(Math.random() * 900 + 100).toString();
  const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  return nums + letter;
};

const MOCK_RESERVAS: Reserva[] = Array.from({ length: 40 }).map((_, i) => ({
  id: `res-${i}`,
  codigo: generateReservaCodigo(),
  data: new Date(2024, 4, Math.floor(Math.random() * 28) + 1).toLocaleDateString('pt-BR'),
  hora: `${Math.floor(Math.random() * 4) + 18}:${Math.floor(Math.random() * 6)}0`,
  tipo: TIPOS_RESERVA[Math.floor(Math.random() * TIPOS_RESERVA.length)],
  nome: MOCK_NAMES[i % MOCK_NAMES.length],
  pax: Math.floor(Math.random() * 10) + 1,
  contato: `(11) 9 ${Math.floor(Math.random() * 9000 + 1000)}-${Math.floor(Math.random() * 9000 + 1000)}`,
  origem: "Sistema",
  status: ['Pendente', 'Confirmado', 'Cancelado', 'Finalizado'][Math.floor(Math.random() * 4)] as ReservaStatus,
  observacao: i % 4 === 0 ? "Comemoração de aniversário. Precisa de espaço para bolo." : ""
}));

const ReservaForm: React.FC<{ initialData?: Reserva }> = ({ initialData }) => {
  const inputClass = "w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 shadow-inner";
  const labelClass = "text-[11px] text-slate-500 dark:text-slate-400 mb-1.5 block ml-1";
  const iconClass = "absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-600 transition-colors pointer-events-none";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        <div className="md:col-span-5 space-y-1">
          <label className={labelClass}>Nome do cliente</label>
          <div className="relative group">
            <User className={iconClass} size={18} />
            <input type="text" className={inputClass} placeholder="Nome completo" defaultValue={initialData?.nome} />
          </div>
        </div>
        <div className="md:col-span-4 space-y-1">
          <label className={labelClass}>Contato</label>
          <div className="relative group">
            <Phone className={iconClass} size={18} />
            <input type="text" className={inputClass} placeholder="(00) 00000-0000" defaultValue={initialData?.contato} />
          </div>
        </div>
        <div className="md:col-span-3 space-y-1">
          <label className={labelClass}>Tipo de reserva</label>
          <div className="relative group">
            <Bookmark className={iconClass} size={18} />
            <select className={inputClass} defaultValue={initialData?.tipo || "Aniver"}>
              {TIPOS_RESERVA.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        <div className="md:col-span-3 space-y-1">
          <label className={labelClass}>Data</label>
          <div className="relative group">
            <CalendarIcon className={iconClass} size={18} />
            <input type="date" className={inputClass} defaultValue={initialData?.data ? initialData.data.split('/').reverse().join('-') : ''} />
          </div>
        </div>
        <div className="md:col-span-2 space-y-1">
          <label className={labelClass}>Hora</label>
          <div className="relative group">
            <Clock className={iconClass} size={18} />
            <input type="time" className={inputClass} defaultValue={initialData?.hora} />
          </div>
        </div>
        <div className="md:col-span-3 space-y-1">
          <label className={labelClass}>Qtd pessoas</label>
          <div className="relative group">
            <Users className={iconClass} size={18} />
            <input type="number" className={inputClass} min="1" defaultValue={initialData?.pax || 2} />
          </div>
        </div>
        <div className="md:col-span-4 space-y-1">
          <label className={labelClass}>Status</label>
          <div className="relative group">
            <Activity className={iconClass} size={18} />
            <select className={inputClass} defaultValue={initialData?.status || "Pendente"}>
              <option value="Pendente">Pendente</option>
              <option value="Confirmado">Confirmado</option>
              <option value="Cancelado">Cancelado</option>
              <option value="Finalizado">Finalizado</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <label className={labelClass}>Observação</label>
        <div className="relative group">
          <FileText className="absolute left-4 top-5 text-slate-500 group-focus-within:text-indigo-600 transition-colors pointer-events-none" size={18} />
          <textarea className={`${inputClass} h-32 resize-none pt-4 font-normal`} placeholder="Alguma restrição ou pedido especial?" defaultValue={initialData?.observacao} />
        </div>
      </div>
    </div>
  );
};

const ReservasPage: React.FC = () => {
  const [data, setData] = useState<Reserva[]>(MOCK_RESERVAS);
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; type: ModalType; title: string; content: React.ReactNode; onConfirm?: () => void; maxWidth?: string }>({
    isOpen: false,
    type: 'view-content',
    title: '',
    content: '',
    maxWidth: 'max-w-lg'
  });

  const handleStatusChange = (id: string, newStatus: ReservaStatus) => {
    setData(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
  };

  const handleAction = (type: 'view' | 'edit' | 'delete', item: Reserva) => {
    if (type === 'delete') {
      setModalConfig({
        isOpen: true,
        type: 'confirm-delete',
        title: 'Excluir reserva',
        maxWidth: 'max-w-lg',
        content: `Tem certeza que deseja excluir a reserva de ${item.nome} marcada para ${item.data} às ${item.hora}?`,
        onConfirm: () => setData(prev => prev.filter(r => r.id !== item.id))
      });
    } else if (type === 'edit') {
      setModalConfig({
        isOpen: true,
        type: 'confirm-update',
        title: 'Editar reserva',
        maxWidth: 'max-w-4xl',
        content: <ReservaForm initialData={item} />,
        onConfirm: () => console.log('Reserva atualizada')
      });
    } else {
      setModalConfig({
        isOpen: true,
        type: 'view-content',
        title: 'Detalhes da reserva',
        maxWidth: 'max-w-2xl',
        content: (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Código</label>
                <p className="text-xl font-bold text-indigo-700 dark:text-indigo-400 tracking-wider">{item.codigo}</p>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Tipo</label>
                <p className="text-lg text-slate-900 dark:text-white">{item.tipo}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Nome do cliente</label>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{item.nome}</p>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Contato</label>
                <p className="text-lg text-indigo-700 dark:text-indigo-400">{item.contato}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Data</label>
                <p className="text-slate-900 dark:text-slate-100">{item.data}</p>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Hora</label>
                <p className="text-slate-900 dark:text-slate-100">{item.hora}</p>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Pessoas</label>
                <p className="font-bold text-indigo-700 dark:text-indigo-400">{item.pax} {item.pax > 1 ? 'pessoas' : 'pessoa'}</p>
              </div>
            </div>
            <div className="pt-5 border-t border-slate-200 dark:border-slate-700">
              <label className="text-xs text-slate-500 mb-2 block">Observação</label>
              <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 italic text-sm text-slate-900 dark:text-slate-300 leading-relaxed shadow-inner">
                {item.observacao || "Nenhuma observação informada."}
              </div>
            </div>
          </div>
        )
      });
    }
  };

  const columns = [
    { header: '#', accessor: (_: any, index: number) => <span className="text-slate-500">{index}</span>, className: 'w-12 text-center' },
    { header: 'Código', accessor: (item: Reserva) => <span className="font-bold text-indigo-700 dark:text-indigo-400 tracking-widest">{item.codigo}</span>, className: 'w-24' },
    { header: 'Data/Hora', accessor: (item: Reserva) => (<div className="flex flex-col"><span className="text-slate-900 dark:text-slate-100">{item.data}</span><span className="text-[10px] text-slate-500">{item.hora}</span></div>), className: 'w-28' },
    { header: 'Tipo', accessor: (item: Reserva) => (<span className="text-[10px] px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 rounded-lg border border-slate-200 dark:border-slate-700 font-medium">{item.tipo}</span>), className: 'w-32' },
    { header: 'Cliente', accessor: (item: Reserva) => (<div className="flex flex-col"><span className="font-bold text-slate-900 dark:text-white text-sm">{item.nome}</span><span className="text-[10px] text-indigo-600 dark:text-indigo-400">{item.pax} {item.pax > 1 ? 'pessoas' : 'pessoa'}</span></div>), className: 'w-56' },
    { header: 'Contato', accessor: 'contato', className: 'w-36 text-slate-700' },
    {
      header: 'Status',
      accessor: (item: Reserva) => (
        <select
          value={item.status}
          onChange={(e) => handleStatusChange(item.id, e.target.value as ReservaStatus)}
          onClick={(e) => e.stopPropagation()}
          className={`text-[10px] px-2.5 py-2 rounded-xl border-0 focus:ring-2 focus:ring-indigo-500 cursor-pointer outline-none transition-all shadow-sm font-bold
            ${item.status === 'Pendente' ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-300' :
              item.status === 'Confirmado' ? 'bg-indigo-100 text-indigo-900 dark:bg-indigo-900/40 dark:text-indigo-300' :
                item.status === 'Cancelado' ? 'bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-300' :
                  'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-300'}
          `}
        >
          <option value="Pendente" className="text-slate-900 dark:bg-slate-800 dark:text-slate-100">Pendente</option>
          <option value="Confirmado" className="text-slate-900 dark:bg-slate-800 dark:text-slate-100">Confirmado</option>
          <option value="Cancelado" className="text-slate-900 dark:bg-slate-800 dark:text-slate-100">Cancelado</option>
          <option value="Finalizado" className="text-slate-900 dark:bg-slate-800 dark:text-slate-100">Finalizado</option>
        </select>
      ),
      className: 'w-36'
    },
    { header: 'Obs', accessor: (item: Reserva) => (<button onClick={() => handleAction('view', item)} className={`p-2.5 rounded-xl transition-all ${item.observacao ? 'text-indigo-700 bg-indigo-50 dark:bg-indigo-900/40 shadow-sm border border-indigo-100 dark:border-indigo-800' : 'text-slate-300 cursor-not-allowed'}`} disabled={!item.observacao}><StickyNote size={18} strokeWidth={2} /></button>), className: 'w-16 text-center' },
    { header: 'Ações', accessor: (item: Reserva) => (<div className="flex items-center gap-1"><button onClick={() => handleAction('view', item)} className="p-1.5 text-slate-500 hover:text-indigo-700 rounded-lg transition-all" title="Visualizar"><Eye size={20} strokeWidth={2} /></button><button onClick={() => handleAction('edit', item)} className="p-1.5 text-slate-500 hover:text-blue-700 rounded-lg transition-all" title="Editar"><Edit3 size={20} strokeWidth={2} /></button><button onClick={() => handleAction('delete', item)} className="p-1.5 text-slate-500 hover:text-red-700 rounded-lg transition-all" title="Excluir"><Trash2 size={20} strokeWidth={2} /></button></div>), className: 'w-28' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Reservas</h1>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Gerenciamento completo das reservas do estabelecimento.</p>
        </div>
        <button
          onClick={() => setModalConfig({ isOpen: true, type: 'confirm-insert', title: 'Nova reserva', maxWidth: 'max-w-4xl', content: <ReservaForm />, onConfirm: () => console.log('Reserva cadastrada') })}
          className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold px-6 py-3 rounded-2xl flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-200 dark:shadow-none tracking-widest text-xs"
        >
          <Plus size={22} strokeWidth={3} />
          Cadastrar
        </button>
      </div>

      <Table columns={columns} data={data} searchPlaceholder="Buscar por código, cliente ou tipo..." />

      <Modal isOpen={modalConfig.isOpen} type={modalConfig.type} title={modalConfig.title} content={modalConfig.content} maxWidth={modalConfig.maxWidth} onConfirm={modalConfig.onConfirm} onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))} />
    </div>
  );
};

export default ReservasPage;
