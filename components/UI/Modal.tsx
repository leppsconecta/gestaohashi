
import React from 'react';
import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { ModalProps, ModalType } from '../../types';

const Modal: React.FC<ModalProps> = ({ isOpen, type, title, content, onConfirm, onClose, maxWidth = 'max-w-lg' }) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'confirm-delete': return <AlertTriangle className="text-red-500" size={24} />;
      case 'confirm-insert': return <CheckCircle className="text-green-500" size={24} />;
      case 'confirm-update': return <Info className="text-blue-500" size={24} />;
      default: return null;
    }
  };

  const getConfirmButtonStyles = () => {
    switch (type) {
      case 'confirm-delete': return 'bg-red-600 hover:bg-red-700';
      case 'confirm-insert': return 'bg-green-600 hover:bg-green-700';
      case 'confirm-update': return 'bg-blue-600 hover:bg-blue-700';
      default: return 'bg-indigo-600 hover:bg-indigo-700';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className={`bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full ${maxWidth} flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixo */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <div className="flex items-center gap-3">
            {getIcon()}
            <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">{title}</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Body - Rolável */}
        <div className="px-6 py-6 text-slate-600 dark:text-slate-300 overflow-y-auto flex-1 custom-scrollbar">
          {typeof content === 'string' ? <p className="leading-relaxed">{content}</p> : content}
        </div>

        {/* Footer - Fixo */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-slate-200 dark:border-slate-700 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200 dark:border-slate-600"
          >
            Cancelar
          </button>
          {onConfirm && (
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-colors shadow-sm ${getConfirmButtonStyles()}`}
            >
              {type === 'confirm-delete' ? 'Confirmar Exclusão' : 'Confirmar'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
