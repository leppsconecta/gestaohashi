
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, StickyNote, AlertCircle } from 'lucide-react';
import Table from '../components/UI/Table';
import Modal from '../components/UI/Modal';
import { Feedback, FeedbackStatus, ModalType } from '../types';

// Mock Data
const MOCK_NAMES = ["Carlos Eduardo", "Fernanda Lima", "Ricardo Souza", "Patrícia Melo", "Gabriel Barbosa", "Aline Ferreira"];

const generateCodigo = () => {
  const nums = Math.floor(Math.random() * 900 + 100).toString();
  const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  return nums + letter;
};

const MOCK_FEEDBACKS: Feedback[] = Array.from({ length: 30 }).map((_, i) => ({
  id: `feed-${i}`,
  data: new Date(2024, 2, Math.floor(Math.random() * 28) + 1).toLocaleDateString('pt-BR'),
  codigo: generateCodigo(),
  status: ['Pendente', 'Resolvendo', 'Resolvido'][Math.floor(Math.random() * 3)] as FeedbackStatus,
  tipo: ['Reclamação', 'Elogio'][Math.floor(Math.random() * 2)] as any,
  origem: ['Site', 'Whatsapp', 'Google'][Math.floor(Math.random() * 3)] as any,
  nome: MOCK_NAMES[i % MOCK_NAMES.length],
  contato: `(11) 9 ${Math.floor(Math.random() * 9000 + 1000)}-${Math.floor(Math.random() * 9000 + 1000)}`,
  descricao: i % 2 === 0 ? "O atendimento foi excelente, parabéns a equipe. No entanto, o prato demorou um pouco mais do que o esperado para chegar à mesa." : "Gostaria de registrar minha satisfação com o novo cardápio."
}));

const FeedbacksPage: React.FC = () => {
  const [data, setData] = useState<Feedback[]>(MOCK_FEEDBACKS);

  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; type: ModalType; title: string; content: React.ReactNode; onConfirm?: () => void; maxWidth?: string }>({
    isOpen: false,
    type: 'view-content',
    title: '',
    content: '',
    maxWidth: 'max-w-lg'
  });

  const handleStatusChange = (id: string, newStatus: FeedbackStatus) => {
    setData(prev => prev.map(f => f.id === id ? { ...f, status: newStatus } : f));
  };

  const handleDeleteClick = (e: React.MouseEvent, item: Feedback) => {
    e.stopPropagation();
    setModalConfig({
      isOpen: true,
      type: 'confirm-delete',
      title: 'Confirmar exclusão',
      content: `Tem certeza que deseja excluir o feedback de ${item.nome} (${item.codigo})?`,
      onConfirm: () => {
        setData(prev => prev.filter(f => f.id !== item.id));
      }
    });
  };

  const handleDescClick = (e: React.MouseEvent, item: Feedback) => {
    e.stopPropagation();
    setModalConfig({
      isOpen: true,
      type: 'view-content',
      title: 'Descrição do feedback',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Nome</p>
              <p className="font-bold text-slate-900 dark:text-white">{item.nome}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Código</p>
              <p className="font-bold text-indigo-700 dark:text-indigo-400">{item.codigo}</p>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
            <p className="text-xs text-slate-500 uppercase mb-2 tracking-widest font-bold">Descrição</p>
            <p className="text-slate-900 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800 italic font-medium">
              {item.descricao || 'Nenhuma descrição cadastrada.'}
            </p>
          </div>
        </div>
      ),
    });
  };

  const columns = [
    { header: '#', accessor: (_: any, index: number) => <span className="text-slate-500">{index}</span>, className: 'w-12 text-center' },
    { header: 'Data', accessor: 'data', className: 'w-28 text-slate-700 dark:text-slate-300' },
    { header: 'Cód', accessor: (item: Feedback) => <span className="font-bold text-indigo-700 dark:text-indigo-400">{item.codigo}</span>, className: 'w-20' },
    {
      header: 'Status',
      accessor: (item: Feedback) => (
        <select
          value={item.status}
          onChange={(e) => handleStatusChange(item.id, e.target.value as FeedbackStatus)}
          onClick={(e) => e.stopPropagation()}
          className={`text-[10px] uppercase tracking-wider px-2 py-1.5 rounded-full border-0 focus:ring-2 focus:ring-indigo-500 cursor-pointer outline-none transition-colors font-bold
            ${item.status === 'Pendente' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' :
              item.status === 'Resolvendo' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' :
                'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'}
          `}
        >
          <option value="Pendente" className="text-slate-900 dark:bg-slate-800 dark:text-slate-100">Pendente</option>
          <option value="Resolvendo" className="text-slate-900 dark:bg-slate-800 dark:text-slate-100">Resolvendo</option>
          <option value="Resolvido" className="text-slate-900 dark:bg-slate-800 dark:text-slate-100">Resolvido</option>
        </select>
      ),
      className: 'w-32'
    },
    {
      header: 'Tipo',
      accessor: (item: Feedback) => (
        <span className={`text-xs uppercase tracking-tighter font-bold ${item.tipo === 'Reclamação' ? 'text-red-700' : 'text-emerald-700'}`}>
          {item.tipo}
        </span>
      ),
      className: 'w-24'
    },
    { header: 'Origem', accessor: 'origem', className: 'w-24 text-slate-500 font-medium' },
    { header: 'Nome', accessor: (item: Feedback) => <span className="font-bold text-slate-900 dark:text-white">{item.nome}</span>, className: 'w-40' },
    { header: 'Contato', accessor: 'contato', className: 'w-36 text-slate-600 font-medium' },
    {
      header: 'Descrição',
      accessor: (item: Feedback) => (
        <button
          onClick={(e) => handleDescClick(e, item)}
          className={`p-2 rounded-lg transition-colors ${item.descricao ? 'text-red-700 bg-red-50 dark:bg-red-900/40' : 'text-slate-300 cursor-not-allowed'}`}
          disabled={!item.descricao}
        >
          <StickyNote size={18} />
        </button>
      ),
      className: 'w-16 text-center'
    },
    {
      header: 'Ações',
      accessor: (item: Feedback) => (
        <div className="flex items-center gap-2">
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Feedbacks</h1>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Acompanhe a satisfação dos clientes e resolva pendências.</p>
        </div>
      </div>

      <Table
        columns={columns}
        data={data}
        searchPlaceholder="Buscar por nome, código ou contato..."
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

export default FeedbacksPage;
