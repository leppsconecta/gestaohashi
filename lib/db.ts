
import { supabase } from './supabase';
import { Funcionario, Reserva, Feedback, Consumacao, LoginSenha, Promocao, Cupom } from '../types';

const KEYS = {
  AUTH: 'hashi_auth_token',
  ADMIN_UNLOCKED: 'hashi_admin_unlocked',
};

// Mappers
const mapFuncionarioFromDB = (f: any): Funcionario => ({
  ...f,
  dataEntrada: f.data_entrada,
  tipoContrato: f.tipo_contrato,
  dataNascimento: f.data_nascimento,
  estadoCivil: f.estado_civil,
  titularConta: f.titular_conta,
  contatoRecado: f.contato_recado,
  pixTipo: f.pix_tipo,
  pixChave: f.pix_chave,
  documentoTipo: f.documento_tipo,
  documentoNumero: f.documento_numero,
  documentoFrente: f.documento_frente,
  documentoVerso: f.documento_verso,
});

const mapFuncionarioToDB = (f: Funcionario) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {
    dataEntrada, tipoContrato, dataNascimento, estadoCivil, titularConta,
    contatoRecado, pixTipo, pixChave, documentoTipo, documentoNumero,
    documentoFrente, documentoVerso, ...rest
  } = f;

  return {
    ...rest,
    data_entrada: f.dataEntrada,
    tipo_contrato: f.tipoContrato,
    data_nascimento: f.dataNascimento,
    estado_civil: f.estadoCivil,
    titular_conta: f.titularConta,
    contato_recado: f.contatoRecado,
    pix_tipo: f.pixTipo,
    pix_chave: f.pixChave,
    documento_tipo: f.documentoTipo,
    documento_numero: f.documentoNumero,
    documento_frente: f.documentoFrente,
    documento_verso: f.documentoVerso
  };
};

export const DBService = {
  // --- AUTH ---
  auth: {
    login: async (email: string, pass: string): Promise<boolean> => {
      // Keep hardcoded auth for now as per original file
      if (
        ((email === 'admin@admin.com' || email === 'felipelepefe@gmail.com') && (pass === '123' || pass === 'admin')) ||
        (email === 'gestao@hashiexpressjundiai.com.br' && pass === '@Hashi2810')
      ) {
        localStorage.setItem(KEYS.AUTH, 'true');
        return true;
      }
      return false;
    },
    logout: () => {
      localStorage.removeItem(KEYS.AUTH);
      localStorage.removeItem(KEYS.ADMIN_UNLOCKED);
    },
    isAuthenticated: () => localStorage.getItem(KEYS.AUTH) === 'true',
    isAdminUnlocked: () => localStorage.getItem(KEYS.ADMIN_UNLOCKED) === 'true',
    unlockAdmin: async (pass: string): Promise<boolean> => {
      if (pass === '281084') {
        localStorage.setItem(KEYS.ADMIN_UNLOCKED, 'true');
        return true;
      }
      return false;
    },
    lockAdmin: () => localStorage.removeItem(KEYS.ADMIN_UNLOCKED)
  },

  // --- GENERIC CRUD HELPERS (Deprecated/Removed) ---

  // --- FUNCIONARIOS ---
  funcionarios: {
    getAll: async (): Promise<Funcionario[]> => {
      const { data, error } = await supabase
        .schema('gestaohashi')
        .from('funcionarios')
        .select('*')
        .order('nome');

      if (error) {
        console.error('Error fetching funcionarios:', error);
        return [];
      }
      return (data || []).map(mapFuncionarioFromDB);
    },
    save: async (item: Funcionario): Promise<void> => {
      const payload = mapFuncionarioToDB(item);
      // Removed .upsert() as it requires keys; using logic based on ID existence if needed, 
      // but upsert is safer if ID is primary key.
      const { error } = await supabase
        .schema('gestaohashi')
        .from('funcionarios')
        .upsert(payload);

      if (error) console.error('Error saving funcionario:', error);
    },
    delete: async (id: string): Promise<void> => {
      const { error } = await supabase
        .schema('gestaohashi')
        .from('funcionarios')
        .delete()
        .eq('id', id);

      if (error) console.error('Error deleting funcionario:', error);
    }
  },

  // --- RESERVAS ---
  reservas: {
    getAll: async (): Promise<Reserva[]> => {
      const { data, error } = await supabase
        .schema('gestaohashi')
        .from('reservas')
        .select('*')
        .order('data', { ascending: false });

      if (error) {
        console.error('Error fetching reservas:', error);
        return [];
      }
      return data as Reserva[];
    },
    save: async (item: Reserva): Promise<void> => {
      const { error } = await supabase
        .schema('gestaohashi')
        .from('reservas')
        .upsert(item);

      if (error) console.error('Error saving reserva:', error);
    },
    updateStatus: async (id: string, status: Reserva['status']): Promise<void> => {
      const { error } = await supabase
        .schema('gestaohashi')
        .from('reservas')
        .update({ status })
        .eq('id', id);

      if (error) console.error('Error updating reserva:', error);
    }
  },

  // --- CUPONS ---
  cupons: {
    getAll: async (): Promise<Cupom[]> => {
      const { data, error } = await supabase
        .schema('gestaohashi')
        .from('cupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching cupons:', error);
        return [];
      }
      return data as Cupom[];
    },
    create: async (cupom: Omit<Cupom, 'id' | 'created_at'>): Promise<void> => {
      const { error } = await supabase
        .schema('gestaohashi')
        .from('cupons')
        .insert(cupom);

      if (error) console.error('Error creating cupom:', error);
    },
    update: async (id: string, cupom: Partial<Cupom>): Promise<void> => {
      const { error } = await supabase
        .schema('gestaohashi')
        .from('cupons')
        .update(cupom)
        .eq('id', id);

      if (error) console.error('Error updating cupom:', error);
    },
    delete: async (id: string): Promise<void> => {
      const { error } = await supabase
        .schema('gestaohashi')
        .from('cupons')
        .delete()
        .eq('id', id);

      if (error) console.error('Error deleting cupom:', error);
    }
  },

  // --- PROMOCOES ---
  // --- PROMOCOES ---
  promocoes: {
    getAll: async (): Promise<Promocao[]> => {
      const { data, error } = await supabase
        .schema('gestaohashi')
        .from('promocoes')
        .select('*')
        .order('created_at', { ascending: false })
        .order('titulo', { ascending: true });

      if (error) {
        console.error('Error fetching promocoes:', error);
        return [];
      }
      return (data || []).map((p: any) => ({
        ...p,
        dataInicio: p.data_inicio,
        dataFim: p.data_fim
      }));
    },
    create: async (promocao: Omit<Promocao, 'id'>): Promise<void> => {
      const payload = {
        titulo: promocao.titulo,
        categoria: promocao.categoria,
        descricao: promocao.descricao,
        ativa: promocao.ativa,
        data_inicio: promocao.dataInicio || null,
        data_fim: promocao.dataFim || null
      };

      const { error } = await supabase
        .schema('gestaohashi')
        .from('promocoes')
        .insert(payload);

      if (error) console.error('Error creating promocao:', error);
    },
    update: async (id: string, promocao: Partial<Promocao>): Promise<void> => {
      const payload: any = { ...promocao };

      // Map camelCase to snake_case for DB
      if (promocao.dataInicio !== undefined) {
        payload.data_inicio = promocao.dataInicio || null;
        delete payload.dataInicio;
      }
      if (promocao.dataFim !== undefined) {
        payload.data_fim = promocao.dataFim || null;
        delete payload.dataFim;
      }

      const { error } = await supabase
        .schema('gestaohashi')
        .from('promocoes')
        .update(payload)
        .eq('id', id);

      if (error) console.error('Error updating promocao:', error);
    },
    delete: async (id: string): Promise<void> => {
      const { error } = await supabase
        .schema('gestaohashi')
        .from('promocoes')
        .delete()
        .eq('id', id);

      if (error) console.error('Error deleting promocao:', error);
    }
  },

  // --- DASHBOARD STATS ---


  getDashboardStats: async () => {
    const todayObj = new Date();
    const today = todayObj.toISOString().split('T')[0];

    // Calculate 7 days ago
    const sevenDaysAgoObj = new Date();
    sevenDaysAgoObj.setDate(todayObj.getDate() - 6);
    const sevenDaysAgo = sevenDaysAgoObj.toISOString().split('T')[0];

    try {
      const [
        reservasP,
        reservasH,
        reservasT,
        feedbacksP,
        feedbacksAll,
        consumacoesP,
        promocoesA,
        cuponsA,
        reservasWeek
      ] = await Promise.all([
        supabase.schema('gestaohashi').from('reservas').select('*', { count: 'exact', head: true }).eq('status', 'Pendente'),
        supabase.schema('gestaohashi').from('reservas').select('*', { count: 'exact', head: true }).eq('data', today),
        supabase.schema('gestaohashi').from('reservas').select('*', { count: 'exact', head: true }),
        supabase.schema('gestaohashi').from('feedbacks').select('*', { count: 'exact', head: true }).eq('status', 'Pendente'),
        supabase.schema('gestaohashi').from('feedbacks').select('tipo'),
        supabase.schema('gestaohashi').from('consumacoes').select('*', { count: 'exact', head: true }).eq('status', 'Pendente'),
        supabase.schema('gestaohashi').from('promocoes').select('*', { count: 'exact', head: true }).eq('ativa', true),
        supabase.schema('gestaohashi').from('cupons').select('*', { count: 'exact', head: true }).eq('ativa', true),
        supabase.schema('gestaohashi').from('reservas').select('data').gte('data', sevenDaysAgo)
      ]);

      const feedbacks = feedbacksAll.data || [];
      const normalize = (s: any) => (typeof s === 'string' && s) ? s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";

      const dist = {
        elogios: feedbacks.filter((f: any) => normalize(f.tipo) === 'elogio').length,
        sugestao: feedbacks.filter((f: any) => normalize(f.tipo) === 'sugestao').length,
        denuncia: feedbacks.filter((f: any) => normalize(f.tipo) === 'denuncia').length,
        reclamacoes: feedbacks.filter((f: any) => normalize(f.tipo) === 'reclamacao').length,
        neutro: feedbacks.filter((f: any) => normalize(f.tipo) === 'neutral' || normalize(f.tipo) === 'neutro').length,
        total: feedbacks.length
      };

      // Process weekly reservations
      // Process weekly reservations (Current Week: Mon-Sun)
      const weekReservations = reservasWeek.data || [];

      const currentDay = todayObj.getDay(); // 0 (Sun) to 6 (Sat)
      const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay; // If Sun (0), back 6 days. Else back to 1 (Mon).

      const mondayObj = new Date(todayObj);
      mondayObj.setDate(todayObj.getDate() + diffToMonday);

      const diasSemana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
      const weeklyData = [];

      for (let i = 0; i < 7; i++) {
        const d = new Date(mondayObj);
        d.setDate(mondayObj.getDate() + i);
        const yyyymmdd = d.toISOString().split('T')[0];

        // Count exact matches for this date
        const count = weekReservations.filter((r: any) => r.data === yyyymmdd).length;

        // We know i=0 is Mon, i=1 is Tue, etc.
        weeklyData.push({ day: diasSemana[i], val: count });
      }

      return {
        reservasPendentes: reservasP.count || 0,
        reservasHoje: reservasH.count || 0,
        reservasTotal: reservasT.count || 0,
        feedbacksPendentes: feedbacksP.count || 0,
        feedbacksDistribucao: dist,
        consumacoesPendentes: consumacoesP.count || 0,
        promocoesAtivas: promocoesA.count || 0,
        cuponsAtivos: cuponsA.count || 0,
        reservasSemanais: weeklyData
      };
    } catch (e) {
      console.error("Error fetching dashboard stats", e);
      return {
        reservasPendentes: 0,
        reservasHoje: 0,
        reservasTotal: 0,
        feedbacksPendentes: 0,
        feedbacksDistribucao: { elogios: 0, sugestao: 0, denuncia: 0, reclamacoes: 0, neutro: 0, total: 0 },
        consumacoesPendentes: 0,
        promocoesAtivas: 0,
        cuponsAtivos: 0,
        reservasSemanais: []
      };
    }
  }
};
