
import React, { useState } from 'react';
import { Plus, Copy, Edit3, Trash2, StickyNote, Globe, User, Key, FileText, ExternalLink } from 'lucide-react';
import Table from '../components/UI/Table';
import Modal from '../components/UI/Modal';
import { LoginSenha, ModalType } from '../types';

const MOCK_LOGINS: LoginSenha[] = [
  {
    id: 'ls-1',
    data: '15/05/2024',
    site: 'https://painel.anota.ai',
    login: 'hashiexpress_admin',
    senha: 'SenhaForte#2024',
    observacao: 'Painel principal de pedidos e cardápio digital.'
  },
  {
    id: 'ls-2',
    data: '10/05/2024',
    site: 'https://business.google.com',
    login: 'contato@hashiexpress.com',
    senha: 'GoogleAuth!99',
    observacao: 'Acesso ao Perfil da Empresa no Google Maps.'
  },
  {
    id: 'ls-3',
    data: '02/05/2024',
    site: 'https://instagram.com',
    login: 'hashi.express.oficial',
    senha: 'InstaHashi*22',
    observacao: 'Conta oficial para marketing e postagens.'
  }
];

const PasswordCell: React.FC<{ senha: string }> = ({ senha }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(senha);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 min-w-[140px]">
      <span className="font-mono text-xs text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 font-medium shadow-inner">
        {senha}
      </span>
      <button onClick={handleCopy} className={`p-2 transition-colors ml-auto ${copied ? 'text-emerald-600' : 'text-slate-500 hover:text-indigo-700'}`} title="Copiar"><Copy size={16} strokeWidth={2} /></button>
    </div>
  );
};

const LoginSenhaForm: React.FC<{ initialData?: LoginSenha }> = ({ initialData }) => {
  const inputClass = "w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white placeholder:text-slate-400 font-medium shadow-sm";
  const labelClass = "text-[11px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-[0.2em] mb-1.5 block ml-1";
  const iconClass = "absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-600 transition-colors pointer-events-none";

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <label className={labelClass}>Site / URL</label>
        <div className="relative group">
          <Globe className={iconClass} size={18} />
          <input type="url" className={inputClass} placeholder="https://exemplo.com" defaultValue={initialData?.site} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1">
          <label className={labelClass}>Login / Usuário</label>
          <div className="relative group">
            <User className={iconClass} size={18} />
            <input type="text" className={inputClass} placeholder="usuário ou email" defaultValue={initialData?.login} />
          </div>
        </div>
        <div className="space-y-1">
          <label className={labelClass}>Senha</label>
          <div className="relative group">
            <Key className={iconClass} size={18} />
            <input type="text" className={inputClass} placeholder="sua senha" defaultValue={initialData?.senha} />
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <label className={labelClass}>Observação</label>
        <div className="relative group">
          <FileText className="absolute left-4 top-4 text-slate-500 group-focus-within:text-indigo-600 transition-colors pointer-events-none" size={18} />
          <textarea className={`${inputClass} h-32 resize-none pt-4 font-medium`} placeholder="Algum detalhe importante sobre este acesso?" defaultValue={initialData?.observacao} />
        </div>
      </div>
    </div>
  );
};

const LoginsSenhasPage: React.FC = () => {
  const [data, setData] = useState<LoginSenha[]>(MOCK_LOGINS);
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; type: ModalType; title: string; content: React.ReactNode; onConfirm?: () => void; maxWidth?: string }>({
    isOpen: false,
    type: 'view-content',
    title: '',
    content: '',
    maxWidth: 'max-w-lg'
  });

  const handleAction = (type: 'view' | 'edit' | 'delete', item: LoginSenha) => {
    if (type === 'delete') {
      setModalConfig({ isOpen: true, type: 'confirm-delete', title: 'Excluir Credencial', maxWidth: 'max-w-lg', content: `Deseja realmente excluir o acesso do site ${item.site}?`, onConfirm: () => setData(prev => prev.filter(l => l.id !== item.id)) });
    } else if (type === 'edit') {
      setModalConfig({ isOpen: true, type: 'confirm-update', title: 'Editar Credencial', maxWidth: 'max-w-3xl', content: <LoginSenhaForm initialData={item} />, onConfirm: () => console.log('Login atualizado') });
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
    { header: '#', accessor: (_: any, index: number) => <span className="font-bold text-slate-500">{index}</span>, className: 'w-12 text-center' },
    { header: 'Data', accessor: 'data', className: 'w-28 font-bold text-slate-700' },
    { header: 'Site', accessor: (item: LoginSenha) => (<div className="flex items-center gap-2 group/link"><a href={item.site} target="_blank" rel="noopener noreferrer" className="font-medium text-indigo-700 dark:text-indigo-400 hover:underline truncate max-w-[180px] text-sm" title={item.site}>{item.site.replace(/^https?:\/\//, '')}</a><ExternalLink size={12} strokeWidth={2} className="text-indigo-400 opacity-0 group-hover/link:opacity-100 transition-opacity" /></div>), className: 'w-48' },
    { header: 'Login', accessor: 'login', className: 'w-40 font-medium text-slate-900 dark:text-white text-sm' },
    { header: 'Senha', accessor: (item: LoginSenha) => <PasswordCell senha={item.senha} />, className: 'w-48' },
    { header: 'Obs', accessor: (item: LoginSenha) => (<button onClick={() => handleAction('view', item)} className={`p-2.5 rounded-xl transition-all ${item.observacao ? 'text-indigo-700 bg-indigo-50 dark:bg-indigo-900/40 shadow-sm border border-indigo-100 dark:border-indigo-800' : 'text-slate-300 cursor-not-allowed'}`} disabled={!item.observacao}><StickyNote size={18} strokeWidth={2} /></button>), className: 'w-16 text-center' },
    { header: 'Ações', accessor: (item: LoginSenha) => (<div className="flex items-center gap-1"><button onClick={() => handleAction('view', item)} className="p-1.5 text-slate-500 hover:text-indigo-700 rounded-lg transition-all" title="Visualizar"><Edit3 size={20} strokeWidth={2} /></button><button onClick={() => handleAction('edit', item)} className="p-1.5 text-slate-500 hover:text-blue-700 rounded-lg transition-all" title="Editar"><Edit3 size={20} strokeWidth={2} /></button><button onClick={() => handleAction('delete', item)} className="p-1.5 text-slate-500 hover:text-red-700 rounded-lg transition-all" title="Excluir"><Trash2 size={20} strokeWidth={2} /></button></div>), className: 'w-28' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Logins e Senhas</h1>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Repositório seguro de credenciais e acessos externos.</p>
        </div>
        <button onClick={() => setModalConfig({ isOpen: true, type: 'confirm-insert', title: 'Nova Credencial', maxWidth: 'max-w-3xl', content: <LoginSenhaForm />, onConfirm: () => console.log('Credencial salva') })} className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold px-6 py-3 rounded-2xl flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-200 dark:shadow-none tracking-widest text-xs uppercase"><Plus size={20} strokeWidth={3} /> Cadastrar</button>
      </div>

      <Table columns={columns} data={data} searchPlaceholder="Buscar por site, login ou observação..." />

      <Modal isOpen={modalConfig.isOpen} type={modalConfig.type} title={modalConfig.title} content={modalConfig.content} maxWidth={modalConfig.maxWidth} onConfirm={modalConfig.onConfirm} onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))} />
    </div>
  );
};

export default LoginsSenhasPage;
