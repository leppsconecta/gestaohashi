
import React, { useState, useEffect, useMemo } from 'react';
import {
  Utensils,
  Package,
  Tags,
  Plus,
  Search,
  Edit3,
  Trash2,
  Image as ImageIcon,
  ChevronRight,
  TrendingUp,
  DollarSign,
  ChefHat,
  X,
  RotateCcw
} from 'lucide-react';
import Modal from '../components/UI/Modal';
import Table, { Column } from '../components/UI/Table';
import { MateriaPrima, PratoFicha, CategoriaPrato, ModalType, IngredientePrato } from '../types';

const INITIAL_INSUMOS: MateriaPrima[] = [
  { id: 'i1', nome: 'açucar', unidade: 'kg', custoUnitario: 4.00 },
  { id: 'i2', nome: 'sal', unidade: 'kg', custoUnitario: 3.00 },
  { id: 'i3', nome: 'Salmão', unidade: 'kg', custoUnitario: 48.00 },
  { id: 'i4', nome: 'Salmão Fresco', unidade: 'kg', custoUnitario: 200.00 },
  { id: 'i5', nome: 'saque mirin', unidade: 'l', custoUnitario: 18.78 },
  { id: 'i6', nome: 'vinagre de rroz', unidade: 'l', custoUnitario: 3.89 },
];

const INITIAL_CATEGORIAS: CategoriaPrato[] = [
  { id: 'c1', nome: 'Frios' },
  { id: 'c2', nome: 'pratos quentes' },
  { id: 'c3', nome: 'temaki' },
];

const INITIAL_PRATOS: PratoFicha[] = [
  {
    id: 'p1',
    nome: 'sashimi de salmão',
    categoriaId: 'c1',
    custoTotal: 4.80,
    precoVenda: 90.00,
    modoPreparo: 'Corte o salmão em fatias finas de aproximadamente 1cm.',
    atualizadoEm: '04/12/2025 21:00',
    ingredientes: [{ materiaPrimaId: 'i3', quantidade: 0.1 }]
  }
];

const FichaTecnicaPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pratos' | 'insumos' | 'categorias'>('pratos');
  const [insumos, setInsumos] = useState<MateriaPrima[]>(INITIAL_INSUMOS);
  const [categorias, setCategorias] = useState<CategoriaPrato[]>(INITIAL_CATEGORIAS);
  const [pratos, setPratos] = useState<PratoFicha[]>(INITIAL_PRATOS);

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: ModalType;
    title: string;
    content: React.ReactNode;
    onConfirm?: () => void;
    maxWidth?: string
  }>({
    isOpen: false,
    type: 'view-content',
    title: '',
    content: null,
  });

  // --- Handlers para Categorias ---
  const handleNovaCategoria = () => {
    setModalConfig({
      isOpen: true,
      type: 'confirm-insert',
      title: 'Nova Categoria',
      maxWidth: 'max-w-md',
      content: (
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Nome da Categoria</label>
            <input id="cat-name" type="text" className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-red-500/20 bg-white dark:bg-slate-800 text-slate-900 dark:text-white" placeholder="Ex: Bebidas" />
          </div>
        </div>
      ),
      onConfirm: () => {
        const name = (document.getElementById('cat-name') as HTMLInputElement).value;
        if (name) setCategorias([...categorias, { id: Date.now().toString(), nome: name }]);
      }
    });
  };

  // --- Handlers para Insumos ---
  const handleNovoInsumo = (initial?: MateriaPrima) => {
    setModalConfig({
      isOpen: true,
      type: initial ? 'confirm-update' : 'confirm-insert',
      title: initial ? 'Editar Matéria-Prima' : 'Nova Matéria-Prima',
      maxWidth: 'max-w-md',
      content: (
        <div className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Nome do Item</label>
            <input id="ins-name" type="text" defaultValue={initial?.nome} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none" placeholder="Ex: Arroz" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Unidade</label>
              <select id="ins-unit" defaultValue={initial?.unidade || 'kg'} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none">
                <option value="kg">Quilo (kg)</option>
                <option value="l">Litro (L)</option>
                <option value="un">Unidade (un)</option>
                <option value="g">Grama (g)</option>
                <option value="ml">Mililitro (ml)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Custo Unitário</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400">R$</span>
                <input id="ins-cost" type="number" step="0.01" defaultValue={initial?.custoUnitario} className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none" placeholder="0,00" />
              </div>
            </div>
          </div>
        </div>
      ),
      onConfirm: () => {
        const nome = (document.getElementById('ins-name') as HTMLInputElement).value;
        const unidade = (document.getElementById('ins-unit') as HTMLSelectElement).value;
        const custo = parseFloat((document.getElementById('ins-cost') as HTMLInputElement).value);
        if (nome && !isNaN(custo)) {
          if (initial) {
            setInsumos(insumos.map(i => i.id === initial.id ? { ...i, nome, unidade, custoUnitario: custo } : i));
          } else {
            setInsumos([...insumos, { id: Date.now().toString(), nome, unidade, custoUnitario: custo }]);
          }
        }
      }
    });
  };

  // --- Handlers para Pratos (Ficha Técnica) ---
  const FichaTecnicaForm: React.FC<{ initial?: PratoFicha }> = ({ initial }) => {
    const [localIngredientes, setLocalIngredientes] = useState<IngredientePrato[]>(initial?.ingredientes || []);
    const [venda, setVenda] = useState<number>(initial?.precoVenda || 0);
    const [selectedInsumoId, setSelectedInsumoId] = useState('');
    const [qtd, setQtd] = useState<number>(0);

    const custoTotal = useMemo(() => {
      return localIngredientes.reduce((acc, ing) => {
        const insumo = insumos.find(i => i.id === ing.materiaPrimaId);
        return acc + (insumo ? insumo.custoUnitario * ing.quantidade : 0);
      }, 0);
    }, [localIngredientes]);

    const margem = useMemo(() => {
      if (venda <= 0) return 0;
      return Math.round(((venda - custoTotal) / custoTotal) * 100);
    }, [venda, custoTotal]);

    const addIngrediente = () => {
      if (!selectedInsumoId || qtd <= 0) return;
      setLocalIngredientes([...localIngredientes, { materiaPrimaId: selectedInsumoId, quantidade: qtd }]);
      setSelectedInsumoId('');
      setQtd(0);
    };

    const removeIngrediente = (idx: number) => {
      setLocalIngredientes(localIngredientes.filter((_, i) => i !== idx));
    };

    return (
      <div className="space-y-6 max-w-full overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Custo Total</span>
            <p className="text-xl font-black text-slate-900 dark:text-white">R$ {custoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-xl border border-rose-100 dark:border-rose-800/50 text-center">
            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest block mb-1">Preço Venda</span>
            <div className="flex items-center justify-center gap-1">
              <span className="text-sm font-bold text-rose-500">R$</span>
              <input
                type="number"
                value={venda}
                onChange={(e) => setVenda(parseFloat(e.target.value) || 0)}
                className="bg-transparent text-xl font-black text-rose-600 dark:text-rose-400 outline-none w-24 text-center"
              />
            </div>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/50 text-center">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-1">Margem Lucro</span>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{margem}%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="aspect-square bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer">
              <ImageIcon size={48} strokeWidth={1} />
              <span className="text-xs font-bold mt-4">Adicionar Foto</span>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nome do Prato</label>
                <input id="dish-name" type="text" defaultValue={initial?.nome} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-red-500/10 outline-none dark:text-white" placeholder="Ex: Sashimi Misto" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Categoria</label>
                <select id="dish-cat" defaultValue={initial?.categoriaId} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl outline-none dark:text-white">
                  {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                <Package size={14} /> Composição (Ingredientes)
              </label>
              <div className="flex gap-2">
                <select
                  className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm min-w-0 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  value={selectedInsumoId}
                  onChange={(e) => setSelectedInsumoId(e.target.value)}
                >
                  <option value="">Selecione um Insumo</option>
                  {insumos.map(i => <option key={i.id} value={i.id}>{i.nome} ({i.unidade})</option>)}
                </select>
                <input
                  type="number"
                  className="w-24 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="Qtd"
                  value={qtd || ''}
                  onChange={(e) => setQtd(parseFloat(e.target.value) || 0)}
                />
                <button onClick={addIngrediente} className="p-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shrink-0"><Plus size={18} strokeWidth={3} /></button>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs min-w-[300px]">
                  <thead className="bg-slate-100 dark:bg-slate-900/50">
                    <tr>
                      <th className="px-4 py-2 text-left font-bold text-slate-500 dark:text-slate-400">INGREDIENTE</th>
                      <th className="px-4 py-2 text-center font-bold text-slate-500 dark:text-slate-400">QTD</th>
                      <th className="px-4 py-2 text-right font-bold text-slate-500 dark:text-slate-400">CUSTO</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {localIngredientes.length > 0 ? localIngredientes.map((ing, idx) => {
                      const insumo = insumos.find(i => i.id === ing.materiaPrimaId);
                      const custoIng = insumo ? insumo.custoUnitario * ing.quantidade : 0;
                      return (
                        <tr key={idx} className="hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors">
                          <td className="px-4 py-2 font-medium text-slate-700 dark:text-slate-300 truncate max-w-[100px]">{insumo?.nome}</td>
                          <td className="px-4 py-2 text-center font-bold whitespace-nowrap dark:text-slate-300">{ing.quantidade} {insumo?.unidade}</td>
                          <td className="px-4 py-2 text-right font-bold text-red-600 dark:text-red-400 whitespace-nowrap">R$ {custoIng.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                          <td className="px-2 text-center">
                            <button onClick={() => removeIngrediente(idx)} className="p-1.5 text-slate-300 hover:text-red-500"><X size={14} /></button>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-slate-400 italic">Nenhum ingrediente adicionado</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <ChefHat size={14} /> Modo de Preparo
          </label>
          <textarea id="dish-preparo" defaultValue={initial?.modoPreparo} className="w-full h-32 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-red-500/10 resize-none text-sm dark:text-white" placeholder="1. Descreva o passo a passo..."></textarea>
        </div>
      </div>
    );
  };

  const handleNovoPrato = (initial?: PratoFicha) => {
    setModalConfig({
      isOpen: true,
      type: initial ? 'confirm-update' : 'confirm-insert',
      title: initial ? 'Editar Ficha Técnica' : 'Nova Ficha Técnica',
      maxWidth: 'max-w-4xl',
      content: <FichaTecnicaForm initial={initial} />,
      onConfirm: () => {
        console.log("Ficha salva");
      }
    });
  };

  // --- Renderização de Colunas ---
  const pratosColumns: Column<PratoFicha>[] = [
    { header: 'FOTO', accessor: () => <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400"><ChefHat size={20} /></div>, className: 'w-20' },
    {
      header: 'NOME', accessor: (p) => (
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-slate-900 dark:text-white truncate">{p.nome}</span>
          <span className="text-[10px] text-slate-400">Atualizado: {p.atualizadoEm}</span>
        </div>
      ), className: 'w-48'
    },
    {
      header: 'CATEGORIA', accessor: (p) => (
        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase whitespace-nowrap">{categorias.find(c => c.id === p.categoriaId)?.nome || 'Sem Categoria'}</span>
      ), className: 'w-32'
    },
    { header: 'CUSTO', accessor: (p) => <span className="font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">R$ {p.custoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>, className: 'w-28' },
    { header: 'PREÇO', accessor: (p) => <span className="font-black text-slate-900 dark:text-white text-lg whitespace-nowrap">{p.precoVenda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>, className: 'w-28' },
    { header: 'MG %', accessor: (p) => <span className="font-black text-emerald-600 dark:text-emerald-400">{Math.round(((p.precoVenda - p.custoTotal) / p.custoTotal) * 100)}</span>, className: 'w-20' },
    {
      header: 'AÇÕES', accessor: (p) => (
        <div className="flex items-center gap-2 justify-end">
          <button onClick={() => handleNovoPrato(p)} className="p-2 text-slate-300 hover:text-indigo-600"><Edit3 size={18} /></button>
          <button onClick={() => setPratos(pratos.filter(x => x.id !== p.id))} className="p-2 text-slate-300 hover:text-red-600"><Trash2 size={18} /></button>
        </div>
      ), className: 'w-24 text-right'
    }
  ];

  const insumosColumns: Column<MateriaPrima>[] = [
    { header: 'NOME', accessor: 'nome', className: 'font-bold text-slate-900 dark:text-white' },
    { header: 'UNIDADE', accessor: 'unidade', className: 'text-slate-500 dark:text-slate-400 font-medium' },
    { header: 'CUSTO / UNID', accessor: (i) => <span className="font-bold text-slate-800 dark:text-slate-200">R$ {i.custoUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span> },
    {
      header: 'AÇÕES', accessor: (i) => (
        <div className="flex items-center gap-2 justify-end">
          <button onClick={() => handleNovoInsumo(i)} className="p-2 text-slate-300 hover:text-indigo-600"><Edit3 size={18} /></button>
          <button onClick={() => setInsumos(insumos.filter(x => x.id !== i.id))} className="p-2 text-slate-300 hover:text-red-600"><Trash2 size={18} /></button>
        </div>
      ), className: 'w-24 text-right'
    }
  ];

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Ficha Técnica</h1>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Gestão de custos, insumos e precificação de pratos.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <span>Atualizado em: 15:46</span>
            <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><RotateCcw size={14} className="text-slate-400" /></button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {/* Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar">
          {[
            { id: 'pratos', label: 'Pratos', icon: <Utensils size={18} /> },
            { id: 'insumos', label: 'Matéria-Prima', icon: <Package size={18} /> },
            { id: 'categorias', label: 'Categorias', icon: <Tags size={18} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${activeTab === tab.id
                  ? 'text-red-600 bg-red-50/30 border-red-600 dark:bg-red-900/10'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 border-transparent'
                }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Header por Aba */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input type="text" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl outline-none focus:ring-4 focus:ring-red-500/10 text-sm font-medium dark:text-white" placeholder={`Buscar ${activeTab}...`} />
            </div>
            {activeTab === 'pratos' && (
              <button onClick={() => handleNovoPrato()} className="w-full sm:w-auto px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-700 transition-all shadow-lg shadow-red-100 dark:shadow-none">
                <Plus size={18} strokeWidth={3} /> Novo Prato
              </button>
            )}
            {activeTab === 'insumos' && (
              <button onClick={() => handleNovoInsumo()} className="w-full sm:w-auto px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-700 transition-all shadow-lg shadow-red-100 dark:shadow-none">
                <Plus size={18} strokeWidth={3} /> Nova Matéria-Prima
              </button>
            )}
          </div>

          {/* Conteúdo dinâmico por Aba */}
          <div className="w-full overflow-hidden">
            {activeTab === 'pratos' && <Table columns={pratosColumns} data={pratos} />}
            {activeTab === 'insumos' && <Table columns={insumosColumns} data={insumos} />}
            {activeTab === 'categorias' && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[400px]">
                <div className="lg:col-span-1 space-y-2">
                  <div className="flex items-center justify-between px-2 mb-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Categorias</h3>
                    <button onClick={handleNovaCategoria} className="p-1 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-500 hover:text-red-600 transition-all"><Plus size={16} /></button>
                  </div>
                  {categorias.map(cat => (
                    <button key={cat.id} className="w-full px-4 py-3 rounded-xl text-left text-sm font-bold text-slate-700 dark:text-slate-300 border border-transparent hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 flex items-center justify-between group transition-all">
                      <span>{cat.nome}</span>
                      <span className="text-[10px] text-slate-400 group-hover:text-red-400">{pratos.filter(p => p.categoriaId === cat.id).length} itens</span>
                    </button>
                  ))}
                </div>
                <div className="lg:col-span-3 bg-slate-50/50 dark:bg-slate-950/20 rounded-3xl border border-slate-100 dark:border-slate-800 p-8">
                  <div className="flex flex-col items-center justify-center text-center py-12 opacity-30 h-full">
                    <Utensils size={48} className="mb-4 text-slate-300" />
                    <p className="text-sm font-bold text-slate-400">Selecione uma categoria para ver os pratos</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        type={modalConfig.type}
        maxWidth={modalConfig.maxWidth}
        content={modalConfig.content}
        onConfirm={modalConfig.onConfirm}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default FichaTecnicaPage;
