
import React, { useState } from 'react';
import { Plus, Eye, Edit3, Trash2, StickyNote, Calendar as CalendarIcon, Hash, User, Type, Award, Activity, FileText } from 'lucide-react';
import Table from '../components/UI/Table';
import Modal from '../components/UI/Modal';
import { Consumacao, ConsumacaoStatus, ConsumacaoTipo, ModalType } from '../types';

// Mock Data Generation
const MOCK_NAMES = ["Marcos Silva", "Juliana Pereira", "Rodrigo Santos", "Beatriz Costa", "Tiago Oliveira", "Clara Mendes"];
const MOCK_EVENTOS = ["Dia dos Pais", "Aniversário Hashi", "Sorteio Instagram", "Cortesia VIP", "Natal Solidário"];

const generateCodigo = () => {
  const nums = Math.floor(Math.random() * 900 + 100).toString();
  const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  return nums + letter;
};

const MOCK_CONSUMACOES: Consumacao[] = Array.from({ length: 25 }).map((_, i) => ({
  id: `cons-${i}`,
  data: new Date(2024, 4, Math.floor(Math.random() * 28) + 1).toLocaleDateString('pt-BR'),
  nome: MOCK_NAMES[i % MOCK_NAMES.length],
  codigo: generateCodigo(),
  tipo: ['Sorteio', 'Cortesia'][Math.floor(Math.random() * 2)] as ConsumacaoTipo,
  evento: MOCK_EVENTOS[i % MOCK_EVENTOS.length],
  status: ['Pendente', 'Utilizado', 'Expirado'][Math.floor(Math.random() * 3)] as ConsumacaoStatus,
  validade: new Date(2024, 11, 31).toLocaleDateString('pt-BR'),
  descricao: "Válido para 01 rodízio individual com bebida inclusa."
}));

// Formulário do Modal de Cadastro/Edição com campos modernos e layout ajustado
const ConsumacaoForm: React.FC<{ initialData?: Consumacao }> = ({ initialData }) => {
  const inputClass = "w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-800 dark:text-slate-200 placeholder:text-slate-400";
  const labelClass = "text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.1em] mb-1.5 block ml-1 font-bold";
  const iconClass = "absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none";

  return (
    <div className="space-y-6">
      {/* Linha 1: Nome, Cod/Contato, Tipo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="space-y-1">
          <label className={labelClass}>Nome do Cliente</label>
          <div className="relative group">
            <User className={iconClass} size={18} />
            <input type="text" className={inputClass} placeholder="Nome completo" defaultValue={initialData?.nome} />
          </div>
        </div>
        <div className="space-y-1">
          <label className={labelClass}>Cod/Contato</label>
          <div className="relative group">
            <Hash className={iconClass} size={18} />
            <input type="text" className={inputClass} placeholder="Ex: 55D6" defaultValue={initialData?.codigo} />
          </div>
        </div>
        <div className="space-y-1">
          <label className={labelClass}>Tipo</label>
          <div className="relative group">
            <Type className={iconClass} size={18} />
            <select className={inputClass} defaultValue={initialData?.tipo || "Cortesia"}>
              <option value="Sorteio">Sorteio</option>
              <option value="Cortesia">Cortesia</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Linha 2: Evento, Status, Data (Validade) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="space-y-1">
          <label className={labelClass}>Evento</label>
          <div className="relative group">
            <Award className={iconClass} size={18} />
            <input type="text" className={inputClass} placeholder="Ex: Dia dos Pais" defaultValue={initialData?.evento} />
          </div>
        </div>
        <div className="space-y-1">
          <label className={labelClass}>Status</label>
          <div className="relative group">
            <Activity className={iconClass} size={18} />
            <select className={inputClass} defaultValue={initialData?.status || "Pendente"}>
              <option value="Pendente">Pendente</option>
              <option value="Utilizado">Utilizado</option>
              <option value="Expirado">Expirado</option>
            </select>
          </div>
        </div>
        <div className="space-y-1">
          <label className={labelClass}>Data (Validade)</label>
          <div className="relative group">
            <div className={iconClass}>
              <CalendarIcon size={18} />
            </div>
            <input 
              type="date" 
              className={inputClass} 
              defaultValue={initialData?.validade ? initialData.validade.split('/').reverse().join('-') : ''} 
            />
          </div>
        </div>
      </div>

      {/* Linha 3: Descrição */}
      <div className="space-y-1">
        <label className={labelClass}>Descrição</label>
        <div className="relative group">
          <FileText className="absolute left-4 top-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" size={18} />
          <textarea 
            className={`${inputClass} h-28 resize-none pt-3`} 
            placeholder="Regras ou detalhes da consumação..." 
            defaultValue={initialData?.descricao} 
          />
        </div>
      </div>
    </div>
  );
};

const ConsumacoesPage: React.FC = () => {
  const [data, setData] = useState<Consumacao[]>(MOCK_CONSUMACOES);
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; type: ModalType; title: string; content: React.ReactNode; onConfirm?: () => void; maxWidth?: string }>({
    isOpen: false,
    type: 'view-content',
    title: '',
    content: '',
    maxWidth: 'max-w-lg'
  });

  const handleStatusChange = (id: string, newStatus: ConsumacaoStatus) => {
    setData(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
  };

  const handleAction = (type: 'view' | 'edit' | 'delete', item: Consumacao) => {
    if (type === 'delete') {
      setModalConfig({
        isOpen: true,
        type: 'confirm-delete',
        title: 'Excluir Consumação',
        content: `Deseja realmente excluir a consumação de ${item.nome} (${item.codigo})?`,
        onConfirm: () => setData(prev => prev.filter(c => c.id !== item.id))
      });
    } else if (type === 'edit') {
      setModalConfig({
        isOpen: true,
        type: 'confirm-update',
        title: 'Editar Consumação',
        maxWidth: 'max-w-4xl',
        content: <ConsumacaoForm initialData={item} />,
        onConfirm: () => console.log('Registro atualizado')
      });
    } else {
      setModalConfig({
        isOpen: true,
        type: 'view-content',
        title: 'Detalhes da Consumação',
        maxWidth: 'max-w-2xl',
        content: (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 uppercase font-bold">Cliente</label>
                <p className="font-bold text-slate-800 dark:text-white">{item.nome}</p>
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase font-bold">Código</label>
                <p className="font-bold text-indigo-600">{item.codigo}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 uppercase font-bold">Tipo</label>
                <p className="text-sm text-slate-600 dark:text-slate-300">{item.tipo}</p>
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase font-bold">Evento</label>
                <p className="text-sm text-slate-600 dark:text-slate-300">{item.evento}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 uppercase font-bold">Validade</label>
                <p className="text-sm text-slate-600 dark:text-slate-300">{item.validade}</p>
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase font-bold">Status</label>
                <p className="text-sm font-bold text-indigo-500">{item.status}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
              <label className="text-xs text-slate-400 uppercase font-bold">Descrição</label>
              <p className="text-sm text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800 leading-relaxed">
                {item.descricao}
              </p>
            </div>
          </div>
        )
      });
    }
  };

  const columns = [
    { header: '#', accessor: (_: any, index: number) => <span className="text-slate-400">{index}</span>, className: 'w-12 text-center' },
    { header: 'Data', accessor: 'data', className: 'w-28' },
    { header: 'Nome', accessor: (item: Consumacao) => <span className="font-bold text-slate-900 dark:text-white">{item.nome}</span>, className: 'w-40' },
    { header: 'Cod/Contato', accessor: (item: Consumacao) => <span className="font-bold text-indigo-600 dark:text-indigo-400">{item.codigo}</span>, className: 'w-28 text-center' },
    { 
      header: 'Tipo', 
      accessor: (item: Consumacao) => (
        <span className={`text-[11px] px-2 py-0.5 rounded-md font-bold ${item.tipo === 'Sorteio' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
          {item.tipo}
        </span>
      ), 
      className: 'w-24' 
    },
    { header: 'Evento', accessor: 'evento', className: 'w-36 truncate font-medium' },
    { 
      header: 'Status', 
      accessor: (item: Consumacao) => (
        <select 
          value={item.status}
          onChange={(e) => handleStatusChange(item.id, e.target.value as ConsumacaoStatus)}
          onClick={(e) => e.stopPropagation()}
          className={`text-xs px-2 py-1 rounded-full border-0 focus:ring-2 focus:ring-indigo-500 cursor-pointer outline-none transition-colors font-bold
            ${item.status === 'Pendente' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 
              item.status === 'Utilizado' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 
              'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}
          `}
        >
          <option value="Pendente">Pendente</option>
          <option value="Utilizado">Utilizado</option>
          <option value="Expirado">Expirado</option>
        </select>
      ),
      className: 'w-32'
    },
    { header: 'Validade', accessor: 'validade', className: 'w-28 text-slate-500' },
    { 
      header: 'Desc', 
      accessor: (item: Consumacao) => (
        <button 
          onClick={() => handleAction('view', item)}
          className="p-2 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg transition-colors"
        >
          <StickyNote size={18} />
        </button>
      ),
      className: 'w-16 text-center'
    },
    { 
      header: 'Ações', 
      accessor: (item: Consumacao) => (
        <div className="flex items-center gap-1">
          <button onClick={() => handleAction('edit', item)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg transition-all" title="Editar"><Edit3 size={16} /></button>
          <button onClick={() => handleAction('delete', item)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-all" title="Excluir"><Trash2 size={16} /></button>
          <button onClick={() => handleAction('view', item)} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg transition-all" title="Visualizar"><Eye size={16} /></button>
        </div>
      ),
      className: 'w-28'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Consumações</h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Gerenciamento de cortesias, sorteios e prêmios do estabelecimento.</p>
        </div>
        <button 
          onClick={() => setModalConfig({
            isOpen: true,
            type: 'confirm-insert',
            title: 'Nova Consumação',
            maxWidth: 'max-w-4xl',
            content: <ConsumacaoForm />,
            onConfirm: () => console.log('Novo registro salvo com status Pendente')
          })}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-100 dark:shadow-none"
        >
          <Plus size={20} strokeWidth={3} />
          Cadastrar
        </button>
      </div>

      <Table columns={columns} data={data} searchPlaceholder="Buscar por nome, código ou evento..." />

      <Modal isOpen={modalConfig.isOpen} type={modalConfig.type} title={modalConfig.title} content={modalConfig.content} maxWidth={modalConfig.maxWidth} onConfirm={modalConfig.onConfirm} onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))} />
    </div>
  );
};

export default ConsumacoesPage;
