
import React, { useState, useEffect } from 'react';
import { Plus, ChevronDown, Tag, Edit3, Trash2, Eye, Calendar, Clock, ChevronUp } from 'lucide-react';
import { Promocao, ModalType } from '../types';
import Modal from '../components/UI/Modal';

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

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

// Sub-componente para o formulário de cadastro/edição
const PromotionForm: React.FC<{ mes: string; initialData?: Promocao }> = ({ mes, initialData }) => {
  const [isFullMonth, setIsFullMonth] = useState(false);
  
  const inputClass = "w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all text-slate-900 dark:text-slate-200 disabled:bg-slate-50 dark:disabled:bg-slate-800/50 disabled:text-slate-500 disabled:cursor-not-allowed font-bold";

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Nome da Promoção</label>
        <input 
          type="text" 
          className={inputClass} 
          placeholder="Ex: Especial Natal" 
          defaultValue={initialData?.titulo}
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Descrição</label>
        <textarea 
          className={`${inputClass} h-24 resize-none font-medium`} 
          placeholder="Detalhes da oferta..." 
          defaultValue={initialData?.descricao}
        />
      </div>

      <div className="flex items-center gap-3 py-1 px-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 w-fit">
        <div className="relative flex items-center">
          <input 
            type="checkbox" 
            id="mes-todo" 
            checked={isFullMonth} 
            onChange={(e) => setIsFullMonth(e.target.checked)}
            className="w-5 h-5 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
          />
        </div>
        <label htmlFor="mes-todo" className="text-sm font-black text-slate-800 dark:text-slate-300 cursor-pointer select-none">
          Mês todo
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Data Início</label>
          <input 
            type="date" 
            disabled={isFullMonth}
            className={inputClass} 
            defaultValue={initialData?.dataInicio}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Data Fim</label>
          <input 
            type="date" 
            disabled={isFullMonth}
            className={inputClass} 
            defaultValue={initialData?.dataFim}
          />
        </div>
      </div>
    </div>
  );
};

const PromocionalPage: React.FC = () => {
  const currentMonthIndex = new Date().getMonth();
  const currentMonthName = MESES[currentMonthIndex];
  
  const [expandedMonth, setExpandedMonth] = useState<string | null>(currentMonthName);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [promosData, setPromosData] = useState<Record<string, Promocao[]>>({
    [currentMonthName]: MOCK_PROMOS,
    "Janeiro": [],
    "Fevereiro": [],
    "Março": [],
  });

  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; type: ModalType; title: string; content: React.ReactNode; onConfirm?: () => void }>({
    isOpen: false,
    type: 'view-content',
    title: '',
    content: ''
  });

  const toggleMonth = (mes: string) => {
    setExpandedMonth(expandedMonth === mes ? null : mes);
  };

  const toggleCard = (id: string) => {
    const next = new Set(expandedCards);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedCards(next);
  };

  const togglePromoActive = (mes: string, id: string) => {
    setPromosData(prev => ({
      ...prev,
      [mes]: prev[mes]?.map(p => p.id === id ? { ...p, ativa: !p.ativa } : p) || []
    }));
  };

  const handleCadastrar = (mes: string) => {
    setModalConfig({
      isOpen: true,
      type: 'confirm-insert',
      title: `Cadastrar Promoção - ${mes}`,
      content: <PromotionForm mes={mes} />,
      onConfirm: () => {
        console.log("Promoção cadastrada em " + mes);
      }
    });
  };

  const handleAction = (type: 'view' | 'edit' | 'delete', promo: Promocao, mes: string) => {
    if (type === 'delete') {
      setModalConfig({
        isOpen: true,
        type: 'confirm-delete',
        title: 'Excluir Promoção',
        content: `Deseja realmente excluir a promoção "${promo.titulo}"?`,
        onConfirm: () => {
          setPromosData(prev => ({
            ...prev,
            [mes]: prev[mes].filter(p => p.id !== promo.id)
          }));
        }
      });
    } else if (type === 'edit') {
      setModalConfig({
        isOpen: true,
        type: 'confirm-update',
        title: `Editar Promoção - ${mes}`,
        content: <PromotionForm mes={mes} initialData={promo} />,
        onConfirm: () => {
          console.log("Promoção atualizada em " + mes);
        }
      });
    } else {
      setModalConfig({
        isOpen: true,
        type: 'view-content',
        title: 'Detalhes da Promoção',
        content: (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Título</label>
              <p className="text-slate-900 dark:text-white font-black text-lg">{promo.titulo}</p>
            </div>
            <div className="flex gap-4">
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Validade</label>
                <p className="text-sm text-slate-800 dark:text-slate-300 font-bold">
                  {promo.dataInicio} até {promo.dataFim}
                </p>
              </div>
            </div>
            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Descrição</label>
              <p className="text-sm text-slate-900 dark:text-slate-200 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800 leading-relaxed italic font-medium">
                {promo.descricao}
              </p>
            </div>
          </div>
        ),
      });
    }
  };

  const renderMonthSection = (mes: string) => {
    const isExpanded = expandedMonth === mes;
    const promoList = promosData[mes] || [];

    return (
      <div 
        key={mes} 
        className={`transition-all duration-300 rounded-2xl border ${
          isExpanded 
            ? 'bg-white dark:bg-slate-900 border-red-200 dark:border-red-900/50 ring-4 ring-red-50 dark:ring-red-900/10 shadow-lg' 
            : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-sm'
        }`}
      >
        <div 
          className="flex items-center justify-between p-5 cursor-pointer group"
          onClick={() => toggleMonth(mes)}
        >
          <div className="flex items-center gap-3">
            <span className={`text-2xl font-black ${mes === currentMonthName ? 'text-red-700' : 'text-slate-900 dark:text-slate-200'}`}>
              {mes}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={(e) => { e.stopPropagation(); handleCadastrar(mes); }}
              className="bg-red-700 hover:bg-red-800 text-white text-xs font-black px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-md active:scale-95 uppercase tracking-widest"
            >
              <Plus size={14} strokeWidth={4} />
              Cadastrar
            </button>
            
            <div className="flex items-center gap-2 pl-4 border-l border-slate-200 dark:border-slate-700">
              <span className="w-8 h-8 rounded-full bg-slate-900 dark:bg-slate-900 flex items-center justify-center text-xs font-black text-white border border-slate-800">
                {promoList.length}
              </span>
              <div className={`text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                <ChevronDown size={22} strokeWidth={2.5} />
              </div>
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="p-6 pt-2 border-t border-slate-50 dark:border-slate-800 animate-in slide-in-from-top-2 duration-300">
            {promoList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {promoList.map((promo, idx) => {
                  const isCardExpanded = expandedCards.has(promo.id);
                  return (
                    <div 
                      key={promo.id} 
                      className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md h-fit"
                    >
                      <div className={`h-1.5 w-full ${promo.ativa ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`} />
                      
                      <div className="p-6 space-y-3">
                        {/* Header do Card com Numeração */}
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 cursor-pointer flex items-center gap-2 group/title" onClick={() => toggleCard(promo.id)}>
                            <div className="flex items-center gap-2">
                               <span className="text-[10px] font-black text-white bg-slate-900 dark:bg-slate-800 w-5 h-5 flex items-center justify-center rounded-md">
                                 {idx + 1}
                               </span>
                               <h4 className="font-black text-slate-900 dark:text-white leading-tight tracking-tight">
                                 {promo.titulo}
                               </h4>
                            </div>
                            {isCardExpanded ? <ChevronUp size={16} className="text-slate-900 dark:text-white" strokeWidth={2.5} /> : <ChevronDown size={16} className="text-slate-400" />}
                          </div>
                          
                          <button 
                            onClick={() => togglePromoActive(mes, promo.id)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${promo.ativa ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                          >
                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${promo.ativa ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>

                        {/* Conteúdo Expandido */}
                        {isCardExpanded && (
                          <div className="pt-4 animate-in fade-in slide-in-from-top-1 duration-200 border-t border-slate-50 dark:border-slate-800 mt-2 space-y-4">
                            {/* Validade */}
                            <div className="flex items-center gap-2 text-[11px] text-indigo-700 dark:text-indigo-300 font-black py-1.5 px-3 bg-indigo-50 dark:bg-indigo-900/40 rounded-lg w-fit border border-indigo-100 dark:border-indigo-800">
                              <Clock size={12} strokeWidth={3} />
                              <span>{promo.dataInicio} - {promo.dataFim}</span>
                            </div>

                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic font-medium">
                              {promo.descricao}
                            </p>

                            {/* Ações e Status */}
                            <div className="pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                              <span className={`text-[10px] font-black uppercase tracking-widest ${promo.ativa ? 'text-emerald-700' : 'text-slate-500'}`}>
                                {promo.ativa ? 'ATIVA' : 'INATIVA'}
                              </span>
                              
                              <div className="flex items-center gap-1">
                                <button 
                                  onClick={() => handleAction('view', promo, mes)}
                                  className="p-1.5 text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 rounded-lg transition-all"
                                  title="Visualizar"
                                >
                                  <Eye size={18} />
                                </button>
                                <button 
                                  onClick={() => handleAction('edit', promo, mes)}
                                  className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded-lg transition-all"
                                  title="Editar"
                                >
                                  <Edit3 size={18} />
                                </button>
                                <button 
                                  onClick={() => handleAction('delete', promo, mes)}
                                  className="p-1.5 text-slate-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-lg transition-all"
                                  title="Excluir"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 dark:bg-slate-900/30 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                <Tag size={40} className="opacity-20 mb-3" />
                <p className="text-sm font-black uppercase tracking-widest">Nenhuma promoção para {mes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Promocional</h1>
        <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Configure as ofertas e campanhas sazonais do estabelecimento.</p>
      </div>

      <div className="space-y-10">
        {/* Mês de Referência */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Calendar size={18} className="text-red-700" strokeWidth={2.5} />
            <h2 className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-[0.2em]">Mês de Referência</h2>
          </div>
          {renderMonthSection(currentMonthName)}
        </section>

        {/* Cronograma Anual */}
        <section className="space-y-4">
          <h2 className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-[0.2em] px-1">Cronograma Anual</h2>
          <div className="space-y-4">
            {MESES.filter(m => m !== currentMonthName).map(mes => renderMonthSection(mes))}
          </div>
        </section>
      </div>

      <Modal 
        isOpen={modalConfig.isOpen}
        type={modalConfig.type}
        title={modalConfig.title}
        content={modalConfig.content}
        onConfirm={modalConfig.onConfirm}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default PromocionalPage;
