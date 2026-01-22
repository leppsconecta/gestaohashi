import React, { useState, useEffect } from 'react';
import {
  Plus, Share2, Eye, Edit3, Trash2, Briefcase, User, CreditCard, RefreshCw, Upload, MapPin, FileText, Check, Copy, Settings, Search, ChevronDown
} from 'lucide-react';
import Table, { Column } from '../components/UI/Table';
import Modal from '../components/UI/Modal';
import RoleManager from '../components/RoleManager';

import { Funcionario, ModalType, AppRoute } from '../types';
import { supabase } from '../lib/supabase';

const FuncionarioDetailsView: React.FC<{ data: Funcionario }> = ({ data }) => {
  const [downloading, setDownloading] = useState<string | null>(null);

  const sectionTitle = "text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2";
  const itemClass = "bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800";
  const labelClass = "text-[10px] text-slate-500 uppercase font-bold mb-1";
  const valueClass = "text-sm text-slate-900 dark:text-white font-medium truncate";

  const fetchAndDownload = async (type: 'front' | 'back') => {
    setDownloading(type);
    try {
      const { data: result, error } = await supabase
        .schema('gestaohashi')
        .from('equipe')
        .select(type === 'front' ? 'document_front' : 'document_back')
        .eq('id', data.id)
        .single();

      if (error) throw error;

      const content = type === 'front' ? (result as any)?.document_front : (result as any)?.document_back;
      if (!content) return alert('Arquivo não encontrado.');

      const link = document.createElement('a');
      link.href = content;
      link.download = `Doc_${type === 'front' ? 'Frente' : 'Verso'}_${data.nome}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
      alert('Erro ao baixar arquivo.');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Compacto */}
      <div className="flex items-start gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div className="w-14 h-14 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xl font-bold shadow-lg shrink-0">
          {data.nome.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate">{data.nome}</h2>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-bold text-slate-500 uppercase tracking-wider">{data.funcao}</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${data.status === 'Ativo' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
              }`}>{data.status}</span>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold uppercase tracking-wider">{data.tipoContrato}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className={sectionTitle}><User size={14} /> Pessoal & Contato</h3>
          <div className="space-y-2">
            <div className={itemClass}>
              <p className={labelClass}>CPF / RG</p>
              <p className={valueClass}>{data.documentoNumero || '-'}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className={itemClass}>
                <p className={labelClass}>Nascimento</p>
                <p className={valueClass}>{data.dataNascimento || '-'}</p>
              </div>
              <div className={itemClass}>
                <p className={labelClass}>Sexo</p>
                <p className={valueClass}>{data.sexo}</p>
              </div>
            </div>
            <div className={itemClass}>
              <p className={labelClass}>Contato</p>
              <p className={valueClass}>{data.contato}</p>
              {data.contatoRecado && <p className="text-xs text-slate-500 mt-0.5">Recado: {data.contatoRecado}</p>}
              <p className="text-xs text-slate-500 mt-0.5">{data.email}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className={sectionTitle}><CreditCard size={14} /> Dados Bancários</h3>
          <div className="space-y-2">
            <div className={itemClass}>
              <p className={labelClass}>Titular</p>
              <p className={valueClass}>{data.titularConta || '-'}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className={itemClass}>
                <p className={labelClass}>Banco</p>
                <p className={valueClass}>{data.banco || '-'}</p>
              </div>
              <div className={itemClass}>
                <p className={labelClass}>Pix ({data.pixTipo})</p>
                <div className="flex items-center justify-between">
                  <p className={valueClass}>{data.pixChave || '-'}</p>
                  {data.pixChave && <Copy size={12} className="text-slate-400 cursor-pointer hover:text-indigo-600" onClick={() => navigator.clipboard.writeText(data.pixChave)} />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className={sectionTitle}><MapPin size={14} /> Endereço</h3>
        <div className={`${itemClass} flex items-center gap-3`}>
          <MapPin size={18} className="text-slate-400 shrink-0" />
          <p className={valueClass}>
            {data.endereco?.rua}, {data.endereco?.numero} {data.endereco?.complemento ? `- ${data.endereco?.complemento}` : ''} - {data.endereco?.bairro}, {data.endereco?.cidade}/{data.endereco?.estado}
          </p>
        </div>
      </div>

      <div>
        <h3 className={sectionTitle}><FileText size={14} /> Documentos</h3>
        <div className="flex gap-3">
          <button
            onClick={() => fetchAndDownload('front')}
            disabled={downloading === 'front'}
            className="flex-1 flex items-center justify-center gap-2 p-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg border border-indigo-100 transition-all active:scale-95 disabled:opacity-50"
          >
            {downloading === 'front' ? <RefreshCw size={18} className="animate-spin" /> : <Upload size={18} className="rotate-180" />}
            <span className="font-bold text-xs uppercase">Baixar Frente</span>
          </button>
          <button
            onClick={() => fetchAndDownload('back')}
            disabled={downloading === 'back'}
            className="flex-1 flex items-center justify-center gap-2 p-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg border border-indigo-100 transition-all active:scale-95 disabled:opacity-50"
          >
            {downloading === 'back' ? <RefreshCw size={18} className="animate-spin" /> : <Upload size={18} className="rotate-180" />}
            <span className="font-bold text-xs uppercase">Baixar Verso</span>
          </button>
        </div>
      </div>
    </div>
  );
};

type FuncionarioContrato = 'CLT' | 'PJ' | 'Freelancer' | 'Estágio' | 'Temporário';

const FuncionarioForm = React.forwardRef<HTMLFormElement, { onSuccess: () => void; initialData?: any; setModalConfig: React.Dispatch<React.SetStateAction<any>> }>(({ onSuccess, initialData, setModalConfig }, ref) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    status: 'Ativo',
    tipoContrato: 'CLT' as FuncionarioContrato,
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
    estado: 'SP',
    complemento: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        status: initialData.status || 'Ativo',
        tipoContrato: initialData.tipoContrato || 'CLT',
        funcao: initialData.funcao || '',
        dataEntrada: initialData.dataEntrada ? new Date(initialData.dataEntrada.split('/').reverse().join('-')).toISOString().split('T')[0] : new Date().toISOString().split('T')[0], // Convert DD/MM/YYYY to YYYY-MM-DD
        nome: initialData.nome || '',
        sexo: initialData.sexo || 'Masculino',
        dataNascimento: initialData.dataNascimento ? new Date(initialData.dataNascimento.split('/').reverse().join('-')).toISOString().split('T')[0] : '',
        telefone: initialData.contato || '',
        telefoneRecado: initialData.contatoRecado || '',
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
        estado: initialData.endereco?.estado || 'SP',
        complemento: initialData.endereco?.complemento || ''
      });
    }
  }, [initialData]);



  // Roles
  const [roles, setRoles] = useState<{ id: string, name: string }[]>([]);
  const [showRoleManager, setShowRoleManager] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);



  const fetchRoles = async () => {
    const { data } = await supabase.schema('gestaohashi').from('cargos').select('*').order('name');
    if (data) setRoles(data);
  };

  useEffect(() => { fetchRoles(); }, []);

  // Handle Role Manager Overlay
  useEffect(() => {
    if (showRoleManager) {
      setModalConfig((prev: any) => ({
        ...prev,
        hideFooter: true,
        title: 'Gerenciar Cargos',
        maxWidth: 'max-w-xs'
      }));
    } else {
      setModalConfig((prev: any) => ({
        ...prev,
        hideFooter: false,
        title: initialData?.id ? 'Editar Funcionário' : 'Novo Funcionário',
        maxWidth: 'max-w-4xl'
      }));
    }
  }, [showRoleManager, setModalConfig, initialData]);

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

      const isFreelancer = formData.tipoContrato === 'Freelancer';

      const payload = {
        status: formData.status,
        type: formData.tipoContrato,
        role: isFreelancer ? 'Freelancer' : formData.funcao,
        admission_date: isFreelancer ? null : formData.dataEntrada,
        name: formData.nome,
        gender: isFreelancer ? null : formData.sexo,
        birth_date: isFreelancer ? null : (formData.dataNascimento || null),
        phone: formData.telefone,
        emergency_phone: formData.telefoneRecado,
        email: isFreelancer ? null : formData.email,
        bank_account_name: formData.titular,
        bank_name: formData.banco,
        bank_key_type: formData.pixTipo,
        bank_key: formData.pixChave,
        document_type: isFreelancer ? null : formData.docTipo,
        document: isFreelancer ? null : formData.docNumero,
        street: isFreelancer ? null : formData.rua,
        number: isFreelancer ? null : formData.numero,
        neighborhood: isFreelancer ? null : formData.bairro,
        city: isFreelancer ? null : formData.cidade,
        state: isFreelancer ? null : formData.estado,
        complement: isFreelancer ? null : formData.complemento,
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

  if (showRoleManager) {
    return (
      <div className="p-2">
        <div className="flex items-center gap-2 mb-4 text-slate-500 cursor-pointer hover:text-indigo-600" onClick={() => setShowRoleManager(false)}>
          <div className="rotate-180"><Share2 size={16} /></div> {/* Using Share2 as placeholder for back arrow since ArrowLeft wasn't imported yet, or just text */}
          <span className="text-xs font-bold uppercase">Voltar para o formulário</span>
        </div>
        <RoleManager
          onClose={() => setShowRoleManager(false)}
          onUpdate={fetchRoles}
        />
      </div>
    );
  }

  const isFreelancer = formData.tipoContrato === 'Freelancer';

  return (
    <form
      ref={ref}
      onSubmit={handleSubmit}
      className="space-y-1"
      onInvalidCapture={(e) => {
        // Prevent default browser behavior if needed, but here we just want to ensure feedback
        const target = e.target as HTMLInputElement;
        if (!target.validity.valid) {
          // If the invalid element is hidden or scrolled out, the user won't see it.
          // We can show a generic alert to ensure they know SOMETHING is wrong.
          // Debounce this so we don't spam alerts for every invalid field (bubbling).
          // However, onInvalid is per element.
          // Simplest: just ensure the form shows visual indicators.
          // A global toast would be better, but alert is requested/standard here.
          // Actually, let's just let the browser bubble show, but if we suspect it's hidden:
          // We can't easily detect if visible.
          // Let's add the alert in the onConfirm logic instead.
        }
      }}
    >

      {/* Dados Empresa */}
      <div className={sectionHeader}><Briefcase size={14} /> Dados da Empresa</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className={labelClass}>Status</label>
          <select name="status" value={formData.status} onChange={handleChange} className={inputClass} required>
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
            <option value="Férias">Férias</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Tipo de Contrato</label>
          <select
            value={formData.tipoContrato}
            onChange={(e) => setFormData({ ...formData, tipoContrato: e.target.value as FuncionarioContrato })}
            className={inputClass}
          >
            <option value="CLT">CLT</option>
            <option value="PJ">PJ</option>
            <option value="Estágio">Estágio</option>
            <option value="Temporário">Temporário</option>
            <option value="Freelancer">Freelancer</option>
          </select>
        </div>

        {!isFreelancer && (
          <>
            <div>
              <label className={labelClass}>Função/Cargo</label>
              <div className="flex gap-2">
                <div className="relative flex-1 group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Search size={14} />
                  </div>
                  <input
                    name="funcao"
                    value={formData.funcao}
                    onChange={handleChange}
                    onFocus={() => setShowRoleDropdown(true)}
                    onBlur={() => setTimeout(() => setShowRoleDropdown(false), 200)}
                    className={`${inputClass} pl-9`}
                    placeholder="Pesquisar ou selecionar..."
                    autoComplete="off"
                    required={!isFreelancer}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <ChevronDown size={14} />
                  </div>

                  {/* Custom Dropdown */}
                  {showRoleDropdown && (
                    <div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto custom-scrollbar">
                      {roles.filter(r => r.name.toLowerCase().includes(formData.funcao.toLowerCase())).length > 0 ? (
                        roles
                          .filter(r => r.name.toLowerCase().includes(formData.funcao.toLowerCase()))
                          .map(r => (
                            <div
                              key={r.id}
                              className="px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer border-b border-slate-50 dark:border-slate-700/50 last:border-0 flex items-center justify-between"
                              onClick={() => setFormData(prev => ({ ...prev, funcao: r.name }))}
                            >
                              {r.name}
                            </div>
                          ))
                      ) : (
                        <div className="p-3 text-xs text-slate-500 text-center">
                          Nenhuma função encontrada.
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowRoleManager(true)}
                  className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  title="Gerenciar Cargos"
                >
                  <Settings size={18} />
                </button>
              </div>
            </div>
            <div>
              <label className={labelClass}>Data Entrada</label>
              <input type="date" name="dataEntrada" value={formData.dataEntrada} onChange={handleChange} className={inputClass} required={!isFreelancer} />
            </div>
          </>
        )}
      </div>

      {/* Dados Pessoais */}
      <div className={sectionHeader}><User size={14} /> Dados Pessoais</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <label className={labelClass}>Nome Completo</label>
          <input name="nome" value={formData.nome} onChange={handleChange} className={inputClass} required />
        </div>

        {!isFreelancer && (
          <>
            <div>
              <label className={labelClass}>Sexo</label>
              <select name="sexo" value={formData.sexo} onChange={handleChange} className={inputClass} required={!isFreelancer}>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Data Nascimento</label>
              <input type="date" name="dataNascimento" value={formData.dataNascimento} onChange={handleChange} className={inputClass} required={!isFreelancer} />
            </div>
          </>
        )}

        <div>
          <label className={labelClass}>Telefone Principal</label>
          <input name="telefone" value={formData.telefone} onChange={handleChange} className={inputClass} placeholder="(00) 00000-0000" required />
        </div>

        {!isFreelancer && (
          <>
            <div>
              <label className={labelClass}>Telefone Recado</label>
              <input name="telefoneRecado" value={formData.telefoneRecado} onChange={handleChange} className={inputClass} placeholder="(00) 00000-0000" />
            </div>
            <div>
              <label className={labelClass}>E-mail</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} placeholder="exemplo@email.com" required={!isFreelancer} />
            </div>
          </>
        )}
      </div>

      {/* Dados Bancários */}
      <div className={sectionHeader}><CreditCard size={14} /> Dados Bancários</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Nome do Titular</label>
          <input name="titular" value={formData.titular} onChange={handleChange} className={inputClass} placeholder="Nome completo como no banco" required />
        </div>
        <div>
          <label className={labelClass}>Banco</label>
          <input name="banco" value={formData.banco} onChange={handleChange} className={inputClass} placeholder="Ex: Nubank, Itaú" required />
        </div>
        <div>
          <label className={labelClass}>Tipo de Chave PIX</label>
          <select name="pixTipo" value={formData.pixTipo} onChange={handleChange} className={inputClass} required>
            <option value="CPF">CPF</option>
            <option value="Celular">Celular</option>
            <option value="Email">Email</option>
            <option value="Aleatória">Aleatória</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Chave PIX</label>
          <input name="pixChave" value={formData.pixChave} onChange={handleChange} className={inputClass} placeholder="Chave PIX" required />
        </div>
      </div>

      {!isFreelancer && (
        <>
          {/* Documentos */}
          <div className={sectionHeader}><FileText size={14} /> Documentos e Fotos</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Tipo de Documento</label>
              <select name="docTipo" value={formData.docTipo} onChange={handleChange} className={inputClass} required={!isFreelancer}>
                <option value="RG">RG</option>
                <option value="CPF">CPF</option>
                <option value="CNH">CNH</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Número do Documento</label>
              <input name="docNumero" value={formData.docNumero} onChange={handleChange} className={inputClass} placeholder="00.000.000-0" required={!isFreelancer} />
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
              <input name="rua" value={formData.rua} onChange={handleChange} className={inputClass} placeholder="Nome da Rua" required={!isFreelancer} />
            </div>
            <div>
              <label className={labelClass}>Número</label>
              <input name="numero" value={formData.numero} onChange={handleChange} className={inputClass} placeholder="123" required={!isFreelancer} />
            </div>

            <div className="col-span-2">
              <label className={labelClass}>Complemento</label>
              <input name="complemento" value={formData.complemento} onChange={handleChange} className={inputClass} placeholder="Apto 23, Bloco B" />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Bairro</label>
              <input name="bairro" value={formData.bairro} onChange={handleChange} className={inputClass} required={!isFreelancer} />
            </div>
            <div className="col-span-3">
              <label className={labelClass}>Cidade</label>
              <input name="cidade" value={formData.cidade} onChange={handleChange} className={inputClass} required={!isFreelancer} />
            </div>
            <div>
              <label className={labelClass}>Estado (UF)</label>
              <input name="estado" value={formData.estado} onChange={handleChange} className={inputClass} placeholder="SP" maxLength={2} required={!isFreelancer} />
            </div>
          </div>
        </>
      )}

      {/* Buttons removed - they are now in the modal footer */}
    </form>
  );
});



const ShareModalContent: React.FC<{ initialEnabled: boolean, link: string }> = ({ initialEnabled, link }) => {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    const newState = !enabled;
    setEnabled(newState); // Optimistic update

    try {
      await supabase
        .schema('gestaohashi')
        .from('config')
        .upsert({ key: 'public_form_enabled', value: String(newState) });
    } catch (err) {
      console.error(err);
      setEnabled(!newState); // Revert on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pt-2">
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Página Pública</span>
          <div
            className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${enabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'} ${loading ? 'opacity-70 cursor-wait' : ''}`}
            onClick={!loading ? toggle : undefined}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${enabled ? 'left-7' : 'left-1'}`} />
          </div>
        </div>
        <p className="text-xs text-slate-500">Ao ativar, qualquer pessoa com o link poderá preencher o formulário.</p>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Link de Acesso</label>
        <div className="flex gap-2">
          <input
            readOnly
            value={link}
            className="flex-1 p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 outline-none"
          />
          <button
            onClick={() => {
              navigator.clipboard.writeText(link);
              alert('Copiado!');
            }}
            className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
          >
            <Copy size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

const FuncionariosPage: React.FC = () => {
  const [data, setData] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalConfig, setModalConfig] = useState<any>({ isOpen: false });
  const [publicLinkEnabled, setPublicLinkEnabled] = useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  const mapToFuncionario = (item: any, includeDocs = false): Funcionario => ({
    id: item.id,
    codigo: item.code?.toString() || '',
    dataEntrada: item.admission_date ? new Date(item.admission_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '',
    tipoContrato: item.type || '',
    nome: item.name || 'Sem nome',
    status: (item.status || 'Ativo') as any,
    funcao: item.role || '',
    contato: item.phone || '',
    contatoRecado: item.emergency_phone || '',
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
      estado: item.state || '',
      complemento: item.complement || ''
    },
    documentoFrente: includeDocs ? item.document_front : '',
    documentoVerso: includeDocs ? item.document_back : ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: result, error } = await supabase
        .schema('gestaohashi')
        .from('equipe')
        .select(`
          id, code, admission_date, type, name, status, role, phone, emergency_phone, email, gender,
          birth_date, nationality, bank_account_name, bank_name, bank_key_type,
          bank_key, document_type, document, street, number, neighborhood, city, state, complement
        `)
        .order('name');

      if (error) throw error;

      if (result) {
        const formattedData: Funcionario[] = result.map(item => mapToFuncionario(item, false));
        setData(formattedData);
      }

      // Fetch config
      const { data: configData } = await supabase
        .schema('gestaohashi')
        .from('config')
        .select('value')
        .eq('key', 'public_form_enabled')
        .single();

      if (configData) {
        setPublicLinkEnabled(configData.value === 'true');
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
            const { error } = await supabase.schema('gestaohashi').from('equipe').delete().eq('id', item.id);
            if (error) throw error;
            loadData();
            setModalConfig({
              isOpen: true,
              type: 'confirm-insert',
              title: 'Sucesso',
              content: 'Funcionário excluído com sucesso!',
              confirmText: 'OK',
              showCancel: false,
              onConfirm: () => setModalConfig({ isOpen: false })
            });
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
          if (formRef.current) {
            if (formRef.current.reportValidity()) {
              formRef.current.requestSubmit();
            } else {
              // Usually reportValidity shows the bubbles.
              // If they don't show, we can alert.
              // alert('Por favor, preencha todos os campos obrigatórios.');
            }
          }
        },
        content: (
          <FuncionarioForm
            ref={formRef}
            initialData={item}
            setModalConfig={setModalConfig}
            onSuccess={() => {
              loadData();
              setModalConfig({
                isOpen: true,
                type: 'confirm-update',
                title: 'Sucesso',
                content: 'Funcionário atualizado com sucesso!',
                showCancel: false,
                confirmText: 'OK',
                onConfirm: () => setModalConfig({ isOpen: false })
              });
            }}
          />
        ),
        maxWidth: 'max-w-4xl'
      });
    } else {
      // Fetch full details from DB to sync, but EXCLUDE heavy documents for speed (load on demand)
      let fullData = { ...item };
      try {
        const { data, error } = await supabase
          .schema('gestaohashi')
          .from('equipe')
          .select(`
            id, code, admission_date, type, name, status, role, phone, emergency_phone, email, gender,
            birth_date, nationality, bank_account_name, bank_name, bank_key_type,
            bank_key, document_type, document, street, number, neighborhood, city, state, complement
          `) // Explicitly NO document_front/back
          .eq('id', item.id)
          .single();

        if (data && !error) {
          fullData = mapToFuncionario(data, false);
        }
      } catch (err) {
        console.error('Erro ao carregar detalhes:', err);
      }

      setModalConfig({
        isOpen: true,
        type: 'view-content',
        title: 'Ficha Cadastral',
        maxWidth: 'max-w-xl', // Reduced width for simplification
        content: <FuncionarioDetailsView data={fullData} />
      });
    }
  };

  const handleShare = () => {
    const link = `${window.location.origin}/#${AppRoute.PUBLIC_FORM_FUNCIONARIO}`;

    setModalConfig({
      isOpen: true,
      type: 'view-content',
      title: 'Compartilhar Cadastro',
      maxWidth: 'max-w-md',
      content: <ShareModalContent initialEnabled={publicLinkEnabled} link={link} />
    });
  };

  const handleCreate = () => {
    setModalConfig({
      isOpen: true,
      type: 'confirm-delete', // Using confirm-delete to get the RED color button style desired by user
      title: 'Novo Funcionário',
      confirmText: 'Salvar Funcionário',
      autoClose: false,
      onConfirm: () => {
        if (formRef.current) {
          if (formRef.current.reportValidity()) {
            formRef.current.requestSubmit();
          }
        }
      },
      content: (
        <FuncionarioForm
          ref={formRef}
          setModalConfig={setModalConfig}
          onSuccess={() => {
            loadData();
            setModalConfig({
              isOpen: true,
              type: 'confirm-insert',
              title: 'Sucesso',
              content: 'Funcionário cadastrado com sucesso!',
              showCancel: false,
              confirmText: 'OK',
              onConfirm: () => setModalConfig({ isOpen: false })
            });
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
    {
      header: 'Vínculo',
      accessor: (item) => (
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${item.tipoContrato === 'CLT' ? 'bg-blue-50 text-blue-700' :
          item.tipoContrato === 'Freelancer' ? 'bg-orange-50 text-orange-700' :
            item.tipoContrato === 'PJ' ? 'bg-purple-50 text-purple-700' :
              'bg-slate-100 text-slate-600'
          }`}>
          {item.tipoContrato}
        </span>
      ),
      className: 'w-28'
    },
    {
      header: 'Pix',
      accessor: (item) => item.pixChave ? (
        <button
          onClick={() => {
            navigator.clipboard.writeText(item.pixChave);
            setModalConfig({
              isOpen: true,
              type: 'confirm-insert',
              title: 'Sucesso',
              content: 'Chave Pix copiada!',
              confirmText: 'OK',
              showCancel: false,
              onConfirm: () => setModalConfig({ isOpen: false })
            });
          }}
          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-all group relative"
          title={item.pixChave}
        >
          <Copy size={16} />
        </button>
      ) : <span className="text-slate-300">-</span>,
      className: 'w-16 text-center'
    },
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
        // @ts-ignore
        confirmText={modalConfig.confirmText}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        // @ts-ignore
        hideFooter={modalConfig.hideFooter}
      />
    </div>
  );
};

export default FuncionariosPage;
