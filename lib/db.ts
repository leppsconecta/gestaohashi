
import { Funcionario, Reserva, Feedback, Consumacao, LoginSenha, Promocao } from '../types';

// Chaves para o LocalStorage (que serão substituídas por endpoints de API no futuro)
const KEYS = {
  AUTH: 'hashi_auth_token',
  ADMIN_UNLOCKED: 'hashi_admin_unlocked',
  FUNCIONARIOS: 'hashi_db_funcionarios',
  RESERVAS: 'hashi_db_reservas',
  FEEDBACKS: 'hashi_db_feedbacks',
  CONSUMACOES: 'hashi_db_consumacoes',
  LOGINS: 'hashi_db_logins',
  PROMOS: 'hashi_db_promos',
  DRIVE_LINK: 'hashi_drive_link'
};

// Artificial delay removed

export const DBService = {
  // --- AUTH ---
  auth: {
    login: async (email: string, pass: string): Promise<boolean> => {

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

  // --- GENERIC CRUD HELPERS ---
  privateGet: <T>(key: string, defaultValue: T[] = []): T[] => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  },

  privateSave: <T>(key: string, data: T[]) => {
    localStorage.setItem(key, JSON.stringify(data));
  },

  // --- FUNCIONARIOS ---
  funcionarios: {
    getAll: async (): Promise<Funcionario[]> => {

      return DBService.privateGet<Funcionario>(KEYS.FUNCIONARIOS);
    },
    save: async (item: Funcionario): Promise<void> => {

      const items = DBService.privateGet<Funcionario>(KEYS.FUNCIONARIOS);
      const index = items.findIndex(i => i.id === item.id);
      if (index > -1) items[index] = item;
      else items.unshift(item);
      DBService.privateSave(KEYS.FUNCIONARIOS, items);
    },
    delete: async (id: string): Promise<void> => {

      const items = DBService.privateGet<Funcionario>(KEYS.FUNCIONARIOS);
      DBService.privateSave(KEYS.FUNCIONARIOS, items.filter(i => i.id !== id));
    }
  },

  // --- RESERVAS ---
  reservas: {
    getAll: async (): Promise<Reserva[]> => {

      return DBService.privateGet<Reserva>(KEYS.RESERVAS);
    },
    save: async (item: Reserva): Promise<void> => {

      const items = DBService.privateGet<Reserva>(KEYS.RESERVAS);
      const index = items.findIndex(i => i.id === item.id);
      if (index > -1) items[index] = item;
      else items.unshift(item);
      DBService.privateSave(KEYS.RESERVAS, items);
    },
    updateStatus: async (id: string, status: Reserva['status']): Promise<void> => {
      const items = DBService.privateGet<Reserva>(KEYS.RESERVAS);
      const index = items.findIndex(i => i.id === id);
      if (index > -1) {
        items[index].status = status;
        DBService.privateSave(KEYS.RESERVAS, items);
      }
    }
  },

  // --- DASHBOARD STATS ---
  getDashboardStats: async () => {
    await delay();
    const reservas = DBService.privateGet<Reserva>(KEYS.RESERVAS);
    const feedbacks = DBService.privateGet<Feedback>(KEYS.FEEDBACKS);

    return {
      reservasPendentes: reservas.filter(r => r.status === 'Pendente').length,
      reservasHoje: reservas.filter(r => r.data === new Date().toLocaleDateString('pt-BR')).length,
      reservasTotal: reservas.length,
      feedbacksPendentes: feedbacks.filter(f => f.status === 'Pendente').length,
      // ... outros stats calculados
    };
  }
};
