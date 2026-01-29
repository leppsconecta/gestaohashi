
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import DashboardPage from './pages/Dashboard';
import CurriculosPage from './pages/Curriculos';
import CurriculoDetail from './pages/CurriculoDetail';
import FeedbacksPage from './pages/Feedbacks';
import PromocionalPage from './pages/Promocional';
import CuponsPage from './pages/Cupons';
import ConsumacoesPage from './pages/Consumacoes';
import ReservasPage from './pages/Reservas';
import LoginsSenhasPage from './pages/LoginsSenhas';
import ArquivosPage from './pages/Arquivos';
import FuncionariosPage from './pages/Funcionarios';
import EscalaPage from './pages/Escala';
import CardapioPage from './pages/Cardapio';
import FichaTecnicaPage from './pages/FichaTecnica';
import MenuOnline from './pages/MenuOnline';
import PublicFormFuncionario from './pages/PublicFormFuncionario';
import LoginPage from './pages/Login';
import GestaoLinkPage from './pages/GestaoLink';
import { AppRoute } from './types';
import { DBService } from './lib/db';

const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unlocked, setUnlocked] = useState(() => DBService.auth.isAdminUnlocked());
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await DBService.auth.unlockAdmin(password);
    setLoading(false);

    if (success) {
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
      setPassword('');
      setTimeout(() => setError(false), 2000);
    }
  };

  useEffect(() => {
    const handleLock = () => setUnlocked(false);
    window.addEventListener('hashi-admin-lock', handleLock);
    return () => window.removeEventListener('hashi-admin-lock', handleLock);
  }, []);

  if (unlocked) {
    return <>{children}</>;
  }

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-500">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 text-center space-y-6">
        <div className="relative mx-auto w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center text-red-600 mb-2 shadow-sm">
          <Lock size={28} strokeWidth={2.5} />
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight uppercase">Área Restrita</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Digite a senha para acessar as configurações.</p>

        </div>

        <form onSubmit={handleUnlock} className="space-y-4">
          <div className="relative">
            <input
              autoFocus
              type="password"
              placeholder="Digite a senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className={`w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border rounded-2xl outline-none transition-all text-center text-xl font-black tracking-[0.4em] focus:ring-4 placeholder:text-slate-300 placeholder:tracking-normal placeholder:font-bold ${error
                ? 'border-red-500 ring-red-500/10 animate-shake text-red-500'
                : 'border-slate-200 dark:border-slate-800 focus:ring-red-500/10 focus:border-red-500 text-slate-800 dark:text-white'
                }`}
            />
            {error && (
              <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-2 animate-in fade-in slide-in-from-top-1">
                Senha incorreta
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-red-100 dark:shadow-none"
          >
            {loading ? 'Verificando...' : <>Acessar Página <ArrowRight size={16} strokeWidth={3} /></>}
          </button>
        </form>
      </div>
    </div>
  );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const location = useLocation();

  const isLoginPath = location.pathname === AppRoute.LOGIN || location.pathname === '/';
  const isPublicFormPath = location.pathname.startsWith('/public/') || location.pathname === AppRoute.PUBLIC_FORM_FUNCIONARIO;
  const isPublicRoute = isLoginPath || isPublicFormPath;

  useEffect(() => {
    const root = window.document.documentElement;
    if (isPublicRoute) {
      root.classList.remove('dark');
    } else {
      const savedTheme = localStorage.getItem('lepps_theme');
      if (savedTheme !== 'light') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [isPublicRoute, location.pathname]);

  if (isPublicRoute) return <>{children}</>;

  if (!DBService.auth.isAuthenticated()) {
    return <Navigate to={AppRoute.LOGIN} replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      <Sidebar
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
        isPinned={isPinned}
        onPinToggle={setIsPinned}
      />

      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 pb-20 lg:pb-0 ${isPinned ? 'lg:pl-64' : 'lg:pl-20'}`}>
        <Header onMobileMenuOpen={() => setIsMobileOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 md:p-8 animate-in fade-in duration-500 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path={AppRoute.LOGIN} element={<LoginPage />} />
          <Route path={AppRoute.DASHBOARD} element={<DashboardPage />} />
          <Route path={AppRoute.RESERVAS} element={<ReservasPage />} />
          <Route path={AppRoute.CURRICULOS} element={<CurriculosPage />} />
          <Route path={AppRoute.CURRICULO_DETAIL} element={<CurriculoDetail />} />
          <Route path={AppRoute.FEEDBACKS} element={<AdminGuard><FeedbacksPage /></AdminGuard>} />
          <Route path={AppRoute.PROMOCIONAL} element={<PromocionalPage />} />
          <Route path={AppRoute.CUPONS} element={<CuponsPage />} />
          <Route path={AppRoute.CONSUMACOES} element={<ConsumacoesPage />} />
          <Route path={AppRoute.LOGINS_SENHAS} element={<AdminGuard><LoginsSenhasPage /></AdminGuard>} />
          <Route path={AppRoute.ARQUIVOS} element={<AdminGuard><ArquivosPage /></AdminGuard>} />
          <Route path={AppRoute.FUNCIONARIOS} element={<AdminGuard><FuncionariosPage /></AdminGuard>} />
          <Route path={AppRoute.ESCALA} element={<AdminGuard><EscalaPage /></AdminGuard>} />
          <Route path={AppRoute.CARDAPIO} element={<AdminGuard><CardapioPage /></AdminGuard>} />
          <Route path={AppRoute.FICHA_TECNICA} element={<AdminGuard><FichaTecnicaPage /></AdminGuard>} />
          <Route path={AppRoute.LINK_MANAGEMENT} element={<GestaoLinkPage />} />
          <Route path={AppRoute.PUBLIC_FORM_FUNCIONARIO} element={<PublicFormFuncionario />} />
          <Route path={AppRoute.MENU_ONLINE} element={<MenuOnline />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
