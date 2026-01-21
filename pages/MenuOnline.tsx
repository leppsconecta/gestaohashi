
import React, { useState, useEffect } from 'react';
import { 
  Utensils, 
  Coffee, 
  Flame, 
  Star,
  Info,
  ChevronDown
} from 'lucide-react';

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=1200"
];

const MENU_MOCK = [
  {
    categoria: 'Menu Degustação',
    icon: <Star size={18} />,
    itens: [
      { id: '1', nome: 'Experiência Chef', desc: 'Sequência de 7 pratos autorais selecionados pelo chef.', preco: '189,90' },
      { id: '2', nome: 'Degustação Mar', desc: 'Mix de frutos do mar frescos grelhados e marinados.', preco: '145,00' },
    ]
  },
  {
    categoria: 'Pratos Quentes',
    icon: <Flame size={18} />,
    itens: [
      { id: '3', nome: 'Filé Mignon ao Poivre', desc: 'Corte alto de filé mignon com molho de pimentas verdes e batatas rústicas.', preco: '89,90' },
      { id: '4', nome: 'Risoto de Cogumelos', desc: 'Mix de cogumelos frescos, finalizado com azeite de trufas e parmesão 24 meses.', preco: '68,00' },
    ]
  },
  {
    categoria: 'Bebidas',
    icon: <Coffee size={18} />,
    itens: [
      { id: '5', nome: 'Vinho Tinto Reserva', desc: 'Garrafa 750ml - Malbec Argentino selecionado.', preco: '120,00' },
      { id: '6', nome: 'Limonada Suíça', desc: 'Limões frescos batidos com leite condensado e gelo.', preco: '15,00' },
    ]
  }
];

const MenuOnline: React.FC = () => {
  const [currentHero, setCurrentHero] = useState(0);
  const [activeTab, setActiveTab] = useState(MENU_MOCK[0].categoria);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHero(prev => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
      {/* Hero Carousel */}
      <section className="h-[45vh] sm:h-[65vh] relative overflow-hidden">
        {HERO_IMAGES.map((img, idx) => (
          <div 
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentHero ? 'opacity-100' : 'opacity-0'}`}
          >
            <img src={img} alt="Ambiente" className="w-full h-full object-cover scale-105" />
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
          </div>
        ))}
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-6">
          <h1 className="text-4xl sm:text-7xl font-extrabold tracking-tighter mb-3 animate-in slide-in-from-bottom-4 duration-700">Hashi Express</h1>
          <p className="text-sm sm:text-xl font-medium opacity-90 animate-in slide-in-from-bottom-4 duration-700 delay-100 italic">Sabor e tradição em cada detalhe</p>
          
          <button 
            onClick={() => document.getElementById('menu-start')?.scrollIntoView({ behavior: 'smooth' })}
            className="mt-8 p-3 rounded-full bg-white/20 backdrop-blur-md animate-bounce"
          >
            <ChevronDown size={24} />
          </button>
        </div>

        {/* Hero Controls */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
          {HERO_IMAGES.map((_, idx) => (
            <button 
              key={idx} 
              onClick={() => setCurrentHero(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${idx === currentHero ? 'w-12 bg-white' : 'w-2 bg-white/30 hover:bg-white/50'}`} 
            />
          ))}
        </div>
      </section>

      {/* Categories Bar */}
      <div id="menu-start" className="sticky top-0 z-40 bg-white/90 backdrop-blur-lg border-b border-slate-200 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-3 px-6 h-16 max-w-5xl mx-auto whitespace-nowrap">
          {MENU_MOCK.map(cat => (
            <button
              key={cat.categoria}
              onClick={() => {
                setActiveTab(cat.categoria);
                document.getElementById(cat.categoria)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all ${activeTab === cat.categoria ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
            >
              {cat.icon}
              {cat.categoria}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Sections */}
      <main className="max-w-3xl mx-auto px-6 py-12 space-y-20">
        {MENU_MOCK.map(cat => (
          <section key={cat.categoria} id={cat.categoria} className="space-y-10 scroll-mt-24">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-indigo-50 flex items-center justify-center text-indigo-600 rounded-2xl shadow-sm">
                {cat.icon}
               </div>
               <h2 className="text-3xl font-bold tracking-tight text-slate-800">{cat.categoria}</h2>
            </div>

            <div className="grid grid-cols-1 gap-12">
              {cat.itens.map(item => (
                <div key={item.id} className="flex gap-6 items-start group">
                  <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-baseline gap-4">
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{item.nome}</h3>
                      <div className="flex-1 border-b border-dotted border-slate-300 mb-1.5" />
                      <span className="text-xl font-bold text-slate-900">R$ {item.preco}</span>
                    </div>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed italic">{item.desc}</p>
                    <button className="text-[10px] font-bold tracking-widest text-indigo-600 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Info size={12} /> Ver detalhes do prato
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* Footer */}
      <footer className="pt-24 pb-12 text-center space-y-6">
        <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center mx-auto text-xl font-bold shadow-xl">H</div>
        <div className="space-y-1">
          <p className="text-sm font-bold text-slate-800 tracking-tight">Hashi Express</p>
          <p className="text-[10px] font-bold text-slate-400 tracking-[0.3em]">Culinária com essência &copy; 2024</p>
        </div>
      </footer>
    </div>
  );
};

export default MenuOnline;
