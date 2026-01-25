
import React, { useState, useEffect } from 'react';
import { Plus, Eye, Edit3, Trash2, StickyNote, Calendar as CalendarIcon, Clock, User, Users, Phone, Activity, FileText, Bookmark, RefreshCw } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Table from '../components/UI/Table';
import Modal from '../components/UI/Modal';
import { Reserva, ReservaStatus, ModalType } from '../types';
import { supabase } from '../lib/supabase';

// Mock Data Helpers
const TIPOS_RESERVA = ["Aniver", "Confra", "Evento", "Outro"];

const ReservaForm: React.FC<{ initialData?: Reserva; onChange: (data: Partial<Reserva>) => void }> = ({ initialData, onChange }) => {
  const [formData, setFormData] = useState<Partial<Reserva>>(initialData || {
    nome: '',
    contato: '',
    tipo: 'Aniver',
    data: new Date().toISOString().split('T')[0],
    hora: '19:00',
    pax: 2,
    status: 'Pendente',
    observacao: ''
  });

  const handleChange = (field: keyof Reserva, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onChange(newData);
  };

  const inputClass = "w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 shadow-inner";
  const labelClass = "text-[11px] text-slate-500 dark:text-slate-400 mb-1.5 block ml-1";
  const iconClass = "absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-600 transition-colors pointer-events-none";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        <div className="md:col-span-5 space-y-1">
          <label className={labelClass}>Nome do cliente</label>
          <div className="relative group">
            <User className={iconClass} size={18} />
            <input
              type="text"
              className={inputClass}
              placeholder="Nome completo"
              value={formData.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
            />
          </div>
        </div>
        <div className="md:col-span-4 space-y-1">
          <label className={labelClass}>Contato</label>
          <div className="relative group">
            <Phone className={iconClass} size={18} />
            <input
              type="text"
              className={inputClass}
              placeholder="(00) 00000-0000"
              value={formData.contato}
              onChange={(e) => handleChange('contato', e.target.value)}
            />
          </div>
        </div>
        <div className="md:col-span-3 space-y-1">
          <label className={labelClass}>Tipo de reserva</label>
          <div className="relative group">
            <Bookmark className={iconClass} size={18} />
            <select
              className={inputClass}
              value={formData.tipo}
              onChange={(e) => handleChange('tipo', e.target.value)}
            >
              {TIPOS_RESERVA.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        <div className="md:col-span-3 space-y-1">
          <label className={labelClass}>Data</label>
          <div className="relative group">
            <CalendarIcon className={iconClass} size={18} />
            <input
              type="date"
              className={inputClass}
              value={formData.data?.includes('/') ? formData.data.split('/').reverse().join('-') : formData.data}
              onChange={(e) => handleChange('data', e.target.value)}
            />
          </div>
        </div>
        <div className="md:col-span-3 space-y-1">
          <label className={labelClass}>Hora</label>
          <div className="relative group">
            <Clock className={iconClass} size={18} />
            <input
              type="time"
              className={inputClass}
              value={formData.hora}
              onChange={(e) => handleChange('hora', e.target.value)}
            />
          </div>
        </div>
        <div className="md:col-span-3 space-y-1">
          <label className={labelClass}>Pessoas</label>
          <div className="relative group">
            <Users className={iconClass} size={18} />
            <input
              type="number"
              className={inputClass}
              min="1"
              value={formData.pax}
              onChange={(e) => handleChange('pax', parseInt(e.target.value) || 1)}
            />
          </div>
        </div>
        <div className="md:col-span-3 space-y-1">
          <label className={labelClass}>Status</label>
          <div className="relative group">
            <Activity className={iconClass} size={18} />
            <select
              className={inputClass}
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              <option value="Pendente">Pendente</option>
              <option value="Confirmado">Confirmado</option>
              <option value="Cancelado">Cancelado</option>
              <option value="Finalizado">Finalizado</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <label className={labelClass}>Observação</label>
        <div className="relative group">
          <FileText className="absolute left-4 top-5 text-slate-500 group-focus-within:text-indigo-600 transition-colors pointer-events-none" size={18} />
          <textarea
            className={`${inputClass} h-32 resize-none pt-4 font-normal`}
            placeholder="Alguma restrição ou pedido especial?"
            value={formData.observacao}
            onChange={(e) => handleChange('observacao', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};


const ReservasPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>('Pendente');

  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; type: ModalType; title: string; content: React.ReactNode; onConfirm?: () => void; maxWidth?: string }>({
    isOpen: false,
    type: 'view-content',
    title: '',
    content: '',
    maxWidth: 'max-w-lg'
  });

  const [formState, setFormState] = useState<Partial<Reserva>>({});
  const formStateRef = React.useRef<Partial<Reserva>>({});

  useEffect(() => {
    formStateRef.current = formState;
  }, [formState]);

  const { data: data = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['reservas'],
    queryFn: async () => {
      const { data: result, error } = await supabase
        .schema('gestaohashi')
        .from('reservas')
        .select(`
          id, code, date, time, customer_name, customer_contact, 
          guests, type, status, notes
        `)
        .order('date', { ascending: false })
        .order('time', { ascending: false });

      if (error) throw error;

      if (result) {
        return result.map(item => ({
          id: item.id,
          codigo: item.code || '',
          data: item.date ? new Date(item.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '',
          hora: item.time ? item.time.substring(0, 5) : '00:00',
          tipo: item.type || 'Outro',
          nome: item.customer_name || 'Cliente Sem Nome',
          pax: item.guests || 2,
          contato: item.customer_contact || '',
          origem: 'Sistema',
          status: (item.status || 'Pendente') as ReservaStatus,
          observacao: item.notes || ''
        }));
      }
      return [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5,
  });

  // Configuração Realtime
  useEffect(() => {
    const channel = supabase
      .channel('reservas_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'gestaohashi',
          table: 'reservas'
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const handleStatusChange = async (id: string, newStatus: ReservaStatus) => {
    try {
      const { error } = await supabase
        .schema('gestaohashi')
        .from('reservas')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['reservas'] });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status.');
    }
  };

  const deleteReserva = async (id: string) => {
    try {
      const { error } = await supabase
        .schema('gestaohashi')
        .from('reservas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['reservas'] });
    } catch (error) {
      console.error('Erro ao excluir:', error);
      alert('Erro ao excluir reserva.');
    }
  };

  const handleSave = async () => {
    const currentData = formStateRef.current;
    console.log('Tentando salvar reserva (Ref):', currentData);

    try {
      if (!currentData.nome || !currentData.data || !currentData.hora) {
        console.warn('Validação falhou (Ref):', {
          nome: currentData.nome,
          data: currentData.data,
          hora: currentData.hora
        });
        alert('Por favor, preencha nome, data e hora.');
        return;
      }

      // Converte data de DD/MM/YYYY para YYYY-MM-DD se necessário
      const formattedDate = currentData.data.includes('/')
        ? currentData.data.split('/').reverse().join('-')
        : currentData.data;

      const payload = {
        customer_name: currentData.nome,
        customer_contact: currentData.contato,
        type: currentData.tipo,
        date: formattedDate,
        time: currentData.hora,
        guests: currentData.pax,
        status: currentData.status,
        notes: currentData.observacao,
        code: currentData.codigo || Math.floor(1000 + Math.random() * 9000).toString()
      };

      if (currentData.id) {
        // Update
        const { error } = await supabase
          .schema('gestaohashi')
          .from('reservas')
          .update(payload)
          .eq('id', currentData.id);
        if (error) throw error;
      } else {
        // Create
        const { error } = await supabase
          .schema('gestaohashi')
          .from('reservas')
          .insert([payload]);
        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['reservas'] });
      setModalConfig(prev => ({ ...prev, isOpen: false }));
      setFormState({});
    } catch (error) {
      console.error('Erro ao salvar reserva:', error);
      alert('Erro ao salvar reserva.');
    }
  };

  const handleConfirm = () => {
    if (modalConfig.type === 'confirm-delete') {
      modalConfig.onConfirm?.();
    } else if (modalConfig.type === 'confirm-insert' || modalConfig.type === 'confirm-update') {
      handleSave();
    }
  };

  const handleAction = (type: 'view' | 'edit' | 'delete', item: Reserva) => {
    if (type === 'delete') {
      setModalConfig({
        isOpen: true,
        type: 'confirm-delete',
        title: 'Excluir reserva',
        maxWidth: 'max-w-lg',
        content: `Tem certeza que deseja excluir a reserva de ${item.nome} marcada para ${item.data} às ${item.hora}?`,
        onConfirm: () => deleteReserva(item.id)
      });
    } else if (type === 'edit') {
      setFormState(item);
      setModalConfig({
        isOpen: true,
        type: 'confirm-update',
        title: 'Editar reserva',
        maxWidth: 'max-w-4xl',
        content: <ReservaForm initialData={item} onChange={(newData) => setFormState(prev => ({ ...prev, ...newData }))} />
      });
    } else {
      setModalConfig({
        isOpen: true,
        type: 'view-content',
        title: 'Detalhes da reserva',
        maxWidth: 'max-w-2xl',
        content: (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Código</label>
                <p className="text-xl font-bold text-indigo-700 dark:text-indigo-400 tracking-wider">{item.codigo}</p>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Tipo</label>
                <p className="text-lg text-slate-900 dark:text-white">{item.tipo}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Nome do cliente</label>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{item.nome}</p>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Contato</label>
                <p className="text-lg text-indigo-700 dark:text-indigo-400">{item.contato}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Data</label>
                <p className="text-slate-900 dark:text-slate-100">{item.data}</p>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Hora</label>
                <p className="text-slate-900 dark:text-slate-100">{item.hora}</p>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Pessoas</label>
                <p className="font-bold text-indigo-700 dark:text-indigo-400">{item.pax} {item.pax > 1 ? 'pessoas' : 'pessoa'}</p>
              </div>
            </div>
            <div className="pt-5 border-t border-slate-200 dark:border-slate-700">
              <label className="text-xs text-slate-500 mb-2 block">Observação</label>
              <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-300 leading-relaxed shadow-inner">
                {item.observacao || "Nenhuma observação informada."}
              </div>
            </div>
          </div>
        )
      });
    }
  };

  const getUnresolvedCount = (status: string) => {
    return data.filter(item => item.status === status).length;
  };

  const tabs = ['Pendente', 'Confirmado', 'Finalizado', 'Cancelado'];
  const filteredData = data.filter(item => item.status === activeTab);

  const generateWhatsAppLink = (item: Reserva) => {
    const firstName = item.nome.split(' ')[0];
    const phone = item.contato.replace(/\D/g, '');

    const [day, month, year] = item.data.split('/');
    const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const dayOfWeek = dateObj.toLocaleDateString('pt-BR', { weekday: 'long' });
    const capitalizedDay = dayOfWeek.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('-');

    const horaNum = item.hora.split(':')[0];

    const message = `Olá ${firstName} tudo bem  ?  Passando aqui só pra confirmar sua reserva\n` +
      `Já vou avisar o pessoal para deixar tudo no jeito pra você\n\n` +
      `Posso confirmar ?\n` +
      `* *Data/H:* ${day}/${month} às ${horaNum}h  ( ${capitalizedDay} )\n` +
      `* Nosso tempo de tolerância é de 10 minutinhos, ta bom`;

    return `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
  };

  const columns = [
    { header: '#', accessor: (_: any, index: number) => <span className="text-slate-500">{index + 1}</span>, className: 'w-12 text-center' },
    { header: 'Código', accessor: (item: Reserva) => <span className="font-bold text-indigo-700 dark:text-indigo-400 tracking-widest">{item.codigo}</span>, className: 'w-24' },
    { header: 'Data/Hora', accessor: (item: Reserva) => (<div className="flex flex-col"><span className="text-slate-900 dark:text-slate-100">{item.data}</span><span className="text-[10px] text-slate-500">{item.hora}</span></div>), className: 'w-28' },
    { header: 'Tipo', accessor: (item: Reserva) => (<span className="text-[10px] px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 rounded-lg border border-slate-200 dark:border-slate-700 font-medium">{item.tipo}</span>), className: 'w-32' },
    { header: 'Cliente', accessor: (item: Reserva) => (<div className="flex flex-col"><span className="font-bold text-slate-900 dark:text-white text-sm">{item.nome}</span><span className="text-[10px] text-indigo-600 dark:text-indigo-400">{item.pax} {item.pax > 1 ? 'pessoas' : 'pessoa'}</span></div>), className: 'w-56' },
    {
      header: 'Contato',
      accessor: (item: Reserva) => (
        <a
          href={generateWhatsAppLink(item)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-700 dark:text-indigo-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          {item.contato}
        </a>
      ),
      className: 'w-36'
    },
    {
      header: 'Status',
      accessor: (item: Reserva) => (
        <select
          value={item.status}
          onChange={(e) => handleStatusChange(item.id, e.target.value as ReservaStatus)}
          onClick={(e) => e.stopPropagation()}
          className={`text-[10px] px-2.5 py-2 rounded-xl border-0 focus:ring-2 focus:ring-indigo-500 cursor-pointer outline-none transition-all shadow-sm font-bold
            ${item.status === 'Pendente' ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-300' :
              item.status === 'Confirmado' ? 'bg-indigo-100 text-indigo-900 dark:bg-indigo-900/40 dark:text-indigo-300' :
                item.status === 'Cancelado' ? 'bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-300' :
                  'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-300'}
          `}
        >
          <option value="Pendente" className="text-slate-900 dark:bg-slate-800 dark:text-slate-100">Pendente</option>
          <option value="Confirmado" className="text-slate-900 dark:bg-slate-800 dark:text-slate-100">Confirmado</option>
          <option value="Cancelado" className="text-slate-900 dark:bg-slate-800 dark:text-slate-100">Cancelado</option>
          <option value="Finalizado" className="text-slate-900 dark:bg-slate-800 dark:text-slate-100">Finalizado</option>
        </select>
      ),
      className: 'w-36'
    },
    { header: 'Obs', accessor: (item: Reserva) => (<button onClick={() => handleAction('view', item)} className={`p-2.5 rounded-xl transition-all ${item.observacao ? 'text-indigo-700 bg-indigo-50 dark:bg-indigo-900/40 shadow-sm border border-indigo-100 dark:border-indigo-800' : 'text-slate-300 cursor-not-allowed'}`} disabled={!item.observacao}><StickyNote size={18} strokeWidth={2} /></button>), className: 'w-16 text-center' },
    { header: 'Ações', accessor: (item: Reserva) => (<div className="flex items-center gap-1"><button onClick={() => handleAction('view', item)} className="p-1.5 text-slate-500 hover:text-indigo-700 rounded-lg transition-all" title="Visualizar"><Eye size={20} strokeWidth={2} /></button><button onClick={() => handleAction('edit', item)} className="p-1.5 text-slate-500 hover:text-blue-700 rounded-lg transition-all" title="Editar"><Edit3 size={20} strokeWidth={2} /></button><button onClick={() => handleAction('delete', item)} className="p-1.5 text-slate-500 hover:text-red-700 rounded-lg transition-all" title="Excluir"><Trash2 size={20} strokeWidth={2} /></button></div>), className: 'w-28' }
  ];

  return (
    <div className="space-y-6 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Reservas</h1>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Gerenciamento completo das reservas do estabelecimento.</p>
        </div>
        <button
          onClick={() => {
            const initialNew = { status: 'Pendente' as ReservaStatus, tipo: 'Aniver', pax: 2, data: new Date().toISOString().split('T')[0], hora: '19:00' };
            setFormState(initialNew);
            setModalConfig({
              isOpen: true,
              type: 'confirm-insert',
              title: 'Nova reserva',
              maxWidth: 'max-w-4xl',
              content: <ReservaForm initialData={initialNew as any} onChange={(newData) => setFormState(prev => ({ ...prev, ...newData }))} />
            });
          }}
          className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold px-6 py-3 rounded-2xl flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-200 dark:shadow-none tracking-widest text-xs"
        >
          <Plus size={22} strokeWidth={3} />
          Cadastrar
        </button>
      </div>

      {/* Abas */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-700 pb-1">
        {tabs.map(tab => {
          const count = getUnresolvedCount(tab);

          let activeClass = '';
          let inactiveClass = '';
          let badgeClass = '';

          switch (tab) {
            case 'Pendente':
              activeClass = 'bg-red-600 text-white shadow-md border-transparent ring-2 ring-offset-2 ring-red-600';
              inactiveClass = 'bg-red-600 text-white border-transparent opacity-50 hover:opacity-80';
              badgeClass = 'bg-white text-red-700 shadow-sm';
              break;
            case 'Confirmado':
              activeClass = 'bg-emerald-600 text-white shadow-md border-transparent ring-2 ring-offset-2 ring-emerald-600';
              inactiveClass = 'bg-emerald-600 text-white border-transparent opacity-50 hover:opacity-80';
              badgeClass = 'bg-white text-emerald-700 shadow-sm';
              break;
            case 'Finalizado':
              activeClass = 'bg-blue-600 text-white shadow-md border-transparent ring-2 ring-offset-2 ring-blue-600';
              inactiveClass = 'bg-blue-600 text-white border-transparent opacity-50 hover:opacity-80';
              badgeClass = 'bg-white text-blue-700 shadow-sm';
              break;
            case 'Cancelado':
              activeClass = 'bg-orange-600 text-white shadow-md border-transparent ring-2 ring-offset-2 ring-orange-600';
              inactiveClass = 'bg-orange-600 text-white border-transparent opacity-50 hover:opacity-80';
              badgeClass = 'bg-white text-orange-700 shadow-sm';
              break;
            default:
              activeClass = 'bg-indigo-600 text-white shadow-md border-transparent ring-2 ring-offset-2 ring-indigo-600';
              inactiveClass = 'bg-indigo-600 text-white border-transparent opacity-50 hover:opacity-80';
              badgeClass = 'bg-white text-indigo-700 shadow-sm';
          }

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                relative px-6 py-3 rounded-t-lg font-bold text-sm transition-all flex items-center gap-2 border-b-2
                ${activeTab === tab ? activeClass : inactiveClass}
              `}
            >
              {tab}
              {count > 0 && (
                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold animate-pulse ${badgeClass}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <Table columns={columns} data={filteredData} searchPlaceholder="Buscar por código, cliente ou tipo..." />

      <Modal
        isOpen={modalConfig.isOpen}
        type={modalConfig.type}
        title={modalConfig.title}
        content={modalConfig.content}
        maxWidth={modalConfig.maxWidth}
        onConfirm={handleConfirm}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default ReservasPage;
