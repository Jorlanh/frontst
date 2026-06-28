import React from 'react';
import { Button, Card } from './UIComponents';
import { LayoutDashboard, Link as LinkIcon, Users, DollarSign, TrendingUp, ChevronRight, ExternalLink, ShieldCheck } from 'lucide-react';
import Logo from './Logo';

interface AffiliateDashboardViewProps {
    user: any;
    onLogout: () => void;
}

const AffiliateDashboardView: React.FC<AffiliateDashboardViewProps> = ({ user, onLogout }) => {
    const referralLink = `${window.location.origin}?ref=${user.id}`;

    const copyLink = () => {
        navigator.clipboard.writeText(referralLink);
        alert('Link copiado com sucesso!');
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans">
            {/* Sidebar / Header */}
            <header className="border-b border-white/5 bg-slate-950/50 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Logo className="h-8" variant="white" showText={false} />
                        <span className="text-xl font-black text-white">Studr<span className="text-purple-400">.Partners</span></span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-sm font-bold">{user.name}</span>
                            <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">{user.affiliateStatus === 'approved' ? 'Afiliado Parceiro' : 'Aguardando Aprovação'}</span>
                        </div>
                        <button
                            onClick={onLogout}
                            className="px-4 py-2 bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-xs font-bold rounded-lg border border-white/10 transition-all uppercase tracking-wider"
                        >
                            Sair
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-6 md:p-10">
                {user.affiliateStatus !== 'approved' ? (
                    <Card className="bg-slate-800/50 border-white/5 p-12 text-center max-w-2xl mx-auto shadow-2xl">
                        <div className="w-20 h-20 bg-yellow-500/20 text-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShieldCheck size={40} />
                        </div>
                        <h2 className="text-3xl font-bold mb-4">Candidatura em Análise</h2>
                        <p className="text-gray-400 leading-relaxed mb-8">
                            Sua solicitação está sendo revisada por nossa equipe. Você terá acesso total às ferramentas de divulgação assim que sua parceria for aprovada.
                        </p>
                        <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl text-yellow-200 text-sm">
                            Enviamos as novidades para o seu e-mail: <strong>{user.email}</strong>
                        </div>
                    </Card>
                ) : (
                    <div className="animate-fade-in space-y-8">
                        {/* Hero Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: 'Cliques totais', value: '0', icon: TrendingUp, color: 'text-blue-400' },
                                { label: 'Conversões (Leads)', value: '0', icon: Users, color: 'text-purple-400' },
                                { label: 'Vendas Ativas', value: '0', icon: Users, color: 'text-green-400' },
                                { label: 'Comissão Acumulada', value: 'R$ 0,00', icon: DollarSign, color: 'text-yellow-400' },
                            ].map((stat, i) => (
                                <Card key={i} className="bg-slate-800/50 border-white/5 p-6 hover:bg-slate-800 transition-colors">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{stat.label}</span>
                                        <stat.icon className={stat.color} size={20} />
                                    </div>
                                    <div className="text-3xl font-black text-white">{stat.value}</div>
                                </Card>
                            ))}
                        </div>

                        {/* Referral Link Section */}
                        <Card className="bg-gradient-to-r from-purple-900/40 to-slate-800/40 border-purple-500/20 p-8 shadow-2xl relative overflow-hidden group">
                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                                        <LinkIcon className="text-purple-400" size={24} /> Seu Link Único
                                    </h3>
                                    <p className="text-gray-400 text-sm">Compartilhe este link e ganhe comissão por cada assinatura gerada.</p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="bg-black/40 border border-white/10 px-4 py-3 rounded-xl font-mono text-sm text-purple-200 min-w-[300px] flex items-center truncate">
                                        {referralLink}
                                    </div>
                                    <Button
                                        onClick={copyLink}
                                        className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-purple-900/50 transition-all active:scale-95"
                                    >
                                        COPIAR LINK
                                    </Button>
                                </div>
                            </div>
                            <div className="absolute -right-20 -top-20 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] group-hover:bg-purple-500/20 transition-all duration-700"></div>
                        </Card>

                        {/* Placeholder Modules */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <Card className="bg-slate-800/30 border-white/5 p-8 border-dashed">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-lg flex items-center justify-center">
                                        <TrendingUp size={24} />
                                    </div>
                                    <h4 className="text-lg font-bold">Histórico de Vendas</h4>
                                </div>
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="text-gray-600 mb-2">Sem vendas registradas ainda.</div>
                                    <p className="text-gray-500 text-xs max-w-xs">Comece a compartilhar seu link para ver suas primeiras comissões aqui.</p>
                                </div>
                            </Card>

                            <Card className="bg-slate-800/30 border-white/5 p-8 border-dashed">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-green-500/10 text-green-400 rounded-lg flex items-center justify-center">
                                        <DollarSign size={24} />
                                    </div>
                                    <h4 className="text-lg font-bold">Solicitar Saque</h4>
                                </div>
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="text-gray-600 mb-2">Saldo insuficiente para saque.</div>
                                    <p className="text-gray-500 text-xs max-w-xs">O valor mínimo para solicitação é de R$ 50,00.</p>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AffiliateDashboardView;
