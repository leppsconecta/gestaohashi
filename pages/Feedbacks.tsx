
import React, { useState, useEffect } from 'react';
import { Trash2, StickyNote, RefreshCw } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Table from '../components/UI/Table';
import Modal from '../components/UI/Modal';
import { Feedback, FeedbackStatus, ModalType } from '../types';
import { supabase } from '../lib/supabase';

const FeedbacksPage: React.FC = () => {
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; type: ModalType; title: string; content: React.ReactNode; onConfirm?: () => void; maxWidth?: string }>({
    isOpen: false,
    type: 'view-content',
    title: '',
    content: '',
    maxWidth: 'max-w-lg'
  });

  const [activeTab, setActiveTab] = useState<string>('Elogio');
  const queryClient = useQueryClient();

  const { data: data = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['feedbacks'],
    queryFn: async () => {
      const { data: result, error } = await supabase
        .schema('gestaohashi')
        .from('feedbacks')
        .select('*')
        .order('data', { ascending: false });

      if (error) throw error;

      if (result) {
        return result.map(item => ({
          ...item,
          data: item.data ? new Date(item.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '',
          tipo: item.tipo === 'Reclamação' ? 'Reclamacao' : item.tipo,
          descricao: item.descricao || ''
        }));
      }
      return [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5,
  });

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .schema('gestaohashi')
        .from('feedbacks')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status.');
    }
  };



  const handleDescClick = (e: React.MouseEvent, item: Feedback) => {
    e.stopPropagation();
    setModalConfig({
      isOpen: true,
      type: 'view-content',
      title: 'Descrição do feedback',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Nome</p>
              <p className="font-bold text-slate-900 dark:text-white">{item.nome}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Código</p>
              <p className="font-bold text-indigo-700 dark:text-indigo-400">{item.codigo}</p>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
            <p className="text-xs text-slate-500 uppercase mb-2 tracking-widest font-bold">Descrição</p>
            <div className="text-slate-900 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800 italic font-medium max-h-[60vh] overflow-y-auto">
              {item.descricao || 'Nenhuma descrição cadastrada.'}
            </div>
          </div>
        </div>
      ),
    });
  };

  // Helper para normalizar status (caso venha diferente do banco legado)
  const getNormalizedStatus = (status: string) => {
    if (status === 'Pending') return 'Pendente';
    return status;
  };

  // Counts for alert badges
  const getUnresolvedCount = (type: string) => {
    return data.filter(item => item.tipo === type && getNormalizedStatus(item.status) !== 'Resolvido').length;
  };

  const tabs = ['Elogio', 'Reclamacao', 'Sugestão', 'Denúncia'];

  const getTabLabel = (tab: string) => {
    if (tab === 'Reclamacao') return 'Reclamação';
    return tab;
  };

  const filteredData = data.filter(item => item.tipo === activeTab);

  // Calcula contadores para os insights
  const stats = {
    total: data.length,
    elogio: data.filter(i => i.tipo === 'Elogio').length,
    reclamacao: data.filter(i => i.tipo === 'Reclamacao').length,
    sugestao: data.filter(i => i.tipo === 'Sugestão').length,
    denuncia: data.filter(i => i.tipo === 'Denúncia').length
  };

  const columns = [
    { header: '#', accessor: (_: any, index: number) => <span className="text-slate-500">{index + 1}</span>, className: 'w-12 text-center' },
    { header: 'Data', accessor: 'data', className: 'w-28 text-slate-700 dark:text-slate-300' },
    { header: 'Cód', accessor: (item: Feedback) => <span className="font-bold text-indigo-700 dark:text-indigo-400">{item.codigo}</span>, className: 'w-20' },
    {
      header: 'Status',
      accessor: (item: Feedback) => (
        <select
          value={getNormalizedStatus(item.status)}
          onChange={(e) => handleStatusChange(item.id, e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className={`text-[10px] uppercase tracking-wider px-2 py-1.5 rounded-full border-0 focus:ring-2 focus:ring-indigo-500 cursor-pointer outline-none transition-colors font-bold
            ${getNormalizedStatus(item.status) === 'Pendente' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' :
              getNormalizedStatus(item.status) === 'Resolvendo' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' :
                'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'}
          `}
        >
          <option value="Pendente" className="text-slate-900 dark:bg-slate-800 dark:text-slate-100">Pendente</option>
          <option value="Resolvendo" className="text-slate-900 dark:bg-slate-800 dark:text-slate-100">Resolvendo</option>
          <option value="Resolvido" className="text-slate-900 dark:bg-slate-800 dark:text-slate-100">Resolvido</option>
        </select>
      ),
      className: 'w-32'
    },
    { header: 'Origem', accessor: 'origem', className: 'w-24 text-slate-500 font-medium' },
    { header: 'Nome', accessor: (item: Feedback) => <span className="font-bold text-slate-900 dark:text-white">{item.nome}</span>, className: 'w-40' },
    { header: 'Contato', accessor: 'contato', className: 'w-36 text-slate-600 font-medium' },
    {
      header: 'Descrição',
      accessor: (item: Feedback) => (
        <div
          onClick={(e) => handleDescClick(e, item)}
          className="cursor-pointer group flex items-start gap-2 max-w-[300px]"
          title="Clique para ver detalhes"
        >
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 italic group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            "{item.descricao || 'Sem descrição'}"
          </p>
          <StickyNote size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
        </div>
      ),
      className: 'w-[300px] text-left'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Feedbacks</h1>
            <button onClick={() => refetch()} disabled={loading} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all" title="Atualizar">
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Acompanhe a satisfação dos clientes e resolva pendências.</p>
        </div>

        {/* Insights Stats */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 w-20">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Elogios</span>
            <span className="text-xl font-black text-emerald-700 dark:text-emerald-300 leading-none mt-1">{stats.elogio}</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 w-20">
            <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Reclam.</span>
            <span className="text-xl font-black text-red-700 dark:text-red-300 leading-none mt-1">{stats.reclamacao}</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 w-20">
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Sugest.</span>
            <span className="text-xl font-black text-amber-700 dark:text-amber-300 leading-none mt-1">{stats.sugestao}</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800/50 w-20">
            <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Denúnc.</span>
            <span className="text-xl font-black text-orange-700 dark:text-orange-300 leading-none mt-1">{stats.denuncia}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-700 pb-1">
        {tabs.map(tab => {
          const count = getUnresolvedCount(tab);

          let activeClass = '';
          let inactiveClass = '';
          let badgeClass = '';

          switch (tab) {
            case 'Elogio':
              activeClass = 'bg-emerald-600 text-white shadow-md border-transparent ring-2 ring-offset-2 ring-emerald-600';
              inactiveClass = 'bg-emerald-600 text-white border-transparent opacity-50 hover:opacity-80';
              badgeClass = 'bg-white text-emerald-700 shadow-sm';
              break;
            case 'Reclamacao':
              activeClass = 'bg-red-600 text-white shadow-md border-transparent ring-2 ring-offset-2 ring-red-600';
              inactiveClass = 'bg-red-600 text-white border-transparent opacity-50 hover:opacity-80';
              badgeClass = 'bg-white text-red-700 shadow-sm';
              break;
            case 'Sugestão':
              activeClass = 'bg-amber-500 text-white shadow-md border-transparent ring-2 ring-offset-2 ring-amber-500';
              inactiveClass = 'bg-amber-500 text-white border-transparent opacity-50 hover:opacity-80';
              badgeClass = 'bg-white text-amber-600 shadow-sm';
              break;
            case 'Denúncia':
              activeClass = 'bg-orange-600 text-white shadow-md border-transparent ring-2 ring-offset-2 ring-orange-600';
              inactiveClass = 'bg-orange-600 text-white border-transparent opacity-50 hover:opacity-80';
              badgeClass = 'bg-white text-orange-700 shadow-sm';
              break;
            default:
              activeClass = 'bg-indigo-600 text-white shadow-md border-transparent ring-2 ring-offset-2 ring-indigo-600';
              inactiveClass = 'bg-indigo-600 text-white border-transparent opacity-50 hover:opacity-80';
              badgeClass = 'bg-white text-indigo-700 shadow-sm';
          }

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                relative px-6 py-3 rounded-t-lg font-bold text-sm transition-all flex items-center gap-2 border-b-2
                ${activeTab === tab ? activeClass : inactiveClass}
              `}
            >
              {getTabLabel(tab)}
              {count > 0 && (
                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold animate-pulse ${badgeClass}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <Table
        columns={columns}
        data={filteredData}
        searchPlaceholder="Buscar por nome, código ou contato..."
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

export default FeedbacksPage;
