import React, { useState, useEffect } from 'react';
import {
  Plus, Share2, Eye, Edit3, Trash2, Briefcase, User, CreditCard, RefreshCw, Upload, MapPin, FileText, Check, Copy
} from 'lucide-react';
import Table, { Column } from '../components/UI/Table';
import Modal from '../components/UI/Modal';

import { Funcionario, ModalType, AppRoute } from '../types';
import { supabase } from '../lib/supabase';

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
          <div><label className={labelClass}>Data entrada</label><span className={valueClass}>{data.dataEntrada || '-'}</span></div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section>
          <div className={sectionTitle}><User size={14} /> Dados Pessoais</div>
          <div className="grid grid-cols-2 gap-6">
            <div><label className={labelClass}>CPF/RG ({data.documentoTipo || 'Doc'})</label><span className={valueClass}>{data.documentoNumero || '-'}</span></div>
            <div><label className={labelClass}>Nascimento</label><span className={valueClass}>{data.dataNascimento || '-'}</span></div>
            <div><label className={labelClass}>Nacionalidade</label><span className={valueClass}>{data.nacionalidade || '-'}</span></div>
            <div><label className={labelClass}>Sexo</label><span className={valueClass}>{data.sexo || '-'}</span></div>
            <div className="col-span-2"><label className={labelClass}>Email</label><span className={valueClass}>{data.email || '-'}</span></div>
            <div className="col-span-2"><label className={labelClass}>Telefone</label><span className={valueClass}>{data.contato || '-'}</span></div>
          </div>
        </section>

        <section>
          <div className={sectionTitle}><MapPin size={14} /> Endereço</div>
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2"><label className={labelClass}>Rua</label><span className={valueClass}>{data.endereco?.rua || '-'}, {data.endereco?.numero || ''}</span></div>
            <div><label className={labelClass}>Bairro</label><span className={valueClass}>{data.endereco?.bairro || '-'}</span></div>
            <div><label className={labelClass}>Cidade/UF</label><span className={valueClass}>{data.endereco?.cidade || '-'}/{data.endereco?.estado || ''}</span></div>
          </div>
        </section>
      </div>

      <section>
        <div className={sectionTitle}><CreditCard size={14} /> Dados Bancários</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div><label className={labelClass}>Banco</label><span className={valueClass}>{data.banco || '-'}</span></div>
          <div><label className={labelClass}>PIX ({data.pixTipo})</label><span className={valueClass}>{data.pixChave || '-'}</span></div>
          <div className="col-span-2"><label className={labelClass}>Titular</label><span className={valueClass}>{data.titularConta || '-'}</span></div>
        </div>
      </section>

      {(data.documentoFrente || data.documentoVerso) && (
        <section>
          <div className={sectionTitle}><FileText size={14} /> Documentos Anexados</div>
          <div className="flex gap-4">
            {data.documentoFrente && (
              <a href={data.documentoFrente} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-3 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-100">
                <FileText size={18} />
                <span className="font-bold text-xs">Ver Frente</span>
              </a>
            )}
            {data.documentoVerso && (
              <a href={data.documentoVerso} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-3 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-100">
                <FileText size={18} />
                <span className="font-bold text-xs">Ver Verso</span>
              </a>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

const FuncionarioForm = React.forwardRef<HTMLFormElement, { onSuccess: () => void; initialData?: any }>(({ onSuccess, initialData }, ref) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    status: 'Ativo',
    tipoContrato: 'CLT (Padrão)',
    funcao: '',
    dataEntrada: new Date().toISOString().split('T')[0],
    nome: '',
    sexo: 'Masculino',
    dataNascimento: '',
    telefone: '',
    telefoneRecado: '',
    email: '',
    titular: '',
    banco: '',
    pixTipo: 'CPF',
    pixChave: '',
    docTipo: 'RG',
    docNumero: '',
    rua: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: 'SP'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        status: initialData.status || 'Ativo',
        tipoContrato: initialData.tipoContrato || 'CLT (Padrão)',
        funcao: initialData.funcao || '',
        dataEntrada: initialData.dataEntrada ? new Date(initialData.dataEntrada.split('/').reverse().join('-')).toISOString().split('T')[0] : new Date().toISOString().split('T')[0], // Convert DD/MM/YYYY to YYYY-MM-DD
        nome: initialData.nome || '',
        sexo: initialData.sexo || 'Masculino',
        dataNascimento: initialData.dataNascimento ? new Date(initialData.dataNascimento.split('/').reverse().join('-')).toISOString().split('T')[0] : '',
        telefone: initialData.contato || '',
        telefoneRecado: '', // Unavailable in map
        email: initialData.email || '',
        titular: initialData.titularConta || '',
        banco: initialData.banco || '',
        pixTipo: initialData.pixTipo || 'CPF',
        pixChave: initialData.pixChave || '',
        docTipo: initialData.documentoTipo || 'RG',
        docNumero: initialData.documentoNumero || '',
        rua: initialData.endereco?.rua || '',
        numero: initialData.endereco?.numero || '',
        bairro: initialData.endereco?.bairro || '',
        cidade: initialData.endereco?.cidade || '',
        estado: initialData.endereco?.estado || 'SP'
      });
    }
  }, [initialData]);

  // Files
  const [docFrente, setDocFrente] = useState<File | null>(null);
  const [docVerso, setDocVerso] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'frente' | 'verso') => {
    if (e.target.files && e.target.files[0]) {
      if (type === 'frente') setDocFrente(e.target.files[0]);
      else setDocVerso(e.target.files[0]);
    }
  };

  const uploadFile = async (file: File, path: string) => {
    // Placeholder for upload logic. 
    // real implementation requires bucket setup. 
    // returning fake URL for now if no bucket known.
    // In a real scenario: await supabase.storage.from('documents').upload(path, file);
    return `https://fake-url.com/${path}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Upload simulation
      let frenteUrl = '';
      let versoUrl = '';

      // NOTE: Actual upload disabled to prevent errors without bucket info.
      // if (docFrente) frenteUrl = await uploadFile(docFrente, `docs/${Date.now()}_frente_${docFrente.name}`);
      // if (docVerso) versoUrl = await uploadFile(docVerso, `docs/${Date.now()}_verso_${docVerso.name}`);

      const payload = {
        status: formData.status,
        type: formData.tipoContrato,
        role: formData.funcao,
        admission_date: formData.dataEntrada,
        name: formData.nome,
        gender: formData.sexo,
        birth_date: formData.dataNascimento || null,
        phone: formData.telefone,
        email: formData.email,
        bank_account_name: formData.titular,
        bank_name: formData.banco,
        bank_key_type: formData.pixTipo,
        bank_key: formData.pixChave,
        document_type: formData.docTipo,
        document: formData.docNumero,
        street: formData.rua,
        number: formData.numero,
        neighborhood: formData.bairro,
        city: formData.cidade,
        state: formData.estado,
        // document_front: frenteUrl,
        // document_back: versoUrl,
        code: initialData?.codigo ? parseInt(initialData.codigo) : Math.floor(Math.random() * 9000) + 1000
      };

      let error;
      if (initialData?.id) {
        const { error: updateError } = await supabase.schema('gestaohashi').from('equipe').update(payload).eq('id', initialData.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase.schema('gestaohashi').from('equipe').insert(payload);
        error = insertError;
      }

      if (error) throw error;

      alert(`Funcionário ${initialData?.id ? 'atualizado' : 'cadastrado'} com sucesso!`);
      onSuccess();
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar funcionário: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const labelClass = "block text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-wider";
  const inputClass = "w-full p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all";
  const sectionHeader = "flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest py-2 border-b border-slate-100 dark:border-slate-800 mb-4 mt-6 first:mt-0";

  return (
    <form ref={ref} onSubmit={handleSubmit} className="space-y-1">

      {/* Dados Empresa */}
      <div className={sectionHeader}><Briefcase size={14} /> Dados da Empresa</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className={labelClass}>Status</label>
          <select name="status" value={formData.status} onChange={handleChange} className={inputClass}>
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
            <option value="Férias">Férias</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Tipo de Contrato</label>
          <select name="tipoContrato" value={formData.tipoContrato} onChange={handleChange} className={inputClass}>
            <option value="CLT (Padrão)">CLT (Padrão)</option>
            <option value="PJ">PJ</option>
            <option value="Estágio">Estágio</option>
            <option value="Temporário">Temporário</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Função/Cargo</label>
          <div className="flex gap-2">
            <input name="funcao" value={formData.funcao} onChange={handleChange} className={inputClass} placeholder="Selecione ou digite" />
            {/* <button type="button" className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500"><Edit3 size={16} /></button> */}
          </div>
        </div>
        <div>
          <label className={labelClass}>Data Entrada</label>
          <input type="date" name="dataEntrada" value={formData.dataEntrada} onChange={handleChange} className={inputClass} />
        </div>
      </div>

      {/* Dados Pessoais */}
      <div className={sectionHeader}><User size={14} /> Dados Pessoais</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <label className={labelClass}>Nome Completo</label>
          <input name="nome" value={formData.nome} onChange={handleChange} className={inputClass} required />
        </div>
        <div>
          <label className={labelClass}>Sexo</label>
          <select name="sexo" value={formData.sexo} onChange={handleChange} className={inputClass}>
            <option value="Masculino">Masculino</option>
            <option value="Feminino">Feminino</option>
            <option value="Outro">Outro</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Data Nascimento</label>
          <input type="date" name="dataNascimento" value={formData.dataNascimento} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Telefone Principal</label>
          <input name="telefone" value={formData.telefone} onChange={handleChange} className={inputClass} placeholder="(00) 00000-0000" />
        </div>
        <div>
          <label className={labelClass}>Telefone Recado</label>
          <input name="telefoneRecado" value={formData.telefoneRecado} onChange={handleChange} className={inputClass} placeholder="(00) 00000-0000" />
        </div>
        <div>
          <label className={labelClass}>E-mail</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} placeholder="exemplo@email.com" />
        </div>
      </div>

      {/* Dados Bancários */}
      <div className={sectionHeader}><CreditCard size={14} /> Dados Bancários</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Nome do Titular</label>
          <input name="titular" value={formData.titular} onChange={handleChange} className={inputClass} placeholder="Nome completo como no banco" />
        </div>
        <div>
          <label className={labelClass}>Banco</label>
          <input name="banco" value={formData.banco} onChange={handleChange} className={inputClass} placeholder="Ex: Nubank, Itaú" />
        </div>
        <div>
          <label className={labelClass}>Tipo de Chave PIX</label>
          <select name="pixTipo" value={formData.pixTipo} onChange={handleChange} className={inputClass}>
            <option value="CPF">CPF</option>
            <option value="Celular">Celular</option>
            <option value="Email">Email</option>
            <option value="Aleatória">Aleatória</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Chave PIX</label>
          <input name="pixChave" value={formData.pixChave} onChange={handleChange} className={inputClass} placeholder="Chave PIX" />
        </div>
      </div>

      {/* Documentos */}
      <div className={sectionHeader}><FileText size={14} /> Documentos e Fotos</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Tipo de Documento</label>
          <select name="docTipo" value={formData.docTipo} onChange={handleChange} className={inputClass}>
            <option value="RG">RG</option>
            <option value="CPF">CPF</option>
            <option value="CNH">CNH</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Número do Documento</label>
          <input name="docNumero" value={formData.docNumero} onChange={handleChange} className={inputClass} placeholder="00.000.000-0" />
        </div>

        <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer relative group">
          <input type="file" onChange={(e) => handleFileChange(e, 'frente')} className="absolute inset-0 opacity-0 cursor-pointer" />
          <div className="w-10 h-10 mb-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Upload size={18} />
          </div>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Foto Frente (Doc)</p>
          <p className="text-[10px] text-slate-400">{docFrente ? docFrente.name : 'Clique para enviar'}</p>
        </div>

        <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer relative group">
          <input type="file" onChange={(e) => handleFileChange(e, 'verso')} className="absolute inset-0 opacity-0 cursor-pointer" />
          <div className="w-10 h-10 mb-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Upload size={18} />
          </div>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Foto Verso (Doc)</p>
          <p className="text-[10px] text-slate-400">{docVerso ? docVerso.name : 'Clique para enviar'}</p>
        </div>
      </div>

      {/* Endereço */}
      <div className={sectionHeader}><MapPin size={14} /> Endereço Completo</div>
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-3">
          <label className={labelClass}>Rua / Logradouro</label>
          <input name="rua" value={formData.rua} onChange={handleChange} className={inputClass} placeholder="Nome da Rua" />
        </div>
        <div>
          <label className={labelClass}>Número</label>
          <input name="numero" value={formData.numero} onChange={handleChange} className={inputClass} placeholder="123" />
        </div>
        <div className="col-span-2">
          <label className={labelClass}>Bairro</label>
          <input name="bairro" value={formData.bairro} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Cidade</label>
          <input name="cidade" value={formData.cidade} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Estado (UF)</label>
          <input name="estado" value={formData.estado} onChange={handleChange} className={inputClass} placeholder="SP" maxLength={2} />
        </div>
      </div>

      {/* Buttons removed - they are now in the modal footer */}
    </form>
  );
});

const FuncionariosPage: React.FC = () => {
  const [data, setData] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalConfig, setModalConfig] = useState<any>({ isOpen: false });
  const formRef = React.useRef<HTMLFormElement>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: result, error } = await supabase
        .schema('gestaohashi')
        .from('equipe')
        .select(`
          id, code, admission_date, type, name, status, role, phone, email, gender, 
          birth_date, nationality, bank_account_name, bank_name, bank_key_type, 
          bank_key, document_type, document, street, number, neighborhood, city, state
        `)
        .order('name');

      if (error) throw error;

      if (result) {
        const formattedData: Funcionario[] = result.map(item => ({
          id: item.id,
          codigo: item.code?.toString() || '',
          dataEntrada: item.admission_date ? new Date(item.admission_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '',
          tipoContrato: item.type || '',
          nome: item.name || 'Sem nome',
          // Garantir que status seja um valor válido ou 'Ativo' como fallback
          status: (item.status || 'Ativo') as any,
          funcao: item.role || '',
          contato: item.phone || '',
          email: item.email || '',
          sexo: item.gender || '',
          dataNascimento: item.birth_date ? new Date(item.birth_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '',
          nacionalidade: item.nationality || '',
          titularConta: item.bank_account_name || '',
          banco: item.bank_name || '',
          pixTipo: item.bank_key_type || '',
          pixChave: item.bank_key || '',
          documentoTipo: item.document_type || '',
          documentoNumero: item.document || '',
          endereco: {
            rua: item.street || '',
            numero: item.number || '',
            bairro: item.neighborhood || '',
            cidade: item.city || '',
            estado: item.state || ''
          },
          documentoFrente: '', // Not loading in list for performance
          documentoVerso: ''   // Not loading in list for performance
        }));
        setData(formattedData);
      }
    } catch (error: any) {
      console.error('Erro ao carregar funcionários:', error);
      alert(`Erro: ${error.message || JSON.stringify(error)}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleAction = async (type: 'view' | 'edit' | 'delete', item: Funcionario) => {
    if (type === 'delete') {
      setModalConfig({
        isOpen: true,
        type: 'confirm-delete',
        title: 'Excluir Funcionário',
        content: `Deseja remover ${item.nome}?`,
        onConfirm: async () => {
          try {
            const { error } = await supabase.from('equipe').delete().eq('id', item.id);
            if (error) throw error;
            loadData();
            setModalConfig({ isOpen: false });
          } catch (error) {
            console.error('Erro ao excluir:', error);
            alert('Erro ao excluir funcionário.');
          }
        }
      });
    } else if (type === 'edit') {
      setModalConfig({
        isOpen: true,
        type: 'confirm-update',
        title: 'Editar Funcionário',
        confirmText: 'Salvar Alterações',
        autoClose: false,
        onConfirm: () => {
          if (formRef.current) formRef.current.requestSubmit();
        },
        content: (
          <FuncionarioForm
            ref={formRef}
            initialData={item}
            onSuccess={() => {
              loadData();
              setModalConfig((prev: any) => ({ ...prev, isOpen: false }));
            }}
          />
        ),
        maxWidth: 'max-w-4xl'
      });
    } else {
      // Fetch full details including heavy documents
      let fullData = { ...item };
      try {
        const { data, error } = await supabase
          .schema('gestaohashi')
          .from('equipe')
          .select('document_front, document_back')
          .eq('id', item.id)
          .single();

        if (data && !error) {
          fullData.documentoFrente = data.document_front;
          fullData.documentoVerso = data.document_back;
        }
      } catch (err) {
        console.error('Erro ao carregar detalhes:', err);
      }

      setModalConfig({
        isOpen: true,
        type: 'view-content',
        title: 'Ficha Cadastral',
        maxWidth: 'max-w-4xl',
        content: <FuncionarioDetailsView data={fullData} />
      });
    }
  };

  const handleShare = () => {
    const link = `${window.location.origin}${AppRoute.PUBLIC_FORM_FUNCIONARIO}`;
    navigator.clipboard.writeText(link);
    alert('Link de cadastro copiado para a área de transferência!');
  };

  const handleCreate = () => {
    setModalConfig({
      isOpen: true,
      type: 'confirm-delete', // Using confirm-delete to get the RED color button style desired by user
      title: 'Novo Funcionário',
      confirmText: 'Salvar',
      autoClose: false,
      onConfirm: () => {
        if (formRef.current) formRef.current.requestSubmit();
      },
      content: (
        <FuncionarioForm
          ref={formRef}
          onSuccess={() => {
            loadData();
            setModalConfig((prev: any) => ({ ...prev, isOpen: false }));
          }}
        />
      ),
      maxWidth: 'max-w-4xl'
    });
  };

  const columns: Column<Funcionario>[] = [
    { header: '#', accessor: (_, index) => <span className="text-slate-500 font-bold">{index + 1}</span>, className: 'w-12 text-center' },
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
          <button onClick={() => handleAction('edit', item)} className="p-2 text-slate-400 hover:text-indigo-600 transition-all"><Edit3 size={18} /></button>
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
        <div className="flex items-center gap-2">
          <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider rounded-lg border border-indigo-100 dark:border-indigo-900 shadow-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all">
            <Share2 size={16} />
            Compartilhar
          </button>
          <button onClick={handleCreate} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg hover:bg-indigo-700 hover:shadow-indigo-600/30 transition-all">
            <Plus size={16} />
            Novo Funcionário
          </button>
          <button onClick={loadData} className="p-2 text-slate-400 hover:text-indigo-600"><RefreshCw size={20} className={loading ? 'animate-spin' : ''} /></button>
        </div>
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
