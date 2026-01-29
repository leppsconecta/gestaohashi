
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


      <aside
        ref={sidebarRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseMove={handleInteraction}
        className={`fixed z-50 transition-all duration-300 bg-white dark:bg-slate-900 shadow-xl border-t border-slate-200 dark:border-slate-800 lg:border-t-0 lg:border-r lg:shadow-none
          lg:h-screen lg:top-0 lg:left-0
          bottom-0 left-0 w-full h-16
          ${isExpanded ? 'lg:w-64' : 'lg:w-20'} 
          lg:translate-x-0
        `}
      >
        <div className="flex flex-row lg:flex-col h-full w-full">
          <div className="hidden lg:flex items-center justify-between px-6 h-16 border-b border-slate-100 dark:border-slate-800 shrink-0">
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

          <nav className="flex-1 flex flex-row lg:flex-col lg:overflow-y-auto lg:py-4 lg:px-3 lg:space-y-6 items-center px-4 gap-2 lg:gap-0 overflow-x-auto custom-scrollbar lg:custom-scrollbar no-scrollbar scroll-smooth">
            {MENU_GROUPS.map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-1 flex flex-row lg:flex-col shrink-0 gap-2 lg:gap-0">
                <div className={`hidden lg:block px-3 mb-2 transition-all duration-200 ${isExpanded ? 'opacity-100 h-auto' : 'opacity-0 h-0 overflow-hidden'}`}>
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
                      flex items-center justify-center ${isExpanded ? 'lg:justify-start' : 'lg:justify-center'} lg:gap-4 p-2 lg:px-3 lg:py-2.5 rounded-xl transition-all group relative shrink-0
                      ${isActive
                        ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-semibold shadow-sm lg:shadow-none'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}
                    `}
                  >
                    <div className="shrink-0 group-hover:scale-110 transition-transform">{item.icon}</div>
                    <span className={`hidden lg:block whitespace-nowrap transition-all duration-200 text-sm font-medium ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 absolute invisible'}`}>
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
