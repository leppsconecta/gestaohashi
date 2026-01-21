
import React from 'react';

export enum AppRoute {
  DASHBOARD = '/dashboard',
  LOGIN = '/login',
  RESERVAS = '/reservas',
  CURRICULOS = '/curriculos',
  CURRICULO_DETAIL = '/curriculos/:id',
  CONSUMACOES = '/consumacoes',
  FEEDBACKS = '/feedbacks',
  FEEDBACK_DETAIL = '/feedbacks/:id',
  PROMOCIONAL = '/promocional',
  CUPONS = '/cupons',
  ESCALA = '/escala',
  FUNCIONARIOS = '/funcionarios',
  FICHA_TECNICA = '/ficha-tecnica',
  CARDAPIO = '/cardapio',
  LOGINS_SENHAS = '/logins-senhas',
  ARQUIVOS = '/arquivos',
  PUBLIC_FORM_FUNCIONARIO = '/public/cadastro-funcionario',
  MENU_ONLINE = '/public/menu',
  LINK_MANAGEMENT = '/gestao-link'
}

export interface MateriaPrima {
  id: string;
  nome: string;
  unidade: string;
  custoUnitario: number;
}

export interface IngredientePrato {
  materiaPrimaId: string;
  quantidade: number;
}

export interface PratoFicha {
  id: string;
  nome: string;
  categoriaId: string;
  custoTotal: number;
  precoVenda: number;
  ingredientes: IngredientePrato[];
  modoPreparo: string;
  foto?: string;
  atualizadoEm: string;
}

export interface CategoriaPrato {
  id: string;
  nome: string;
}

export interface CardapioItem {
  id: string;
  nome: string;
  descricao: string;
  preco?: string;
  foto?: string;
  ativo: boolean;
}

export interface CardapioCategoria {
  id: string;
  nome: string;
  itens: CardapioItem[];
}

export interface Attachment {
  id: string;
  type: 'image' | 'audio' | 'video' | 'pdf';
  url: string;
  name: string;
}

export interface RespostaSemanal {
  id: string;
  dia: string;
  ativa: boolean;
  mensagem: string;
  attachments: Attachment[];
}

export interface Curriculo {
  id: string;
  data: string;
  nome: string;
  funcao: string;
  contato: string;
  idade: string | number;
  sexo: 'M' | 'F' | 'Outro';
  cidade: string;
  bairro: string;
  observacao?: string;
  arquivo_url?: string;
}

export type FuncionarioStatus = 'Ativo' | 'Inativo' | 'Férias' | 'Afastado';
export type FuncionarioContrato = 'CLT (Padrão)' | 'Freelancer' | 'PJ' | 'Estágio';

export interface Funcionario {
  id: string;
  codigo: string;
  dataEntrada: string;
  tipoContrato: FuncionarioContrato;
  nome: string;
  status: FuncionarioStatus;
  funcao: string;
  contato: string;
  email?: string;
  sexo?: string;
  dataNascimento?: string;
  nacionalidade?: string;
  estadoCivil?: string;
  titularConta?: string;
  contatoRecado?: string;
  banco?: string;
  pixTipo?: string;
  pixChave?: string;
  documentoTipo?: string;
  documentoNumero?: string;
  endereco?: {
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
  };
  documentoFrente?: string;
  documentoVerso?: string;
}

export interface TurnoConfig {
  id: string;
  label: string;
  inicio: string;
  fim: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
}

export interface EscalaAtribuicao {
  funcionarioId: string;
  turnoId: string;
}

export type FeedbackStatus = 'Pendente' | 'Resolvendo' | 'Resolvido';
export type FeedbackTipo = 'Reclamação' | 'Elogio' | 'Sugestão' | 'Denúncia';
export type FeedbackOrigem = 'Site' | 'Whatsapp' | 'Google';

export interface Feedback {
  id: string;
  data: string;
  codigo: string;
  status: FeedbackStatus;
  tipo: FeedbackTipo;
  origem: FeedbackOrigem;
  nome: string;
  contato: string;
  descricao: string;
}

export type ConsumacaoStatus = 'Pendente' | 'Utilizado' | 'Expirado';
export type ConsumacaoTipo = 'Sorteio' | 'Cortesia' | 'Voucher';

export interface Consumacao {
  id: string;
  data: string;
  nome: string;
  codigo: string;
  tipo: ConsumacaoTipo;
  evento: string;
  status: ConsumacaoStatus;
  validade: string;
  descricao: string;
}

export type ReservaStatus = 'Pendente' | 'Confirmado' | 'Cancelado' | 'Finalizado';

export interface Reserva {
  id: string;
  codigo: string;
  data: string;
  hora: string;
  tipo: string;
  nome: string;
  pax: number;
  contato: string;
  origem: string;
  status: ReservaStatus;
  observacao?: string;
}

export interface LoginSenha {
  id: string;
  data: string;
  site: string;
  login: string;
  senha: string;
  observacao?: string;
}

export interface Promocao {
  id: string;
  titulo: string;
  categoria: string;
  descricao: string;
  ativa: boolean;
  dataInicio?: string;
  dataFim?: string;
}

export interface CronogramaMensal {
  mes: string;
  promocoes: Promocao[];
}

export type ModalType = 'confirm-delete' | 'confirm-insert' | 'confirm-update' | 'view-content';

export interface ModalProps {
  isOpen: boolean;
  type: ModalType;
  title: string;
  content: string | React.ReactNode;
  onConfirm?: () => void;
  onClose: () => void;
  maxWidth?: string;
  confirmText?: string;
  autoClose?: boolean;
}
