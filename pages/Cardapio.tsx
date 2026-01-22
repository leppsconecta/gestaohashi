import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  Image as ImageIcon,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  List,
  ArrowUp,
  ArrowDown,
  Save,
  X,
  GripVertical,
  Check,
  Upload,
  Video,
  Loader2,
  Filter,
  Search,
  Layers
} from 'lucide-react';
import Modal from '../components/UI/Modal';
import { ModalType } from '../types';
import { supabase } from '../lib/supabase';

// Produto incluído em um combo
interface ComboProduct {
  id: string;
  nome: string;
  descricao?: string;
  quantidade: string; // Ex: "3"
  unidade: 'Unid' | 'g' | 'ml'; // Unit type
  foto?: string;
  isFromCardapio?: boolean;
  originalItemId?: string;
  useOriginalDescription?: boolean;
}

interface CardapioItem {
  id: string;
  nome: string;
  descricao: string;
  preco: string;
  foto?: string;
  ativo: boolean;
  isCombo?: boolean;
  comboItens?: ComboProduct[];
  showSavings?: boolean; // Show savings info
  savingsAmount?: string; // Amount saved, e.g., "15,00"
}

interface CardapioCategoria {
  id: string;
  nome: string;
  itens: CardapioItem[];
}


const INITIAL_CATEGORIAS: CardapioCategoria[] = [
  {
    id: 'cat-1',
    nome: 'Bebidas',
    itens: [
      { id: 'item-1', nome: 'Coca-Cola 350ml', descricao: 'Refrigerante gelado', preco: '6,00', foto: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400', ativo: true },
      { id: 'item-2', nome: 'Suco Natural Laranja', descricao: 'Suco de laranja natural 500ml', preco: '12,00', foto: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400', ativo: true },
      { id: 'item-3', nome: 'Água Mineral 500ml', descricao: 'Água mineral sem gás', preco: '4,00', foto: 'https://images.unsplash.com/photo-1559839914-17aae19cec71?w=400', ativo: true },
      { id: 'item-4', nome: 'Cerveja Heineken', descricao: 'Long neck 330ml', preco: '14,00', foto: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400', ativo: true },
    ]
  },
  {
    id: 'cat-2',
    nome: 'Pratos Quentes',
    itens: [
      { id: 'item-5', nome: 'Filé à Parmegiana', descricao: 'Filé empanado com molho de tomate e queijo gratinado, arroz e fritas', preco: '58,90', foto: 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=400', ativo: true },
      { id: 'item-6', nome: 'Risoto de Camarão', descricao: 'Arroz arbóreo cremoso com camarões salteados', preco: '72,00', foto: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?w=400', ativo: true },
      { id: 'item-7', nome: 'Lasanha Bolonhesa', descricao: 'Massa fresca, molho bolonhesa e bechamel', preco: '45,00', foto: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400', ativo: true },
    ]
  },
  {
    id: 'cat-3',
    nome: 'Pratos Frios',
    itens: [
      { id: 'item-8', nome: 'Salada Caesar', descricao: 'Alface romana, croutons, parmesão e molho caesar', preco: '32,00', foto: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400', ativo: true },
      { id: 'item-9', nome: 'Carpaccio', descricao: 'Fatias finas de filé mignon com rúcula e parmesão', preco: '48,00', foto: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400', ativo: true },
    ]
  },
  {
    id: 'cat-4',
    nome: 'Sobremesas',
    itens: [
      { id: 'item-10', nome: 'Petit Gateau', descricao: 'Bolo de chocolate com recheio cremoso e sorvete', preco: '28,00', foto: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400', ativo: true },
      { id: 'item-11', nome: 'Pudim de Leite', descricao: 'Pudim tradicional com calda de caramelo', preco: '18,00', foto: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400', ativo: true },
      { id: 'item-12', nome: 'Brownie com Sorvete', descricao: 'Brownie de chocolate com sorvete de creme', preco: '24,00', foto: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=400', ativo: true },
    ]
  },
  {
    id: 'cat-5',
    nome: 'Porções',
    itens: [
      { id: 'item-13', nome: 'Batata Frita', descricao: 'Porção de batata frita crocante', preco: '25,00', foto: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400', ativo: true },
      { id: 'item-14', nome: 'Onion Rings', descricao: 'Anéis de cebola empanados', preco: '28,00', foto: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=400', ativo: true },
      { id: 'item-15', nome: 'Mix de Petiscos', descricao: 'Coxinha, bolinha de queijo e pastéis', preco: '45,00', foto: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f25?w=400', ativo: true },
      {
        id: 'combo-1',
        nome: 'Combo Happy Hour',
        descricao: 'Perfeito para compartilhar! Inclui nossas melhores porções e bebidas.',
        preco: '89,90',
        foto: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400',
        ativo: true,
        isCombo: true,
        showSavings: true,
        savingsAmount: '25,00',
        comboItens: [
          { id: 'cp-1', nome: 'Batata Frita', descricao: 'Porção de batata frita crocante', quantidade: '1', unidade: 'Unid' as const, isFromCardapio: true },
          { id: 'cp-2', nome: 'Onion Rings', descricao: 'Anéis de cebola empanados', quantidade: '1', unidade: 'Unid' as const, isFromCardapio: true },
          { id: 'cp-3', nome: 'Cerveja Heineken', descricao: 'Long neck 330ml', quantidade: '4', unidade: 'Unid' as const, isFromCardapio: true },
        ]
      },
    ]
  },
];

const CardapioPage: React.FC = () => {
  const [categorias, setCategorias] = useState<CardapioCategoria[]>(INITIAL_CATEGORIAS);
  const [activeCatId, setActiveCatId] = useState<string>('cat-1');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const [modalConfig, setModalConfig] = useState<any>({ isOpen: false });
  const [editingItem, setEditingItem] = useState<CardapioItem | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco: '',
    foto: ''
  });

  // Category name editing
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');

  // Drag and drop state
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);

  // File upload state
  const [isUploading, setIsUploading] = useState(false);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Combo modal state
  const [comboModalOpen, setComboModalOpen] = useState(false);
  const [editingCombo, setEditingCombo] = useState<CardapioItem | null>(null);
  const [comboFormData, setComboFormData] = useState({
    nome: '',
    descricao: '',
    preco: '',
    foto: '',
    showSavings: false,
    savingsAmount: ''
  });
  const [comboProducts, setComboProducts] = useState<ComboProduct[]>([]);
  const [newComboProduct, setNewComboProduct] = useState<{
    nome: string;
    descricao: string;
    quantidade: string;
    unidade: 'Unid' | 'g' | 'ml';
    useOriginalDescription: boolean;
  }>({ nome: '', descricao: '', quantidade: '', unidade: 'Unid', useOriginalDescription: true });
  const [selectedProduct, setSelectedProduct] = useState<(CardapioItem & { categoryName: string }) | null>(null);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);
  const comboFileInputRef = useRef<HTMLInputElement>(null);
  const [isComboUploading, setIsComboUploading] = useState(false);

  // Add dropdown state
  const [showAddDropdown, setShowAddDropdown] = useState(false);

  // Filter state
  const [showFilter, setShowFilter] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');

  // Get all products from all categories for autocomplete
  const allProducts = categorias.flatMap(cat =>
    cat.itens.filter(item => !item.isCombo).map(item => ({ ...item, categoryName: cat.nome }))
  );

  // Filtered products for autocomplete
  const filteredProducts = productSearchQuery.length >= 1
    ? allProducts.filter(p =>
      p.nome.toLowerCase().includes(productSearchQuery.toLowerCase())
    ).slice(0, 5)
    : [];

  // File upload handler with validations
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isImage && !isVideo) {
      alert('Formato não suportado. Use imagens (JPG, PNG, GIF, WebP) ou vídeos (MP4, WebM).');
      return;
    }

    // Size validation: 5MB for images, 50MB for videos
    const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`Arquivo muito grande. Limite: ${isVideo ? '50MB' : '5MB'}`);
      return;
    }

    // Video duration validation (max 30 seconds)
    if (isVideo) {
      const video = document.createElement('video');
      video.preload = 'metadata';

      const durationCheck = new Promise<boolean>((resolve) => {
        video.onloadedmetadata = () => {
          URL.revokeObjectURL(video.src);
          if (video.duration > 30) {
            alert('Vídeo muito longo. Limite: 30 segundos.');
            resolve(false);
          } else {
            resolve(true);
          }
        };
        video.onerror = () => {
          alert('Erro ao processar o vídeo.');
          resolve(false);
        };
      });

      video.src = URL.createObjectURL(file);
      const isValid = await durationCheck;
      if (!isValid) return;
    }

    setIsUploading(true);
    try {
      // Convert to base64 for local storage (in production, upload to Supabase storage)
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setFormData(prev => ({ ...prev, foto: base64 }));
        setMediaType(isVideo ? 'video' : 'image');
        setIsUploading(false);
      };
      reader.onerror = () => {
        alert('Erro ao processar o arquivo.');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      alert('Erro ao fazer upload.');
      setIsUploading(false);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const activeCategory = categorias.find(c => c.id === activeCatId);

  // Check scroll capability
  const checkScroll = () => {
    const container = tabsContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [categorias]);

  const scrollTabs = (direction: 'left' | 'right') => {
    const container = tabsContainerRef.current;
    if (container) {
      const scrollAmount = 200;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScroll, 300);
    }
  };

  const handleAddCategoria = () => {
    const nome = prompt("Nome da nova categoria:");
    if (nome) {
      const newCat = { id: `cat-${Date.now()}`, nome, itens: [] };
      setCategorias([...categorias, newCat]);
      setActiveCatId(newCat.id);
    }
  };

  const handleDeleteCategoria = (id: string) => {
    if (confirm("Deseja excluir esta categoria e todos os itens?")) {
      setCategorias(categorias.filter(c => c.id !== id));
      if (activeCatId === id && categorias.length > 1) {
        setActiveCatId(categorias[0].id === id ? categorias[1].id : categorias[0].id);
      }
    }
  };

  const handleUpdateCategoryName = (id: string) => {
    if (editingCategoryName.trim()) {
      setCategorias(prev => prev.map(cat =>
        cat.id === id ? { ...cat, nome: editingCategoryName.trim() } : cat
      ));
    }
    setEditingCategoryId(null);
    setEditingCategoryName('');
  };

  const startEditingCategory = (cat: CardapioCategoria) => {
    setEditingCategoryId(cat.id);
    setEditingCategoryName(cat.nome);
  };

  // Drag and drop handlers
  const handleDragStart = (itemId: string) => {
    setDraggedItemId(itemId);
  };

  const handleDragOver = (e: React.DragEvent, itemId: string) => {
    e.preventDefault();
    if (itemId !== draggedItemId) {
      setDragOverItemId(itemId);
    }
  };

  const handleDrop = (targetItemId: string) => {
    if (!draggedItemId || draggedItemId === targetItemId) {
      setDraggedItemId(null);
      setDragOverItemId(null);
      return;
    }

    setCategorias(prev => prev.map(cat => {
      if (cat.id === activeCatId) {
        const items = [...cat.itens];
        const draggedIdx = items.findIndex(i => i.id === draggedItemId);
        const targetIdx = items.findIndex(i => i.id === targetItemId);

        if (draggedIdx !== -1 && targetIdx !== -1) {
          const [draggedItem] = items.splice(draggedIdx, 1);
          items.splice(targetIdx, 0, draggedItem);
        }

        return { ...cat, itens: items };
      }
      return cat;
    }));

    setDraggedItemId(null);
    setDragOverItemId(null);
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
    setDragOverItemId(null);
  };

  // Combo functions
  const openComboModal = (combo?: CardapioItem) => {
    setEditingCombo(combo || null);
    setComboFormData({
      nome: combo?.nome || '',
      descricao: combo?.descricao || '',
      preco: combo?.preco || '',
      foto: combo?.foto || '',
      showSavings: combo?.showSavings || false,
      savingsAmount: combo?.savingsAmount || ''
    });
    setComboProducts(combo?.comboItens || []);
    setNewComboProduct({ nome: '', quantidade: '' });
    setProductSearchQuery('');
    setShowProductSuggestions(false);
    setComboModalOpen(true);
  };

  // Combo file upload handler
  const handleComboFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Apenas imagens são permitidas para combos.');
      return;
    }

    // Size validation: 5MB for images
    if (file.size > 5 * 1024 * 1024) {
      alert('Imagem muito grande. Limite: 5MB');
      return;
    }

    setIsComboUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setComboFormData(prev => ({ ...prev, foto: base64 }));
        setIsComboUploading(false);
      };
      reader.onerror = () => {
        alert('Erro ao processar o arquivo.');
        setIsComboUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      alert('Erro ao fazer upload.');
      setIsComboUploading(false);
    }

    if (comboFileInputRef.current) {
      comboFileInputRef.current.value = '';
    }
  };

  // Add product from autocomplete
  const addProductFromSuggestion = () => {
    if (!selectedProduct) return;
    if (!newComboProduct.quantidade.trim()) {
      alert('Informe a quantidade do produto');
      return;
    }
    setComboProducts([...comboProducts, {
      id: `cp-${Date.now()}`,
      nome: selectedProduct.nome,
      descricao: newComboProduct.useOriginalDescription ? selectedProduct.descricao : newComboProduct.descricao,
      quantidade: newComboProduct.quantidade,
      unidade: newComboProduct.unidade,
      foto: selectedProduct.foto,
      isFromCardapio: true,
      originalItemId: selectedProduct.id,
      useOriginalDescription: newComboProduct.useOriginalDescription
    }]);
    setProductSearchQuery('');
    setSelectedProduct(null);
    setNewComboProduct({ nome: '', descricao: '', quantidade: '', unidade: 'Unid', useOriginalDescription: true });
    setShowProductSuggestions(false);
  };

  const handleSaveCombo = () => {
    if (!comboFormData.nome.trim()) {
      alert('Informe o nome do combo');
      return;
    }
    if (comboProducts.length < 2) {
      alert('O combo deve ter no mínimo 2 produtos');
      return;
    }

    setCategorias(prev => prev.map(cat => {
      if (cat.id === activeCatId) {
        if (editingCombo) {
          return {
            ...cat,
            itens: cat.itens.map(item =>
              item.id === editingCombo.id
                ? {
                  ...item,
                  nome: comboFormData.nome,
                  descricao: comboFormData.descricao,
                  preco: comboFormData.preco,
                  foto: comboFormData.foto,
                  isCombo: true,
                  comboItens: comboProducts,
                  showSavings: comboFormData.showSavings,
                  savingsAmount: comboFormData.savingsAmount
                }
                : item
            )
          };
        } else {
          return {
            ...cat,
            itens: [...cat.itens, {
              id: `combo-${Date.now()}`,
              nome: comboFormData.nome,
              descricao: comboFormData.descricao,
              preco: comboFormData.preco,
              foto: comboFormData.foto,
              ativo: true,
              isCombo: true,
              comboItens: comboProducts,
              showSavings: comboFormData.showSavings,
              savingsAmount: comboFormData.savingsAmount
            }]
          };
        }
      }
      return cat;
    }));

    setComboModalOpen(false);
    setEditingCombo(null);
    setComboFormData({ nome: '', descricao: '', preco: '', foto: '', showSavings: false, savingsAmount: '' });
    setComboProducts([]);
  };

  const addProductToCombo = () => {
    if (!newComboProduct.nome.trim() || !newComboProduct.quantidade.trim()) {
      alert('Informe o nome e a quantidade do produto');
      return;
    }
    setComboProducts([...comboProducts, {
      id: `cp-${Date.now()}`,
      nome: newComboProduct.nome,
      descricao: newComboProduct.descricao,
      quantidade: newComboProduct.quantidade,
      unidade: newComboProduct.unidade,
      isFromCardapio: false
    }]);
    setNewComboProduct({ nome: '', descricao: '', quantidade: '', unidade: 'Unid', useOriginalDescription: true });
    setSelectedProduct(null);
    setProductSearchQuery('');
  };

  const removeProductFromCombo = (productId: string) => {
    setComboProducts(comboProducts.filter(p => p.id !== productId));
  };

  const openItemModal = (item?: CardapioItem) => {
    setEditingItem(item || null);
    setFormData({
      nome: item?.nome || '',
      descricao: item?.descricao || '',
      preco: item?.preco || '',
      foto: item?.foto || ''
    });
    setModalConfig({
      isOpen: true,
      type: 'confirm-insert',
      title: item ? 'Editar Produto' : 'Novo Produto'
    });
  };

  const handleSaveItem = () => {
    if (!formData.nome.trim()) {
      alert('Informe o nome do produto');
      return;
    }

    setCategorias(prev => prev.map(cat => {
      if (cat.id === activeCatId) {
        if (editingItem) {
          return {
            ...cat,
            itens: cat.itens.map(item =>
              item.id === editingItem.id
                ? { ...item, ...formData }
                : item
            )
          };
        } else {
          return {
            ...cat,
            itens: [...cat.itens, {
              id: `item-${Date.now()}`,
              nome: formData.nome,
              descricao: formData.descricao,
              preco: formData.preco,
              foto: formData.foto,
              ativo: true
            }]
          };
        }
      }
      return cat;
    }));

    setModalConfig({ isOpen: false });
  };

  const handleDeleteItem = (itemId: string) => {
    if (confirm("Excluir este produto?")) {
      setCategorias(prev => prev.map(cat => ({
        ...cat,
        itens: cat.itens.filter(item => item.id !== itemId)
      })));
    }
  };

  const moveItem = (itemId: string, direction: 'up' | 'down') => {
    setCategorias(prev => prev.map(cat => {
      if (cat.id === activeCatId) {
        const idx = cat.itens.findIndex(i => i.id === itemId);
        if (idx === -1) return cat;
        const newIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (newIdx < 0 || newIdx >= cat.itens.length) return cat;

        const newItens = [...cat.itens];
        [newItens[idx], newItens[newIdx]] = [newItens[newIdx], newItens[idx]];
        return { ...cat, itens: newItens };
      }
      return cat;
    }));
  };

  const updateItemField = (itemId: string, field: keyof CardapioItem, value: string) => {
    setCategorias(prev => prev.map(cat => {
      if (cat.id === activeCatId) {
        return {
          ...cat,
          itens: cat.itens.map(item =>
            item.id === itemId ? { ...item, [field]: value } : item
          )
        };
      }
      return cat;
    }));
  };

  const formatPrice = (value: string) => {
    let cleaned = value.replace(/[^\d,\.]/g, '');
    cleaned = cleaned.replace('.', ',');
    return cleaned;
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Cardápio</h1>
          <p className="text-sm text-slate-500">Gerencie os produtos do seu estabelecimento</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.open('/#/public/menu', '_blank')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
          >
            <ExternalLink size={16} />
            Visualizar
          </button>
          <button
            onClick={handleAddCategoria}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-sm transition-all"
          >
            <Plus size={18} />
            Nova Categoria
          </button>
        </div>
      </div>

      {/* Category Tabs - Horizontal Scrollable */}
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-2">
        {canScrollLeft && (
          <button
            onClick={() => scrollTabs('left')}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
          >
            <ChevronLeft size={20} className="text-slate-600 dark:text-slate-300" />
          </button>
        )}

        <div
          ref={tabsContainerRef}
          onScroll={checkScroll}
          className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth px-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categorias.map(cat => (
            <div key={cat.id} className="flex-shrink-0">
              {editingCategoryId === cat.id ? (
                <div className="flex items-center gap-1 px-2 py-1.5 bg-white dark:bg-slate-700 rounded-xl border-2 border-indigo-500">
                  <input
                    type="text"
                    value={editingCategoryName}
                    onChange={(e) => setEditingCategoryName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleUpdateCategoryName(cat.id);
                      if (e.key === 'Escape') { setEditingCategoryId(null); setEditingCategoryName(''); }
                    }}
                    autoFocus
                    className="w-24 px-2 py-1 bg-transparent text-sm font-medium outline-none text-slate-900 dark:text-white"
                  />
                  <button
                    onClick={() => handleUpdateCategoryName(cat.id)}
                    className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => { setEditingCategoryId(null); setEditingCategoryName(''); }}
                    className="p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600 rounded"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setActiveCatId(cat.id)}
                  onDoubleClick={() => startEditingCategory(cat)}
                  className={`
                    px-5 py-3 rounded-xl font-medium text-sm transition-all whitespace-nowrap
                    ${activeCatId === cat.id
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }
                  `}
                  title="Clique duplo para editar"
                >
                  {cat.nome}
                  <span className={`ml-2 text-xs ${activeCatId === cat.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                    ({cat.itens.length})
                  </span>
                </button>
              )}
            </div>
          ))}
        </div>

        {canScrollRight && (
          <button
            onClick={() => scrollTabs('right')}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
          >
            <ChevronRight size={20} className="text-slate-600 dark:text-slate-300" />
          </button>
        )}
      </div>

      {/* Category Header with Actions */}
      {activeCategory && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">{activeCategory.nome}</h2>
            <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
              {activeCategory.itens.length} produto{activeCategory.itens.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500'}`}
                title="Visualização em grade"
              >
                <Grid3X3 size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500'}`}
                title="Visualização em lista"
              >
                <List size={18} />
              </button>
            </div>

            {/* Filter */}
            <div className="relative flex items-center">
              {showFilter ? (
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                  <input
                    type="text"
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    placeholder="Buscar..."
                    autoFocus
                    className="px-3 py-2 bg-transparent text-sm w-40 outline-none text-slate-900 dark:text-white"
                  />
                  <button
                    onClick={() => { setShowFilter(false); setFilterQuery(''); }}
                    className="p-2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowFilter(true)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                  title="Filtrar produtos"
                >
                  <Search size={18} />
                </button>
              )}
            </div>

            {/* Add Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowAddDropdown(!showAddDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm transition-all"
              >
                <Plus size={16} />
                Adicionar
              </button>

              {showAddDropdown && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowAddDropdown(false)}
                  />
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-full mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden z-50 min-w-[180px]">
                    <button
                      onClick={() => {
                        openItemModal();
                        setShowAddDropdown(false);
                      }}
                      className="w-full px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-all"
                    >
                      <ImageIcon size={18} className="text-emerald-500" />
                      Adicionar Produto
                    </button>
                    <button
                      onClick={() => {
                        openComboModal();
                        setShowAddDropdown(false);
                      }}
                      className="w-full px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 border-t border-slate-100 dark:border-slate-700 transition-all"
                    >
                      <Grid3X3 size={18} className="text-amber-500" />
                      Adicionar Combo
                    </button>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => handleDeleteCategoria(activeCategory.id)}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
              title="Excluir categoria"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      )}

      {/* GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
          {activeCategory?.itens
            .filter(item => !filterQuery || item.nome.toLowerCase().includes(filterQuery.toLowerCase()))
            .map((item, idx) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(item.id)}
                onDragOver={(e) => handleDragOver(e, item.id)}
                onDrop={() => handleDrop(item.id)}
                onDragEnd={handleDragEnd}
                className={`
                bg-white dark:bg-slate-900 rounded-xl border overflow-hidden hover:shadow-lg transition-all group cursor-grab active:cursor-grabbing
                ${dragOverItemId === item.id ? 'border-indigo-500 border-2 scale-105' : 'border-slate-100 dark:border-slate-800'}
                ${draggedItemId === item.id ? 'opacity-50' : 'opacity-100'}
              `}
              >
                {/* Product Image */}
                <div className="aspect-square bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                  {item.foto ? (
                    <img src={item.foto} alt={item.nome} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon size={32} className="text-slate-300 dark:text-slate-600" />
                    </div>
                  )}
                  {/* Combo Badge */}
                  {item.isCombo && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-md flex items-center gap-1">
                      <Layers size={10} />
                      COMBO
                    </div>
                  )}
                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => item.isCombo ? openComboModal(item) : openItemModal(item)}
                      className="p-2 bg-white text-slate-700 rounded-lg hover:bg-slate-100 transition-all"
                      title="Editar"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-xs truncate flex-1">{item.nome}</h3>
                    {item.isCombo && (
                      <span className="text-[9px] text-indigo-500 font-medium">{item.comboItens?.length} itens</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-2 min-h-[24px]">
                    {item.descricao || 'Sem descrição'}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      R$ {item.preco || '0,00'}
                    </span>
                    {item.isCombo && item.showSavings && item.savingsAmount && (
                      <span className="text-[9px] text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded">
                        -R${item.savingsAmount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

          {/* Add Product Card */}
          <button
            onClick={() => openItemModal()}
            className="aspect-square bg-slate-50 dark:bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-indigo-600 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
          >
            <Plus size={28} strokeWidth={1.5} />
            <span className="font-medium text-xs">Adicionar</span>
          </button>
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === 'list' && (
        <div className="space-y-2">
          {activeCategory?.itens
            .filter(item => !filterQuery || item.nome.toLowerCase().includes(filterQuery.toLowerCase()))
            .map((item, idx) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(item.id)}
                onDragOver={(e) => handleDragOver(e, item.id)}
                onDrop={() => handleDrop(item.id)}
                onDragEnd={handleDragEnd}
                className={`
                bg-white dark:bg-slate-900 rounded-xl border p-3 flex items-center gap-3 cursor-grab active:cursor-grabbing transition-all
                ${dragOverItemId === item.id ? 'border-indigo-500 border-2 scale-[1.02]' : 'border-slate-100 dark:border-slate-800'}
                ${draggedItemId === item.id ? 'opacity-50' : 'opacity-100'}
              `}
              >
                {/* Drag Handle */}
                <div className="flex-shrink-0 text-slate-300 dark:text-slate-600">
                  <GripVertical size={20} />
                </div>

                {/* Image Thumbnail with Combo Badge */}
                <div className="relative flex-shrink-0">
                  <div
                    onClick={() => item.isCombo ? openComboModal(item) : openItemModal(item)}
                    className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all group"
                    title="Clique para editar"
                  >
                    {item.foto ? (
                      <img src={item.foto} alt={item.nome} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon size={18} className="text-slate-300 dark:text-slate-600" />
                      </div>
                    )}
                  </div>
                  {/* Combo Badge */}
                  {item.isCombo && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                      <Layers size={10} className="text-white" />
                    </div>
                  )}
                </div>

                {/* Editable Fields - 20% nome, 65% descrição, 15% preço */}
                <div className="flex-1 flex items-center gap-3">
                  {/* Nome - 20% */}
                  <input
                    type="text"
                    value={item.nome}
                    onChange={(e) => updateItemField(item.id, 'nome', e.target.value)}
                    placeholder="Nome do produto"
                    className="w-[20%] min-w-[100px] px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                  {/* Descrição - 65% */}
                  <input
                    type="text"
                    value={item.descricao}
                    onChange={(e) => updateItemField(item.id, 'descricao', e.target.value)}
                    placeholder="Descrição do produto"
                    className="w-[65%] flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                  {/* Preço - 15% */}
                  <div className="w-[15%] min-w-[90px] flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 text-sm font-medium">R$</span>
                      <input
                        type="text"
                        value={item.preco}
                        onChange={(e) => updateItemField(item.id, 'preco', formatPrice(e.target.value))}
                        placeholder="0,00"
                        className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-emerald-700 dark:text-emerald-400 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all flex-shrink-0"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

          {/* Add Item Button */}
          <button
            onClick={() => openItemModal()}
            className="w-full py-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 text-slate-400 hover:text-indigo-600 hover:border-indigo-300 transition-all"
          >
            <Plus size={20} />
            <span className="font-medium text-sm">Adicionar Produto</span>
          </button>
        </div>
      )}

      {/* Empty State */}
      {activeCategory?.itens.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon size={64} className="mx-auto text-slate-200 dark:text-slate-700 mb-4" />
          <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">Nenhum produto cadastrado</h3>
          <p className="text-sm text-slate-400 mb-4">Adicione produtos a esta categoria</p>
          <button
            onClick={() => openItemModal()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all"
          >
            Adicionar Produto
          </button>
        </div>
      )}

      {/* Product Modal */}
      <Modal
        isOpen={modalConfig.isOpen}
        type={modalConfig.type}
        title={modalConfig.title}
        maxWidth="max-w-lg"
        content={
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2">Imagem ou Vídeo do produto</label>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Upload area */}
              <div
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl aspect-video flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 cursor-pointer hover:border-indigo-300 transition-all relative overflow-hidden"
              >
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 size={32} className="text-indigo-500 animate-spin" />
                    <span className="text-xs text-slate-400">Processando...</span>
                  </div>
                ) : formData.foto ? (
                  <>
                    {mediaType === 'video' || formData.foto.startsWith('data:video') ? (
                      <video
                        src={formData.foto}
                        className="w-full h-full object-cover rounded-xl"
                        controls
                        muted
                      />
                    ) : (
                      <img src={formData.foto} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                    )}
                    {/* Remove button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData(prev => ({ ...prev, foto: '' }));
                        setMediaType(null);
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <>
                    <Upload size={32} className="text-slate-300 mb-2" />
                    <span className="text-xs text-slate-500 font-medium">Clique para enviar</span>
                    <span className="text-[10px] text-slate-400 mt-1">Imagem (até 5MB) ou Vídeo (até 50MB, máx 30s)</span>
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2">Nome do produto <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Coca-Cola 350ml"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2">Descrição</label>
              <textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Ingredientes ou detalhes do produto..."
                rows={3}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2">Preço (R$)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">R$</span>
                <input
                  type="text"
                  value={formData.preco}
                  onChange={(e) => setFormData({ ...formData, preco: formatPrice(e.target.value) })}
                  placeholder="10,99"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-semibold"
                />
              </div>
            </div>
          </div>
        }
        onConfirm={handleSaveItem}
        confirmText={editingItem ? 'Salvar Alterações' : 'Adicionar Produto'}
        onClose={() => setModalConfig({ isOpen: false })}
      />
      {/* Combo Modal - Two Column Layout */}
      {comboModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingCombo ? 'Editar Combo' : 'Novo Combo'}
              </h2>
              <button
                onClick={() => setComboModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Two Column Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Photo, Name, Description, Price, Savings */}
                <div className="space-y-4">
                  {/* Foto do Combo */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-2">Foto do Combo</label>
                    <input
                      ref={comboFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleComboFileUpload}
                      className="hidden"
                    />
                    <div
                      onClick={() => !isComboUploading && comboFileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl h-40 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800 cursor-pointer hover:border-amber-300 transition-all relative overflow-hidden"
                    >
                      {isComboUploading ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 size={24} className="text-amber-500 animate-spin" />
                          <span className="text-xs text-slate-400">Processando...</span>
                        </div>
                      ) : comboFormData.foto ? (
                        <>
                          <img src={comboFormData.foto} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setComboFormData(prev => ({ ...prev, foto: '' }));
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all"
                          >
                            <X size={12} />
                          </button>
                        </>
                      ) : (
                        <>
                          <Upload size={24} className="text-slate-300 mb-1" />
                          <span className="text-xs text-slate-500">Clique para enviar (até 5MB)</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Nome */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-2">Nome do Combo <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={comboFormData.nome}
                      onChange={(e) => setComboFormData({ ...comboFormData, nome: e.target.value })}
                      placeholder="Ex: Combo Família"
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Descrição */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-2">Descrição</label>
                    <textarea
                      value={comboFormData.descricao}
                      onChange={(e) => setComboFormData({ ...comboFormData, descricao: e.target.value })}
                      placeholder="Descrição do combo..."
                      rows={2}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500/20 resize-none text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Preço */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-2">Valor do Combo</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">R$</span>
                      <input
                        type="text"
                        value={comboFormData.preco}
                        onChange={(e) => setComboFormData({ ...comboFormData, preco: formatPrice(e.target.value) })}
                        placeholder="59,90"
                        className="w-full pl-12 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Economia Toggle */}
                  <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 rounded-xl px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Mostrar economia</p>
                      <p className="text-xs text-slate-500">Ex: "Cliente economiza R$ 15,00"</p>
                    </div>
                    <button
                      onClick={() => setComboFormData({ ...comboFormData, showSavings: !comboFormData.showSavings })}
                      className={`relative w-12 h-6 rounded-full transition-all ${comboFormData.showSavings ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${comboFormData.showSavings ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>

                  {/* Savings Amount */}
                  {comboFormData.showSavings && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-2">Valor da economia</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 text-sm font-medium">R$</span>
                        <input
                          type="text"
                          value={comboFormData.savingsAmount}
                          onChange={(e) => setComboFormData({ ...comboFormData, savingsAmount: formatPrice(e.target.value) })}
                          placeholder="15,00"
                          className="w-full pl-12 pr-4 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-sm font-semibold text-emerald-700 dark:text-emerald-400 outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Products List */}
                <div className="space-y-4">
                  <label className="block text-xs font-semibold text-slate-500">Produtos incluídos <span className="text-red-500">*</span></label>

                  {/* Products List with Thumbnails */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 min-h-[200px] max-h-[280px] overflow-y-auto">
                    {comboProducts.length > 0 ? (
                      <div className="space-y-2">
                        {comboProducts.map((product) => (
                          <div key={product.id} className="flex items-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2">
                            {/* Thumbnail */}
                            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                              {product.foto ? (
                                <img src={product.foto} alt={product.nome} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ImageIcon size={14} className="text-slate-300" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{product.nome}</p>
                              <p className="text-xs text-slate-400 truncate">{product.descricao || 'Sem descrição'}</p>
                            </div>
                            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-100 dark:bg-indigo-900/40 px-2 py-0.5 rounded whitespace-nowrap">
                              {product.quantidade} {product.unidade}
                            </span>
                            <button
                              onClick={() => removeProductFromCombo(product.id)}
                              className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded flex-shrink-0"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 py-8">
                        <Grid3X3 size={32} className="mb-2 opacity-40" />
                        <p className="text-sm">Nenhum produto adicionado</p>
                      </div>
                    )}
                  </div>

                  {/* Add Product Section */}
                  <div className="bg-slate-100 dark:bg-slate-700/50 rounded-xl p-4 space-y-3">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Adicionar produto</p>

                    {/* Product Search/Name */}
                    <div className="relative">
                      <input
                        type="text"
                        value={productSearchQuery}
                        onChange={(e) => {
                          setProductSearchQuery(e.target.value);
                          setNewComboProduct({ ...newComboProduct, nome: e.target.value });
                          setShowProductSuggestions(true);
                          setSelectedProduct(null);
                        }}
                        onFocus={() => setShowProductSuggestions(true)}
                        placeholder="Buscar ou digitar nome do produto..."
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white"
                      />

                      {/* Suggestions Dropdown */}
                      {showProductSuggestions && filteredProducts.length > 0 && !selectedProduct && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden z-20 max-h-40 overflow-y-auto">
                          {filteredProducts.map((product) => (
                            <button
                              key={product.id}
                              onClick={() => {
                                setSelectedProduct(product);
                                setProductSearchQuery(product.nome);
                                setNewComboProduct({ ...newComboProduct, nome: product.nome, descricao: product.descricao });
                                setShowProductSuggestions(false);
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 border-b border-slate-100 dark:border-slate-700 last:border-0"
                            >
                              <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded overflow-hidden flex-shrink-0">
                                {product.foto ? (
                                  <img src={product.foto} alt={product.nome} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <ImageIcon size={12} className="text-slate-300" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{product.nome}</p>
                                <p className="text-xs text-slate-400">{product.categoryName}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Description option for existing products */}
                    {selectedProduct && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setNewComboProduct({ ...newComboProduct, useOriginalDescription: true })}
                            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${newComboProduct.useOriginalDescription ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'}`}
                          >
                            Usar descrição original
                          </button>
                          <button
                            onClick={() => setNewComboProduct({ ...newComboProduct, useOriginalDescription: false })}
                            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${!newComboProduct.useOriginalDescription ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'}`}
                          >
                            Nova descrição
                          </button>
                        </div>
                        {!newComboProduct.useOriginalDescription && (
                          <textarea
                            value={newComboProduct.descricao}
                            onChange={(e) => setNewComboProduct({ ...newComboProduct, descricao: e.target.value })}
                            placeholder="Digite a nova descrição..."
                            rows={2}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm resize-none text-slate-900 dark:text-white"
                          />
                        )}
                      </div>
                    )}

                    {/* Description for new products (not from cardapio) */}
                    {!selectedProduct && productSearchQuery && (
                      <textarea
                        value={newComboProduct.descricao}
                        onChange={(e) => setNewComboProduct({ ...newComboProduct, descricao: e.target.value })}
                        placeholder="Descrição do produto..."
                        rows={2}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm resize-none text-slate-900 dark:text-white"
                      />
                    )}

                    {/* Quantity and Unit */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newComboProduct.quantidade}
                        onChange={(e) => setNewComboProduct({ ...newComboProduct, quantidade: e.target.value })}
                        placeholder="Qtd"
                        className="w-20 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm outline-none text-slate-900 dark:text-white text-center"
                      />
                      <div className="flex bg-white dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-600 overflow-hidden">
                        {(['Unid', 'g', 'ml'] as const).map((unit) => (
                          <button
                            key={unit}
                            onClick={() => setNewComboProduct({ ...newComboProduct, unidade: unit })}
                            className={`px-3 py-2 text-xs font-medium transition-all ${newComboProduct.unidade === unit ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                          >
                            {unit}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => {
                          if (selectedProduct) {
                            addProductFromSuggestion();
                          } else {
                            addProductToCombo();
                          }
                        }}
                        className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                      >
                        <Plus size={16} />
                        Adicionar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-white dark:bg-slate-900 px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 flex-shrink-0">
              <button
                onClick={() => setComboModalOpen(false)}
                className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-sm font-medium transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveCombo}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-all"
              >
                {editingCombo ? 'Salvar Alterações' : 'Criar Combo'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default CardapioPage;
