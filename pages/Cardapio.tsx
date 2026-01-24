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
  Layers,
  MoreVertical,
  Eye,
  EyeOff,
  Sparkles,
  Star
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
  visivel?: boolean; // New property for visibility
}

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

interface CardapioCategoria {
  id: string;
  nome: string;
  tipo?: 'padrao' | 'especial';
  destaque?: DestaqueConteudo;
  itens: CardapioItem[];
}


const INITIAL_CATEGORIAS: CardapioCategoria[] = [
  {
    id: 'cat-1',
    nome: 'Bebidas',
    itens: [
      { id: 'item-1', nome: 'Coca-Cola 350ml', descricao: 'Refrigerante gelado', preco: '6,00', foto: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400', ativo: true, visivel: true },
      { id: 'item-2', nome: 'Suco Natural Laranja', descricao: 'Suco de laranja natural 500ml', preco: '12,00', foto: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400', ativo: true, visivel: true },
      { id: 'item-3', nome: 'Água Mineral 500ml', descricao: 'Água mineral sem gás', preco: '4,00', foto: 'https://images.unsplash.com/photo-1559839914-17aae19cec71?w=400', ativo: true, visivel: true },
      { id: 'item-4', nome: 'Cerveja Heineken', descricao: 'Long neck 330ml', preco: '14,00', foto: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400', ativo: true, visivel: true },
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
  const [categorias, setCategorias] = useState<CardapioCategoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
    foto: '',
    visivel: true
  });

  // Category name editing
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [categoryMenuOpen, setCategoryMenuOpen] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number, left: number }>({ top: 0, left: 0 });

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

  // Hero images state (up to 3 images for menu cover)
  interface HeroImage {
    id: string;
    foto: string;
    titulo: string; // max 20 characters
    subtitulo: string; // max 50 characters
    showDescription: boolean;
  }
  const [heroImagesExpanded, setHeroImagesExpanded] = useState(false);
  const [heroImages, setHeroImages] = useState<HeroImage[]>([
    { id: 'hero-1', foto: '', titulo: '', subtitulo: '', showDescription: false },
    { id: 'hero-2', foto: '', titulo: '', subtitulo: '', showDescription: false },
    { id: 'hero-3', foto: '', titulo: '', subtitulo: '', showDescription: false }
  ]);
  const [uploadingHeroIndex, setUploadingHeroIndex] = useState<number | null>(null);
  const heroFileInputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  // Section expanded states
  const [productsExpanded, setProductsExpanded] = useState(false); // Sections collapsed by default
  const [splashExpanded, setSplashExpanded] = useState(false);

  // Menu Online state
  const [menuOnlineEnabled, setMenuOnlineEnabled] = useState(true);
  const [isUpdatingMenuStatus, setIsUpdatingMenuStatus] = useState(false);

  // Function to focus on one section and collapse others
  const focusSection = (section: 'hero' | 'products' | 'splash', resetCategory = false, shouldScroll = true) => {
    setHeroImagesExpanded(section === 'hero');
    setProductsExpanded(section === 'products');
    setSplashExpanded(section === 'splash');

    if (resetCategory && categorias.length > 0) {
      setActiveCatId(categorias[0].id);
    }

    // Scroll to top only if requested
    if (shouldScroll) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Custom Modals State
  const [deleteCategoryModal, setDeleteCategoryModal] = useState<{ isOpen: boolean, categoryId: string | null }>({ isOpen: false, categoryId: null });
  const [deleteItemModal, setDeleteItemModal] = useState<{ isOpen: boolean, itemId: string | null }>({ isOpen: false, itemId: null });
  const [addCategoryModal, setAddCategoryModal] = useState<{ isOpen: boolean, name: string, type: 'padrao' | 'especial' }>({ isOpen: false, name: '', type: 'padrao' });
  const [itemMenuOpen, setItemMenuOpen] = useState<string | null>(null);
  const [itemMenuPosition, setItemMenuPosition] = useState<{ top: number, left: number }>({ top: 0, left: 0 });

  // Destaque Editor State
  const [destaqueModalOpen, setDestaqueModalOpen] = useState(false);
  const [editingDestaqueCategory, setEditingDestaqueCategory] = useState<CardapioCategoria | null>(null);
  const [destaqueFormData, setDestaqueFormData] = useState<{
    titulo: string;
    descricao: string;
    preco: string;
    midias: { url: string, type: 'image' | 'video', duration?: number }[];
  }>({ titulo: '', descricao: '', preco: '', midias: [] });
  const [isDestaqueUploading, setIsDestaqueUploading] = useState(false);
  const destaqueFileInputRef = useRef<HTMLInputElement>(null);

  // ... (rest of the code)

  const handleAddCategoria = () => {
    setAddCategoryModal({ isOpen: true, name: '', type: 'padrao' });
  };

  const handleConfirmAddCategoria = async () => {
    if (addCategoryModal.name.trim()) {
      try {
        const { data, error } = await supabase
          .schema('gestaohashi')
          .from('categorias')
          .insert({
            nome: addCategoryModal.name.trim(),
            ordem: categorias.length,
            tipo: addCategoryModal.type
          })
          .select()
          .single();

        if (error) throw error;

        // If special, create empty destaque entry
        if (addCategoryModal.type === 'especial') {
          await supabase
            .schema('gestaohashi')
            .from('destaques_conteudo')
            .insert({ categoria_id: data.id, midias: [] });
        }

        const newCat: CardapioCategoria = {
          id: data.id,
          nome: data.nome,
          tipo: data.tipo as 'padrao' | 'especial',
          destaque: addCategoryModal.type === 'especial' ? { id: 'temp', categoriaId: data.id, titulo: '', descricao: '', midias: [], ativo: true } : undefined,
          itens: []
        };
        setCategorias([...categorias, newCat]);
        setActiveCatId(newCat.id);
        setAddCategoryModal({ isOpen: false, name: '', type: 'padrao' });
      } catch (error: any) {
        console.error('Error adding category:', error);
        alert('Erro ao adicionar categoria: ' + (error.message || 'Erro desconhecido.'));
      }
    }
  };

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
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
      const filePath = `produtos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('cardapio')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('cardapio')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, foto: publicUrl }));
      setMediaType(isVideo ? 'video' : 'image');
    } catch (error: any) {
      console.error('Error uploading file:', error);
      alert('Erro ao fazer upload da imagem: ' + (error.message || 'Erro desconhecido.'));
    } finally {
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

  // Fetch data on mount
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch categories
      const { data: catData, error: catError } = await supabase
        .schema('gestaohashi')
        .from('categorias')
        .select('*')
        .order('ordem', { ascending: true });

      if (catError) throw catError;

      // Fetch special content (destaques)
      const { data: destaquesData, error: destaquesError } = await supabase
        .schema('gestaohashi')
        .from('destaques_conteudo')
        .select('*');

      if (destaquesError && destaquesError.code !== '42P01') console.error('Error fetching destaques:', destaquesError);

      // Fetch products for these categories
      const { data: prodData, error: prodError } = await supabase
        .schema('gestaohashi')
        .from('produtos')
        .select('*')
        .order('ordem', { ascending: true });

      if (prodError) throw prodError;

      // Fetch combo items
      const { data: comboItemData, error: comboItemError } = await supabase
        .schema('gestaohashi')
        .from('combo_produtos')
        .select('*');

      if (comboItemError) throw comboItemError;

      // Format data
      const formattedCategorias: CardapioCategoria[] = catData.map(cat => ({
        id: cat.id,
        nome: cat.nome,
        tipo: cat.tipo || 'padrao',
        destaque: destaquesData?.find(d => d.categoria_id === cat.id),
        itens: prodData
          .filter(p => p.categoria_id === cat.id)
          .map(p => ({
            id: p.id,
            nome: p.nome,
            descricao: p.descricao || '',
            preco: p.preco?.toString().replace('.', ',') || '0,00',
            foto: p.foto_url,
            ativo: p.ativo ?? true,
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
                foto: ci.foto_url,
                isFromCardapio: !!ci.produto_id,
                originalItemId: ci.produto_id
              }))
          }))
      }));

      setCategorias(formattedCategorias);

      // Fetch Menu Status
      try {
        const { data: configData } = await supabase
          .schema('gestaohashi')
          .from('config')
          .select('value')
          .eq('key', 'menu_online_enabled')
          .single();

        if (configData) {
          setMenuOnlineEnabled(configData.value === 'true');
        } else {
          // Default to enabled if not found
          setMenuOnlineEnabled(true);
        }
      } catch (e) {
        console.warn('Menu config not found');
      }

      // Fetch Hero Images
      try {
        const { data: heroData, error: heroError } = await supabase
          .schema('gestaohashi')
          .from('hero_images')
          .select('*')
          .order('ordem', { ascending: true });

        if (!heroError && heroData && heroData.length > 0) {
          const formattedHeroes = [0, 1, 2].map(idx => {
            const h = heroData.find(hd => hd.ordem === idx);
            return h ? {
              id: h.id,
              foto: h.foto_url,
              titulo: h.titulo || '',
              subtitulo: h.subtitulo || '',
              showDescription: h.show_description ?? false
            } : { id: `hero-${idx}`, foto: '', titulo: '', subtitulo: '', showDescription: false };
          });
          setHeroImages(formattedHeroes);
        }
      } catch (e) {
        console.warn('Hero images table might not be ready yet.');
      }

    } catch (error: any) {
      console.error('Error fetching cardapio data:', error);
      // Only alert if it's not a common "table not found" during setup
      if (error.code !== 'PGRST116' && error.code !== '42P01') {
        alert('Erro ao carregar dados: ' + (error.message || 'Verifique sua conexão.'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [categorias]);


  // Destaque Handlers
  const handleDestaqueFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (destaqueFormData.midias.length + files.length > 5) {
      alert('Máximo de 5 mídias por destaque.');
      return;
    }

    setIsDestaqueUploading(true);
    try {
      const newMidias = [...destaqueFormData.midias];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isVideo = file.type.startsWith('video/');
        const isImage = file.type.startsWith('image/');

        if (!isImage && !isVideo) {
          alert(`Arquivo ${file.name} ignorado. Formato inválido.`);
          continue;
        }

        const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
        if (file.size > maxSize) {
          alert(`Arquivo ${file.name} muito grande.`);
          continue;
        }

        // Validate video duration
        if (isVideo) {
          const video = document.createElement('video');
          video.preload = 'metadata';
          const durationCheck = new Promise<number>((resolve) => {
            video.onloadedmetadata = () => { URL.revokeObjectURL(video.src); resolve(video.duration); };
            video.onerror = () => { resolve(0); };
          });
          video.src = URL.createObjectURL(file);
          const duration = await durationCheck;
          if (duration > 30) {
            alert(`Vídeo ${file.name} ignorado. Máximo 30 segundos.`);
            continue;
          }
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `destaques/${Math.random()}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('cardapio').upload(fileName, file);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('cardapio').getPublicUrl(fileName);
        newMidias.push({ url: publicUrl, type: isVideo ? 'video' : 'image', duration: isVideo ? undefined : 4 });
      }

      setDestaqueFormData(prev => ({ ...prev, midias: newMidias }));
    } catch (error: any) {
      console.error('Error uploading destaque media:', error);
      alert('Erro ao fazer upload: ' + (error.message || 'Erro desconhecido.'));
    } finally {
      setIsDestaqueUploading(false);
      if (destaqueFileInputRef.current) destaqueFileInputRef.current.value = '';
    }
  };

  const openDestaqueEditor = (cat: CardapioCategoria) => {
    setEditingDestaqueCategory(cat);
    if (cat.destaque) {
      setDestaqueFormData({
        titulo: cat.destaque.titulo || '',
        descricao: cat.destaque.descricao || '',
        preco: cat.destaque.preco || '',
        midias: cat.destaque.midias || []
      });
    } else {
      setDestaqueFormData({ titulo: '', descricao: '', preco: '', midias: [] });
    }
    setDestaqueModalOpen(true);
  };

  const handleSaveDestaque = async () => {
    if (!editingDestaqueCategory) return;
    if (!destaqueFormData.titulo.trim()) {
      alert('O título é obrigatório.');
      return;
    }
    if (destaqueFormData.midias.length === 0) {
      alert('Adicione pelo menos uma imagem ou vídeo.');
      return;
    }

    try {
      const payload = {
        categoria_id: editingDestaqueCategory.id,
        titulo: destaqueFormData.titulo,
        descricao: destaqueFormData.descricao,
        preco: destaqueFormData.preco ? parseFloat(destaqueFormData.preco.replace(',', '.')) : null,
        midias: destaqueFormData.midias,
        ativo: true
      };

      // Check if entry exists to determine update or insert (upsert logic via delete/insert or just upsert if unique constraint)
      // Since we have ON CONFLICT (categoria_id) DO UPDATE in standard SQL, but Supabase JS .upsert works well
      const { data, error } = await supabase
        .schema('gestaohashi')
        .from('destaques_conteudo')
        .upsert(payload, { onConflict: 'categoria_id' })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setCategorias(prev => prev.map(c => {
        if (c.id === editingDestaqueCategory.id) {
          return {
            ...c,
            destaque: {
              id: data.id,
              categoriaId: data.categoria_id,
              titulo: data.titulo,
              descricao: data.descricao,
              preco: data.preco?.toString().replace('.', ','),
              midias: data.midias,
              ativo: data.ativo
            }
          };
        }
        return c;
      }));

      setDestaqueModalOpen(false);
      alert('Conteúdo especial salvo com sucesso!');
    } catch (error: any) {
      console.error('Error saving destaque:', error);
      alert('Erro ao salvar destaque: ' + error.message);
    }
  };

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



  const handleDeleteCategoria = (id: string) => {
    setDeleteCategoryModal({ isOpen: true, categoryId: id });
  };

  const handleConfirmDeleteCategoria = async () => {
    if (deleteCategoryModal.categoryId) {
      try {
        const { error } = await supabase
          .schema('gestaohashi')
          .from('categorias')
          .delete()
          .eq('id', deleteCategoryModal.categoryId);

        if (error) throw error;

        setCategorias(categorias.filter(c => c.id !== deleteCategoryModal.categoryId));
        if (activeCatId === deleteCategoryModal.categoryId && categorias.length > 1) {
          const remaining = categorias.filter(c => c.id !== deleteCategoryModal.categoryId);
          if (remaining.length > 0) {
            setActiveCatId(remaining[0].id);
          }
        }
        setDeleteCategoryModal({ isOpen: false, categoryId: null });
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Erro ao excluir categoria do banco de dados.');
      }
    }
  };

  const handleUpdateCategoryName = async (id: string) => {
    if (editingCategoryName.trim()) {
      try {
        const { error } = await supabase
          .schema('gestaohashi')
          .from('categorias')
          .update({ nome: editingCategoryName.trim() })
          .eq('id', id);

        if (error) throw error;

        setCategorias(prev => prev.map(cat =>
          cat.id === id ? { ...cat, nome: editingCategoryName.trim() } : cat
        ));
      } catch (error) {
        console.error('Error updating category name:', error);
        alert('Erro ao atualizar nome da categoria.');
      }
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
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
      const filePath = `combos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('cardapio')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('cardapio')
        .getPublicUrl(filePath);

      setComboFormData(prev => ({ ...prev, foto: publicUrl }));
    } catch (error: any) {
      console.error('Error uploading combo image:', error);
      alert('Erro ao fazer upload da imagem do combo: ' + (error.message || 'Erro desconhecido.'));
    } finally {
      setIsComboUploading(false);
    }

    if (comboFileInputRef.current) {
      comboFileInputRef.current.value = '';
    }
  };

  // Hero image upload handler
  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem válida.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB.');
      return;
    }

    setUploadingHeroIndex(index);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
      const filePath = `hero/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('cardapio')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('cardapio')
        .getPublicUrl(filePath);

      setHeroImages(prev => prev.map((img, idx) =>
        idx === index ? { ...img, foto: publicUrl } : img
      ));
    } catch (error: any) {
      console.error('Error uploading hero image:', error);
      alert('Erro ao fazer upload da imagem de capa: ' + (error.message || 'Erro desconhecido.'));
    } finally {
      setUploadingHeroIndex(null);
    }

    if (heroFileInputRefs[index]?.current) {
      heroFileInputRefs[index].current!.value = '';
    }
  };

  const handleSaveHero = async () => {
    try {
      const promises = heroImages.map((hero, idx) => {
        const payload = {
          foto_url: hero.foto,
          titulo: hero.titulo,
          subtitulo: hero.subtitulo,
          show_description: hero.showDescription,
          ordem: idx
        };

        if (hero.id && !hero.id.startsWith('hero-')) {
          return supabase
            .schema('gestaohashi')
            .from('hero_images')
            .update(payload)
            .eq('id', hero.id);
        } else {
          return supabase
            .schema('gestaohashi')
            .from('hero_images')
            .insert(payload);
        }
      });

      await Promise.all(promises);
      alert('Imagens de capa salvas com sucesso!');
      await fetchData();
    } catch (error) {
      console.error('Error saving hero images:', error);
      alert('Erro ao salvar imagens de capa.');
    }
  };

  // Update hero image field
  const updateHeroImageField = (index: number, field: 'titulo' | 'subtitulo' | 'showDescription', value: string | boolean) => {
    setHeroImages(prev => prev.map((img, idx) =>
      idx === index ? { ...img, [field]: value } : img
    ));
  };

  // Remove hero image
  const removeHeroImage = (index: number) => {
    setHeroImages(prev => prev.map((img, idx) =>
      idx === index ? { ...img, foto: '', titulo: '', subtitulo: '', showDescription: false } : img
    ));
  };
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

  const handleSaveCombo = async () => {
    if (!comboFormData.nome.trim()) {
      alert('Informe o nome do combo');
      return;
    }
    if (comboProducts.length < 2) {
      alert('O combo deve ter no mínimo 2 produtos');
      return;
    }

    try {
      const priceVal = parseFloat(comboFormData.preco.replace(',', '.')) || 0;
      const savingsVal = parseFloat(comboFormData.savingsAmount.replace(',', '.')) || 0;

      let comboId = editingCombo?.id;

      const comboPayload = {
        nome: comboFormData.nome,
        descricao: comboFormData.descricao,
        preco: priceVal,
        foto_url: comboFormData.foto,
        is_combo: true,
        show_savings: comboFormData.showSavings,
        savings_amount: savingsVal,
        categoria_id: activeCatId,
        ativo: true,
        visivel: true
      };

      if (editingCombo) {
        const { error } = await supabase
          .schema('gestaohashi')
          .from('produtos')
          .update(comboPayload)
          .eq('id', comboId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .schema('gestaohashi')
          .from('produtos')
          .insert(comboPayload)
          .select()
          .single();
        if (error) throw error;
        comboId = data.id;
      }

      // Sync combo items
      // 1. Delete old items
      const { error: delError } = await supabase
        .schema('gestaohashi')
        .from('combo_produtos')
        .delete()
        .eq('combo_id', comboId);
      if (delError) throw delError;

      // 2. Insert new items
      const itemsPayload = comboProducts.map(cp => ({
        combo_id: comboId,
        produto_id: cp.isFromCardapio ? cp.originalItemId : null,
        nome: cp.nome,
        descricao: cp.descricao,
        quantidade: cp.quantidade,
        unidade: cp.unidade,
        foto_url: cp.foto
      }));

      const { error: insError } = await supabase
        .schema('gestaohashi')
        .from('combo_produtos')
        .insert(itemsPayload);
      if (insError) throw insError;

      await fetchData(); // Refresh all to reflect changes
      setComboModalOpen(false);
      setEditingCombo(null);
      setComboFormData({ nome: '', descricao: '', preco: '', foto: '', showSavings: false, savingsAmount: '' });
      setComboProducts([]);
    } catch (error) {
      console.error('Error saving combo:', error);
      alert('Erro ao salvar combo no banco de dados.');
    }
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
      foto: item?.foto || '',
      visivel: item?.visivel ?? true
    });
    setModalConfig({
      isOpen: true,
      type: 'confirm-insert',
      title: item ? 'Editar Produto' : 'Novo Produto'
    });
  };

  const handleSaveItem = async () => {
    if (!formData.nome.trim()) {
      alert('Informe o nome do produto');
      return;
    }

    try {
      const priceVal = parseFloat(formData.preco.replace(',', '.')) || 0;
      const payload = {
        nome: formData.nome,
        descricao: formData.descricao,
        preco: priceVal,
        foto_url: formData.foto,
        visivel: formData.visivel,
        categoria_id: activeCatId,
        ativo: true,
        is_combo: false
      };

      if (editingItem) {
        const { error } = await supabase
          .schema('gestaohashi')
          .from('produtos')
          .update(payload)
          .eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .schema('gestaohashi')
          .from('produtos')
          .insert(payload);
        if (error) throw error;
      }

      await fetchData();
      setModalConfig({ isOpen: false });
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Erro ao salvar produto no banco de dados.');
    }
  };

  const handleDeleteItem = (itemId: string) => {
    setDeleteItemModal({ isOpen: true, itemId });
  };

  const handleConfirmDeleteItem = async () => {
    if (deleteItemModal.itemId) {
      try {
        const { error } = await supabase
          .schema('gestaohashi')
          .from('produtos')
          .delete()
          .eq('id', deleteItemModal.itemId);

        if (error) throw error;

        await fetchData();
        setDeleteItemModal({ isOpen: false, itemId: null });
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Erro ao excluir produto.');
      }
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

  const toggleVisibility = async (itemId: string) => {
    const item = activeCategory?.itens.find(i => i.id === itemId);
    if (!item) return;

    try {
      const { error } = await supabase
        .schema('gestaohashi')
        .from('produtos')
        .update({ visivel: !item.visivel })
        .eq('id', itemId);

      if (error) throw error;

      setCategorias(prev => prev.map(cat => {
        if (cat.id === activeCatId) {
          return {
            ...cat,
            itens: cat.itens.map(item =>
              item.id === itemId ? { ...item, visivel: !item.visivel } : item
            )
          };
        }
        return cat;
      }));
    } catch (error) {
      console.error('Error toggling visibility:', error);
      alert('Erro ao alterar visibilidade no banco de dados.');
    }
  };

  const toggleMenuOnline = async () => {
    setIsUpdatingMenuStatus(true);
    const newState = !menuOnlineEnabled;
    try {
      const { error } = await supabase
        .schema('gestaohashi')
        .from('config')
        .upsert({ key: 'menu_online_enabled', value: String(newState) }, { onConflict: 'key' });

      if (error) throw error;
      setMenuOnlineEnabled(newState);
    } catch (error) {
      console.error('Error toggling menu status:', error);
      alert('Erro ao alterar status do menu online.');
    } finally {
      setIsUpdatingMenuStatus(false);
    }
  };

  const formatPrice = (value: string) => {
    let cleaned = value.replace(/[^\d,\.]/g, '');
    cleaned = cleaned.replace('.', ',');
    return cleaned;
  };

  return (
    <div className="space-y-6 pb-20 relative min-h-[400px]">
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-[2px] z-50 flex flex-col items-center justify-center rounded-2xl">
          <Loader2 size={40} className="text-indigo-600 animate-spin mb-4" />
          <p className="text-slate-600 dark:text-slate-300 font-medium">Carregando cardápio...</p>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Cardápio</h1>
          <p className="text-sm text-slate-500">Gerencie os produtos do seu estabelecimento</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Menu Online Toggle */}
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Menu Online
            </span>
            <button
              onClick={toggleMenuOnline}
              disabled={isUpdatingMenuStatus}
              className={`
                relative w-10 h-5 rounded-full transition-all duration-300 flex items-center
                ${menuOnlineEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}
                ${isUpdatingMenuStatus ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
              `}
            >
              <div className={`
                absolute w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300
                ${menuOnlineEnabled ? 'left-[22px]' : 'left-0.5'}
                ${isUpdatingMenuStatus ? 'scale-75' : 'scale-100'}
              `} />
            </button>
            <span className={`text-[10px] font-bold uppercase transition-colors ${menuOnlineEnabled ? 'text-emerald-600' : 'text-slate-400'}`}>
              {menuOnlineEnabled ? 'Ativo' : 'Inativo'}
            </span>
          </div>

          <button
            onClick={() => window.open('/#/public/menu', '_blank')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm group"
          >
            <ExternalLink size={16} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
            Visualizar
          </button>
        </div>
      </div>

      {/* Hero Images - Collapsible Section */}
      {(!productsExpanded && !splashExpanded) && (
        <div id="hero-section" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          {heroImagesExpanded && (
            <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <button
                onClick={() => setHeroImagesExpanded(false)}
                className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors"
              >
                <ChevronLeft size={20} />
                Voltar ao Menu Principal
              </button>
            </div>
          )}
          <button
            onClick={() => heroImagesExpanded ? setHeroImagesExpanded(false) : focusSection('hero')}
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-bold"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <ImageIcon size={18} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-white text-sm">Imagens - Capa MENU</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Adicione até 3 imagens para o carrossel do menu</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {heroImagesExpanded && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSaveHero();
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-all shadow-sm"
                >
                  <Save size={14} />
                  Salvar Alterações
                </button>
              )}
              <ChevronRight size={20} className={`text-slate-400 transition-transform ${heroImagesExpanded ? 'rotate-90' : ''}`} />
            </div>
          </button>

          {heroImagesExpanded && (
            <div className="px-5 pb-5 border-t border-slate-100 dark:border-slate-800">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {heroImages.map((hero, idx) => (
                  <div key={hero.id} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">IMAGEM {idx + 1}</span>
                      {hero.foto && (
                        <button
                          onClick={() => removeHeroImage(idx)}
                          className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-all"
                          title="Remover imagem"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    {/* Hidden file input */}
                    <input
                      ref={heroFileInputRefs[idx]}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleHeroImageUpload(e, idx)}
                      className="hidden"
                    />

                    {/* Image upload area */}
                    <div
                      onClick={() => !uploadingHeroIndex && heroFileInputRefs[idx]?.current?.click()}
                      className="aspect-video rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-600 flex items-center justify-center cursor-pointer hover:border-amber-400 transition-all overflow-hidden relative"
                    >
                      {uploadingHeroIndex === idx ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 size={24} className="text-amber-500 animate-spin" />
                          <span className="text-xs text-slate-400">Carregando...</span>
                        </div>
                      ) : hero.foto ? (
                        <>
                          <img src={hero.foto} alt={`Hero ${idx + 1}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-xs font-medium">Clique para trocar</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-slate-400">
                          <Upload size={24} />
                          <span className="text-xs">Clique para enviar</span>
                        </div>
                      )}
                    </div>

                    {/* Toggle for description */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Adicionar descrição?</span>
                      <button
                        onClick={() => updateHeroImageField(idx, 'showDescription', !hero.showDescription)}
                        className={`relative w-10 h-5 rounded-full transition-colors ${hero.showDescription ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                      >
                        <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${hero.showDescription ? 'translate-x-5' : ''}`} />
                      </button>
                    </div>

                    {/* Title and Subtitle inputs - only shown if toggle is on */}
                    {hero.showDescription && (
                      <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-600">
                        {/* Title input - max 20 characters */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Título</label>
                            <span className={`text-[10px] ${hero.titulo.length > 20 ? 'text-red-500' : 'text-slate-400'}`}>
                              {hero.titulo.length}/20
                            </span>
                          </div>
                          <input
                            type="text"
                            value={hero.titulo}
                            onChange={(e) => updateHeroImageField(idx, 'titulo', e.target.value.slice(0, 20))}
                            placeholder="Título"
                            maxLength={20}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                          />
                        </div>

                        {/* Subtitle input - max 50 characters */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Subtítulo</label>
                            <span className={`text-[10px] ${hero.subtitulo.length > 50 ? 'text-red-500' : 'text-slate-400'}`}>
                              {hero.subtitulo.length}/50
                            </span>
                          </div>
                          <textarea
                            value={hero.subtitulo}
                            onChange={(e) => updateHeroImageField(idx, 'subtitulo', e.target.value.slice(0, 50))}
                            placeholder="Subtítulo"
                            maxLength={50}
                            rows={2}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Products Section - Collapsible */}
      {(!heroImagesExpanded && !splashExpanded) && (
        <div id="products-section" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-visible">
          {productsExpanded && (
            <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <button
                onClick={() => setProductsExpanded(false)}
                className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors"
              >
                <ChevronLeft size={20} />
                Voltar ao Menu Principal
              </button>
            </div>
          )}
          <button
            onClick={() => productsExpanded ? setProductsExpanded(false) : focusSection('products', true)}
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <Grid3X3 size={18} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-white text-sm">Produtos</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Gerencie categorias e itens do cardápio</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                {categorias.reduce((acc, cat) => acc + cat.itens.length, 0)} itens
              </span>
              <ChevronRight size={20} className={`text-slate-400 transition-transform ${productsExpanded ? 'rotate-90' : ''}`} />
            </div>
          </button>

          {productsExpanded && (
            <div className="px-5 pb-5 border-t border-slate-100 dark:border-slate-800 space-y-4 pt-4">
              {/* Category Tabs - Horizontal Scrollable */}
              <div className="relative bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-2 overflow-visible">
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
                        <div className="relative">
                          <button
                            onClick={() => {
                              setActiveCatId(cat.id);
                            }}
                            id={`cat-btn-${cat.id}`}
                            className={`
                          px-5 py-3 rounded-xl font-medium text-sm transition-all whitespace-nowrap flex items-center gap-2 relative
                          ${activeCatId === cat.id
                                ? cat.tipo === 'especial'
                                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-200 dark:shadow-none'
                                  : 'bg-indigo-600 text-white shadow-md'
                                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                              }
                        `}
                          >
                            {cat.tipo === 'especial' && (
                              <Sparkles size={14} className={activeCatId === cat.id ? 'text-purple-200' : 'text-purple-500'} />
                            )}
                            {cat.nome}
                            <span className={`text-xs ${activeCatId === cat.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                              ({cat.itens.length})
                            </span>
                            {cat.tipo === 'especial' && activeCatId === cat.id && (
                              <Star size={10} className="text-amber-300 fill-amber-300 animate-pulse absolute -top-1 -right-1" />
                            )}
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                setMenuPosition({ top: rect.bottom + 8, left: rect.right - 140 });
                                setCategoryMenuOpen(categoryMenuOpen === cat.id ? null : cat.id);
                              }}
                              className={`ml-1 p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-all cursor-pointer ${activeCatId === cat.id ? 'text-indigo-200 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                              <MoreVertical size={14} />
                            </span>
                          </button>

                          {/* Dropdown Menu */}
                          {categoryMenuOpen === cat.id && (
                            <>
                              <div
                                className="fixed inset-0 z-[100]"
                                onClick={() => setCategoryMenuOpen(null)}
                              />
                              <div
                                className="fixed bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-[101] min-w-[140px]"
                                style={{
                                  top: menuPosition.top,
                                  left: menuPosition.left
                                }}
                              >
                                <button
                                  onClick={() => {
                                    startEditingCategory(cat);
                                    setCategoryMenuOpen(null);
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-all"
                                >
                                  <Edit3 size={14} className="text-indigo-500" />
                                  Renomear
                                </button>
                                <button
                                  onClick={() => {
                                    handleDeleteCategoria(cat.id);
                                    setCategoryMenuOpen(null);
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 flex items-center gap-2 border-t border-slate-100 dark:border-slate-700 transition-all"
                                >
                                  <Trash2 size={14} className="text-red-500" />
                                  Deletar
                                </button>
                              </div>
                            </>
                          )}
                        </div>
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
                    <button
                      onClick={handleAddCategoria}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm transition-all shadow-sm"
                    >
                      <Plus size={16} />
                      Nova Categoria
                    </button>

                    {/* Standard Category Controls */}
                    {activeCategory?.tipo !== 'especial' && (
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
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setShowAddDropdown(false)}
                            />
                            <div className="absolute right-0 top-full mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden z-50 min-w-[180px]">
                              <button
                                onClick={() => {
                                  openItemModal();
                                  setShowAddDropdown(false);
                                }}
                                className="w-full px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-all whitespace-nowrap"
                              >
                                <ImageIcon size={18} className="text-emerald-500 flex-shrink-0" />
                                Adicionar Produto
                              </button>
                              <button
                                onClick={() => {
                                  openComboModal();
                                  setShowAddDropdown(false);
                                }}
                                className="w-full px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 border-t border-slate-100 dark:border-slate-700 transition-all whitespace-nowrap"
                              >
                                <Grid3X3 size={18} className="text-amber-500 flex-shrink-0" />
                                Adicionar Combo
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* Special Category Controls */}
                    {activeCategory?.tipo === 'especial' && (
                      <button
                        onClick={() => activeCategory && openDestaqueEditor(activeCategory)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg text-sm transition-all ml-2 shadow-sm animate-pulse"
                      >
                        <Edit3 size={16} />
                        Editar Conteúdo Especial
                      </button>
                    )}

                    {/* View Toggle - Hide for special categories */}
                    {activeCategory?.tipo !== 'especial' && (
                      <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 ml-2">
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
                    )}
                  </div>
                </div>
              )}

              {!isLoading && categorias.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                  <Layers size={48} className="text-slate-300 mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white">Nenhuma categoria encontrada</h3>
                  <p className="text-slate-500 mb-6 text-center max-w-xs">Comece criando uma nova categoria para adicionar seus produtos.</p>
                  <button
                    onClick={handleAddCategoria}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-md"
                  >
                    <Plus size={20} />
                    Criar minha primeira categoria
                  </button>
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
                          {/* Visibility Overlay */}
                          {!item.visivel && (
                            <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                              <div className="bg-slate-900/80 text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 shadow-lg">
                                <EyeOff size={14} />
                                Produto oculto do MENU
                              </div>
                            </div>
                          )}

                          {/* 3-dots Menu - Replaces Hover Actions */}
                          <div className="absolute top-2 right-2 z-20">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                setItemMenuPosition({ top: rect.bottom + 5, left: rect.left - 100 });
                                setItemMenuOpen(itemMenuOpen === item.id ? null : item.id);
                              }}
                              className="p-1.5 bg-white/90 hover:bg-white text-slate-700 rounded-lg shadow-sm transition-all hover:scale-105 active:scale-95"
                            >
                              <MoreVertical size={16} />
                            </button>
                          </div>

                          {/* Item Menu Dropdown */}
                          {itemMenuOpen === item.id && (
                            <>
                              <div
                                className="fixed inset-0 z-[100]"
                                onClick={(e) => { e.stopPropagation(); setItemMenuOpen(null); }}
                              />
                              <div
                                className="fixed bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-[101] min-w-[150px]"
                                style={{
                                  top: itemMenuPosition.top,
                                  left: itemMenuPosition.left
                                }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={() => {
                                    item.isCombo ? openComboModal(item) : openItemModal(item);
                                    setItemMenuOpen(null);
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 transition-all"
                                >
                                  <Edit3 size={14} className="text-indigo-500" />
                                  Editar
                                </button>
                                <button
                                  onClick={() => {
                                    toggleVisibility(item.id);
                                    setItemMenuOpen(null);
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 border-t border-slate-100 dark:border-slate-700 transition-all"
                                >
                                  {item.visivel ? (
                                    <>
                                      <EyeOff size={14} className="text-slate-500" />
                                      Ocultar do Menu
                                    </>
                                  ) : (
                                    <>
                                      <Eye size={14} className="text-emerald-500" />
                                      Exibir no Menu
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() => {
                                    handleDeleteItem(item.id);
                                    setItemMenuOpen(null);
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 flex items-center gap-2 border-t border-slate-100 dark:border-slate-700 transition-all"
                                >
                                  <Trash2 size={14} className="text-red-500" />
                                  Deletar
                                </button>
                              </div>
                            </>
                          )}
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
                              onClick={() => toggleVisibility(item.id)}
                              className={`p-2 rounded-lg transition-all flex-shrink-0 ${item.visivel ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
                              title={item.visivel ? "Ocultar do Menu" : "Exibir no Menu"}
                            >
                              {item.visivel ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>

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
            </div>
          )}
        </div>
      )}

      {/* Splash Section - Collapsible */}
      {(!heroImagesExpanded && !productsExpanded) && (
        <div id="splash-section" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          {splashExpanded && (
            <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <button
                onClick={() => setSplashExpanded(false)}
                className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors"
              >
                <ChevronLeft size={20} />
                Voltar ao Menu Principal
              </button>
            </div>
          )}
          <button
            onClick={() => splashExpanded ? setSplashExpanded(false) : focusSection('splash')}
            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Layers size={18} className="text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-white text-sm">Splash</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Configurar tela de abertura do menu</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-purple-500 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded-full">
                Em breve
              </span>
              <ChevronRight size={20} className={`text-slate-400 transition-transform ${splashExpanded ? 'rotate-90' : ''}`} />
            </div>
          </button>

          {splashExpanded && (
            <div className="px-5 pb-5 border-t border-slate-100 dark:border-slate-800">
              <div className="py-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center">
                  <Layers size={32} className="text-purple-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">Splash Screen</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto mb-4">
                  Configure uma tela de abertura personalizada para o seu menu digital. Esta funcionalidade estará disponível em breve.
                </p>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-sm font-medium">
                  <Loader2 size={14} className="animate-spin" />
                  Em desenvolvimento
                </span>
              </div>
            </div>
          )}
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

      {/* Add Category Modal */}
      <Modal
        isOpen={addCategoryModal.isOpen}
        type="confirm-insert"
        title="Nova Categoria"
        content={
          <div className="space-y-4">
            <p className="text-sm text-slate-500">Digite o nome da nova categoria para o seu cardápio.</p>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2">Nome da Categoria</label>
              <input
                type="text"
                value={addCategoryModal.name}
                onChange={(e) => setAddCategoryModal({ ...addCategoryModal, name: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleConfirmAddCategoria()}
                placeholder="Ex: Lanches, Bebidas..."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm"
              />
            </div>

            {/* Type Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2">Tipo de Categoria</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setAddCategoryModal({ ...addCategoryModal, type: 'padrao' })}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${addCategoryModal.type === 'padrao' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                >
                  <Grid3X3 size={20} />
                  <span className="text-xs font-bold">Padrão</span>
                  <span className="text-[9px] opacity-70">Lista de produtos</span>
                </button>
                <button
                  onClick={() => setAddCategoryModal({ ...addCategoryModal, type: 'especial' })}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${addCategoryModal.type === 'especial' ? 'bg-purple-50 border-purple-500 text-purple-700' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                >
                  <div className="relative">
                    <Sparkles size={20} />
                    <Star size={8} className="absolute -top-1 -right-1 text-amber-400 fill-amber-400" />
                  </div>
                  <span className="text-xs font-bold">Especial (Destaque)</span>
                  <span className="text-[9px] opacity-70">Stories & Multimídia</span>
                </button>
              </div>
            </div>
          </div>
        }
        onConfirm={handleConfirmAddCategoria}
        confirmText="Criar Categoria"
        onClose={() => setAddCategoryModal({ isOpen: false, name: '', type: 'padrao' })}
      />

      {/* Destaque Content Editor Modal */}
      <Modal
        isOpen={destaqueModalOpen}
        type="view-content"
        title="Editar Conteúdo Especial"
        maxWidth="max-w-2xl"
        content={
          <div className="space-y-6">
            {/* Media Upload */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mídias (Fotos/Vídeos)</label>
                <span className="text-[10px] text-slate-400">{destaqueFormData.midias.length}/5 adicionados</span>
              </div>

              {/* Media List */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {destaqueFormData.midias.map((midia, idx) => (
                  <div key={idx} className="aspect-[4/5] bg-slate-100 dark:bg-slate-800 rounded-lg relative overflow-hidden group border border-slate-200 dark:border-slate-700">
                    {midia.type === 'video' ? (
                      <video src={midia.url} className="w-full h-full object-cover" />
                    ) : (
                      <img src={midia.url} alt={`Media ${idx}`} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          const newM = [...destaqueFormData.midias];
                          newM.splice(idx, 1);
                          setDestaqueFormData(prev => ({ ...prev, midias: newM }));
                        }}
                        className="p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700"
                      >
                        <Trash2 size={12} />
                      </button>
                      {midia.type === 'video' && <Video size={14} className="text-white" />}
                    </div>
                    {/* Index Badge */}
                    <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/50 text-white text-[9px] font-bold rounded">
                      {idx + 1}
                    </div>
                  </div>
                ))}

                {/* Upload Button */}
                {destaqueFormData.midias.length < 5 && (
                  <div
                    onClick={() => !isDestaqueUploading && destaqueFileInputRef.current?.click()}
                    className="aspect-[4/5] bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all text-slate-400 hover:text-purple-500"
                  >
                    {isDestaqueUploading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <>
                        <Plus size={24} className="mb-1" />
                        <span className="text-[9px] font-bold uppercase">Adicionar</span>
                      </>
                    )}
                  </div>
                )}
              </div>
              <input
                ref={destaqueFileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleDestaqueFileUpload}
                className="hidden"
              />
              <p className="text-[10px] text-slate-400">
                Imagens (4s) ou Vídeos (máx 30s). Formato vertical (9:16 ou 4:5) recomendado.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Título do Destaque</label>
                <input
                  type="text"
                  value={destaqueFormData.titulo}
                  onChange={(e) => setDestaqueFormData(prev => ({ ...prev, titulo: e.target.value }))}
                  placeholder="Ex: Festival de Inverno"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Preço (Opcional)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">R$</span>
                  <input
                    type="text"
                    value={destaqueFormData.preco}
                    onChange={(e) => setDestaqueFormData(prev => ({ ...prev, preco: formatPrice(e.target.value) }))}
                    placeholder="0,00"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Descrição (Conteúdo)</label>
              <textarea
                value={destaqueFormData.descricao}
                onChange={(e) => setDestaqueFormData(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Descreva os detalhes desta categoria especial..."
                rows={4}
                maxLength={500}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500/20 resize-none text-slate-900 dark:text-white"
              />
              <div className="text-right text-[10px] text-slate-400 mt-1">
                {destaqueFormData.descricao.length}/500
              </div>
            </div>
          </div>
        }
        onConfirm={handleSaveDestaque}
        confirmText="Salvar Conteúdo"
        onClose={() => setDestaqueModalOpen(false)}
      />

      {/* Delete Category Modal */}
      <Modal
        isOpen={deleteCategoryModal.isOpen}
        type="confirm-delete"
        title="Excluir Categoria"
        content="Tem certeza que deseja excluir esta categoria? Todos os produtos vinculados a ela também serão excluídos permanentemente."
        onConfirm={handleConfirmDeleteCategoria}
        confirmText="Sim, Excluir Tudo"
        onClose={() => setDeleteCategoryModal({ isOpen: false, categoryId: null })}
      />

      {/* Delete Item Modal */}
      <Modal
        isOpen={deleteItemModal.isOpen}
        type="confirm-delete"
        title="Excluir Produto"
        content="Tem certeza que deseja remover este produto do cardápio?"
        onConfirm={handleConfirmDeleteItem}
        confirmText="Sim, Remover"
        onClose={() => setDeleteItemModal({ isOpen: false, itemId: null })}
      />

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div >
  );
};

export default CardapioPage;
