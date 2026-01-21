
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogIn,
  ShieldCheck,
  Mail,
  Lock,
  ArrowLeft,
  Building2,
  Phone,
  CheckCircle2,
  ChevronRight,
  UserPlus,
  RefreshCw,
  Send
} from 'lucide-react';
import { AppRoute } from '../types';
import { DBService } from '../lib/db';

type AuthView = 'login' | 'register' | 'recovery' | 'recovery-success' | 'register-success';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<AuthView>('login');
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const success = await DBService.auth.login(email, password);

      if (success) {
        navigate(AppRoute.DASHBOARD);
      } else {
        setError('Credenciais inválidas.');
        setLoading(false);
      }
    } catch (err) {
      setError('Erro ao realizar login.');
      setLoading(false);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setView('register-success');
    }, 1500);
  };

  const handleRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setView('recovery-success');
    }, 1500);
  };

  const inputClass = "w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all text-slate-900 dark:text-white font-semibold placeholder:text-slate-400 placeholder:font-normal";
  const labelClass = "text-sm font-semibold text-slate-600 dark:text-slate-400 ml-1 mb-1.5 block";

  const renderView = () => {
    switch (view) {
      case 'login':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Bem-vindo de volta</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Acesse o painel administrativo | Hashi Express Jundiaí</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className={labelClass}>E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} placeholder="seu@email.com" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className={labelClass}>Senha</label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputClass} placeholder="••••••••" />
                </div>
              </div>

              {error && <p className="text-xs text-red-500 font-bold text-center animate-bounce">{error}</p>}

              <button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-70 text-white font-bold py-4 rounded-2xl shadow-xl shadow-red-100 dark:shadow-none transition-all flex items-center justify-center gap-2 text-sm active:scale-[0.98]">
                {loading ? <RefreshCw className="animate-spin" size={20} /> : <><LogIn size={18} /> Entrar agora</>}
              </button>
            </form>
          </div>
        );

      case 'register':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Criar conta</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Cadastre sua empresa e comece em minutos</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1">
                <label className={labelClass}>Nome da Empresa</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} required className={inputClass} placeholder="Ex: Restaurante Lepps" />
                </div>
              </div>
              <div className="space-y-1">
                <label className={labelClass}>E-mail corporativo</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className={inputClass} placeholder="contato@empresa.com.br" />
                </div>
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Telefone / WhatsApp</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required className={inputClass} placeholder="(00) 00000-0000" />
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-red-100 transition-all flex items-center justify-center gap-2 text-sm mt-4 active:scale-[0.98]">
                {loading ? <RefreshCw className="animate-spin" size={20} /> : <><UserPlus size={18} /> Finalizar cadastro</>}
              </button>
            </form>

            <button onClick={() => setView('login')} className="w-full py-3 text-slate-500 font-bold text-xs flex items-center justify-center gap-2 hover:text-red-600 transition-colors">
              <ArrowLeft size={14} /> Já tenho uma conta
            </button>
          </div>
        );

      case 'recovery':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Recuperar acesso</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Informe o e-mail cadastrado</p>
            </div>

            <form onSubmit={handleRecovery} className="space-y-6">
              <div className="space-y-1">
                <label className={labelClass}>E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className={inputClass} placeholder="nome@empresa.com.br" />
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-red-100 transition-all flex items-center justify-center gap-2 text-sm active:scale-[0.98]">
                {loading ? <RefreshCw className="animate-spin" size={20} /> : <><Send size={18} /> Enviar link de recuperação</>}
              </button>
            </form>

            <button onClick={() => setView('login')} className="w-full py-3 text-slate-500 font-bold text-xs flex items-center justify-center gap-2 hover:text-red-600 transition-colors">
              <ArrowLeft size={14} /> Voltar para o login
            </button>
          </div>
        );

      case 'recovery-success':
        return (
          <div className="text-center space-y-6 animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto text-emerald-500">
              <CheckCircle2 size={40} />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Verifique seu e-mail</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
                As instruções de recuperação foram enviadas para <span className="font-bold text-slate-700 dark:text-slate-200">{email || 'seu e-mail'}</span>. Se não encontrar, verifique a caixa de spam.
              </p>
            </div>
            <button onClick={() => setView('login')} className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 text-sm">
              Voltar ao login
            </button>
          </div>
        );

      case 'register-success':
        return (
          <div className="text-center space-y-6 animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto text-emerald-500">
              <CheckCircle2 size={40} />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Conta pronta!</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
                Sua empresa foi cadastrada com sucesso. Agora você já pode acessar todas as funcionalidades da plataforma.
              </p>
            </div>
            <button onClick={() => setView('login')} className="w-full bg-red-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-red-100 transition-all flex items-center justify-center gap-2 text-sm active:scale-95">
              Fazer login agora <ChevronRight size={18} />
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-red-500/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-red-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 z-10">
        <div className="p-8 sm:p-10">
          <div className="flex justify-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl flex items-center justify-center shadow-lg shadow-red-200 dark:shadow-none">
              <ShieldCheck className="text-white" size={30} />
            </div>
          </div>
          {renderView()}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
