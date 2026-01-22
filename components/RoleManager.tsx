
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, X, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Role {
    id: string;
    name: string;
}

interface RoleManagerProps {
    onClose: () => void;
    onUpdate: () => void;
}

const RoleManager: React.FC<RoleManagerProps> = ({ onClose, onUpdate }) => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [newName, setNewName] = useState('');

    const fetchRoles = async () => {
        try {
            const { data, error } = await supabase
                .schema('gestaohashi')
                .from('cargos')
                .select('*')
                .order('name');

            if (error) throw error;
            setRoles(data || []);
        } catch (error) {
            console.error('Erro ao buscar cargos:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const handleAdd = async () => {
        if (!newName.trim()) return;
        try {
            const { error } = await supabase
                .schema('gestaohashi')
                .from('cargos')
                .insert({ name: newName.trim() });

            if (error) throw error;

            setNewName('');
            fetchRoles();
            onUpdate();
        } catch (error) {
            console.error('Erro ao adicionar cargo:', error);
            alert('Erro ao adicionar cargo.');
        }
    };

    const handleUpdate = async (id: string) => {
        if (!editName.trim()) return;
        try {
            const { error } = await supabase
                .schema('gestaohashi')
                .from('cargos')
                .update({ name: editName.trim() })
                .eq('id', id);

            if (error) throw error;

            setEditingId(null);
            fetchRoles();
            onUpdate();
        } catch (error) {
            console.error('Erro ao atualizar cargo:', error);
            alert('Erro ao atualizar cargo.');
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Deseja realmente excluir o cargo "${name}"?`)) return;
        try {
            const { error } = await supabase
                .schema('gestaohashi')
                .from('cargos')
                .delete()
                .eq('id', id);

            if (error) throw error;

            fetchRoles();
            onUpdate();
        } catch (error) {
            console.error('Erro ao excluir cargo:', error);
            alert('Erro ao excluir cargo.');
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Novo cargo..."
                    className="flex-1 p-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none"
                />
                <button
                    onClick={handleAdd}
                    disabled={!newName.trim()}
                    className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                    <Plus size={16} />
                </button>
            </div>

            <div className="max-h-40 overflow-y-auto space-y-1 bg-slate-50 dark:bg-slate-900/30 p-2 rounded-lg">
                {loading ? (
                    <p className="text-center text-xs text-slate-500 py-2">Carregando...</p>
                ) : roles.length === 0 ? (
                    <p className="text-center text-xs text-slate-500 py-2">Nenhum cargo.</p>
                ) : (
                    roles.map(role => (
                        <div key={role.id} className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700 group">
                            {editingId === role.id ? (
                                <div className="flex items-center gap-1 flex-1">
                                    <input
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="flex-1 p-1 text-xs bg-slate-50 dark:bg-slate-900 border border-indigo-300 rounded outline-none"
                                        autoFocus
                                    />
                                    <button onClick={() => handleUpdate(role.id)} className="text-emerald-600 p-1"><Save size={12} /></button>
                                    <button onClick={() => setEditingId(null)} className="text-red-500 p-1"><X size={12} /></button>
                                </div>
                            ) : (
                                <>
                                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{role.name}</span>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                                        <button onClick={() => { setEditingId(role.id); setEditName(role.name); }} className="p-1 text-slate-400 hover:text-indigo-600"><Edit3 size={12} /></button>
                                        <button onClick={() => handleDelete(role.id, role.name)} className="p-1 text-slate-400 hover:text-red-600"><Trash2 size={12} /></button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>

            <button
                onClick={onClose}
                className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold uppercase hover:bg-slate-200 dark:hover:bg-slate-700"
            >
                Concluir
            </button>
        </div>
    );
};

export default RoleManager;
