import React, { useState } from 'react';
import { Plus, Copy, Edit3, Trash2, StickyNote, Globe, User, Key, FileText, ExternalLink, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import Table from '../components/UI/Table';
import Modal from '../components/UI/Modal';
import { LoginSenha, ModalType } from '../types';


const PasswordCell: React.FC<{ senha: string }> = ({ senha }) => {
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(senha);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(!isVisible);
  };

  return (
    <div className="flex items-center gap-2 min-w-[160px]">
      <span className="font-mono text-xs text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 font-medium shadow-inner flex-1 truncate">
        {isVisible ? senha : '••••••••'}
      </span>
      <div className="flex items-center gap-1">
        <button onClick={toggleVisibility} className="p-2 text-slate-500 hover:text-indigo-700 transition-colors" title={isVisible ? "Ocultar" : "Visualizar"}>
          {isVisible ? <EyeOff size={16} strokeWidth={2} /> : <Eye size={16} strokeWidth={2} />}
        </button>
        <button onClick={handleCopy} className={`p-2 transition-colors ${copied ? 'text-emerald-600' : 'text-slate-500 hover:text-indigo-700'}`} title="Copiar">
          <Copy size={16} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
};

const LoginSenhaForm: React.FC<{ initialData?: LoginSenha; onSubmit: (data: Partial<LoginSenha>) => void }> = ({ initialData, onSubmit }) => {
  const [formData, setFormData] = useState<Partial<LoginSenha>>(initialData || {
    site: '',
    login: '',
    senha: '',
    observacao: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const inputClass = "w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400 font-medium shadow-sm";
  const labelClass = "text-[11px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-[0.2em] mb-1.5 block ml-1";
  const iconClass = "absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-600 transition-colors pointer-events-none";

  return (
    <form id="login-senha-form" onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <label className={labelClass}>Site / URL</label>
        <div className="relative group">
          <Globe className={iconClass} size={18} />
          <input type="url" name="site" className={inputClass} placeholder="https://exemplo.com" required value={formData.site} onChange={handleChange} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1">
          <label className={labelClass}>Login / Usuário</label>
          <div className="relative group">
            <User className={iconClass} size={18} />
            <input type="text" name="login" className={inputClass} placeholder="usuário ou email" required value={formData.login} onChange={handleChange} />
          </div>
        </div>
        <div className="space-y-1">
          <label className={labelClass}>Senha</label>
          <div className="relative group">
            <Key className={iconClass} size={18} />
            <input type="text" name="senha" className={inputClass} placeholder="sua senha" required value={formData.senha} onChange={handleChange} />
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <label className={labelClass}>Observação</label>
        <div className="relative group">
          <FileText className="absolute left-4 top-4 text-slate-500 group-focus-within:text-indigo-600 transition-colors pointer-events-none" size={18} />
          <textarea name="observacao" className={`${inputClass} h-32 resize-none pt-4 font-medium`} placeholder="Algum detalhe importante sobre este acesso?" value={formData.observacao} onChange={handleChange} />
        </div>
      </div>
    </form>
  );
};

const LoginsSenhasPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; type: ModalType; title: string; content: React.ReactNode; onConfirm?: () => void; maxWidth?: string }>({
    isOpen: false,
    type: 'view-content',
    title: '',
    content: '',
    maxWidth: 'max-w-lg'
  });

  const { data: data = [], isLoading, refetch } = useQuery({
    queryKey: ['logins_senhas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema('gestaohashi')
        .from('logins_senhas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(item => ({
        ...item,
        data: new Date(item.created_at).toLocaleDateString('pt-BR')
      }));
    }
  });

  const mutation = useMutation({
    mutationFn: async ({ action, formData, id }: { action: 'insert' | 'update' | 'delete', formData?: Partial<LoginSenha>, id?: string }) => {
      if (action === 'insert') {
        const { error } = await supabase.schema('gestaohashi').from('logins_senhas').insert(formData);
        if (error) throw error;
      } else if (action === 'update') {
        const { error } = await supabase.schema('gestaohashi').from('logins_senhas').update(formData).eq('id', id);
        if (error) throw error;
      } else if (action === 'delete') {
        const { error } = await supabase.schema('gestaohashi').from('logins_senhas').delete().eq('id', id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logins_senhas'] });
      setModalConfig(prev => ({ ...prev, isOpen: false }));
    },
    onError: (error) => {
      console.error('Erro na operação:', error);
      alert('Ocorreu um erro ao processar a solicitação.');
    }
  });

  const handleAction = (type: 'view' | 'edit' | 'delete', item: LoginSenha) => {
    if (type === 'delete') {
      setModalConfig({
        isOpen: true,
        type: 'confirm-delete',
        title: 'Excluir Credencial',
        maxWidth: 'max-w-lg',
        content: `Deseja realmente excluir o acesso do site ${item.site}?`,
        onConfirm: () => mutation.mutate({ action: 'delete', id: item.id })
      });
    } else if (type === 'edit') {
      setModalConfig({
        isOpen: true,
        type: 'confirm-update',
        title: 'Editar Credencial',
        maxWidth: 'max-w-3xl',
        content: <LoginSenhaForm initialData={item} onSubmit={(formData) => mutation.mutate({ action: 'update', id: item.id, formData })} />,
        onConfirm: () => {
          const form = document.getElementById('login-senha-form') as HTMLFormElement;
          form?.requestSubmit();
        }
      });
    } else {
      setModalConfig({
        isOpen: true,
        type: 'view-content',
        title: 'Detalhes da Credencial',
        maxWidth: 'max-w-2xl',
        content: (
          <div className="space-y-6">
            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Site</label>
              <div className="flex items-center gap-3">
                <p className="font-bold text-xl text-indigo-700 dark:text-indigo-400 truncate">{item.site}</p>
                <a href={item.site} target="_blank" rel="noopener noreferrer" className="p-2 bg-indigo-50 dark:bg-indigo-900/40 rounded-xl text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 shadow-sm transition-all"><ExternalLink size={18} strokeWidth={2.5} /></a>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Login</label>
                <p className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">{item.login}</p>
              </div>
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Senha</label>
                <PasswordCell senha={item.senha} />
              </div>
            </div>
            <div className="pt-5 border-t border-slate-200 dark:border-slate-700">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Observação</label>
              <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 italic text-sm text-slate-900 dark:text-slate-300 font-medium leading-relaxed shadow-inner">{item.observacao || "Nenhuma observação informada."}</div>
            </div>
          </div>
        )
      });
    }
  };

  const columns = [
    { header: '#', accessor: (_: any, index: number) => <span className="font-bold text-slate-500 text-xs">{index + 1}</span>, className: 'w-12 text-center' },
    { header: 'Data', accessor: 'data', className: 'w-28 text-slate-500 font-medium text-xs' },
    { header: 'Site', accessor: (item: LoginSenha) => (<div className="flex items-center gap-2 group/link"><a href={item.site} target="_blank" rel="noopener noreferrer" className="font-bold text-indigo-700 dark:text-indigo-400 hover:underline truncate max-w-[180px] text-sm" title={item.site}>{item.site.replace(/^https?:\/\//, '')}</a><ExternalLink size={12} strokeWidth={2} className="text-indigo-400 opacity-0 group-hover/link:opacity-100 transition-opacity" /></div>), className: 'w-48' },
    { header: 'Login', accessor: 'login', className: 'w-40 font-bold text-slate-900 dark:text-white text-sm' },
    { header: 'Senha', accessor: (item: LoginSenha) => <PasswordCell senha={item.senha} />, className: 'w-48' },
    { header: 'Obs', accessor: (item: LoginSenha) => (<button onClick={() => handleAction('view', item)} className={`p-2 rounded-xl transition-all ${item.observacao ? 'text-indigo-700 bg-indigo-50 dark:bg-indigo-900/40 shadow-sm' : 'text-slate-300 cursor-not-allowed'}`} disabled={!item.observacao}><StickyNote size={18} strokeWidth={2} /></button>), className: 'w-16 text-center' },
    { header: 'Ações', accessor: (item: LoginSenha) => (<div className="flex items-center gap-1"><button onClick={() => handleAction('edit', item)} className="p-2 text-slate-500 hover:text-indigo-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all" title="Editar"><Edit3 size={18} strokeWidth={2} /></button><button onClick={() => handleAction('delete', item)} className="p-2 text-slate-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-lg transition-all" title="Excluir"><Trash2 size={18} strokeWidth={2} /></button></div>), className: 'w-24' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Logins e Senhas</h1>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Repositório seguro de credenciais e acessos externos.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setModalConfig({
            isOpen: true,
            type: 'confirm-insert',
            title: 'Nova Credencial',
            maxWidth: 'max-w-3xl',
            content: <LoginSenhaForm onSubmit={(formData) => mutation.mutate({ action: 'insert', formData })} />,
            onConfirm: () => {
              const form = document.getElementById('login-senha-form') as HTMLFormElement;
              form?.requestSubmit();
            }
          })} className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold px-6 py-3 rounded-2xl flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-200 dark:shadow-none tracking-widest text-xs uppercase"><Plus size={20} strokeWidth={3} /> Cadastrar</button>
          <button onClick={() => refetch()} disabled={isLoading} className="p-3 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all" title="Atualizar">
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <Table columns={columns} data={data} searchPlaceholder="Buscar por site, login ou observação..." />

      <Modal isOpen={modalConfig.isOpen} type={modalConfig.type} title={modalConfig.title} content={modalConfig.content} maxWidth={modalConfig.maxWidth} onConfirm={modalConfig.onConfirm} onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))} />
    </div>
  );
};

export default LoginsSenhasPage;
