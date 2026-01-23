
import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Eye, Calendar, Tag, RefreshCw } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Promocao, ModalType } from '../types';
import Modal from '../components/UI/Modal';
import Table from '../components/UI/Table';
import { DBService } from '../lib/db';

const PromotionForm: React.FC<{ initialData?: Promocao; onSubmit: (data: Omit<Promocao, 'id'>) => void }> = ({ initialData, onSubmit }) => {
  const [titulo, setTitulo] = useState(initialData?.titulo || '');
  const [categoria, setCategoria] = useState(initialData?.categoria || 'Rodízio');
  const [dataInicio, setDataInicio] = useState(initialData?.dataInicio || '');
  const [dataFim, setDataFim] = useState(initialData?.dataFim || '');
  const [descricao, setDescricao] = useState(initialData?.descricao || '');
  const [ativa, setAtiva] = useState(initialData?.ativa ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      titulo,
      categoria,
      descricao,
      ativa,
      dataInicio,
      dataFim
    });
  };

  const inputClass = "w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 font-medium";
  const labelClass = "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1";

  return (
    <form id="promo-form" onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className={labelClass}>Título da Promoção</label>
          <div className="relative group">
            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              required
              className={`${inputClass} pl-12`}
              placeholder="Ex: Especial Natal"
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className={labelClass}>Categoria</label>
          <select
            className={inputClass}
            value={categoria}
            onChange={e => setCategoria(e.target.value)}
          >
            <option>Rodízio</option>
            <option>Bebidas</option>
            <option>Sobremesas</option>
            <option>Kilo</option>
            <option>A La Carte</option>
            <option>Promoções</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className={labelClass}>Data Início</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="date"
              className={`${inputClass} pl-12`}
              value={dataInicio}
              onChange={e => setDataInicio(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className={labelClass}>Data Fim</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="date"
              className={`${inputClass} pl-12`}
              value={dataFim}
              onChange={e => setDataFim(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <label className={labelClass}>Descrição e Regras</label>
        <textarea
          required
          className={`${inputClass} h-32 resize-none py-4`}
          placeholder="Descreva os detalhes da promoção..."
          value={descricao}
          onChange={e => setDescricao(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-red-500 transition-colors w-full sm:w-auto">
          <input
            type="checkbox"
            checked={ativa}
            onChange={e => setAtiva(e.target.checked)}
            className="w-5 h-5 rounded border-slate-300 text-red-600 focus:ring-red-500"
          />
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300 select-none">Promoção Ativa</span>
        </label>
      </div>
    </form>
  );
};


const formatDate = (dateStr?: string) => {
  if (!dateStr) return '';
  if (dateStr.includes('/')) return dateStr; // Já formatado
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

const PromocionalPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; type: ModalType; title: string; content: React.ReactNode; onConfirm?: () => void; maxWidth?: string }>({
    isOpen: false,
    type: 'view-content',
    title: '',
    content: ''
  });

  const { data: promocoes = [], isLoading } = useQuery({
    queryKey: ['promocoes'],
    queryFn: DBService.promocoes.getAll,
  });

  const createMutation = useMutation({
    mutationFn: DBService.promocoes.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promocoes'] });
      setModalConfig(prev => ({ ...prev, isOpen: false }));
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Promocao> }) => DBService.promocoes.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promocoes'] });
      setModalConfig(prev => ({ ...prev, isOpen: false }));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: DBService.promocoes.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promocoes'] });
      setModalConfig(prev => ({ ...prev, isOpen: false }));
    }
  });

  const handleToggleActive = (id: string, currentStatus: boolean) => {
    updateMutation.mutate({ id, data: { ativa: !currentStatus } });
  };

  const handleAction = (type: 'view' | 'edit' | 'delete', promo: Promocao) => {
    if (type === 'delete') {
      setModalConfig({
        isOpen: true,
        type: 'confirm-delete',
        title: 'Excluir Promoção',
        content: `Deseja realmente excluir a promoção "${promo.titulo}"?`,
        onConfirm: () => deleteMutation.mutate(promo.id)
      });
    } else if (type === 'edit') {
      setModalConfig({
        isOpen: true,
        type: 'confirm-update',
        title: 'Editar Promoção',
        content: <PromotionForm initialData={promo} onSubmit={(data) => updateMutation.mutate({ id: promo.id, data })} />,
        maxWidth: 'max-w-2xl',
        onConfirm: () => {
          const form = document.getElementById('promo-form') as HTMLFormElement;
          if (form) form.requestSubmit();
        }
      });
    } else {
      setModalConfig({
        isOpen: true,
        type: 'view-content',
        title: 'Detalhes da Promoção',
        content: (
          <div className="space-y-6">
            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Título</label>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">{promo.titulo}</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Categoria</label>
                <p className="font-bold text-slate-700 dark:text-slate-300 mt-1">{promo.categoria}</p>
              </div>
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Status</label>
                <span className={`inline-block mt-1 px-2.5 py-0.5 rounded text-[11px] font-black uppercase tracking-wider ${promo.ativa ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                  {promo.ativa ? 'Ativa' : 'Inativa'}
                </span>
              </div>
            </div>
            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Vigência</label>
              <div className="flex items-center gap-2 mt-1 text-sm font-bold text-slate-800 dark:text-slate-200">
                <Calendar size={16} className="text-red-500" />
                {formatDate(promo.dataInicio) || '...'} até {formatDate(promo.dataFim) || '...'}
              </div>
            </div>
            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Descrição</label>
              <div className="mt-2 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {promo.descricao}
              </div>
            </div>
          </div>
        ),
        maxWidth: 'max-w-lg'
      });
    }
  };

  const columns = [
    {
      header: 'Promoção',
      accessor: (item: Promocao) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900 dark:text-white">{item.titulo}</span>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{item.categoria}</span>
        </div>
      ),
      className: 'w-64'
    },
    {
      header: 'Vigência',
      accessor: (item: Promocao) => (
        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
          {item.dataInicio ? `${formatDate(item.dataInicio)} - ${formatDate(item.dataFim)}` : 'Vigência indeterminada'}
        </span>
      ),

      className: 'w-40'
    },
    {
      header: 'Status',
      accessor: (item: Promocao) => (
        <button
          onClick={(e) => { e.stopPropagation(); handleToggleActive(item.id, item.ativa); }}
          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 ${item.ativa
            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50'
            : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
            }`}
        >
          {item.ativa ? 'Ativa' : 'Inativa'}
        </button>
      ),
      className: 'w-24 text-center'
    },
    {
      header: 'Ações',
      accessor: (item: Promocao) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={(e) => { e.stopPropagation(); handleAction('view', item); }} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 rounded-lg transition-all"><Eye size={18} /></button>
          <button onClick={(e) => { e.stopPropagation(); handleAction('edit', item); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded-lg transition-all"><Edit3 size={18} /></button>
          <button onClick={(e) => { e.stopPropagation(); handleAction('delete', item); }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-lg transition-all"><Trash2 size={18} /></button>
        </div>
      ),
      className: 'w-32 text-right'
    }
  ];

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <RefreshCw size={40} className="text-red-600 animate-spin opacity-50" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Promocional</h1>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Gerencie as ofertas e campanhas ativas do estabelecimento.</p>
        </div>
        <button
          onClick={() => setModalConfig({
            isOpen: true,
            type: 'confirm-insert',
            title: 'Nova Promoção',
            content: <PromotionForm onSubmit={(data) => createMutation.mutate(data)} />,
            maxWidth: 'max-w-2xl',
            onConfirm: () => {
              const form = document.getElementById('promo-form') as HTMLFormElement;
              if (form) form.requestSubmit();
            }
          })}
          className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-2xl flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-red-100 dark:shadow-none tracking-widest text-xs"
        >
          <Plus size={20} strokeWidth={3} />
          Cadastrar
        </button>
      </div>

      <Table
        columns={columns}
        data={promocoes}
        searchPlaceholder="Buscar por título ou categoria..."
        itemsPerPage={10}
        onRowClick={(item) => handleAction('view', item)}
      />

      <Modal
        isOpen={modalConfig.isOpen}
        type={modalConfig.type}
        title={modalConfig.title}
        content={modalConfig.content}
        maxWidth={modalConfig.maxWidth}
        onConfirm={modalConfig.onConfirm}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default PromocionalPage;
