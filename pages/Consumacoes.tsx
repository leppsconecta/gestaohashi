
import React, { useState, useEffect } from 'react';
import { Plus, Eye, Edit3, Trash2, StickyNote, Calendar as CalendarIcon, Hash, User, Type, Award, Activity, FileText, RefreshCw } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Table from '../components/UI/Table';
import Modal from '../components/UI/Modal';
import { Consumacao, ConsumacaoStatus, ConsumacaoTipo, ModalType } from '../types';
import { supabase } from '../lib/supabase';

// Helper para formatar data DD/MM/YYYY para YYYY-MM-DD (para input date)
const formatDateToISO = (dateStr?: string) => {
  if (!dateStr) return '';
  // Se já for YYYY-MM-DD
  if (dateStr.includes('-')) return dateStr;
  // Se for DD/MM/YYYY
  const parts = dateStr.split('/');
  if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
  return '';
};

const ConsumacaoForm: React.FC<{ initialData?: Partial<Consumacao>; onChange: (data: Partial<Consumacao>) => void }> = ({ initialData, onChange }) => {
  const [formData, setFormData] = useState<Partial<Consumacao>>(initialData || { status: 'Pendente', tipo: 'Cortesia' });

  useEffect(() => {
    onChange(formData);
  }, [formData, onChange]);

  const handleChange = (field: keyof Consumacao, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const inputClass = "w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-800 dark:text-slate-200 placeholder:text-slate-400";
  const labelClass = "text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.1em] mb-1.5 block ml-1 font-bold";
  const iconClass = "absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="space-y-1">
          <label className={labelClass}>Nome do Cliente</label>
          <div className="relative group">
            <User className={iconClass} size={18} />
            <input
              type="text"
              className={inputClass}
              placeholder="Nome completo"
              value={formData.nome || ''}
              onChange={e => handleChange('nome', e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className={labelClass}>Cod/Contato</label>
          <div className="relative group">
            <Hash className={iconClass} size={18} />
            <input
              type="text"
              className={inputClass}
              placeholder="Ex: 55D6"
              value={formData.codigo || ''}
              onChange={e => handleChange('codigo', e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className={labelClass}>Tipo</label>
          <div className="relative group">
            <Type className={iconClass} size={18} />
            <select
              className={inputClass}
              value={formData.tipo || 'Cortesia'}
              onChange={e => handleChange('tipo', e.target.value)}
            >
              <option value="Sorteio" className="text-slate-900 dark:bg-slate-800 dark:text-slate-100">Sorteio</option>
              <option value="Cortesia" className="text-slate-900 dark:bg-slate-800 dark:text-slate-100">Cortesia</option>
              <option value="Voucher" className="text-slate-900 dark:bg-slate-800 dark:text-slate-100">Voucher</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="space-y-1">
          <label className={labelClass}>Evento</label>
          <div className="relative group">
            <Award className={iconClass} size={18} />
            <input
              type="text"
              className={inputClass}
              placeholder="Ex: Dia dos Pais"
              value={formData.evento || ''}
              onChange={e => handleChange('evento', e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className={labelClass}>Status</label>
          <div className="relative group">
            <Activity className={iconClass} size={18} />
            <select
              className={inputClass}
              value={formData.status || 'Pendente'}
              onChange={e => handleChange('status', e.target.value)}
            >
              <option value="Pendente" className="text-slate-900 dark:bg-slate-800 dark:text-slate-100">Pendente</option>
              <option value="Utilizado" className="text-slate-900 dark:bg-slate-800 dark:text-slate-100">Utilizado</option>
              <option value="Expirado" className="text-slate-900 dark:bg-slate-800 dark:text-slate-100">Expirado</option>
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
              value={formatDateToISO(formData.validade)}
              onChange={e => handleChange('validade', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <label className={labelClass}>Descrição</label>
        <div className="relative group">
          <FileText className="absolute left-4 top-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" size={18} />
          <textarea
            className={`${inputClass} h-28 resize-none pt-3`}
            placeholder="Regras ou detalhes da consumação..."
            value={formData.descricao || ''}
            onChange={e => handleChange('descricao', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

const ConsumacoesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; type: ModalType; title: string; content: React.ReactNode; onConfirm?: () => void; maxWidth?: string }>({
    isOpen: false,
    type: 'view-content',
    title: '',
    content: '',
    maxWidth: 'max-w-lg'
  });

  // Estado temporário para capturar dados do formulário
  const [formTempData, setFormTempData] = useState<Partial<Consumacao>>({});

  const { data = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['consumacoes'],
    queryFn: async () => {
      const { data: result, error } = await supabase
        .from('view_consumacoes_gestao')
        .select('*')
        .order('data', { ascending: false });

      if (error) throw error;

      if (result) {
        return result.map(item => ({
          ...item,
          data: new Date(item.data).toLocaleDateString('pt-BR'),
          validade: item.validade ? new Date(item.validade).toLocaleDateString('pt-BR') : ''
        }));
      }
      return [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5,
  });

  const handleStatusChange = async (id: string, newStatus: ConsumacaoStatus) => {
    try {
      const { error } = await supabase
        .from('view_consumacoes_gestao')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      // Invalidate query to refresh data
      queryClient.invalidateQueries({ queryKey: ['consumacoes'] });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao salvar status.');
    }
  };

  const handleSave = async (isUpdate: boolean, id?: string) => {
    try {
      // Preparar dados para o banco (converter data se necessário)
      // O input date retorna YYYY-MM-DD, que o Supabase aceita bem
      const payload = {
        ...formTempData,
        // Garantir que validade está no formato correto se foi alterada
        validade: formTempData.validade ? formTempData.validade : null
      };

      if (isUpdate && id) {
        const { error } = await supabase
          .from('view_consumacoes_gestao')
          .update(payload)
          .eq('id', id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('view_consumacoes_gestao')
          .insert([payload]);

        if (error) throw error;
      }

      await queryClient.invalidateQueries({ queryKey: ['consumacoes'] });
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar registro.');
      throw error; // Propagar erro para não fechar modal se falhar (se o modal tratasse isso, mas aqui fecha no onConfirm wrapper)
    }
  };

  const handleAction = (type: 'view' | 'edit' | 'delete', item?: Consumacao) => {
    setFormTempData({}); // Resetar temp data

    if (type === 'delete' && item) {
      setModalConfig({
        isOpen: true,
        type: 'confirm-delete',
        title: 'Excluir Consumação',
        content: `Deseja realmente excluir a consumação de ${item.nome} (${item.codigo})?`,
        onConfirm: async () => {
          try {
            const { error } = await supabase
              .from('view_consumacoes_gestao')
              .delete()
              .eq('id', item.id);
            if (error) throw error;
            queryClient.invalidateQueries({ queryKey: ['consumacoes'] });
          } catch (e) {
            console.error(e);
            alert('Erro ao excluir.');
          }
        }
      });
    } else if (type === 'edit' && item) {
      setFormTempData(item); // Inicializar com dados existentes
      setModalConfig({
        isOpen: true,
        type: 'confirm-update',
        title: 'Editar Consumação',
        maxWidth: 'max-w-4xl',
        content: <ConsumacaoForm initialData={item} onChange={setFormTempData} />,
        onConfirm: () => handleSave(true, item.id)
      });
    } else if (type === 'view' && item) {
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
              <div className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800 leading-relaxed max-h-40 overflow-y-auto">
                {item.descricao}
              </div>
            </div>
          </div>
        )
      });
    }
  };

  const handleNew = () => {
    setFormTempData({ status: 'Pendente', tipo: 'Cortesia' });
    setModalConfig({
      isOpen: true,
      type: 'confirm-insert',
      title: 'Nova Consumação',
      maxWidth: 'max-w-4xl',
      content: <ConsumacaoForm onChange={setFormTempData} />,
      onConfirm: () => handleSave(false)
    });
  };

  const columns = [
    { header: '#', accessor: (_: any, index: number) => <span className="text-slate-400">{index + 1}</span>, className: 'w-12 text-center' },
    { header: 'Data', accessor: 'data', className: 'w-28' },
    { header: 'Nome', accessor: (item: Consumacao) => <span className="font-bold text-slate-900 dark:text-white">{item.nome}</span>, className: 'w-40' },
    { header: 'Cod/Contato', accessor: (item: Consumacao) => <span className="font-bold text-indigo-600 dark:text-indigo-400">{item.codigo}</span>, className: 'w-28 text-center' },
    {
      header: 'Tipo',
      accessor: (item: Consumacao) => (
        <span className={`text-[11px] px-2 py-0.5 rounded-md font-bold ${item.tipo === 'Sorteio' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
          item.tipo === 'Cortesia' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
            'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
          }`}>
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
          <option value="Pendente" className="text-slate-900 dark:bg-slate-800 dark:text-slate-100">Pendente</option>
          <option value="Utilizado" className="text-slate-900 dark:bg-slate-800 dark:text-slate-100">Utilizado</option>
          <option value="Expirado" className="text-slate-900 dark:bg-slate-800 dark:text-slate-100">Expirado</option>
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
        <div className="flex items-center gap-2">
          <button onClick={() => refetch()} disabled={loading} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all" title="Atualizar">
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleNew}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-100 dark:shadow-none"
          >
            <Plus size={20} strokeWidth={3} />
            Cadastrar
          </button>
        </div>
      </div>

      <Table columns={columns} data={data} searchPlaceholder="Buscar por nome, código ou evento..." />

      <Modal isOpen={modalConfig.isOpen} type={modalConfig.type} title={modalConfig.title} content={modalConfig.content} maxWidth={modalConfig.maxWidth} onConfirm={modalConfig.onConfirm} onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))} />
    </div>
  );
};

export default ConsumacoesPage;
