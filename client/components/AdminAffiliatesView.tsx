import React, { useEffect, useState } from 'react';
import { Button, Card, FullPageLoader, Badge } from './UIComponents';
import { Check, X, Search, User, Mail, Calendar, ExternalLink, ShieldCheck, Clock, Filter, Link } from 'lucide-react';

interface Affiliate {
    id: string;
    name: string;
    email: string;
    affiliateStatus: string;
    createdAt: string;
    phone?: string;
    affiliateLink?: any;
}

interface ProductDiscountForm { discountType: 'percent' | 'fixed'; discountValue: string; }
interface ApprovalForm { slug: string; monthly: ProductDiscountForm; annual: ProductDiscountForm; simulado: ProductDiscountForm; }
const emptyProduct = (): ProductDiscountForm => ({ discountType: 'percent', discountValue: '0' });

interface AdminAffiliatesViewProps { onBack: () => void; }

const BASE_PRICES = { monthly: 68, annual: 39, simulado: 11.80 };
function calcDisplayPrice(base: number, type: 'percent' | 'fixed', value: number): number {
    if (type === 'percent') return Math.max(0, base * (1 - value / 100));
    return Math.max(0, base - value);
}

const AdminAffiliatesView: React.FC<AdminAffiliatesViewProps> = ({ onBack }) => {
    const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const [approvalTarget, setApprovalTarget] = useState<Affiliate | null>(null);
    const [approvalForm, setApprovalForm] = useState<ApprovalForm>({ slug: '', monthly: emptyProduct(), annual: emptyProduct(), simulado: emptyProduct() });
    const [approvalLoading, setApprovalLoading] = useState(false);
    const [approvalError, setApprovalError] = useState('');

    const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/$/, "");

    const fetchAffiliates = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('studr_token');
            const resp = await fetch(`${API_URL}/admin/affiliates`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await resp.json();
            if (resp.ok) setAffiliates(data);
            else {
                if (resp.status === 403) setError("Acesso Negado (403). Faça logout e login novamente para atualizar seu token.");
                else setError(data.error || 'Erro ao carregar afiliados.');
            }
        } catch {
            setError('Erro de conexão.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAffiliates(); }, []);

    const handleReject = async (id: string) => {
        try {
            const token = localStorage.getItem('studr_token');
            const resp = await fetch(`${API_URL}/admin/affiliates/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status: 'rejected' }),
            });
            if (resp.ok) setAffiliates(prev => prev.map(a => a.id === id ? { ...a, affiliateStatus: 'rejected' } : a));
            else alert('Erro ao recusar.');
        } catch { alert('Erro de conexão.'); }
    };

    const openApprovalModal = (aff: Affiliate) => {
        const existing = aff.affiliateLink;
        setApprovalForm({
            slug: existing?.slug || aff.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || '',
            monthly: existing ? { discountType: existing.discountTypeMonthly as any, discountValue: String(existing.discountValueMonthly) } : emptyProduct(),
            annual: existing ? { discountType: existing.discountTypeAnnual as any, discountValue: String(existing.discountValueAnnual) } : emptyProduct(),
            simulado: existing ? { discountType: existing.discountTypeSimulado as any, discountValue: String(existing.discountValueSimulado) } : emptyProduct(),
        });
        setApprovalError('');
        setApprovalTarget(aff);
    };

    const updateProduct = (product: 'monthly' | 'annual' | 'simulado', field: keyof ProductDiscountForm, value: string) => {
        setApprovalForm(prev => ({ ...prev, [product]: { ...prev[product], [field]: value } }));
    };

    const isFormValid = () => approvalForm.slug.trim() !== '';

    const handleApproveSubmit = async () => {
        if (!approvalTarget || !isFormValid()) return;
        setApprovalLoading(true);
        setApprovalError('');
        try {
            const token = localStorage.getItem('studr_token');
            const resp = await fetch(`${API_URL}/admin/affiliates/${approvalTarget.id}/approve`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    slug: approvalForm.slug,
                    discountTypeMonthly: approvalForm.monthly.discountType,
                    discountValueMonthly: approvalForm.monthly.discountValue,
                    discountTypeAnnual: approvalForm.annual.discountType,
                    discountValueAnnual: approvalForm.annual.discountValue,
                    discountTypeSimulado: approvalForm.simulado.discountType,
                    discountValueSimulado: approvalForm.simulado.discountValue,
                }),
            });
            const data = await resp.json();
            if (resp.ok) {
                setAffiliates(prev => prev.map(a => a.id === approvalTarget.id ? { ...a, affiliateStatus: 'approved' } : a));
                setApprovalTarget(null);
            } else setApprovalError(data.error || 'Erro ao salvar.');
        } catch { setApprovalError('Erro de conexão.'); } finally { setApprovalLoading(false); }
    };

    const filteredAffiliates = affiliates.filter(a => {
        const matchesSearch = (a.name?.toLowerCase().includes(searchTerm.toLowerCase()) || a.email?.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = statusFilter === 'all' || a.affiliateStatus === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) return <FullPageLoader text="Carregando painel de afiliados..." />;

    return (
        <div className="animate-fade-in space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 flex items-center gap-4 p-5">
                    <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 rounded-full flex items-center justify-center"><Clock size={24} /></div>
                    <div><p className="text-xs font-bold text-slate-400 uppercase">Pendentes</p><p className="text-2xl font-black">{affiliates.filter(a => a.affiliateStatus === 'pending').length}</p></div>
                </Card>
                <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 flex items-center gap-4 p-5">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-full flex items-center justify-center"><Check size={24} /></div>
                    <div><p className="text-xs font-bold text-slate-400 uppercase">Aprovados</p><p className="text-2xl font-black">{affiliates.filter(a => a.affiliateStatus === 'approved').length}</p></div>
                </Card>
                <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 flex items-center gap-4 p-5">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 text-purple-600 rounded-full flex items-center justify-center"><User size={24} /></div>
                    <div><p className="text-xs font-bold text-slate-400 uppercase">Total</p><p className="text-2xl font-black">{affiliates.length}</p></div>
                </Card>
            </div>

            <Card className="mb-8 p-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-dashed">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input type="text" placeholder="Buscar parceiro..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl outline-none" />
                    </div>
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                        {(['all', 'pending', 'approved', 'rejected'] as const).map(status => (
                            <button key={status} onClick={() => setStatusFilter(status)} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${statusFilter === status ? 'bg-white dark:bg-slate-700 text-purple-600' : 'text-slate-500'}`}>
                                {status === 'all' ? 'Ver Todos' : status === 'pending' ? 'Pendentes' : status === 'approved' ? 'Ativos' : 'Recusados'}
                            </button>
                        ))}
                    </div>
                </div>
            </Card>

            {error ? (
                <div className="bg-red-50 text-red-600 p-8 rounded-2xl text-center"><h3 className="text-xl font-bold">{error}</h3></div>
            ) : filteredAffiliates.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border-2 border-dashed p-20 rounded-3xl text-center flex flex-col items-center">
                    <h3 className="text-2xl font-black">Nenhum resultado</h3>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredAffiliates.map(aff => (
                        <Card key={aff.id} className="p-4 bg-white dark:bg-slate-900">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center text-xl font-black">{aff.name?.charAt(0) || 'A'}</div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-black">{aff.name}</h3>
                                            <Badge color={aff.affiliateStatus === 'approved' ? 'green' : aff.affiliateStatus === 'pending' ? 'yellow' : 'red'}>{aff.affiliateStatus}</Badge>
                                        </div>
                                        <div className="text-xs text-slate-500 flex items-center gap-4 mt-1"><Mail size={12} /> {aff.email}</div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {aff.affiliateStatus === 'pending' ? (
                                        <>
                                            <button onClick={() => openApprovalModal(aff)} className="px-4 py-2 bg-green-500 text-white rounded-xl text-xs font-bold flex items-center gap-2"><Check size={16} /> Aprovar</button>
                                            <button onClick={() => handleReject(aff.id)} className="px-4 py-2 bg-slate-100 text-red-500 rounded-xl text-xs font-bold flex items-center gap-2"><X size={16} /> Recusar</button>
                                        </>
                                    ) : aff.affiliateStatus === 'approved' ? (
                                        <button onClick={() => openApprovalModal(aff)} className="flex items-center gap-2 text-xs font-bold text-slate-400 p-2"><Link size={14} /> Editar Links</button>
                                    ) : null}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Modal de Aprovação (Simples) */}
            {approvalTarget && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-black mb-4">Aprovar: {approvalTarget.name}</h2>
                        <label className="block text-xs font-bold text-slate-500 mb-2">Slug da URL (ex: joao-silva)</label>
                        <input type="text" value={approvalForm.slug} onChange={e => setApprovalForm(prev => ({...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')}))} className="w-full border rounded-xl px-4 py-2 mb-6" />
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setApprovalTarget(null)}>Cancelar</Button>
                            <Button onClick={handleApproveSubmit} disabled={!isFormValid()} className="bg-green-500 text-white">Confirmar Aprovação</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default AdminAffiliatesView;