
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Trash2, StickyNote } from 'lucide-react';
import Table from '../components/UI/Table';
import Modal from '../components/UI/Modal';
import { Curriculo, ModalType } from '../types';

// Mock Data
const MOCK_NAMES = ["João Silva", "Maria Oliveira", "Pedro Santos", "Ana Costa", "Lucas Fernandes", "Julia Souza", "Bruno Lima", "Carla Dias"];

const MOCK_CURRICULOS: Curriculo[] = Array.from({ length: 45 }).map((_, i) => ({
  id: `curr-${i}`,
  data: new Date(2024, 1, Math.floor(Math.random() * 28) + 1).toLocaleDateString('pt-BR'),
  nome: MOCK_NAMES[i % MOCK_NAMES.length] + (i > 8 ? ` ${i}` : ''),
  funcao: ['Garçom', 'Cozinheiro', 'Hostess', 'Barman', 'Auxiliar de Limpeza'][Math.floor(Math.random() * 5)],
  contato: `(11) 9 ${Math.floor(Math.random() * 9000 + 1000)}-${Math.floor(Math.random() * 9000 + 1000)}`,
  idade: Math.floor(Math.random() * 40) + 18,
  sexo: ['M', 'F'][Math.floor(Math.random() * 2)] as 'M' | 'F',
  cidade: 'São Paulo',
  bairro: ['Pinheiros', 'Moema', 'Butantã', 'Centro', 'Vila Madalena'][Math.floor(Math.random() * 5)],
  observacao: i % 3 === 0 ? "Experiência anterior em restaurante de grande porte e disponibilidade imediata." : ""
}));

const CurriculosPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<Curriculo[]>(MOCK_CURRICULOS);
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; type: ModalType; title: string; content: React.ReactNode; onConfirm?: () => void }>({
    isOpen: false,
    type: 'view-content',
    title: '',
    content: ''
  });

  const handleDeleteClick = (e: React.MouseEvent, item: Curriculo) => {
    e.stopPropagation();
    setModalConfig({
      isOpen: true,
      type: 'confirm-delete',
      title: 'Confirmar exclusão',
      content: `Tem certeza que deseja excluir o currículo de ${item.nome}? Esta ação não pode ser desfeita.`,
      onConfirm: () => {
        setData(prev => prev.filter(c => c.id !== item.id));
      }
    });
  };

  const handleObsClick = (e: React.MouseEvent, item: Curriculo) => {
    e.stopPropagation();
    setModalConfig({
      isOpen: true,
      type: 'view-content',
      title: 'Visualização do currículo',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 tracking-widest uppercase font-bold">Nome</p>
              <p className="font-bold text-slate-900 dark:text-white">{item.nome}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 tracking-widest uppercase font-bold">Função</p>
              <p className="text-slate-900 dark:text-white">{item.funcao}</p>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 tracking-widest uppercase font-bold">Observação</p>
            <p className="text-slate-800 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800 italic font-medium">
              {item.observacao || 'Nenhuma observação cadastrada.'}
            </p>
          </div>
        </div>
      ),
    });
  };

  const handleViewClick = (e: React.MouseEvent, item: Curriculo) => {
    e.stopPropagation();
    navigate(`/curriculos/${item.id}`);
  };

  const columns = [
    { header: '#', accessor: (_: any, index: number) => <span className="text-slate-500">{index}</span>, className: 'w-12' },
    { header: 'Data', accessor: 'data', className: 'w-28 text-slate-500 font-medium' },
    { header: 'Nome', accessor: (item: Curriculo) => <span className="font-bold text-slate-900 dark:text-white tracking-tight">{item.nome}</span>, className: 'w-40' },
    { header: 'Função', accessor: 'funcao', className: 'w-32 text-slate-700 dark:text-slate-300' },
    { header: 'Contato', accessor: 'contato', className: 'w-36 text-slate-700 font-medium' },
    { header: 'Idade', accessor: 'idade', className: 'w-16 text-center text-slate-600' },
    { header: 'Sexo', accessor: 'sexo', className: 'w-16 text-center text-slate-600' },
    { header: 'Cidade', accessor: 'cidade', className: 'w-28 text-slate-500' },
    { header: 'Bairro', accessor: 'bairro', className: 'w-28 text-slate-500' },
    { 
      header: 'Obs', 
      accessor: (item: Curriculo) => (
        <button 
          onClick={(e) => handleObsClick(e, item)}
          className={`p-2 rounded-lg transition-colors ${item.observacao ? 'text-red-700 bg-red-50 dark:bg-red-900/30' : 'text-slate-300 cursor-not-allowed'}`}
          disabled={!item.observacao}
        >
          <StickyNote size={18} />
        </button>
      ),
      className: 'w-16 text-center'
    },
    { 
      header: 'Ações', 
      accessor: (item: Curriculo) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => handleViewClick(e, item)}
            className="p-2 text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all"
            title="Visualizar currículo"
          >
            <Eye size={18} />
          </button>
          <button 
            onClick={(e) => handleDeleteClick(e, item)}
            className="p-2 text-slate-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-lg transition-all"
            title="Excluir"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
      className: 'w-28'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Currículos</h1>
        <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Gerencie as candidaturas e currículos recebidos pelo sistema.</p>
      </div>

      <Table 
        columns={columns} 
        data={data} 
        searchPlaceholder="Buscar por nome, função ou contato..."
      />

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

export default CurriculosPage;
