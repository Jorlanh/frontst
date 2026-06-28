import React, { useState } from 'react';
import { Button } from './UIComponents';
import { LayoutDashboard, Users, ShieldCheck, ChevronLeft, LogOut, Package, Zap } from 'lucide-react';
import { useUser } from '../contexts/UserContext'; // 🔥 Importamos o contexto do usuário

// Certifique-se de que os imports abaixo estão corretos e apontam para os arquivos na mesma pasta
import AdminDashboardView from './AdminDashboardView';
import AdminUsersView from './AdminUsersView';
import AdminAffiliatesView from './AdminAffiliatesView';
import AdminAffiliateProductsView from './AdminAffiliateProductsView';

interface AdminShellProps {
    onBack: () => void;
}

type TabType = 'dashboard' | 'users' | 'affiliates' | 'affiliate-products';

const AdminShell: React.FC<AdminShellProps> = ({ onBack }) => {
    const { user } = useUser(); // 🔥 Pegando o usuário logado
    const [activeTab, setActiveTab] = useState<TabType>('dashboard');

    // 🔥 O menu agora é dinâmico. A aba Kiwify só aparece para o seu e-mail.
    const menuItems = [
        { id: 'dashboard', label: 'Estatísticas', icon: LayoutDashboard },
        { id: 'users', label: 'Usuários', icon: Users },
        { id: 'affiliates', label: 'Candidatos Afiliados', icon: ShieldCheck },
        ...(user?.email === 'sachabm@hotmail.com' 
            ? [{ id: 'affiliate-products', label: 'Produtos Kiwify', icon: Package }] 
            : [])
    ] as const;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950/50 pb-20 animate-fade-in w-full">
            {/* Top Bar */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={onBack}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all group"
                        >
                            <ChevronLeft size={24} className="text-slate-500 group-hover:text-enem-blue transition-colors" />
                        </button>
                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>
                        <div>
                            <h1 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2 tracking-tighter uppercase">
                                <Zap size={18} className="text-enem-blue animate-pulse" />
                                Central Admin Studr
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex flex-col text-right mr-2">
                            <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tighter">Administrador</span>
                            <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Sessão Segura Ativa</span>
                        </div>
                        <Button variant="outline" size="sm" onClick={onBack} className="p-2 border-slate-200 dark:border-slate-800">
                           <LogOut size={18} className="text-red-400" />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 pt-8 w-full">
                {/* Tabs Navigation */}
                <div className="flex flex-wrap gap-2 mb-10 overflow-x-auto pb-2 scrollbar-none w-full">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id as TabType)}
                                className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-sm font-black transition-all border whitespace-nowrap
                                    ${activeTab === item.id 
                                        ? 'bg-enem-blue text-white border-enem-blue shadow-xl shadow-blue-500/20 translate-y-[-2px]' 
                                        : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-800 hover:border-enem-blue/30'}
                                `}
                            >
                                <Icon size={18} />
                                {item.label}
                            </button>
                        );
                    })}
                </div>

                {/* Sub-Views Content */}
                <div className="space-y-8 w-full">
                    {activeTab === 'dashboard' && <AdminDashboardView />}
                    {activeTab === 'users' && <AdminUsersView />}
                    {activeTab === 'affiliates' && <AdminAffiliatesView onBack={() => setActiveTab('dashboard')} />}
                    
                    {/* 🔥 Dupla checagem: mesmo se burlarem a aba, a view não renderiza sem o e-mail correto */}
                    {activeTab === 'affiliate-products' && user?.email === 'sachabm@hotmail.com' && (
                        <AdminAffiliateProductsView />
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminShell;