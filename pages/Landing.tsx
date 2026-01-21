
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  MessageSquare, 
  Star, 
  FileText, 
  ArrowRight, 
  Smartphone, 
  Rocket, 
  Users, 
  ShieldCheck, 
  Mail, 
  MapPin, 
  Phone, 
  Instagram, 
  Facebook,
  Menu,
  X,
  PlayCircle,
  Gift
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { AppRoute } from '../types';

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1551288049-bbbda5366392?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800"
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [loadingImages, setLoadingImages] = useState(true);

  useEffect(() => {
    const generateCarouselImages = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompts = [
          "A minimalist 3D illustration of business management software on a screen, professional purple and blue theme.",
          "Digital human resources and employee scheduling management interface 3D illustration, indigo palette.",
          "Customer feedback and star ratings dashboard 3D visualization, modern tech aesthetic.",
          "Automated messaging and communication flow 3D design, clean minimalist style."
        ];

        const generated: string[] = [];
        for (const prompt of prompts) {
          try {
            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash-image',
              contents: { parts: [{ text: prompt }] }
            });
            
            for (const part of response.candidates?.[0]?.content?.parts || []) {
              if (part.inlineData) {
                generated.push(`data:image/png;base64,${part.inlineData.data}`);
                break;
              }
            }
          } catch (itemErr) {
            console.warn(`Erro ao gerar imagem para: ${prompt}`, itemErr);
            generated.push(FALLBACK_IMAGES[generated.length]);
          }
        }
        
        if (generated.length > 0) setImages(generated);
        else setImages(FALLBACK_IMAGES);

      } catch (err) {
        console.error("Falha ao gerar imagens (Quota Exceeded ou Erro de Rede)", err);
        setImages(FALLBACK_IMAGES);
      } finally {
        setLoadingImages(false);
      }
    };

    generateCarouselImages();
  }, []);

  useEffect(() => {
    if (images.length === 0) return;
    const interval = setInterval(() => {
      setCurrentImageIdx((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images]);

  const services = [
    { title: 'Respostas Inteligentes', desc: 'Agende fluxos de mensagens automáticas no WhatsApp para cada dia da semana.', icon: <MessageSquare className="text-indigo-600" size={24} /> },
    { title: 'Gestão de Feedbacks', desc: 'Monitore avaliações do Google e de seu site em um só lugar para elevar sua nota.', icon: <Star className="text-purple-600" size={24} /> },
    { title: 'Banco de Currículos', desc: 'Centralize o recebimento de candidaturas com formulários públicos e organizados.', icon: <FileText className="text-indigo-600" size={24} /> },
    { title: 'Escala e Equipe', desc: 'Gerencie turnos, funcionários e documentos de RH de forma digital e rápida.', icon: <Users className="text-purple-600" size={24} /> },
    { title: 'Reservas e Eventos', desc: 'Controle total sobre agendamentos de mesas e consumação promocional.', icon: <CheckCircle2 className="text-indigo-600" size={24} /> },
    { title: 'Link Bio Inteligente', desc: 'Um cartão de visitas digital personalizável para unificar todos seus canais.', icon: <Smartphone className="text-purple-600" size={24} /> },
  ];

  const plans = [
    { name: 'Essencial', price: 'R$ 97', features: ['Programador de Respostas', 'Gestão de Currículos', 'Link Bio Hashi', 'Suporte via Chat'] },
    { name: 'Business', price: 'R$ 197', popular: true, features: ['Tudo do Essencial', 'Gestão de Feedbacks Google', 'Escala de Funcionários', 'Gestão de Reservas'] },
    { name: 'Premium', price: 'R$ 347', features: ['Tudo do Business', 'Relatórios Avançados', 'Acesso Multi-Unidade', 'Gerente de Conta'] },
  ];

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 scroll-smooth">
      <style>{`
        @keyframes pulse-indigo {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.4); }
          50% { transform: scale(1.05); box-shadow: 0 0 0 20px rgba(79, 70, 229, 0); }
        }
        .animate-pulse-button {
          animation: pulse-indigo 2s infinite;
        }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
               <span className="text-white font-black text-xl">H</span>
            </div>
            <span className="text-2xl font-bold tracking-tighter text-slate-800">Hashi</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollTo('hero')} className="text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors">Início</button>
            <button onClick={() => scrollTo('services')} className="text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors">Serviços</button>
            <button onClick={() => scrollTo('plans')} className="text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors">Planos</button>
            <button onClick={() => scrollTo('contact')} className="text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors">Contato</button>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => navigate(AppRoute.LOGIN)} className="hidden sm:block text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors">Entrar</button>
            <button onClick={() => navigate(AppRoute.LOGIN)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 transition-all active:scale-95">Criar conta</button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-slate-500">{isMenuOpen ? <X /> : <Menu />}</button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-100 p-6 space-y-4 animate-in slide-in-from-top-4 duration-300">
            <button onClick={() => scrollTo('hero')} className="block w-full text-left font-semibold text-slate-600">Início</button>
            <button onClick={() => scrollTo('services')} className="block w-full text-left font-semibold text-slate-600">Serviços</button>
            <button onClick={() => scrollTo('plans')} className="block w-full text-left font-semibold text-slate-600">Planos</button>
            <button onClick={() => scrollTo('contact')} className="block w-full text-left font-semibold text-slate-600">Contato</button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="hero" className="pt-40 pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 animate-in slide-in-from-left-8 duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold">
              <Rocket size={14} /> Gestão empresarial 360º
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
              Sua empresa na <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">palma da mão.</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-xl">
              Centralize feedbacks, automatize respostas e gerencie sua equipe com a facilidade de um clique. A Hashi é a plataforma definitiva para negócios que buscam crescimento real.
            </p>
            
            <div className="flex flex-col gap-8">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button onClick={() => navigate(AppRoute.LOGIN)} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-5 rounded-[2rem] font-bold text-base shadow-2xl shadow-indigo-200 transition-all flex items-center justify-center gap-3 active:scale-95">
                  Começar agora <ArrowRight size={18} />
                </button>
                <button className="flex items-center gap-2 text-slate-600 font-semibold text-sm px-6 py-4 hover:text-indigo-600 transition-colors">
                  <PlayCircle size={24} /> Ver demonstração
                </button>
              </div>

              <div className="flex justify-center sm:justify-start">
                <button 
                  onClick={() => navigate(AppRoute.LOGIN)}
                  className="animate-pulse-button bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-sm flex items-center gap-3 shadow-lg hover:shadow-indigo-200 transition-all"
                >
                  <Gift size={18} />
                  Teste 7 dias grátis (sem cartão de crédito)
                </button>
              </div>
            </div>
          </div>

          <div className="relative animate-in zoom-in-95 duration-1000">
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-[4rem] blur-3xl" />
            <div className="relative bg-white p-3 rounded-[3.5rem] shadow-2xl border border-slate-100 aspect-square overflow-hidden group">
               {loadingImages ? (
                 <div className="w-full h-full bg-slate-50 animate-pulse flex items-center justify-center">
                   <div className="w-12 h-12 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                 </div>
               ) : (
                 <div className="relative w-full h-full">
                    {images.map((img, idx) => (
                      <img key={idx} src={img} alt={`Serviço ${idx + 1}`} className={`absolute inset-0 w-full h-full object-cover rounded-[3rem] transition-all duration-1000 ease-in-out ${idx === currentImageIdx ? 'opacity-100 scale-100' : 'opacity-0 scale-110 pointer-events-none'}`} />
                    ))}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                      {images.map((_, idx) => (
                        <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIdx ? 'w-8 bg-indigo-600' : 'w-2 bg-white/50'}`} />
                      ))}
                    </div>
                 </div>
               )}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-[0.2em]">Nossos serviços</h2>
            <h3 className="text-4xl font-bold text-slate-900 tracking-tight">Tudo que seu negócio precisa</h3>
            <p className="text-slate-500 font-medium max-w-2xl mx-auto">Funcionalidades pensadas para otimizar sua operação e melhorar a experiência do cliente.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((s, i) => (
              <div key={i} className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">{s.icon}</div>
                <h4 className="text-xl font-bold text-slate-800 mb-3">{s.title}</h4>
                <p className="text-slate-500 font-medium leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="plans" className="py-24">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-xs font-bold text-purple-600 uppercase tracking-[0.2em]">Preços justos</h2>
            <h3 className="text-4xl font-bold text-slate-900 tracking-tight">Escolha o plano ideal</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((p, i) => (
              <div key={i} className={`p-10 rounded-[3rem] border-2 flex flex-col items-center text-center space-y-8 relative overflow-hidden ${p.popular ? 'border-indigo-600 shadow-2xl shadow-indigo-100' : 'border-slate-100 shadow-sm'}`}>
                {p.popular && <div className="absolute top-6 -right-12 bg-indigo-600 text-white text-[10px] font-bold uppercase py-2 px-12 rotate-45 tracking-widest">Destaque</div>}
                <div className="space-y-2">
                  <h4 className="text-lg font-bold text-slate-400">{p.name}</h4>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-extrabold text-slate-900">{p.price}</span>
                    <span className="text-slate-400 font-semibold">/mês</span>
                  </div>
                </div>
                <ul className="space-y-4 w-full">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-600"><CheckCircle2 size={16} className="text-indigo-500" /> {f}</li>
                  ))}
                </ul>
                <button onClick={() => navigate(AppRoute.LOGIN)} className={`w-full py-4 rounded-2xl font-bold text-sm transition-all active:scale-95 ${p.popular ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-900 hover:bg-slate-100'}`}>Assinar agora</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center"><span className="text-white font-black">H</span></div>
            <span className="text-xl font-bold tracking-tighter text-slate-800">Hashi</span>
          </div>
          <p className="text-slate-400 text-sm font-medium">&copy; 2024 Hashi Gestão Inteligente. Todos os direitos reservados.</p>
          <div className="flex gap-6">
             <button className="text-xs font-semibold text-slate-400 hover:text-slate-600">Privacidade</button>
             <button className="text-xs font-semibold text-slate-400 hover:text-slate-600">Termos</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
