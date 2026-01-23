

import React, { useState } from 'react';
import { Plus, Search, Tag, Edit3, Trash2, Eye, Copy, ExternalLink, Ticket, RefreshCw } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ModalType, Cupom } from '../types';
import Modal from '../components/UI/Modal';
import { DBService } from '../lib/db';

const CupomForm: React.FC<{ initialData?: Cupom; onSubmit: (data: Omit<Cupom, 'id' | 'created_at'>) => void }> = ({ initialData, onSubmit }) => {
  const [titulo, setTitulo] = useState(initialData?.titulo || '');
  const [descricao, setDescricao] = useState(initialData?.descricao || '');
  const [link, setLink] = useState(initialData?.link || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      titulo,
      descricao,
      link,
      ativa: initialData?.ativa ?? true
    });
  };

  const inputClass = "w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all text-slate-800 dark:text-slate-200";

  return (
    <form id="cupom-form" onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Título do Cupom</label>
        <input
          type="text"
          required
          className={inputClass}
          placeholder="Ex: Cupom de Desconto"
          value={titulo}
          onChange={e => setTitulo(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Descrição</label>
        <textarea
          required
          className={`${inputClass} h-24 resize-none`}
          placeholder="Regras do cupom..."
          value={descricao}
          onChange={e => setDescricao(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Link/Código do Cupom</label>
        <input
          type="text"
          required
          className={inputClass}
          placeholder="https://..."
          value={link}
          onChange={e => setLink(e.target.value)}
        />
      </div>
    </form>
  );
};

const CuponsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; type: ModalType; title: string; content: React.ReactNode; onConfirm?: () => void }>({
    isOpen: false,
    type: 'view-content',
    title: '',
    content: ''
  });

  const { data: cupons = [], isLoading } = useQuery({
    queryKey: ['cupons'],
    queryFn: DBService.cupons.getAll,
  });

  const createMutation = useMutation({
    mutationFn: DBService.cupons.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cupons'] });
      setModalConfig(prev => ({ ...prev, isOpen: false }));
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Cupom> }) => DBService.cupons.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cupons'] });
      setModalConfig(prev => ({ ...prev, isOpen: false }));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: DBService.cupons.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cupons'] });
      setModalConfig(prev => ({ ...prev, isOpen: false }));
    }
  });

  const toggleCupomActive = (id: string, currentStatus: boolean) => {
    updateMutation.mutate({ id, data: { ativa: !currentStatus } });
  };

  const handleCopy = (link: string) => {
    navigator.clipboard.writeText(link);
  };

  const handleNovoCupom = () => {
    setModalConfig({
      isOpen: true,
      type: 'confirm-insert',
      title: 'Novo Cupom',
      content: <CupomForm onSubmit={(data) => createMutation.mutate(data)} />,
      onConfirm: () => {
        // Trigger generic submit button if needed, or handle inside form
        // For simplicity, we can rely on the form submit or make the modal 'Confirm' button trigger form submission.
        // But since our Modal component structure might expect checking 'confirm' click:
        const form = document.getElementById('cupom-form') as HTMLFormElement;
        if (form) form.requestSubmit();
      }
    });
  };

  const handleAction = (type: 'view' | 'edit' | 'delete', cupom: Cupom) => {
    if (type === 'delete') {
      setModalConfig({
        isOpen: true,
        type: 'confirm-delete',
        title: 'Excluir Cupom',
        content: `Deseja realmente excluir o cupom "${cupom.titulo}"?`,
        onConfirm: () => deleteMutation.mutate(cupom.id)
      });
    } else if (type === 'edit') {
      setModalConfig({
        isOpen: true,
        type: 'confirm-update',
        title: 'Editar Cupom',
        content: <CupomForm initialData={cupom} onSubmit={(data) => updateMutation.mutate({ id: cupom.id, data })} />,
        onConfirm: () => {
          const form = document.getElementById('cupom-form') as HTMLFormElement;
          if (form) form.requestSubmit();
        }
      });
    } else {
      setModalConfig({
        isOpen: true,
        type: 'view-content',
        title: 'Detalhes do Cupom',
        content: (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">Título</label>
              <p className="text-slate-800 dark:text-white font-semibold">{cupom.titulo}</p>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">Link</label>
              <p className="text-sm text-indigo-600 dark:text-indigo-400 break-all">{cupom.link}</p>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">Descrição</label>
              <p className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800 italic">{cupom.descricao}</p>
            </div>
          </div>
        )
      });
    }
  };

  const filteredCupons = cupons.filter(c =>
    c.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <RefreshCw size={40} className="text-red-600 animate-spin opacity-50" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Cupons</h1>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Gerencie cupons de desconto e ações de fidelização.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar cupom..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500/10 transition-all text-slate-800 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={handleNovoCupom}
          className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-100 dark:shadow-none transition-all active:scale-95"
        >
          <Plus size={20} strokeWidth={3} />
          Novo Cupom
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCupons.map((cupom, idx) => {
          return (
            <div
              key={cupom.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md h-full"
            >
              <div className={`h-1.5 w-full ${cupom.ativa ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`} />

              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-md border ${cupom.ativa
                        ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/30'
                        : 'text-slate-400 bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700'
                        }`}>
                        {idx + 1}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Ticket size={14} className={cupom.ativa ? 'text-emerald-500' : 'text-slate-400'} />
                        <h4 className="font-bold text-slate-800 dark:text-white leading-tight">
                          {cupom.titulo}
                        </h4>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleCupomActive(cupom.id, cupom.ativa)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${cupom.ativa ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${cupom.ativa ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="pt-3 border-t border-slate-50 dark:border-slate-800 mt-2 space-y-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic h-20 overflow-y-auto pr-1 custom-scrollbar">
                    {cupom.descricao}
                  </p>

                  <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl group/link">
                    <div className="p-2 text-slate-400">
                      <ExternalLink size={16} />
                    </div>
                    <input
                      readOnly
                      value={cupom.link}
                      className="flex-1 bg-transparent text-[11px] text-slate-500 dark:text-slate-400 outline-none truncate font-medium"
                    />
                    <button
                      onClick={() => handleCopy(cupom.link)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
                      title="Copiar Link"
                    >
                      <Copy size={16} />
                    </button>
                  </div>

                  <div className="pt-3 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${cupom.ativa ? 'text-emerald-500' : 'text-slate-300'}`}>
                      {cupom.ativa ? 'ATIVO' : 'INATIVO'}
                    </span>

                    <div className="flex items-center gap-1">
                      <button onClick={() => handleAction('view', cupom)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all" title="Visualizar"><Eye size={16} /></button>
                      <button onClick={() => handleAction('edit', cupom)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all" title="Editar"><Edit3 size={16} /></button>
                      <button onClick={() => handleAction('delete', cupom)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all" title="Excluir"><Trash2 size={16} /></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

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

export default CuponsPage;
