
import React, { useState, useEffect } from 'react';
import { 
  Plus, Share2, Eye, Edit3, Trash2, Briefcase, User, CreditCard, RefreshCw, Upload, MapPin, FileText, Check, Copy
} from 'lucide-react';
import Table, { Column } from '../components/UI/Table';
import Modal from '../components/UI/Modal';
import { Funcionario, ModalType } from '../types';
import { DBService } from '../lib/db';

const FuncionarioDetailsView: React.FC<{ data: Funcionario }> = ({ data }) => {
  const labelClass = "text-[11px] text-slate-500 dark:text-slate-400 mb-1 block ml-1";
  const valueClass = "text-sm text-slate-900 dark:text-slate-100 font-medium";
  const sectionTitle = "flex items-center gap-2 text-[11px] text-indigo-600 dark:text-indigo-400 uppercase tracking-widest py-3 border-b border-slate-100 dark:border-slate-800 mb-4 mt-6 first:mt-0 font-bold";

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4 p-6 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800 mb-6">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-lg">
          {data.nome.charAt(0)}
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-none mb-1">{data.nome}</h2>
          <div className="flex items-center gap-3">
             <span className="text-[11px] text-slate-500 bg-white dark:bg-slate-800 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-800 tracking-wider shadow-sm font-bold">
               {data.codigo}
             </span>
             <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">{data.funcao}</span>
          </div>
        </div>
      </div>
      
      <section>
        <div className={sectionTitle}><Briefcase size={14} /> Dados Profissionais</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div><label className={labelClass}>Status</label><span className={valueClass}>{data.status}</span></div>
          <div><label className={labelClass}>Contrato</label><span className={valueClass}>{data.tipoContrato}</span></div>
          <div><label className={labelClass}>Função</label><span className={valueClass}>{data.funcao}</span></div>
          <div><label className={labelClass}>Data entrada</label><span className={valueClass}>{data.dataEntrada}</span></div>
        </div>
      </section>

      <section>
        <div className={sectionTitle}><CreditCard size={14} /> Dados Bancários</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div><label className={labelClass}>Banco</label><span className={valueClass}>{data.banco || '-'}</span></div>
          <div><label className={labelClass}>PIX ({data.pixTipo})</label><span className={valueClass}>{data.pixChave || '-'}</span></div>
          <div className="col-span-2 md:col-span-1"><label className={labelClass}>Titular</label><span className={valueClass}>{data.titularConta || '-'}</span></div>
        </div>
      </section>
    </div>
  );
};

const FuncionariosPage: React.FC = () => {
  const [data, setData] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalConfig, setModalConfig] = useState<any>({ isOpen: false });

  const loadData = async () => {
    setLoading(true);
    const result = await DBService.funcionarios.getAll();
    setData(result);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleAction = (type: 'view' | 'edit' | 'delete', item: Funcionario) => {
    if (type === 'delete') {
      setModalConfig({
        isOpen: true,
        type: 'confirm-delete',
        title: 'Excluir Funcionário',
        content: `Deseja remover ${item.nome}?`,
        onConfirm: async () => {
          await DBService.funcionarios.delete(item.id);
          loadData();
        }
      });
    } else {
      setModalConfig({
        isOpen: true,
        type: 'view-content',
        title: 'Ficha Cadastral',
        maxWidth: 'max-w-4xl',
        content: <FuncionarioDetailsView data={item} />
      });
    }
  };

  const columns: Column<Funcionario>[] = [
    { header: '#', accessor: (_, index) => <span className="text-slate-500 font-bold">{index}</span>, className: 'w-12 text-center' },
    { 
      header: 'Funcionário', 
      accessor: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-md">
            {item.nome.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 dark:text-white truncate max-w-[150px] tracking-tight">{item.nome}</span>
            <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">{item.codigo}</span>
          </div>
        </div>
      ),
      className: 'w-56'
    },
    { header: 'Função', accessor: 'funcao', className: 'w-36 text-slate-600 dark:text-slate-400 font-bold text-xs uppercase tracking-tight' },
    { header: 'Status', accessor: (item) => <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm border bg-emerald-50 text-emerald-700 border-emerald-100">{item.status}</span>, className: 'w-28 text-center' },
    { header: 'Contato', accessor: 'contato', className: 'w-36 text-slate-500 font-bold' },
    { 
      header: 'Ações', 
      accessor: (item) => (
        <div className="flex items-center gap-1">
          <button onClick={() => handleAction('view', item)} className="p-2 text-slate-400 hover:text-indigo-600 transition-all"><Eye size={18} /></button>
          <button onClick={() => handleAction('delete', item)} className="p-2 text-slate-400 hover:text-red-600 transition-all"><Trash2 size={18} /></button>
        </div>
      ),
      className: 'w-32 text-right'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Funcionários</h1>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Painel administrativo sincronizado com o banco.</p>
        </div>
        <button onClick={loadData} className="p-2 text-slate-400 hover:text-indigo-600"><RefreshCw size={20} className={loading ? 'animate-spin' : ''} /></button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><RefreshCw size={40} className="text-red-600 animate-spin" /></div>
      ) : (
        <Table columns={columns} data={data} searchPlaceholder="Buscar por nome..." />
      )}

      <Modal 
        isOpen={modalConfig.isOpen}
        type={modalConfig.type}
        title={modalConfig.title}
        maxWidth={modalConfig.maxWidth}
        content={modalConfig.content}
        onConfirm={modalConfig.onConfirm}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
      />
    </div>
  );
};

export default FuncionariosPage;
