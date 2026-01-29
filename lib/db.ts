
import { supabase } from './supabase';
import { Funcionario, Reserva, Feedback, Consumacao, LoginSenha, Promocao, Cupom, TurnoConfig } from '../types';

const KEYS = {
  AUTH: 'hashi_auth_token',
  ADMIN_UNLOCKED: 'hashi_admin_unlocked',
};

// Mappers
const mapFuncionarioFromDB = (f: any): Funcionario => ({
  id: f.id,
  codigo: f.code?.toString() || '',
  nome: f.name,
  funcao: f.role,
  status: f.status,
  dataEntrada: f.admission_date,
  tipoContrato: f.type,
  contato: f.phone,
  email: f.email,
  sexo: f.gender,
  dataNascimento: f.birth_date,
  nacionalidade: f.nationality,
  documentoTipo: f.document_type,
  documentoNumero: f.document,
  documentoFrente: f.document_front,
  documentoVerso: f.document_back,
  endereco: {
    rua: f.street,
    numero: f.number,
    bairro: f.neighborhood,
    cidade: f.city,
    estado: f.state,
    complemento: f.complement
  },
  banco: f.bank_name,
  titularConta: f.bank_account_name,
  pixTipo: f.bank_key_type,
  pixChave: f.bank_key,
  // Fallbacks for optional fields ensuring types match
  contact_emergency: f.emergency_phone
} as Funcionario);

const mapFuncionarioToDB = (f: Funcionario) => {
  return {
    name: f.nome,
    role: f.funcao,
    status: f.status,
    admission_date: f.dataEntrada,
    type: f.tipoContrato,
    phone: f.contato,
    email: f.email,
    gender: f.sexo,
    birth_date: f.dataNascimento,
    nationality: f.nacionalidade,
    document_type: f.documentoTipo,
    document: f.documentoNumero,
    document_front: f.documentoFrente,
    document_back: f.documentoVerso,
    street: f.endereco?.rua,
    number: f.endereco?.numero,
    neighborhood: f.endereco?.bairro,
    city: f.endereco?.cidade,
    state: f.endereco?.estado,
    complement: f.endereco?.complemento,
    bank_name: f.banco,
    bank_account_name: f.titularConta,
    bank_key_type: f.pixTipo,
    bank_key: f.pixChave,
    code: parseInt(f.codigo || '0')
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
        .schema('public')
        .from('equipe_view')
        .select('id, code, name, role, status, admission_date, type, phone, email, gender, birth_date, nationality, document_type, document, street, number, neighborhood, city, state, complement, bank_name, bank_account_name, bank_key_type, bank_key, emergency_phone')
        .order('name');

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
        .from('equipe')
        .upsert(payload);

      if (error) console.error('Error saving funcionario:', error);
    },
    delete: async (id: string): Promise<void> => {
      const { error } = await supabase
        .schema('gestaohashi')
        .from('equipe')
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
  },

  // --- TURNOS ---
  turnos: {
    getAll: async (): Promise<TurnoConfig[]> => {
      const { data, error } = await supabase
        .schema('gestaohashi')
        .from('turnos')
        .select('*')
        .order('ordem');

      if (error) {
        console.error('Error fetching turnos:', error);
        return [];
      }
      return (data || []).map((t: any) => ({
        id: t.id,
        label: t.label,
        inicio: t.inicio,
        fim: t.fim,
        colorClass: t.color_class,
        bgClass: t.bg_class,
        borderClass: t.border_class
      }));
    },
    saveAll: async (turnos: TurnoConfig[]): Promise<void> => {
      const payload = turnos.map((t, index) => ({
        id: t.id,
        label: t.label,
        inicio: t.inicio,
        fim: t.fim,
        color_class: t.colorClass,
        bg_class: t.bgClass,
        border_class: t.borderClass,
        ordem: index + 1
      }));

      const { error } = await supabase
        .schema('gestaohashi')
        .from('turnos')
        .upsert(payload);

      if (error) console.error('Error saving turnos:', error);
    }
  },

  // --- ESCALA ---
  escala: {
    getByRange: async (startDate: string, endDate: string) => {
      const { data, error } = await supabase
        .schema('gestaohashi')
        .from('escala')
        .select('*')
        .gte('data', startDate)
        .lte('data', endDate);

      if (error) {
        console.error('Error fetching escala:', error);
        return [];
      }
      return data || [];
    },
    add: async (data: string, turnoId: string, funcionarioId: string) => {
      const { error } = await supabase
        .schema('gestaohashi')
        .from('escala')
        .insert({
          data,
          turno_id: turnoId,
          funcionario_id: funcionarioId
        });

      if (error) {
        // Ignore duplicate key error, otherwise log
        if (!error.message.includes('unique constraint')) {
          console.error('Error adding escala:', error);
        }
      }
    },
    remove: async (data: string, turnoId: string, funcionarioId: string) => {
      const { error } = await supabase
        .schema('gestaohashi')
        .from('escala')
        .delete()
        .match({
          data,
          turno_id: turnoId,
          funcionario_id: funcionarioId
        });

      if (error) console.error('Error removing escala:', error);
    }
  }
};
