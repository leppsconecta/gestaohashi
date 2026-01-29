
import React from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  FileText,
  Utensils,
  Star,
  Megaphone,
  Ticket,
  CalendarDays,
  Users,
  BookOpen,
  Key,
  Folder,
  Settings,
  UtensilsCrossed
} from 'lucide-react';
import { AppRoute } from './types';

export interface MenuItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

export interface MenuGroup {
  label: string;
  color?: string;
  items: MenuItem[];
}

export const MENU_GROUPS: MenuGroup[] = [
  {
    label: 'Operacional',
    items: [
      { label: 'Painel', path: AppRoute.DASHBOARD, icon: <LayoutDashboard size={20} /> },
      { label: 'Reservas', path: AppRoute.RESERVAS, icon: <CalendarCheck size={20} /> },
      { label: 'Currículos', path: AppRoute.CURRICULOS, icon: <FileText size={20} /> },
      { label: 'Consumações', path: AppRoute.CONSUMACOES, icon: <Utensils size={20} /> },

      { label: 'Promocional', path: AppRoute.PROMOCIONAL, icon: <Megaphone size={20} /> },
      { label: 'Cupons', path: AppRoute.CUPONS, icon: <Ticket size={20} /> },
    ]
  },
  {
    label: 'Administração',
    color: 'text-red-600 dark:text-red-400',
    items: [
      { label: 'Feedbacks', path: AppRoute.FEEDBACKS, icon: <Star size={20} /> },
      { label: 'Cardápio', path: AppRoute.CARDAPIO, icon: <UtensilsCrossed size={20} /> },
      { label: 'Escala', path: AppRoute.ESCALA, icon: <CalendarDays size={20} /> },
      { label: 'Funcionários', path: AppRoute.FUNCIONARIOS, icon: <Users size={20} /> },
      { label: 'Ficha Técnica', path: AppRoute.FICHA_TECNICA, icon: <BookOpen size={20} /> },
      { label: 'Arquivos', path: AppRoute.ARQUIVOS, icon: <Folder size={20} /> },
      { label: 'Logins e Senhas', path: AppRoute.LOGINS_SENHAS, icon: <Key size={20} /> },
    ]
  }
];
