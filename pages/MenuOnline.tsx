import React, { useState, useEffect, useRef, TouchEvent } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  User,
  MessageSquare,
  Users,
  Share2,
  Calendar,
  Handshake,
  Layers,
  Package,
  Sparkles,
  Loader2,
  Star
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ComboProduct {
  id: string;
  nome: string;
  descricao?: string;
  quantidade: string;
  unidade?: string;
  foto?: string;
}


// Destaque Types
interface DestaqueMidia {
  url: string;
  type: 'image' | 'video';
  duration?: number;
}

interface DestaqueConteudo {
  id: string;
  categoriaId: string;
  titulo: string;
  descricao: string;
  preco?: string;
  midias: DestaqueMidia[];
  ativo: boolean;
}

interface MenuItem {
  id: string;
  nome: string;
  descricao: string;
  preco: string;
  foto?: string;
  isCombo?: boolean;
  comboItens?: ComboProduct[];
  showSavings?: boolean;
  savingsAmount?: string;
  visivel?: boolean;
}

interface MenuCategory {
  id: string;
  nome: string;
  tipo?: 'padrao' | 'especial';
  destaque?: DestaqueConteudo;
  itens: MenuItem[];
}

// Special Category View Component
const SpecialCategoryView: React.FC<{ destaque: DestaqueConteudo }> = ({ destaque }) => {
  const [currentMedia, setCurrentMedia] = useState(0);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setCurrentMedia(0);
  }, [destaque.id]);

  useEffect(() => {
    // Reset progress on slide change
    setProgress(0);

    if (!destaque.midias || destaque.midias.length === 0) return;

    const media = destaque.midias[currentMedia];
    if (!media) return;

    let timer: NodeJS.Timeout;

    if (media.type === 'image') {
      const duration = 10000; // Fixed 10s duration per user request
      const interval = 50; // Smoother 50ms updates
      const totalSteps = duration / interval;
      let currentStep = 0;

      timer = setInterval(() => {
        currentStep++;
        const newProgress = (currentStep / totalSteps) * 100;

        setProgress(newProgress);

        if (currentStep >= totalSteps) {
          clearInterval(timer);
          setCurrentMedia(c => (c + 1) % destaque.midias.length);
        }
      }, interval);
    } else if (media.type === 'video') {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(e => console.log('Auto-play blocked:', e));
      }
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [currentMedia, destaque.midias]);

  const handleVideoEnded = () => {
    setCurrentMedia(c => (c + 1) % destaque.midias.length);
  };

  const handleVideoProgress = () => {
    if (videoRef.current && videoRef.current.duration) {
      setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
    }
  };

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-xl relative w-full max-w-sm mx-auto border border-slate-100 flex flex-col">
      {/* Media Layer - Aspect Ratio 9:16 */}
      <div className="relative w-full aspect-[9/16] bg-slate-900 overflow-hidden shrink-0">
        {destaque.midias.map((media, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-300 flex items-center justify-center ${idx === currentMedia ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            {media.type === 'video' ? (
              <video
                ref={idx === currentMedia ? videoRef : null}
                src={media.url}
                className="w-full h-full object-cover"
                muted
                playsInline
                autoPlay
                onEnded={handleVideoEnded}
                onTimeUpdate={handleVideoProgress}
              />
            ) : (
              <img src={media.url} alt="" className="w-full h-full object-cover" />
            )}
            {/* Gradient only at top for visibility of progress bar */}
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent" />
          </div>
        ))}

        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 z-30 p-2 flex gap-1">
          {destaque.midias.map((_, idx) => (
            <div key={idx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className={`h-full bg-white transition-all duration-100 ease-linear ${idx < currentMedia ? 'w-full' : idx === currentMedia ? '' : 'w-0'}`}
                style={{ width: idx === currentMedia ? `${progress}%` : undefined }}
              />
            </div>
          ))}
        </div>

        {/* Navigation Touch Zones */}
        <div className="absolute inset-0 z-20 flex">
          <div
            className="w-[30%] h-full outline-none"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentMedia(c => (c - 1 + destaque.midias.length) % destaque.midias.length);
            }}
          />
          <div
            className="w-[70%] h-full outline-none"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentMedia(c => (c + 1) % destaque.midias.length);
            }}
          />
        </div>
      </div>

      {/* Content Section - Flowing Below Image */}
      <div className="p-5 bg-white text-slate-800 relative z-30 border-t border-slate-100">
        <h2 className="text-2xl font-black mb-3 leading-tight text-amber-500 uppercase drop-shadow-sm">{destaque.titulo}</h2>
        <div className="space-y-4">
          <p className="text-sm font-medium text-slate-500 leading-relaxed">{destaque.descricao}</p>
          {destaque.preco && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">A partir de</span>
              <span className="text-2xl font-light text-amber-500">
                R$ {destaque.preco}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Hero Image Interface
interface HeroImage {
  id: string;
  foto: string;
  titulo: string;
  subtitulo: string;
  showDescription: boolean;
}

interface ExpandedItem {
  categoryId: string;
  itemIndex: number;
}

const MenuOnline: React.FC = () => {
  const [categorias, setCategorias] = useState<MenuCategory[]>([]);
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentHero, setCurrentHero] = useState(0);
  const [activeCatId, setActiveCatId] = useState<string | null>(null);
  const [expandedItem, setExpandedItem] = useState<ExpandedItem | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [expandedComboItemIndex, setExpandedComboItemIndex] = useState<number | null>(null);
  const [menuEnabled, setMenuEnabled] = useState(true);

  const contactOptions = [
    { icon: MessageSquare, label: 'Sugestões', color: 'bg-blue-500', url: 'https://hashiexpressjundiai.com.br' },
    { icon: Share2, label: 'Redes Sociais', color: 'bg-pink-500', url: 'https://instagram.com/hashiexpressjundiai' },
    { icon: Calendar, label: 'Reservas', color: 'bg-green-500', url: 'https://hashiexpressjundiai.com.br' },
    { icon: Handshake, label: 'Parcerias', color: 'bg-orange-500', url: 'https://hashiexpressjundiai.com.br' },
  ];

  const activeCategory = categorias.find(c => c.id === activeCatId);
  const allItems = categorias.flatMap(cat => cat.itens.filter(i => i.visivel !== false).map(item => ({ ...item, categoryId: cat.id })));

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch Menu Status
      try {
        const { data: configData } = await supabase
          .schema('gestaohashi')
          .from('config')
          .select('value')
          .eq('key', 'menu_online_enabled')
          .single();

        if (configData) {
          setMenuEnabled(configData.value === 'true');
        }
      } catch (e) {
        console.warn('Menu config not found');
      }

      // Fetch categories
      const { data: catData, error: catError } = await supabase
        .schema('gestaohashi')
        .from('categorias')
        .select('*')
        .order('ordem', { ascending: true });

      if (catError) throw catError;

      // Fetch products
      const { data: prodData, error: prodError } = await supabase
        .schema('gestaohashi')
        .from('produtos')
        .select('*')
        .eq('ativo', true)
        .order('ordem', { ascending: true });

      if (prodError) throw prodError;

      // Fetch combo items
      const { data: comboItemData, error: comboItemError } = await supabase
        .schema('gestaohashi')
        .from('combo_produtos')
        .select('*');

      if (comboItemError) throw comboItemError;

      // Fetch special content (destaques)
      const { data: destaquesData, error: destaquesError } = await supabase
        .schema('gestaohashi')
        .from('destaques_conteudo')
        .select('*');

      if (destaquesError && destaquesError.code !== '42P01') console.error('Error fetching destaques:', destaquesError);

      // Format data
      const formattedCategorias: MenuCategory[] = catData.map(cat => ({
        id: cat.id,
        nome: cat.nome,
        tipo: cat.tipo || 'padrao',
        destaque: destaquesData?.find(d => d.categoria_id === cat.id && d.ativo),
        itens: prodData
          .filter(p => p.categoria_id === cat.id)
          .map(p => ({
            id: p.id,
            nome: p.nome,
            descricao: p.descricao || '',
            preco: p.preco?.toString().replace('.', ',') || '0,00',
            foto: p.foto_url,
            isCombo: p.is_combo ?? false,
            showSavings: p.show_savings ?? false,
            savingsAmount: p.savings_amount?.toString().replace('.', ',') || '',
            visivel: p.visivel ?? true,
            comboItens: comboItemData
              .filter(ci => ci.combo_id === p.id)
              .map(ci => ({
                id: ci.id,
                nome: ci.nome,
                descricao: ci.descricao,
                quantidade: ci.quantidade,
                unidade: ci.unidade as any,
                foto: ci.foto_url
              }))
          }))
      }));

      setCategorias(formattedCategorias);
      if (formattedCategorias.length > 0) {
        setActiveCatId(formattedCategorias[0].id);
      }

      // Fetch Hero Images
      try {
        const { data: heroData, error: heroError } = await supabase
          .schema('gestaohashi')
          .from('hero_images')
          .select('*')
          .order('ordem', { ascending: true });

        if (!heroError && heroData && heroData.length > 0) {
          const formattedHeroes = heroData.map(h => ({
            id: h.id,
            foto: h.foto_url,
            titulo: h.titulo || '',
            subtitulo: h.subtitulo || '',
            showDescription: h.show_description ?? false
          }));
          setHeroImages(formattedHeroes);
        }
      } catch (e) {
        console.warn('Hero images not found');
      }

    } catch (error) {
      console.error('Error fetching menu data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (heroImages.length > 0) {
      const timer = setInterval(() => {
        setCurrentHero(prev => (prev + 1) % heroImages.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [heroImages]);

  // Get current expanded item details
  const getCurrentExpandedItem = () => {
    if (!expandedItem) return null;
    const cat = categorias.find(c => c.id === expandedItem.categoryId);
    if (!cat) return null;
    return cat.itens[expandedItem.itemIndex];
  };

  // Navigate to next/prev item in expanded view
  const navigateExpanded = (direction: 'prev' | 'next') => {
    if (!expandedItem) return;

    const cat = categorias.find(c => c.id === expandedItem.categoryId);
    if (!cat) return;

    setSlideDirection(direction === 'next' ? 'left' : 'right');

    setTimeout(() => {
      if (direction === 'next') {
        if (expandedItem.itemIndex < cat.itens.length - 1) {
          setExpandedItem({ ...expandedItem, itemIndex: expandedItem.itemIndex + 1 });
        }
      } else {
        if (expandedItem.itemIndex > 0) {
          setExpandedItem({ ...expandedItem, itemIndex: expandedItem.itemIndex - 1 });
        }
      }
      setSlideDirection(null);
    }, 150);
  };

  // Touch handlers for swipe
  const handleTouchStart = (e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (Math.abs(distance) >= minSwipeDistance) {
      if (distance > 0) {
        navigateExpanded('next');
      } else {
        navigateExpanded('prev');
      }
    }
  };

  const openExpanded = (categoryId: string, itemIndex: number) => {
    setExpandedItem({ categoryId, itemIndex });
  };

  const closeExpanded = () => {
    setExpandedItem(null);
  };

  const currentItem = getCurrentExpandedItem();
  const canGoPrev = expandedItem ? expandedItem.itemIndex > 0 : false;
  const canGoNext = expandedItem ? (categorias.find(c => c.id === expandedItem.categoryId)?.itens.length || 0) > expandedItem.itemIndex + 1 : false;

  if (!menuEnabled && !isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <Package size={48} className="text-indigo-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Menu Indisponível</h1>
        <p className="text-slate-400 max-w-xs mx-auto mb-8">
          No momento nosso cardápio online está em manutenção ou temporariamente desativado.
        </p>
        <a
          href="https://hashiexpressjundiai.com.br"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-slate-500 tracking-widest font-semibold hover:text-indigo-400 transition-colors"
        >
          hashiexpressjundiai.com.br
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-20 font-sans">
      {/* Hero Carousel */}
      <section className="h-[40vh] sm:h-[50vh] relative overflow-hidden bg-slate-900">
        {heroImages.length > 0 ? (
          heroImages.map((hero, idx) => (
            <div
              key={hero.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentHero ? 'opacity-100' : 'opacity-0'}`}
            >
              <img src={hero.foto} alt={hero.titulo} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60" />

              {hero.showDescription && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-6 animate-fadeIn">
                  <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-2">{hero.titulo}</h1>
                  <p className="text-sm sm:text-base font-medium opacity-80">{hero.subtitulo}</p>
                </div>
              )}
            </div>
          ))
        ) : !isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-6">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-2">Hashi Express</h1>
            <p className="text-sm sm:text-base font-medium opacity-80">Sabor e tradição em cada detalhe</p>
          </div>
        ) : null}

        {/* Person Icon Button */}
        <button
          onClick={() => setShowContactModal(true)}
          className="absolute bottom-4 right-4 p-3 bg-red-600 text-white rounded-full shadow-lg animate-pulse hover:bg-red-700 transition-colors z-10"
        >
          <User size={24} />
        </button>

      </section>

      {/* Categories Bar */}
      <div id="menu-start" className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm min-h-[58px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-[58px]">
            <Loader2 size={24} className="text-red-600 animate-spin" />
          </div>
        ) : (
          <div className="flex gap-1 p-2 overflow-x-auto scrollbar-hide justify-center md:justify-center">
            {categorias.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCatId(cat.id)}
                className={`
                  flex-shrink-0 px-4 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 relative
                  ${activeCatId === cat.id
                    ? cat.tipo === 'especial'
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-200'
                      : 'bg-red-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }
                `}
              >
                {cat.tipo === 'especial' && (
                  <Sparkles size={14} className={activeCatId === cat.id ? 'text-purple-200' : 'text-purple-500'} />
                )}
                {cat.nome}
                {cat.tipo === 'especial' && activeCatId === cat.id && (
                  <Star size={10} className="text-amber-300 fill-amber-300 animate-pulse absolute -top-1 -right-1" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Products Grid */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          {activeCategory?.nome}
          {activeCategory?.tipo === 'especial' && <Sparkles size={20} className="text-purple-500" />}
        </h2>

        {activeCategory?.tipo === 'especial' && activeCategory.destaque ? (
          <SpecialCategoryView destaque={activeCategory.destaque} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {activeCategory?.itens.filter(item => item.visivel !== false).map((item, idx) => (
              <div
                key={item.id}
                onClick={() => openExpanded(activeCatId, idx)}
                className={`bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group relative ${item.isCombo ? 'border-purple-200 ring-1 ring-purple-100' : 'border-slate-100'}`}
              >
                {/* Combo and Savings Badges - Stacked vertically on mobile */}
                {item.isCombo && (
                  <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                    {/* Combo Badge */}
                    <div className="px-2.5 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center gap-1 shadow-lg w-fit">
                      <Layers size={10} />
                      COMBO
                    </div>

                    {/* Savings Badge */}
                    {item.showSavings && item.savingsAmount && (
                      <div className="px-2 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center gap-1 shadow-lg w-fit">
                        <Sparkles size={10} />
                        -R${item.savingsAmount}
                      </div>
                    )}
                  </div>
                )}

                {/* Image */}
                <div className="aspect-square bg-slate-100 overflow-hidden relative">
                  {item.foto ? (
                    <img
                      src={item.foto}
                      alt={item.nome}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      Sem foto
                    </div>
                  )}
                  {/* Combo gradient overlay */}
                  {item.isCombo && (
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 to-transparent pointer-events-none" />
                  )}
                </div>

                {/* Info */}
                <div className={`p-3 ${item.isCombo ? 'bg-gradient-to-b from-white to-purple-50' : ''}`}>
                  <h3 className="font-bold text-slate-800 text-sm truncate mb-1">{item.nome}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-2 min-h-[32px]">{item.descricao}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-lg font-black ${item.isCombo ? 'text-purple-600' : 'text-red-600'}`}>R$ {item.preco}</span>
                    {item.isCombo && item.comboItens && (
                      <span className="text-[10px] text-purple-500 bg-purple-100 px-2 py-0.5 rounded-full font-medium">
                        {item.comboItens.length} itens
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Expanded Product Modal */}
      {expandedItem && currentItem && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeExpanded}
        >
          {/* Close Button */}
          <button
            onClick={closeExpanded}
            className="absolute top-4 right-4 p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all z-50"
          >
            <X size={24} />
          </button>

          {/* Navigation Arrows */}
          {canGoPrev && (
            <button
              onClick={(e) => { e.stopPropagation(); navigateExpanded('prev'); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all z-50"
            >
              <ChevronLeft size={28} />
            </button>
          )}
          {canGoNext && (
            <button
              onClick={(e) => { e.stopPropagation(); navigateExpanded('next'); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all z-50"
            >
              <ChevronRight size={28} />
            </button>
          )}

          {/* Product Card */}
          <div
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={`
              bg-white rounded-3xl overflow-hidden overflow-y-auto max-w-md w-[90%] max-h-[85vh] shadow-2xl
              transition-all duration-150 ease-out
              ${slideDirection === 'left' ? '-translate-x-full opacity-0' : ''}
              ${slideDirection === 'right' ? 'translate-x-full opacity-0' : ''}
              ${!slideDirection ? 'translate-x-0 opacity-100' : ''}
            `}
          >
            {/* Image */}
            <div className="aspect-square bg-slate-100 overflow-hidden relative">
              {currentItem.foto ? (
                <img src={currentItem.foto} alt={currentItem.nome} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300 text-lg">
                  Sem foto
                </div>
              )}
              {/* Combo overlay badge on image */}
              {currentItem.isCombo && (
                <div className="absolute top-4 left-4 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold rounded-full flex items-center gap-1.5 shadow-lg">
                  <Layers size={12} />
                  COMBO
                </div>
              )}
            </div>

            {/* Info */}
            <div className={`p-6 ${currentItem.isCombo ? 'bg-gradient-to-b from-white to-purple-50' : ''}`}>
              <h2 className={`text-2xl font-black mb-2 ${currentItem.isCombo ? 'text-purple-800' : 'text-slate-800'}`}>{currentItem.nome}</h2>

              {currentItem.preco ? (
                <>
                  <p className="text-slate-500 leading-relaxed mb-6">{currentItem.descricao}</p>

                  {/* Feedbacks Carousel Section */}
                  <div className="mb-6">
                    <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <MessageSquare size={16} className="text-purple-500" />
                      O que estão falando deste produto
                    </h3>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6">
                      {[
                        { name: 'Ana Silva', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d', rating: 5, text: 'Simplesmente delicioso! O sabor é incomparável.' },
                        { name: 'João Souza', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', rating: 5, text: 'Melhor pedido que fiz na semana. Chegou super rápido!' },
                        { name: 'Mariana Costa', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026302d', rating: 4, text: 'Muito bom, mas a porção poderia ser um pouco maior.' },
                        { name: 'Pedro Alves', avatar: 'https://i.pravatar.cc/150?u=a048581f4e29026704d', rating: 5, text: 'Sabor autêntico e fresco. Recomendo demais!' }
                      ].map((fb, idx) => (
                        <div key={idx} className="flex-shrink-0 w-64 bg-slate-50 rounded-xl p-3 border border-slate-100 shadow-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <img src={fb.avatar} alt={fb.name} className="w-8 h-8 rounded-full" />
                            <div>
                              <p className="text-xs font-bold text-slate-800">{fb.name}</p>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} size={10} className={i < fb.rating ? "text-amber-400 fill-amber-400" : "text-slate-300"} />
                                ))}
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-3 italic">"{fb.text}"</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Combo products list - Expandable with carousel */}
                  {currentItem.isCombo && currentItem.comboItens && currentItem.comboItens.length > 0 && (
                    <div className="mb-5">
                      {/* Header */}
                      <div className="flex items-center gap-2 mb-3">
                        <Package size={16} className="text-purple-600" />
                        <p className="text-sm font-bold text-purple-700">Este combo inclui:</p>
                      </div>

                      {/* Expanded Carousel View */}
                      {expandedComboItemIndex !== null && (
                        <div className="bg-white rounded-2xl border-2 border-purple-200 overflow-hidden mb-4 shadow-lg">
                          {/* Carousel Header with Combo X label */}
                          <div className="bg-purple-100 px-4 py-2 flex items-center justify-between">
                            <span className="text-xs font-bold text-purple-700">
                              Item {expandedComboItemIndex + 1} de {currentItem.comboItens.length}
                            </span>
                            <button
                              onClick={() => setExpandedComboItemIndex(null)}
                              className="p-1 hover:bg-purple-200 rounded-full transition-all"
                            >
                              <X size={14} className="text-purple-600" />
                            </button>
                          </div>

                          {/* Carousel Content - Only show image section if item has photo */}
                          {currentItem.comboItens[expandedComboItemIndex].foto ? (
                            <div className="relative">
                              <div className="aspect-video bg-slate-100 overflow-hidden">
                                <img
                                  src={currentItem.comboItens[expandedComboItemIndex].foto}
                                  alt={currentItem.comboItens[expandedComboItemIndex].nome}
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              {/* Navigation Arrows */}
                              {expandedComboItemIndex > 0 && (
                                <button
                                  onClick={() => setExpandedComboItemIndex(expandedComboItemIndex - 1)}
                                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all"
                                >
                                  <ChevronLeft size={18} className="text-purple-600" />
                                </button>
                              )}
                              {expandedComboItemIndex < currentItem.comboItens.length - 1 && (
                                <button
                                  onClick={() => setExpandedComboItemIndex(expandedComboItemIndex + 1)}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all"
                                >
                                  <ChevronRight size={18} className="text-purple-600" />
                                </button>
                              )}
                            </div>
                          ) : null}

                          {/* Item Details - Full information when expanded */}
                          <div className="p-4">
                            <h4 className="font-bold text-slate-800 mb-1">{currentItem.comboItens[expandedComboItemIndex].nome}</h4>
                            <p className="text-sm text-slate-500 mb-2">{currentItem.comboItens[expandedComboItemIndex].descricao}</p>
                            <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                              {currentItem.comboItens[expandedComboItemIndex].quantidade} {currentItem.comboItens[expandedComboItemIndex].unidade || 'un'}
                            </span>
                          </div>

                          {/* Carousel dots indicator - only show dots for items with descriptions */}
                          <div className="flex justify-center gap-1.5 pb-3">
                            {currentItem.comboItens.filter(i => i.descricao).map((item, idx) => {
                              const realIdx = currentItem.comboItens.findIndex(i => i.id === item.id);
                              return (
                                <button
                                  key={item.id}
                                  onClick={() => setExpandedComboItemIndex(realIdx)}
                                  className={`w-2 h-2 rounded-full transition-all ${realIdx === expandedComboItemIndex ? 'bg-purple-600 w-4' : 'bg-purple-200 hover:bg-purple-300'}`}
                                />
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Products List - Compact view with scroll after 5 items */}
                      <div className={`bg-white rounded-2xl border border-purple-100 overflow-hidden shadow-sm ${currentItem.comboItens.length > 5 ? 'max-h-80 overflow-y-auto' : ''}`}>
                        {currentItem.comboItens.map((item, idx) => {
                          const hasDescription = !!item.descricao;
                          const isClickable = hasDescription;

                          return (
                            <div key={item.id} className="relative">
                              {/* Item X label above each item */}
                              <div className="bg-purple-50 px-4 py-1 border-b border-purple-100">
                                <span className="text-[10px] font-bold text-purple-500 uppercase tracking-wide">
                                  Item {idx + 1}
                                </span>
                              </div>
                              {isClickable ? (
                                <button
                                  onClick={() => setExpandedComboItemIndex(expandedComboItemIndex === idx ? null : idx)}
                                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all border-b border-purple-50 last:border-0 ${expandedComboItemIndex === idx ? 'bg-purple-50' : 'hover:bg-slate-50'}`}
                                >
                                  <div className="flex-1 min-w-0">
                                    {/* Product Name */}
                                    <p className="font-semibold text-slate-800 text-sm truncate">{item.nome}</p>
                                    {/* Brief Description */}
                                    <p className="text-xs text-slate-400 truncate">{item.descricao}</p>
                                  </div>
                                  {/* Quantity */}
                                  <span className="text-xs text-purple-600 font-semibold bg-purple-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                                    {item.quantidade} {item.unidade || 'un'}
                                  </span>
                                  <ChevronRight size={14} className={`text-slate-400 transition-transform flex-shrink-0 ${expandedComboItemIndex === idx ? 'rotate-90' : ''}`} />
                                </button>
                              ) : (
                                <div className="w-full flex items-center gap-3 px-4 py-3 border-b border-purple-50 last:border-0">
                                  <div className="flex-1 min-w-0">
                                    {/* Product Name */}
                                    <p className="font-semibold text-slate-800 text-sm truncate">{item.nome}</p>
                                    {/* No description indicator */}
                                    <p className="text-xs text-slate-300 italic">Sem descrição</p>
                                  </div>
                                  {/* Quantity */}
                                  <span className="text-xs text-purple-600 font-semibold bg-purple-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                                    {item.quantidade} {item.unidade || 'un'}
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Scroll hint */}
                      {currentItem.comboItens.length > 5 && (
                        <p className="text-[10px] text-center text-purple-400 mt-2">Role para ver mais itens</p>
                      )}
                    </div>
                  )}

                  <div className="flex items-end justify-between">
                    <div>
                      <span className={`text-3xl font-black ${currentItem.isCombo ? 'text-purple-600' : 'text-red-600'}`}>R$ {currentItem.preco}</span>
                      {/* Savings Badge */}
                      {currentItem.isCombo && currentItem.showSavings && currentItem.savingsAmount && (
                        <div className="mt-2">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs font-bold rounded-full shadow-md">
                            <Sparkles size={12} />
                            Você economiza R$ {currentItem.savingsAmount}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-slate-400">
                      {expandedItem.itemIndex + 1} / {categorias.find(c => c.id === expandedItem.categoryId)?.itens.filter(i => i.visivel !== false).length}
                    </div>
                  </div>
                </>
              ) : (
                <div className="max-h-32 overflow-y-auto">
                  <p className="text-slate-500 leading-relaxed">{currentItem.descricao}</p>
                </div>
              )}
            </div>
          </div>

          {/* Swipe indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-1">
            {categorias.find(c => c.id === expandedItem.categoryId)?.itens.filter(i => i.visivel !== false).map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${idx === expandedItem.itemIndex ? 'bg-red-600 w-6' : 'bg-white/30'}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setShowContactModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-500 p-6 text-white text-center relative">
              <button
                onClick={() => setShowContactModal(false)}
                className="absolute top-4 right-4 p-1.5 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
              >
                <X size={18} />
              </button>
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <User size={28} />
              </div>
              <h2 className="text-xl font-bold">Fale Conosco</h2>
              <p className="text-sm opacity-80 mt-1">Como podemos ajudar?</p>
            </div>

            {/* Modal Options */}
            <div className="p-4 space-y-3">
              {contactOptions.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => window.open(option.url, '_blank')}
                  className="w-full flex items-center gap-4 p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors group"
                >
                  <div className={`w-12 h-12 ${option.color} rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}>
                    <option.icon size={22} />
                  </div>
                  <span className="text-lg font-semibold text-slate-700">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}


      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default MenuOnline;
