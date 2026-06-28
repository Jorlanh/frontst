import React, { useEffect, useState } from 'react';
import { Button, Card, FullPageLoader, Badge } from './UIComponents';
import { Search, Shield, User, Mail, Calendar, UserCheck, UserX, Clock, Plus, X } from 'lucide-react';

interface UserData {
    id: string;
    email: string;
    name: string;
    role: string;
    isVerified: boolean;
    isBlocked: boolean;
    isPremium: boolean;
    createdAt: string;
    level: number;
    totalTimeSecs: number;
}

const AdminUsersView: React.FC = () => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    // Estados do Modal de Criação
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', role: 'STUDENT', isPremium: false });
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState('');

    const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/$/, "");

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('studr_token');
            const resp = await fetch(`${API_URL}/admin/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await resp.json();
            if (resp.ok) setUsers(data);
            else setError(data.error || 'Erro ao carregar usuários.');
        } catch (err) {
            setError('Erro de conexão com o servidor.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const toggleBlock = async (id: string) => {
        try {
            const token = localStorage.getItem('studr_token');
            const resp = await fetch(`${API_URL}/admin/users/${id}/toggle-block`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await resp.json();
            if (resp.ok) {
                setUsers(prev => prev.map(u => u.id === id ? { ...u, isBlocked: !u.isBlocked } : u));
            } else {
                alert(data.error || 'Erro ao alterar status.');
            }
        } catch (err) { alert('Erro ao alterar status.'); }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateLoading(true);
        setCreateError('');
        try {
            const token = localStorage.getItem('studr_token');
            const resp = await fetch(`${API_URL}/admin/users`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(createForm)
            });
            const data = await resp.json();
            if (resp.ok) {
                setIsCreateModalOpen(false);
                setCreateForm({ name: '', email: '', password: '', role: 'STUDENT', isPremium: false });
                fetchUsers(); // Recarrega a lista
            } else {
                setCreateError(data.error || 'Erro ao criar usuário.');
            }
        } catch (err) { setCreateError('Erro de conexão.'); } finally { setCreateLoading(false); }
    };

    const formatTime = (seconds: number) => {
        if (!seconds) return '0h 0m';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}h ${m}m`;
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || String(u.role).toLowerCase() === roleFilter.toLowerCase();
        return matchesSearch && matchesRole;
    });

    if (loading) return <FullPageLoader text="Carregando lista de usuários..." />;

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto flex-1">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input type="text" placeholder="Buscar usuário..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-2.5 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-enem-blue"
                        />
                    </div>
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl overflow-x-auto">
                        {['all', 'admin', 'student', 'affiliate'].map(role => (
                            <button key={role} onClick={() => setRoleFilter(role)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all whitespace-nowrap ${roleFilter === role ? 'bg-white dark:bg-slate-700 text-enem-blue shadow-sm' : 'text-slate-500'}`}>
                                {role === 'all' ? 'Todos' : role}
                            </button>
                        ))}
                    </div>
                </div>
                
                <Button onClick={() => setIsCreateModalOpen(true)} className="w-full md:w-auto bg-enem-blue hover:bg-blue-700 text-white font-bold flex items-center gap-2 rounded-xl py-2.5">
                    <Plus size={18} /> Novo Usuário
                </Button>
            </div>

            {error ? (
                <Card className="text-center p-12 text-red-500">{error}</Card>
            ) : filteredUsers.length === 0 ? (
                <div className="text-center p-20 text-slate-400">Nenhum usuário encontrado.</div>
            ) : (
                <div className="grid gap-3">
                    {filteredUsers.map(user => {
                        const isRoleAdmin = String(user.role).toUpperCase() === 'ADMIN';
                        const isSuperAdmin = user.email === 'sachabm@hotmail.com';
                        
                        return (
                            <Card key={user.id} className={`p-5 transition-all ${user.isBlocked ? 'opacity-60 bg-slate-50 grayscale' : 'hover:border-blue-200'}`}>
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 w-full md:w-auto">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner
                                            ${isSuperAdmin ? 'bg-red-100 text-red-600 border border-red-200' : isRoleAdmin ? 'bg-purple-100 text-purple-600' : user.isPremium ? 'bg-yellow-100 text-yellow-600' : 'bg-slate-100 text-slate-500'}
                                        `}>
                                            {isSuperAdmin ? '👑' : user.name?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <span className="font-black text-lg text-slate-800 dark:text-slate-100">{user.name}</span>
                                                {isSuperAdmin && <Badge color="red">Super Admin</Badge>}
                                                {!isSuperAdmin && isRoleAdmin && <Badge color="purple">Admin</Badge>}
                                                {user.isPremium && !isRoleAdmin && <Badge color="yellow">Premium</Badge>}
                                                {user.isBlocked && <Badge color="red">Bloqueado</Badge>}
                                            </div>
                                            <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-4 gap-y-2 font-medium">
                                                <span className="flex items-center gap-1"><Mail size={14}/> {user.email}</span>
                                                <span className="flex items-center gap-1"><Calendar size={14}/> Membro desde: {new Date(user.createdAt).toLocaleDateString('pt-BR')}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 mt-2 md:mt-0">
                                        <div className="text-center flex flex-col items-center">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><Clock size={12}/> Uso Real</p>
                                            <p className="font-black text-enem-blue">{formatTime(user.totalTimeSecs)}</p>
                                        </div>
                                        <div className="text-center flex flex-col items-center">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><Award size={12}/> Nível Real</p>
                                            <p className="font-black text-slate-700 dark:text-slate-300">{user.level || 1}</p>
                                        </div>
                                        
                                        {!isSuperAdmin && (
                                            <button onClick={() => toggleBlock(user.id)}
                                                className={`p-3 rounded-xl transition-all shadow-sm ${user.isBlocked ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600'}`}
                                                title={user.isBlocked ? 'Desbloquear' : 'Bloquear'}
                                            >
                                                {user.isBlocked ? <UserCheck size={20}/> : <UserX size={20}/>}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* MODAL DE CRIAÇÃO DE USUÁRIO */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                            <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                                <UserPlus size={24} className="text-enem-blue" /> Adicionar Novo Usuário
                            </h2>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-red-500"><X size={24}/></button>
                        </div>
                        <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                            {createError && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold text-center">{createError}</div>}
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Nome Completo</label>
                                <input required type="text" value={createForm.name} onChange={e => setCreateForm({...createForm, name: e.target.value})} className="w-full border rounded-xl px-4 py-3 bg-slate-50 outline-none focus:ring-2 focus:ring-enem-blue" placeholder="Ex: João da Silva"/>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">E-mail</label>
                                <input required type="email" value={createForm.email} onChange={e => setCreateForm({...createForm, email: e.target.value})} className="w-full border rounded-xl px-4 py-3 bg-slate-50 outline-none focus:ring-2 focus:ring-enem-blue" placeholder="joao@email.com"/>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Senha (Provisória)</label>
                                <input required type="text" value={createForm.password} onChange={e => setCreateForm({...createForm, password: e.target.value})} className="w-full border rounded-xl px-4 py-3 bg-slate-50 outline-none focus:ring-2 focus:ring-enem-blue" placeholder="Senha123"/>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Nível de Acesso</label>
                                    <select value={createForm.role} onChange={e => setCreateForm({...createForm, role: e.target.value})} className="w-full border rounded-xl px-4 py-3 bg-slate-50 outline-none font-bold text-slate-700">
                                        <option value="STUDENT">Aluno</option>
                                        <option value="ADMIN">Administrador</option>
                                        <option value="AFFILIATE">Afiliado</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Status Premium</label>
                                    <select value={createForm.isPremium ? "true" : "false"} onChange={e => setCreateForm({...createForm, isPremium: e.target.value === "true"})} className="w-full border rounded-xl px-4 py-3 bg-slate-50 outline-none font-bold text-slate-700">
                                        <option value="false">Não (Trial)</option>
                                        <option value="true">Sim (Acesso Total)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-6">
                                <Button type="submit" loading={createLoading} className="w-full py-4 rounded-xl bg-enem-blue hover:bg-blue-700 text-white font-black text-lg">
                                    Criar Usuário
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// Imports faltantes que usei no layout:
import { Award, UserPlus } from 'lucide-react';
export default AdminUsersView;