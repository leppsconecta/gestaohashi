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
  Sparkles
} from 'lucide-react';

// Mock data - In production, this would come from database/context shared with Cardapio.tsx
interface ComboProduct {
  id: string;
  nome: string;
  descricao?: string;
  quantidade: string;
  unidade?: string;
  foto?: string;
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
  itens: MenuItem[];
}

const MENU_DATA: MenuCategory[] = [
  {
    id: 'cat-1',
    nome: 'Bebidas',
    itens: [
      { id: 'item-1', nome: 'Coca-Cola 350ml', descricao: 'Refrigerante gelado', preco: '6,00', foto: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=800' },
      { id: 'item-2', nome: 'Suco Natural Laranja', descricao: 'Suco de laranja natural 500ml', preco: '12,00', foto: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=800' },
      { id: 'item-3', nome: 'Água Mineral 500ml', descricao: 'Água mineral sem gás', preco: '4,00', foto: 'https://images.unsplash.com/photo-1559839914-17aae19cec71?w=800' },
      { id: 'item-4', nome: 'Cerveja Heineken', descricao: 'Long neck 330ml', preco: '14,00', foto: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=800' },
    ]
  },
  {
    id: 'cat-2',
    nome: 'Pratos Quentes',
    itens: [
      { id: 'item-5', nome: 'Filé à Parmegiana', descricao: 'Filé empanado com molho de tomate e queijo gratinado, arroz e fritas', preco: '58,90', foto: 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=800' },
      { id: 'item-6', nome: 'Risoto de Camarão', descricao: 'Arroz arbóreo cremoso com camarões salteados', preco: '72,00', foto: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?w=800' },
      { id: 'item-7', nome: 'Lasanha Bolonhesa', descricao: 'Massa fresca, molho bolonhesa e bechamel', preco: '45,00', foto: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=800' },
    ]
  },
  {
    id: 'cat-3',
    nome: 'Pratos Frios',
    itens: [
      { id: 'item-8', nome: 'Salada Caesar', descricao: 'Alface romana, croutons, parmesão e molho caesar', preco: '32,00', foto: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800' },
      { id: 'item-9', nome: 'Carpaccio', descricao: 'Fatias finas de filé mignon com rúcula e parmesão', preco: '48,00', foto: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800' },
    ]
  },
  {
    id: 'cat-4',
    nome: 'Sobremesas',
    itens: [
      { id: 'item-10', nome: 'Petit Gateau', descricao: 'Bolo de chocolate com recheio cremoso e sorvete', preco: '28,00', foto: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800' },
      { id: 'item-11', nome: 'Pudim de Leite', descricao: 'Pudim tradicional com calda de caramelo', preco: '18,00', foto: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800' },
      { id: 'item-12', nome: 'Brownie com Sorvete', descricao: 'Brownie de chocolate com sorvete de creme', preco: '24,00', foto: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=800' },
    ]
  },
  {
    id: 'cat-5',
    nome: 'Porções',
    itens: [
      { id: 'item-13', nome: 'Batata Frita', descricao: 'Porção de batata frita crocante', preco: '25,00', foto: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800' },
      { id: 'item-14', nome: 'Onion Rings', descricao: 'Anéis de cebola empanados', preco: '28,00', foto: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=800' },
      { id: 'item-15', nome: 'Mix de Petiscos', descricao: 'Coxinha, bolinha de queijo e pastéis', preco: '45,00', foto: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f25?w=800' },
      {
        id: 'combo-1',
        nome: 'Combo Happy Hour',
        descricao: 'Perfeito para compartilhar! Inclui nossas melhores porções e bebidas geladas.',
        preco: '89,90',
        foto: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
        isCombo: true,
        showSavings: true,
        savingsAmount: '25,00',
        comboItens: [
          { id: 'cp-1', nome: 'Batata Frita', descricao: 'Porção de batata frita crocante', quantidade: '1', unidade: 'Porção', foto: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400' },
          { id: 'cp-2', nome: 'Onion Rings', descricao: 'Anéis de cebola empanados', quantidade: '1', unidade: 'Porção', foto: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=400' },
          { id: 'cp-3', nome: 'Cerveja Heineken', descricao: 'Long neck 330ml gelada', quantidade: '4', unidade: 'Unid', foto: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400' },
        ]
      },
    ]
  },
];

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=1200"
];

interface ExpandedItem {
  categoryId: string;
  itemIndex: number;
}

const MenuOnline: React.FC = () => {
  const [currentHero, setCurrentHero] = useState(0);
  const [activeCatId, setActiveCatId] = useState(MENU_DATA[0].id);
  const [expandedItem, setExpandedItem] = useState<ExpandedItem | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [expandedComboItemIndex, setExpandedComboItemIndex] = useState<number | null>(null);

  const contactOptions = [
    { icon: MessageSquare, label: 'Sugestões', color: 'bg-blue-500' },
    { icon: Users, label: 'Grupo VIP', color: 'bg-purple-500' },
    { icon: Share2, label: 'Redes Sociais', color: 'bg-pink-500' },
    { icon: Calendar, label: 'Reservas', color: 'bg-green-500' },
    { icon: Handshake, label: 'Parcerias', color: 'bg-orange-500' },
  ];

  const activeCategory = MENU_DATA.find(c => c.id === activeCatId);
  const allItems = MENU_DATA.flatMap(cat => cat.itens.filter(i => i.visivel !== false).map(item => ({ ...item, categoryId: cat.id })));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHero(prev => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Get current expanded item details
  const getCurrentExpandedItem = () => {
    if (!expandedItem) return null;
    const cat = MENU_DATA.find(c => c.id === expandedItem.categoryId);
    if (!cat) return null;
    return cat.itens[expandedItem.itemIndex];
  };

  // Navigate to next/prev item in expanded view
  const navigateExpanded = (direction: 'prev' | 'next') => {
    if (!expandedItem) return;

    const cat = MENU_DATA.find(c => c.id === expandedItem.categoryId);
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
  const canGoNext = expandedItem ? (MENU_DATA.find(c => c.id === expandedItem.categoryId)?.itens.length || 0) > expandedItem.itemIndex + 1 : false;

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-20 font-sans">
      {/* Hero Carousel */}
      <section className="h-[40vh] sm:h-[50vh] relative overflow-hidden">
        {HERO_IMAGES.map((img, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentHero ? 'opacity-100' : 'opacity-0'}`}
          >
            <img src={img} alt="Ambiente" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60" />
          </div>
        ))}

        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-6">

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-2">Hashi Express</h1>
          <p className="text-sm sm:text-base font-medium opacity-80">Sabor e tradição em cada detalhe</p>

        </div>

        {/* Person Icon Button */}
        <button
          onClick={() => setShowContactModal(true)}
          className="absolute bottom-4 right-4 p-3 bg-red-600 text-white rounded-full shadow-lg animate-pulse hover:bg-red-700 transition-colors z-10"
        >
          <User size={24} />
        </button>

      </section>

      {/* Categories Bar */}
      <div id="menu-start" className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm">
        <div className="flex gap-1 p-2 overflow-x-auto scrollbar-hide justify-center md:justify-center">
          {MENU_DATA.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCatId(cat.id)}
              className={`
                flex-shrink-0 px-4 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap
                ${activeCatId === cat.id
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }
              `}
            >
              {cat.nome}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">{activeCategory?.nome}</h2>

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
                  <p className="text-slate-500 leading-relaxed mb-4">{currentItem.descricao}</p>

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
                              {currentItem.comboItens[expandedComboItemIndex].quantidade} {currentItem.comboItens[expandedComboItemIndex].unidade || 'Unid'}
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
                                    {item.quantidade}x
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
                                    {item.quantidade}x
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
                      {expandedItem.itemIndex + 1} / {MENU_DATA.find(c => c.id === expandedItem.categoryId)?.itens.length}
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
            {MENU_DATA.find(c => c.id === expandedItem.categoryId)?.itens.map((_, idx) => (
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
