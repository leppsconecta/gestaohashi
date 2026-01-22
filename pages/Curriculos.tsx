import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Trash2, StickyNote, RefreshCw } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Table from '../components/UI/Table';
import Modal from '../components/UI/Modal';
import { Curriculo, ModalType } from '../types';
import { supabase } from '../lib/supabase';

const CurriculosPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; type: ModalType; title: string; content: React.ReactNode; onConfirm?: () => void }>({
    isOpen: false,
    type: 'view-content',
    title: '',
    content: ''
  });

  const { data: data = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['curriculos'],
    queryFn: async () => {
      const { data: curriculos, error } = await supabase
        .from('view_curriculos_gestao')
        .select('*')
        .order('data', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (curriculos) {
        return curriculos.map(item => ({
          ...item,
          data: new Date(item.data).toLocaleDateString('pt-BR')
        }));
      }
      return [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5,
  });

  const handleDeleteClick = (e: React.MouseEvent, item: Curriculo) => {
    e.stopPropagation();
    setModalConfig({
      isOpen: true,
      type: 'confirm-delete',
      title: 'Confirmar exclusão',
      content: `Tem certeza que deseja excluir o currículo de ${item.nome}? Esta ação não pode ser desfeita.`,
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from('view_curriculos_gestao')
            .delete()
            .eq('id', item.id);

          if (error) throw error;

          queryClient.invalidateQueries({ queryKey: ['curriculos'] });
        } catch (error) {
          console.error('Erro ao excluir:', error);
          alert('Erro ao excluir registro.');
        }
      }
    });
  };

  const handleObsClick = (e: React.MouseEvent, item: Curriculo) => {
    e.stopPropagation();
    setModalConfig({
      isOpen: true,
      type: 'view-content',
      title: 'Visualização do currículo',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 tracking-widest uppercase font-bold">Nome</p>
              <p className="font-bold text-slate-900 dark:text-white">{item.nome}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 tracking-widest uppercase font-bold">Função</p>
              <p className="text-slate-900 dark:text-white">{item.funcao}</p>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 tracking-widest uppercase font-bold">Observação</p>
            <p className="text-slate-800 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800 italic font-medium">
              {item.observacao || 'Nenhuma observação cadastrada.'}
            </p>
          </div>
        </div>
      ),
    });
  };

  const handleViewClick = (e: React.MouseEvent, item: Curriculo) => {
    e.stopPropagation();
    if (item.arquivo_url) {
      window.open(item.arquivo_url, '_blank');
    } else {
      setModalConfig({
        isOpen: true,
        type: 'view-content',
        title: 'Detalhes do Candidato',
        content: (
          <div className="space-y-6">
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800 text-center">
              <p className="text-amber-800 dark:text-amber-300 font-bold text-sm">Este candidato não possui currículo anexado.</p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-xs text-slate-500 uppercase font-black">Nome</label>
                <p className="font-bold text-lg text-slate-900 dark:text-white">{item.nome}</p>
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase font-black">Função</label>
                <p className="font-medium text-slate-700 dark:text-slate-300">{item.funcao}</p>
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase font-black">Contato</label>
                <p className="font-medium text-slate-700 dark:text-slate-300">{item.contato}</p>
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase font-black">Cidade/Bairro</label>
                <p className="font-medium text-slate-700 dark:text-slate-300">{item.cidade} - {item.bairro}</p>
              </div>
            </div>
          </div>
        )
      });
    }
  };

  const columns = [
    { header: '#', accessor: (_: any, index: number) => <span className="text-slate-500">{index + 1}</span>, className: 'w-12' },
    { header: 'Data', accessor: 'data', className: 'w-28 text-slate-500 font-medium' },
    { header: 'Nome', accessor: (item: Curriculo) => <span className="font-bold text-slate-900 dark:text-white tracking-tight">{item.nome}</span>, className: 'w-40' },
    { header: 'Função', accessor: 'funcao', className: 'w-32 text-slate-700 dark:text-slate-300' },
    { header: 'Contato', accessor: 'contato', className: 'w-36 text-slate-700 font-medium' },
    { header: 'Idade', accessor: 'idade', className: 'w-16 text-center text-slate-600' },
    { header: 'Sexo', accessor: 'sexo', className: 'w-16 text-center text-slate-600' },
    { header: 'Cidade', accessor: 'cidade', className: 'w-28 text-slate-500' },
    { header: 'Bairro', accessor: 'bairro', className: 'w-28 text-slate-500' },
    {
      header: 'Obs',
      accessor: (item: Curriculo) => (
        <button
          onClick={(e) => handleObsClick(e, item)}
          className={`p-2 rounded-lg transition-colors ${item.observacao ? 'text-red-700 bg-red-50 dark:bg-red-900/30' : 'text-slate-300 cursor-not-allowed'}`}
          disabled={!item.observacao}
        >
          <StickyNote size={18} />
        </button>
      ),
      className: 'w-16 text-center'
    },
    {
      header: 'Ações',
      accessor: (item: Curriculo) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => handleViewClick(e, item)}
            className="p-2 text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
            title="Visualizar currículo"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={(e) => handleDeleteClick(e, item)}
            className="p-2 text-slate-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-lg transition-all"
            title="Excluir"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
      className: 'w-28'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Currículos</h1>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Gerencie as candidaturas e currículos recebidos pelo sistema.</p>
          </div>
          <button onClick={() => refetch()} disabled={loading} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all" title="Atualizar">
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <Table
        columns={columns}
        data={data}
        searchPlaceholder="Buscar por nome, função ou contato..."
      />

      <Modal
        isOpen={modalConfig.isOpen}
        type={modalConfig.type}
        title={modalConfig.title}
        content={modalConfig.content}
        onConfirm={modalConfig.onConfirm}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default CurriculosPage;
