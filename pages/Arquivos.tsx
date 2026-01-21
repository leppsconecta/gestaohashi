
import React, { useState, useEffect } from 'react';
import { Folder, ExternalLink, Plus, Globe, Cloud } from 'lucide-react';
import Modal from '../components/UI/Modal';
import { ModalType } from '../types';

const ArquivosPage: React.FC = () => {
  const [driveLink, setDriveLink] = useState(() => {
    return localStorage.getItem('hashi_drive_link') || 'https://drive.google.com';
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempLink, setTempLink] = useState(driveLink);

  const handleSaveLink = () => {
    setDriveLink(tempLink);
    localStorage.setItem('hashi_drive_link', tempLink);
    setIsModalOpen(false);
  };

  const handleOpenDrive = () => {
    window.open(driveLink, '_blank');
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 p-12 relative animate-in zoom-in-95 duration-500">
        
        {/* Botão Discreto "+" */}
        <button 
          onClick={() => {
            setTempLink(driveLink);
            setIsModalOpen(true);
          }}
          className="absolute top-8 right-8 w-10 h-10 rounded-full flex items-center justify-center text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all active:scale-95"
          title="Configurar Link do Drive"
        >
          <Plus size={24} strokeWidth={3} />
        </button>

        <div className="flex flex-col items-center text-center space-y-8">
          
          {/* Icon Container */}
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <Folder size={64} className="text-blue-500 fill-blue-500/10" />
            </div>
            {/* Small Badge Icon */}
            <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-800 flex items-center justify-center shadow-sm">
               <Cloud size={16} className="text-red-500" />
            </div>
          </div>

          {/* Text Content */}
          <div className="space-y-4 max-w-lg">
            <h1 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight">
              Gerenciamento de Arquivos
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed font-medium">
              Para garantir a segurança e centralização dos dados, todos os documentos, contratos e mídias da empresa estão hospedados no Google Drive.
            </p>
          </div>

          {/* Red Button */}
          <div className="space-y-4 pt-4">
            <button 
              onClick={handleOpenDrive}
              className="bg-[#e30613] hover:bg-[#c00511] text-white font-black text-lg px-10 py-5 rounded-2xl flex items-center gap-3 transition-all active:scale-95 shadow-xl shadow-red-200 dark:shadow-none"
            >
              <ExternalLink size={24} strokeWidth={3} />
              Acessar Drive da Empresa
            </button>
            <p className="text-sm text-slate-400 font-medium">
              Será aberta uma nova guia no seu navegador.
            </p>
          </div>
        </div>
      </div>

      {/* Modal para editar o link */}
      <Modal 
        isOpen={isModalOpen}
        type="confirm-update"
        title="Configurar Link do Drive"
        maxWidth="max-w-md"
        onConfirm={handleSaveLink}
        onClose={() => setIsModalOpen(false)}
        content={
          <div className="space-y-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Insira o link oficial do Google Drive da empresa para que o botão de acesso funcione corretamente.
            </p>
            <div className="relative group">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" size={18} />
              <input 
                type="url" 
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                placeholder="https://drive.google.com/..."
                value={tempLink}
                onChange={(e) => setTempLink(e.target.value)}
              />
            </div>
          </div>
        }
      />
    </div>
  );
};

export default ArquivosPage;
