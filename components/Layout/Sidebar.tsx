
import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronRight, Pin, Menu, X, LogOut } from 'lucide-react';
import { MENU_GROUPS } from '../../constants';

interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
  isPinned: boolean;
  onPinToggle: (pinned: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onMobileClose, isPinned, onPinToggle }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [lastInteraction, setLastInteraction] = useState(Date.now());
  const sidebarRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const isExpanded = isHovered || isPinned;

  useEffect(() => {
    if (!isPinned) return;
    const interval = setInterval(() => {
      if (Date.now() - lastInteraction > 120000) {
        onPinToggle(false);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [isPinned, lastInteraction, onPinToggle]);

  const handleInteraction = () => {
    setLastInteraction(Date.now());
  };

  return (
    <>
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden" 
          onClick={onMobileClose}
        />
      )}

      <aside
        ref={sidebarRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseMove={handleInteraction}
        className={`fixed top-0 left-0 z-50 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 shadow-xl lg:shadow-none
          ${isExpanded ? 'w-64' : 'w-20'} 
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 h-16 border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shrink-0 shadow-lg">
                <span className="text-white font-black text-lg">H</span>
              </div>
              <span className={`font-bold text-lg text-slate-800 dark:text-white whitespace-nowrap transition-opacity duration-200 tracking-tighter ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
                Hashi
              </span>
            </div>
            
            <button 
              onClick={() => onPinToggle(!isPinned)}
              className={`hidden lg:block p-1.5 rounded-lg transition-colors ${isPinned ? 'text-red-600 bg-red-50 dark:bg-red-900/30' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'} ${!isExpanded && 'hidden'}`}
              title={isPinned ? "Desafixar menu" : "Fixar menu"}
            >
              <Pin size={18} className={isPinned ? 'fill-current' : ''} />
            </button>

            <button onClick={onMobileClose} className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
            {MENU_GROUPS.map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-1">
                <div className={`px-3 mb-2 transition-all duration-200 ${isExpanded ? 'opacity-100 h-auto' : 'opacity-0 h-0 overflow-hidden'}`}>
                  <span className={`text-[11px] font-bold tracking-wide ${group.color || 'text-slate-400 dark:text-slate-500'}`}>
                    {group.label}
                  </span>
                </div>
                
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => window.innerWidth < 1024 && onMobileClose()}
                    className={({ isActive }) => `
                      flex items-center gap-4 px-3 py-2.5 rounded-xl transition-all group relative
                      ${isActive 
                        ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-semibold' 
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}
                    `}
                  >
                    <div className="shrink-0 group-hover:scale-110 transition-transform">{item.icon}</div>
                    <span className={`whitespace-nowrap transition-all duration-200 text-sm font-medium ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 absolute invisible'}`}>
                      {item.label}
                    </span>
                    {!isExpanded && (
                      <div className="absolute left-16 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                        {item.label}
                      </div>
                    )}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
