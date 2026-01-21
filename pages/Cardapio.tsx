
import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Image as ImageIcon, 
  ChevronDown, 
  ChevronUp, 
  Layers,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Camera,
  X
} from 'lucide-react';
import Modal from '../components/UI/Modal';
import { CardapioCategoria, CardapioItem, ModalType, AppRoute } from '../types';

const INITIAL_CATEGORIAS: CardapioCategoria[] = [
  { id: 'cat-1', nome: 'Bebidas', itens: [] },
  { id: 'cat-2', nome: 'Pratos Quentes', itens: [] },
  { id: 'cat-3', nome: 'Pratos Frios', itens: [] },
  { id: 'cat-4', nome: 'Mais Pedidos', itens: [] },
  { id: 'cat-5', nome: 'Menu Degustação', itens: [] },
];

const CardapioPage: React.FC = () => {
  const [categorias, setCategorias] = useState<CardapioCategoria[]>(INITIAL_CATEGORIAS);
  const [headerImages, setHeaderImages] = useState<string[]>([
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800",
  ]);
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set(['cat-1']));
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; type: ModalType; title: string; content: React.ReactNode; onConfirm?: () => void; maxWidth?: string }>({
    isOpen: false,
    type: 'view-content',
    title: '',
    content: '',
  });

  const toggleCat = (id: string) => {
    const next = new Set(expandedCats);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedCats(next);
  };

  const handleAddHeaderImage = () => {
    if (headerImages.length >= 3) return alert("Limite de 3 imagens atingido.");
    const url = prompt("Insira a URL da imagem:");
    if (url) setHeaderImages([...headerImages, url]);
  };

  const removeHeaderImage = (idx: number) => {
    setHeaderImages(headerImages.filter((_, i) => i !== idx));
  };

  const handleAddCategoria = () => {
    const nome = prompt("Nome da nova categoria:");
    if (nome) {
      setCategorias([...categorias, { id: `cat-${Date.now()}`, nome, itens: [] }]);
    }
  };

  const moveItem = (catId: string, itemIdx: number, direction: 'up' | 'down') => {
    setCategorias(prev => prev.map(cat => {
      if (cat.id === catId) {
        const newItens = [...cat.itens];
        const targetIdx = direction === 'up' ? itemIdx - 1 : itemIdx + 1;
        if (targetIdx >= 0 && targetIdx < newItens.length) {
          [newItens[itemIdx], newItens[targetIdx]] = [newItens[targetIdx], newItens[itemIdx]];
        }
        return { ...cat, itens: newItens };
      }
      return cat;
    }));
  };

  const handleAddItem = (catId: string) => {
    setModalConfig({
      isOpen: true,
      type: 'confirm-insert',
      title: 'Adicionar produto',
      maxWidth: 'max-w-2xl',
      content: <ItemForm />,
      onConfirm: () => {
        setCategorias(prev => prev.map(cat => {
          if (cat.id === catId) {
            return {
              ...cat,
              itens: [...cat.itens, { 
                id: `item-${Date.now()}`, 
                nome: 'Novo produto', 
                descricao: 'Descrição breve do item...', 
                preco: '0,00',
                ativo: true 
              }]
            };
          }
          return cat;
        }));
      }
    });
  };

  const removeCategoria = (id: string) => {
    if (confirm("Deseja realmente excluir esta categoria e todos os itens dela?")) {
      setCategorias(categorias.filter(c => c.id !== id));
    }
  };

  const removeItem = (catId: string, itemId: string) => {
    setCategorias(prev => prev.map(cat => {
      if (cat.id === catId) {
        return { ...cat, itens: cat.itens.filter(i => i.id !== itemId) };
      }
      return cat;
    }));
  };

  const ItemForm = ({ initialData }: { initialData?: CardapioItem }) => (
    <div className="space-y-6 text-slate-700 dark:text-slate-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-500 ml-1">Nome do produto</label>
          <input className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-semibold shadow-sm" defaultValue={initialData?.nome} />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-500 ml-1">Valor (R$)</label>
          <input className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-semibold shadow-sm" defaultValue={initialData?.preco} placeholder="0,00" />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-[11px] font-semibold text-slate-500 ml-1">Descrição</label>
        <textarea className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-normal h-32 resize-none leading-relaxed" placeholder="Ingredientes ou detalhes..." defaultValue={initialData?.descricao} />
      </div>
      <div className="space-y-2">
        <label className="text-[11px] font-semibold text-slate-500 ml-1">Foto do produto</label>
        <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] h-40 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 transition-all cursor-pointer bg-slate-50/50 dark:bg-slate-950/50">
          <ImageIcon size={32} strokeWidth={1.5} />
          <span className="text-[11px] font-medium mt-3">Clique para anexar imagem</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Header da Página */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Gestão de cardápio</h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">Personalize o menu online do seu estabelecimento.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.open('/#/public/menu', '_blank')}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs font-semibold transition-all active:scale-95 shadow-lg shadow-emerald-100 dark:shadow-none"
          >
            <ExternalLink size={18} strokeWidth={2.5} />
            Ver cardápio
          </button>
          <button 
            onClick={handleAddCategoria}
            className="bg-indigo-700 hover:bg-indigo-800 text-white font-semibold px-6 py-3 rounded-2xl flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-100 dark:shadow-none text-xs"
          >
            <Plus size={22} strokeWidth={2.5} /> Nova categoria
          </button>
        </div>
      </div>

      {/* Gestão do Header / Carrossel */}
      <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/40 rounded-2xl text-indigo-700">
              <Camera size={24} strokeWidth={2} />
            </div>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white tracking-tight">Imagens do cabeçalho</h2>
          </div>
          <span className="text-[11px] font-semibold text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-lg border border-slate-100 dark:border-slate-700 uppercase tracking-widest">{headerImages.length}/3 imagens</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {headerImages.map((img, idx) => (
            <div key={idx} className="group relative aspect-video rounded-2xl overflow-hidden border-2 border-slate-100 dark:border-slate-800 shadow-sm">
              <img src={img} className="w-full h-full object-cover" alt="Banner" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button 
                  onClick={() => removeHeaderImage(idx)}
                  className="p-3 bg-red-600 text-white rounded-xl shadow-lg active:scale-90"
                >
                  <Trash2 size={20} strokeWidth={2} />
                </button>
              </div>
            </div>
          ))}
          {headerImages.length < 3 && (
            <button 
              onClick={handleAddHeaderImage}
              className="aspect-video border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:text-indigo-700 hover:border-indigo-200 transition-all gap-2 bg-slate-50/50 dark:bg-slate-950/50"
            >
              <Plus size={32} strokeWidth={2} />
              <span className="text-[11px] font-medium">Adicionar banner</span>
            </button>
          )}
        </div>
      </section>

      {/* Listagem de Categorias */}
      <div className="space-y-4">
        {categorias.map(cat => {
          const isExpanded = expandedCats.has(cat.id);
          return (
            <div key={cat.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
              <div 
                onClick={() => toggleCat(cat.id)}
                className="p-7 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-5">
                  <div className="p-3.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 rounded-2xl shadow-sm border border-indigo-100 dark:border-indigo-800">
                    <Layers size={24} strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-none mb-1">{cat.nome}</h3>
                    <p className="text-[11px] text-slate-500 font-medium">{cat.itens.length} produtos cadastrados</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeCategoria(cat.id); }}
                    className="p-2.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={20} strokeWidth={2} />
                  </button>
                  <div className="text-slate-400">
                    {isExpanded ? <ChevronUp size={28} strokeWidth={2} /> : <ChevronDown size={28} strokeWidth={2} />}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="p-7 pt-0 border-t border-slate-50 dark:border-slate-800 animate-in slide-in-from-top-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
                    {cat.itens.map((item, idx) => (
                      <div key={item.id} className="bg-slate-50/50 dark:bg-slate-800/40 p-5 rounded-[2rem] border border-slate-200 dark:border-slate-700 flex items-start gap-5 shadow-sm transition-all hover:shadow-md">
                        <div className="w-20 h-20 bg-white dark:bg-slate-950 rounded-2xl flex items-center justify-center text-slate-300 border border-slate-200 dark:border-slate-800 shrink-0 shadow-inner">
                          <ImageIcon size={28} strokeWidth={2} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-900 dark:text-white truncate text-sm mb-1">{item.nome}</h4>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 mb-2 font-normal leading-tight">{item.descricao}</p>
                          <span className="text-sm font-bold text-indigo-700 dark:text-indigo-400 bg-white dark:bg-slate-950 px-2 py-1 rounded-lg border border-indigo-100 dark:border-indigo-900 shadow-sm">R$ {item.preco}</span>
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="flex flex-col border-2 border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                            <button onClick={(e) => { e.stopPropagation(); moveItem(cat.id, idx, 'up'); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 border-b-2 border-slate-100 dark:border-slate-700"><ArrowUp size={14} strokeWidth={2} /></button>
                            <button onClick={(e) => { e.stopPropagation(); moveItem(cat.id, idx, 'down'); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"><ArrowDown size={14} strokeWidth={2} /></button>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); removeItem(cat.id, item.id); }} className="p-2 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all shadow-sm"><Trash2 size={18} strokeWidth={2} /></button>
                        </div>
                      </div>
                    ))}
                    
                    <button 
                      onClick={() => handleAddItem(cat.id)}
                      className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 flex flex-col items-center justify-center text-slate-500 hover:text-indigo-700 hover:border-indigo-200 transition-all gap-3 h-full min-h-[120px] bg-slate-50/30 dark:bg-slate-950/30"
                    >
                      <Plus size={32} strokeWidth={2} />
                      <span className="text-[11px] font-semibold">Adicionar item</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Modal 
        isOpen={modalConfig.isOpen}
        type={modalConfig.type}
        title={modalConfig.title}
        maxWidth={modalConfig.maxWidth}
        content={modalConfig.content}
        onConfirm={modalConfig.onConfirm}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default CardapioPage;
