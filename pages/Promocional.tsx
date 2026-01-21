
import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Eye, Calendar, Tag } from 'lucide-react';
import { Promocao, ModalType } from '../types';
import Modal from '../components/UI/Modal';
import Table from '../components/UI/Table';

const MOCK_PROMOS: Promocao[] = [
  {
    id: 'p1',
    titulo: 'Bariátricos',
    categoria: 'Rodízio',
    descricao: '* Bariátricos: 50% com laudo médico (CRM) * Idosos: Entre em contato com o gerente Lucas, ele sempre resolve ❤️',
    ativa: true,
    dataInicio: '2024-12-01',
    dataFim: '2024-12-31'
  },
  {
    id: 'p2',
    titulo: 'Promocional Criança',
    categoria: 'Rodízio',
    descricao: '*Descontos Especiais* * Crianças (6-10 anos): R$ 69,00 almoço / R$ 75,00 jantar',
    ativa: true,
    dataInicio: '2024-12-01',
    dataFim: '2024-12-15'
  },
  {
    id: 'p3',
    titulo: 'Promocional Kilo',
    categoria: 'Rodízio',
    descricao: 'Segunda a Quinta: ♦ Opção por kilo: R$ 14,90 / 100g ou seja: 149,90 o Kilo',
    ativa: true,
    dataInicio: '2024-12-10',
    dataFim: '2024-12-20'
  },
  {
    id: 'p4',
    titulo: 'Promocional Rodízio',
    categoria: 'Rodízio',
    descricao: '♦ SEGUNDA A QUINTA ➔ Almoço e Jantar: De 129,00 por apenas R$ 109,00 / pessoa ♦ SEXTA-FEIRA ➔ Almoço: R$ 119,00 / pessoa ➔ Jantar: R$...',
    ativa: true,
    dataInicio: '2024-12-01',
    dataFim: '2024-12-31'
  }
];

const PromotionForm: React.FC<{ initialData?: Promocao }> = ({ initialData }) => {
  const inputClass = "w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 font-medium";
  const labelClass = "text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className={labelClass}>Título da Promoção</label>
          <div className="relative group">
            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              className={`${inputClass} pl-12`}
              placeholder="Ex: Especial Natal"
              defaultValue={initialData?.titulo}
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className={labelClass}>Categoria</label>
          <select className={inputClass} defaultValue={initialData?.categoria || "Rodízio"}>
            <option>Rodízio</option>
            <option>Bebidas</option>
            <option>Sobremesas</option>
            <option>Kilo</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className={labelClass}>Data Início</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="date"
              className={`${inputClass} pl-12`}
              defaultValue={initialData?.dataInicio}
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className={labelClass}>Data Fim</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="date"
              className={`${inputClass} pl-12`}
              defaultValue={initialData?.dataFim}
            />
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <label className={labelClass}>Descrição e Regras</label>
        <textarea
          className={`${inputClass} h-32 resize-none py-4`}
          placeholder="Descreva os detalhes da promoção..."
          defaultValue={initialData?.descricao}
        />
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-red-500 transition-colors w-full sm:w-auto">
          <input
            type="checkbox"
            defaultChecked={initialData?.ativa ?? true}
            className="w-5 h-5 rounded border-slate-300 text-red-600 focus:ring-red-500"
          />
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300 select-none">Promoção Ativa</span>
        </label>
      </div>
    </div>
  );
};

const PromocionalPage: React.FC = () => {
  const [data, setData] = useState<Promocao[]>(MOCK_PROMOS);
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; type: ModalType; title: string; content: React.ReactNode; onConfirm?: () => void; maxWidth?: string }>({
    isOpen: false,
    type: 'view-content',
    title: '',
    content: ''
  });

  const handleToggleActive = (id: string) => {
    setData(prev => prev.map(p => p.id === id ? { ...p, ativa: !p.ativa } : p));
  };

  const handleAction = (type: 'view' | 'edit' | 'delete', promo: Promocao) => {
    if (type === 'delete') {
      setModalConfig({
        isOpen: true,
        type: 'confirm-delete',
        title: 'Excluir Promoção',
        content: `Deseja realmente excluir a promoção "${promo.titulo}"?`,
        onConfirm: () => setData(prev => prev.filter(p => p.id !== promo.id))
      });
    } else if (type === 'edit') {
      setModalConfig({
        isOpen: true,
        type: 'confirm-update',
        title: 'Editar Promoção',
        content: <PromotionForm initialData={promo} />,
        maxWidth: 'max-w-2xl',
        onConfirm: () => console.log('Atualizado')
      });
    } else {
      setModalConfig({
        isOpen: true,
        type: 'view-content',
        title: 'Detalhes da Promoção',
        content: (
          <div className="space-y-6">
            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Título</label>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">{promo.titulo}</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Categoria</label>
                <p className="font-bold text-slate-700 dark:text-slate-300 mt-1">{promo.categoria}</p>
              </div>
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Status</label>
                <span className={`inline-block mt-1 px-2.5 py-0.5 rounded text-[11px] font-black uppercase tracking-wider ${promo.ativa ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                  {promo.ativa ? 'Ativa' : 'Inativa'}
                </span>
              </div>
            </div>
            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Vigência</label>
              <div className="flex items-center gap-2 mt-1 text-sm font-bold text-slate-800 dark:text-slate-200">
                <Calendar size={16} className="text-red-500" />
                {promo.dataInicio} até {promo.dataFim}
              </div>
            </div>
            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Descrição</label>
              <div className="mt-2 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">
                {promo.descricao}
              </div>
            </div>
          </div>
        ),
        maxWidth: 'max-w-lg'
      });
    }
  };

  const columns = [
    {
      header: 'Promoção',
      accessor: (item: Promocao) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900 dark:text-white">{item.titulo}</span>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{item.categoria}</span>
        </div>
      ),
      className: 'w-64'
    },
    {
      header: 'Vigência',
      accessor: (item: Promocao) => (
        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
          {item.dataInicio} - {item.dataFim}
        </span>
      ),
      className: 'w-40'
    },
    {
      header: 'Status',
      accessor: (item: Promocao) => (
        <button
          onClick={(e) => { e.stopPropagation(); handleToggleActive(item.id); }}
          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 ${item.ativa
              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
            }`}
        >
          {item.ativa ? 'Ativa' : 'Inativa'}
        </button>
      ),
      className: 'w-24 text-center'
    },
    {
      header: 'Ações',
      accessor: (item: Promocao) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={(e) => { e.stopPropagation(); handleAction('view', item); }} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 rounded-lg transition-all"><Eye size={18} /></button>
          <button onClick={(e) => { e.stopPropagation(); handleAction('edit', item); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded-lg transition-all"><Edit3 size={18} /></button>
          <button onClick={(e) => { e.stopPropagation(); handleAction('delete', item); }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-lg transition-all"><Trash2 size={18} /></button>
        </div>
      ),
      className: 'w-32 text-right'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Promocional</h1>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Gerencie as ofertas e campanhas ativas do estabelecimento.</p>
        </div>
        <button
          onClick={() => setModalConfig({
            isOpen: true,
            type: 'confirm-insert',
            title: 'Nova Promoção',
            content: <PromotionForm />,
            maxWidth: 'max-w-2xl',
            onConfirm: () => console.log('Cadastrado')
          })}
          className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-2xl flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-red-100 dark:shadow-none tracking-widest text-xs"
        >
          <Plus size={20} strokeWidth={3} />
          Cadastrar
        </button>
      </div>

      <Table
        columns={columns}
        data={data}
        searchPlaceholder="Buscar por título ou categoria..."
        itemsPerPage={10}
        onRowClick={(item) => handleAction('view', item)}
      />

      <Modal
        isOpen={modalConfig.isOpen}
        type={modalConfig.type}
        title={modalConfig.title}
        content={modalConfig.content}
        maxWidth={modalConfig.maxWidth}
        onConfirm={modalConfig.onConfirm}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default PromocionalPage;
