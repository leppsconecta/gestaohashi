
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Globe, 
  Instagram, 
  Facebook, 
  Youtube, 
  Music2, 
  Play, 
  Save, 
  Key, 
  Lock,
  Smartphone,
  Undo2,
  Info,
  LogOut,
  RefreshCw,
  Mail
} from 'lucide-react';
import { AppRoute } from '../types';
import Modal from '../components/UI/Modal';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [isDirty, setIsDirty] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  // Social State
  const [socialUsernames, setSocialUsernames] = useState({
    instagram: 'hashiexpress',
    facebook: 'hashi.express',
    tiktok: '',
    youtube: '',
    kwai: ''
  });

  // Notify Header about isDirty state
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('settings-status', { 
      detail: { isDirty } 
    }));
  }, [isDirty]);

  // Listen for save trigger from Header
  useEffect(() => {
    const handleGlobalSave = () => handleSave();
    window.addEventListener('trigger-settings-save', handleGlobalSave);
    return () => window.removeEventListener('trigger-settings-save', handleGlobalSave);
  }, [isDirty]);

  // Intercepting internal navigation
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if (!isDirty) return;

      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      
      if (anchor) {
        const href = anchor.getAttribute('href');
        if (href && (href.startsWith('#') || !href.includes('://'))) {
          if (href === window.location.hash) return;

          e.preventDefault();
          e.stopPropagation();
          setPendingPath(href);
          setShowExitModal(true);
        }
      }
    };

    window.addEventListener('click', handleGlobalClick, { capture: true });
    return () => window.removeEventListener('click', handleGlobalClick, { capture: true });
  }, [isDirty]);

  // Prevent accidental navigation (Browser level)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleUpdateSocial = (platform: keyof typeof socialUsernames, value: string) => {
    const cleaned = value.toLowerCase().trim().replace('@', '').split('/').pop() || '';
    setSocialUsernames(prev => ({ ...prev, [platform]: cleaned }));
    setIsDirty(true);
  };

  const handleSave = () => {
    setIsDirty(false);
    alert('Configurações salvas com sucesso!');
  };

  const handleNavigateAway = () => {
    setIsDirty(false);
    setShowExitModal(false);
    if (pendingPath) {
      if (pendingPath.startsWith('#')) {
        window.location.hash = pendingPath.replace('#', '');
      } else {
        navigate(pendingPath);
      }
    }
  };

  const handleGenerateAdminPassword = () => {
    alert("Uma nova senha foi enviada para o email e telefone cadastrados.");
  };

  // UI Standard Classes
  const inputClass = "w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 shadow-sm";
  const labelClass = "text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 block ml-1";
  const sectionCardClass = "bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-all";
  const sectionTitleClass = "text-xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-3 mb-6";

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 sm:space-y-8 pb-8 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
        <div className="space-y-1 text-center sm:text-left">
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Configurações de Perfil</h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Gerencie sua segurança e conexões digitais.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 sm:gap-8">
        
        {/* Main Column: Segurança */}
        <div className="xl:col-span-8">
          <section className={sectionCardClass}>
            <h2 className={sectionTitleClass}>
              <ShieldCheck className="text-indigo-600" size={24} /> 
              Acesso e Segurança
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Coluna 1: Alteração de Senha de Usuário */}
              <div className="space-y-6">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                  <Key size={16} className="text-indigo-600" /> Alterar Senha de Usuário
                </h3>
                <div className="space-y-4">
                  <input 
                    type="password" 
                    className={inputClass} 
                    placeholder="Senha atual" 
                    onChange={() => setIsDirty(true)} 
                  />
                  <input 
                    type="password" 
                    className={inputClass} 
                    placeholder="Nova senha" 
                    onChange={() => setIsDirty(true)} 
                  />
                  <input 
                    type="password" 
                    className={inputClass} 
                    placeholder="Confirmar nova senha" 
                    onChange={() => setIsDirty(true)} 
                  />
                </div>
              </div>

              {/* Coluna 2: Senha de Administrador */}
              <div className="space-y-6 md:border-l md:border-slate-100 md:dark:border-slate-800 md:pl-10">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                  <Lock size={16} className="text-red-500" /> Senha de Administrador
                </h3>
                <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-2xl mb-4 border border-red-100/50 dark:border-red-900/30">
                  <p className="text-[10px] text-red-600 dark:text-red-400 font-bold leading-tight">
                    Esta senha protege o acesso às páginas administrativas: 
                    Escala, Funcionários e Arquivos.
                  </p>
                </div>
                <div className="space-y-4">
                  <input 
                    type="password" 
                    className={inputClass} 
                    placeholder="Nova senha administrativa" 
                    onChange={() => setIsDirty(true)} 
                  />
                  
                  <button 
                    type="button"
                    onClick={handleGenerateAdminPassword}
                    className="w-full py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                  >
                    <RefreshCw size={14} /> Gerar nova senha por e-mail
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Side Column: Redes */}
        <div className="xl:col-span-4">
          <section className={sectionCardClass}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">Presença Digital</h2>
              <Globe className="text-slate-300" size={20} />
            </div>
            
            <div className="space-y-5">
              <div className="space-y-1">
                <label className={labelClass}>Instagram</label>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-rose-50 text-rose-500 border border-rose-100">
                    <Instagram size={18} />
                  </div>
                  <input 
                    type="text" 
                    className={inputClass} 
                    placeholder="usuário" 
                    value={socialUsernames.instagram}
                    onChange={(e) => handleUpdateSocial('instagram', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Facebook</label>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-blue-50 text-blue-600 border border-blue-100">
                    <Facebook size={18} />
                  </div>
                  <input 
                    type="text" 
                    className={inputClass} 
                    placeholder="página" 
                    value={socialUsernames.facebook}
                    onChange={(e) => handleUpdateSocial('facebook', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className={labelClass}>TikTok</label>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-slate-900 text-white">
                    <Music2 size={18} />
                  </div>
                  <input 
                    type="text" 
                    className={inputClass} 
                    placeholder="usuário" 
                    value={socialUsernames.tiktok}
                    onChange={(e) => handleUpdateSocial('tiktok', e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-2">
                <p className="text-[9px] font-medium text-slate-400 flex items-center gap-1.5 ml-1 leading-tight">
                  <Info size={10} /> Informe apenas o nome de usuário ou link da página.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal 
        isOpen={showExitModal}
        type="confirm-update"
        title="Deseja sair sem salvar?"
        maxWidth="max-w-md"
        content={
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              Você possui alterações pendentes que ainda não foram salvas. Deseja salvar agora ou descartar as mudanças?
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <button 
                onClick={handleNavigateAway}
                className="w-full py-3 px-4 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
              >
                <LogOut size={16} /> Descartar e Sair
              </button>
            </div>
          </div>
        }
        onConfirm={() => {
          handleSave();
          setTimeout(handleNavigateAway, 100);
        }}
        onClose={() => setShowExitModal(false)}
      />
    </div>
  );
};

export default SettingsPage;
