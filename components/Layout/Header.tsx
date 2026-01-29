
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sun, Moon, Menu, LogOut, Lock } from 'lucide-react';
import { AppRoute } from '../../types';

interface HeaderProps {
  onMobileMenuOpen: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMobileMenuOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const theme = localStorage.getItem('lepps_theme');
    return theme !== 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('lepps_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('lepps_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleLogout = () => {
    localStorage.removeItem('lepps_auth');
    localStorage.removeItem('hashi_admin_unlocked');
    navigate(AppRoute.LOGIN);
  };

  const handleLockAdmin = () => {
    // Revoga a permissão administrativa no armazenamento local
    localStorage.removeItem('hashi_admin_unlocked');

    // Redireciona o usuário para o Painel (Dashboard)
    // Isso garante que ele saia de qualquer página de administração imediatamente
    // e o AdminGuard solicitará a senha no próximo acesso.
    navigate(AppRoute.DASHBOARD);
  };

  return (
    <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 px-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={onMobileMenuOpen}
          className="hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
        >
          <Menu size={24} />
        </button>

        <div className="hidden sm:block">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-tight">
            Seja bem vindo ao <span className="text-red-600 dark:text-red-400">Hashi Express Jundiaí</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">


        <button
          onClick={handleLockAdmin}
          className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 border border-slate-200 dark:border-slate-700 shadow-sm"
          title="Bloquear acesso à administração"
        >
          <Lock size={14} strokeWidth={2.5} />
          Bloquear Tela
        </button>

        <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-700 pl-4">
          <button
            onClick={toggleDarkMode}
            className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
