import React, { useEffect, useState } from 'react';
import { Button, Card, FullPageLoader } from './UIComponents';
import { Save, ExternalLink } from 'lucide-react';

interface ProductForm {
    label: string;
    checkoutUrl: string;
    kiwifyInviteLink: string;
}

const PRODUCT_TYPES = [
    { type: 'monthly', defaultLabel: 'Plano Mensal', description: 'R$ 68/mês' },
    { type: 'annual', defaultLabel: 'Plano Anual', description: 'R$ 39/mês' },
    { type: 'simulado', defaultLabel: 'Plano Simulado', description: 'R$ 11,80/mês' },
];

const AdminAffiliateProductsView: React.FC = () => {
    const [forms, setForms] = useState<Record<string, ProductForm>>({
        monthly: { label: 'Plano Mensal', checkoutUrl: '', kiwifyInviteLink: '' },
        annual: { label: 'Plano Anual', checkoutUrl: '', kiwifyInviteLink: '' },
        simulado: { label: 'Plano Simulado', checkoutUrl: '', kiwifyInviteLink: '' },
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [saved, setSaved] = useState<string | null>(null);
    const [error, setError] = useState('');

    const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/$/, "");

    useEffect(() => {
        const token = localStorage.getItem('studr_token');
        fetch(`${API_URL}/admin/affiliate-products`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(async r => {
                if (!r.ok) {
                    if (r.status === 403) throw new Error("Acesso Negado. Faça logout e login.");
                    throw new Error("Erro de servidor.");
                }
                return r.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    const updated = { ...forms };
                    data.forEach((p: any) => {
                        if (updated[p.productType]) {
                            updated[p.productType] = { label: p.label, checkoutUrl: p.checkoutUrl, kiwifyInviteLink: p.kiwifyInviteLink };
                        }
                    });
                    setForms(updated);
                }
            })
            .catch((e) => setError(e.message || 'Erro ao carregar produtos.'))
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async (productType: string) => {
        const form = forms[productType];
        if (!form.checkoutUrl || !form.kiwifyInviteLink) return;

        setSaving(productType);
        setError('');
        try {
            const token = localStorage.getItem('studr_token');
            const resp = await fetch(`${API_URL}/admin/affiliate-products/${productType}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(form),
            });
            if (resp.ok) {
                setSaved(productType);
                setTimeout(() => setSaved(null), 2000);
            } else {
                const data = await resp.json();
                setError(data.error || 'Erro ao salvar.');
            }
        } catch {
            setError('Erro de conexão.');
        } finally {
            setSaving(null);
        }
    };

    const updateForm = (productType: string, field: keyof ProductForm, value: string) => {
        setForms(prev => ({ ...prev, [productType]: { ...prev[productType], [field]: value } }));
    };

    if (loading) return <FullPageLoader text="Carregando produtos..." />;

    return (
        <div className="animate-fade-in space-y-6">
            <div>
                <h2 className="text-xl font-black">Produtos Kiwify</h2>
                <p className="text-sm text-slate-500 mt-1">Links de checkout e convite de afiliado.</p>
            </div>

            {error && <p className="text-sm text-red-600 font-bold bg-red-50 rounded-lg p-3">{error}</p>}

            <div className="grid gap-6">
                {PRODUCT_TYPES.map(({ type, defaultLabel, description }) => {
                    const form = forms[type];
                    const isValid = form.checkoutUrl.trim() !== '' && form.kiwifyInviteLink.trim() !== '';
                    return (
                        <Card key={type} className="p-6">
                            <h3 className="font-black mb-4">{defaultLabel} <span className="text-xs text-slate-400 font-normal">({description})</span></h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Link de Checkout</label>
                                    <input type="url" value={form.checkoutUrl} onChange={e => updateForm(type, 'checkoutUrl', e.target.value)} className="w-full border rounded-xl px-4 py-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Link de Convite Afiliado</label>
                                    <input type="url" value={form.kiwifyInviteLink} onChange={e => updateForm(type, 'kiwifyInviteLink', e.target.value)} className="w-full border rounded-xl px-4 py-2 text-sm" />
                                </div>
                                <div className="flex justify-end pt-2">
                                    <Button onClick={() => handleSave(type)} disabled={!isValid || saving === type} className="bg-enem-blue text-white">
                                        <Save size={14} className="mr-2 inline" /> {saved === type ? 'Salvo!' : 'Salvar'}
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default AdminAffiliateProductsView;