
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
  Folder,
  Settings,
  UtensilsCrossed
} from 'lucide-react';
import { AppRoute, TurnoConfig } from './types';

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
    ]
  }
];

export const turnosConfigs: TurnoConfig[] = [
  {
    id: 't1',
    label: 'Manhã',
    inicio: '09:00',
    fim: '15:00',
    colorClass: 'text-sky-600',
    bgClass: 'bg-sky-50',
    borderClass: 'border-sky-200',
    ordem: 1
  },
  {
    id: 't2',
    label: 'Tarde',
    inicio: '15:00',
    fim: '18:00',
    colorClass: 'text-orange-600',
    bgClass: 'bg-orange-50',
    borderClass: 'border-orange-200',
    ordem: 2
  },
  {
    id: 't3',
    label: 'Noite',
    inicio: '18:00',
    fim: '23:00',
    colorClass: 'text-indigo-600',
    bgClass: 'bg-indigo-50',
    borderClass: 'border-indigo-200',
    ordem: 3
  },
  {
    id: 't4',
    label: 'Extra',
    inicio: '(Flex)',
    fim: '',
    colorClass: 'text-purple-600',
    bgClass: 'bg-purple-50',
    borderClass: 'border-purple-200',
    ordem: 4
  }
];
