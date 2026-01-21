
import React, { useState } from 'react';
import { 
  User, 
  Phone, 
  Mail, 
  CreditCard, 
  FileText, 
  MapPin, 
  CheckCircle2, 
  Briefcase,
  ChevronRight,
  ArrowLeft,
  Plus
} from 'lucide-react';
import { Funcionario, FuncionarioContrato } from '../types';

const PublicFormFuncionario: React.FC = () => {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  
  // Estado do formulário
  const [formData, setFormData] = useState({
    tipoContrato: 'CLT (Padrão)' as FuncionarioContrato,
    funcao: '',
    nome: '',
    contato: '',
    email: '',
    sexo: 'Masculino',
    dataNascimento: '',
    titularConta: '',
    banco: '',
    pixTipo: 'CPF',
    pixChave: '',
    documentoNumero: '',
    rua: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: 'SP'
  });

  const isFreelancer = formData.tipoContrato === 'Freelancer';

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const inputClass = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-medium";
  const labelClass = "text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block ml-1";
  const stepTitle = "text-xl font-black text-slate-800 uppercase tracking-tight mb-6 flex items-center gap-2";

  const handleSubmit = () => {
    // Gerar dados automáticos de sistema
    const newFuncionario: Funcionario = {
      id: String(Date.now()),
      codigo: `#${Math.floor(1000 + Math.random() * 9000)}`,
      dataEntrada: new Date().toLocaleDateString('pt-BR'),
      status: 'Ativo',
      ...formData,
      endereco: !isFreelancer ? {
        rua: formData.rua,
        numero: formData.numero,
        bairro: formData.bairro,
        cidade: formData.cidade,
        estado: formData.estado
      } : undefined
    };

    // Simular salvamento (em um SaaS real seria uma chamada de API)
    const existing = JSON.parse(localStorage.getItem('hashi_public_submissions') || '[]');
    localStorage.setItem('hashi_public_submissions', JSON.stringify([newFuncionario, ...existing]));
    
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-12 rounded-[3rem] shadow-xl border border-slate-100 text-center space-y-6 animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={48} className="text-emerald-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Cadastro Enviado!</h1>
            <p className="text-slate-500 font-medium leading-relaxed">Seus dados foram recebidos com sucesso. A equipe do Hashi entrará em contato em breve.</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all active:scale-95"
          >
            Enviar outro cadastro
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-6">
      <div className="max-w-3xl w-full text-center mb-12 space-y-4">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-blue-100 font-black text-white text-2xl">H</div>
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Cadastro de Colaborador</h1>
          <p className="text-slate-500 font-medium">Portal de contratação Hashi Express.</p>
        </div>
      </div>

      <div className="max-w-3xl w-full bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-8 sm:p-12">
        <div className="flex gap-2 mb-10">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-blue-600' : 'bg-slate-100'}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className={stepTitle}><Briefcase className="text-blue-500" /> Vínculo e Identificação</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Tipo de Contrato</label>
                  <select 
                    className={inputClass} 
                    value={formData.tipoContrato} 
                    onChange={(e) => handleChange('tipoContrato', e.target.value)}
                  >
                    <option>CLT (Padrão)</option>
                    <option>Freelancer</option>
                    <option>PJ</option>
                    <option>Estágio</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Cargo / Função</label>
                  <input 
                    type="text" 
                    className={inputClass} 
                    placeholder="Ex: Garçom" 
                    value={formData.funcao}
                    onChange={(e) => handleChange('funcao', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    className={`${inputClass} pl-12`} 
                    placeholder="Como no seu documento" 
                    value={formData.nome}
                    onChange={(e) => handleChange('nome', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className={isFreelancer ? 'sm:col-span-1' : ''}>
                  <label className={labelClass}>Sexo</label>
                  <select 
                    className={inputClass} 
                    value={formData.sexo}
                    onChange={(e) => handleChange('sexo', e.target.value)}
                  >
                    <option>Masculino</option>
                    <option>Feminino</option>
                    <option>Outro</option>
                  </select>
                </div>
                <div className={isFreelancer ? 'sm:col-span-1' : ''}>
                  <label className={labelClass}>WhatsApp Principal</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      className={`${inputClass} pl-12`} 
                      placeholder="(00) 00000-0000" 
                      value={formData.contato}
                      onChange={(e) => handleChange('contato', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {!isFreelancer && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                   <div>
                    <label className={labelClass}>E-mail</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="email" 
                        className={`${inputClass} pl-12`} 
                        placeholder="seu@email.com" 
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Data de Nascimento</label>
                    <input 
                      type="date" 
                      className={inputClass} 
                      value={formData.dataNascimento}
                      onChange={(e) => handleChange('dataNascimento', e.target.value)}
                    />
                  </div>
                </div>
              )}
              
              <button 
                onClick={() => setStep(2)}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-100 mt-4"
              >
                Próximo Passo <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className={stepTitle}><CreditCard className="text-blue-500" /> Dados Bancários</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Nome do Titular da Conta</label>
                  <input 
                    type="text" 
                    className={inputClass} 
                    placeholder="Conforme registrado no banco" 
                    value={formData.titularConta}
                    onChange={(e) => handleChange('titularConta', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Instituição Bancária</label>
                  <input 
                    type="text" 
                    className={inputClass} 
                    placeholder="Ex: Nubank, Itaú..." 
                    value={formData.banco}
                    onChange={(e) => handleChange('banco', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Tipo de Chave PIX</label>
                  <select 
                    className={inputClass}
                    value={formData.pixTipo}
                    onChange={(e) => handleChange('pixTipo', e.target.value)}
                  >
                    <option>CPF</option>
                    <option>E-mail</option>
                    <option>Celular</option>
                    <option>Chave Aleatória</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Chave PIX</label>
                  <input 
                    type="text" 
                    className={inputClass} 
                    placeholder="Sua chave para recebimento" 
                    value={formData.pixChave}
                    onChange={(e) => handleChange('pixChave', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setStep(1)}
                  className="w-20 py-4 border border-slate-200 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-slate-50 transition-all active:scale-95"
                >
                  <ArrowLeft size={18} />
                </button>
                <button 
                  onClick={() => setStep(3)}
                  className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-100"
                >
                  Próximo Passo <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className={stepTitle}><FileText className="text-blue-500" /> Finalização</h2>
            <div className="space-y-6">
              
              {!isFreelancer ? (
                <div className="space-y-6">
                  <div>
                    <label className={labelClass}>RG ou CPF</label>
                    <input 
                      type="text" 
                      className={inputClass} 
                      placeholder="Apenas números" 
                      value={formData.documentoNumero}
                      onChange={(e) => handleChange('documentoNumero', e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
                    <div className="sm:col-span-9">
                      <label className={labelClass}>Rua / Logradouro</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                          type="text" 
                          className={`${inputClass} pl-12`} 
                          placeholder="Nome da rua" 
                          value={formData.rua}
                          onChange={(e) => handleChange('rua', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-3">
                      <label className={labelClass}>Nº</label>
                      <input 
                        type="text" 
                        className={inputClass} 
                        placeholder="123" 
                        value={formData.numero}
                        onChange={(e) => handleChange('numero', e.target.value)}
                      />
                    </div>
                    <div className="sm:col-span-6">
                      <label className={labelClass}>Bairro</label>
                      <input 
                        type="text" 
                        className={inputClass} 
                        placeholder="Bairro" 
                        value={formData.bairro}
                        onChange={(e) => handleChange('bairro', e.target.value)}
                      />
                    </div>
                    <div className="sm:col-span-6">
                      <label className={labelClass}>Cidade</label>
                      <input 
                        type="text" 
                        className={inputClass} 
                        placeholder="Cidade" 
                        value={formData.cidade}
                        onChange={(e) => handleChange('cidade', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className={labelClass}>Foto do Documento (Frente)</label>
                    <div className="border-2 border-dashed border-slate-100 rounded-[2rem] h-32 flex flex-col items-center justify-center text-slate-300 hover:text-blue-500 hover:border-blue-500 cursor-pointer transition-all">
                      <Plus size={24} />
                      <span className="text-[10px] font-black uppercase tracking-widest mt-2">Toque para anexar</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 p-8 rounded-[2.5rem] border border-blue-100 text-center space-y-4">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 size={24} />
                  </div>
                  <p className="text-sm font-bold text-blue-800 leading-relaxed">
                    Como Freelancer, seus dados básicos e bancários já foram coletados. O Hashi Express agradece sua disponibilidade.
                  </p>
                </div>
              )}
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setStep(2)}
                  className="w-20 py-4 border border-slate-200 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-slate-50 transition-all active:scale-95"
                >
                  <ArrowLeft size={18} />
                </button>
                <button 
                  onClick={handleSubmit}
                  className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-100"
                >
                  Finalizar Cadastro <CheckCircle2 size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="mt-8 text-slate-400 text-[10px] font-black uppercase tracking-widest">
        Hashi Tecnologia • Segurança de Dados 256-bit
      </p>
    </div>
  );
};

export default PublicFormFuncionario;
