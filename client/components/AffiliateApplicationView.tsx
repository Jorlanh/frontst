
import React, { useState } from 'react';
import { Button, Card } from './UIComponents';
import Logo from './Logo';
import { User, Mail, Lock, Phone, ArrowRight, Loader2, CheckCircle, X, Eye, EyeOff } from 'lucide-react';

interface AffiliateApplicationViewProps {
    onBack: () => void;
    onSuccess: (email: string) => void;
}

const AffiliateApplicationView: React.FC<AffiliateApplicationViewProps> = ({ onBack, onSuccess }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name || !email || !password || !phone) {
            setError('Por favor, preencha todos os campos.');
            return;
        }

        setIsLoading(true);

        const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/$/, "");

        try {
            const response = await fetch(`${API_URL}/auth/register-affiliate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password, phone }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao enviar candidatura.');
            }

            onSuccess(email);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600 rounded-full blur-[150px] opacity-10 -z-10"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600 rounded-full blur-[150px] opacity-10 -z-10"></div>

            <div className="w-full max-w-md animate-fade-in-up">
                {/* Close/Back Button */}
                <button
                    onClick={onBack}
                    className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
                >
                    <X size={24} />
                </button>

                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-4">
                        <Logo className="h-8" variant="white" showText={false} />
                        <span className="text-2xl font-black text-white">Studr<span className="text-purple-400">.Partners</span></span>
                    </div>
                    <h1 className="text-2xl font-bold text-white">Candidatura de Parceiro</h1>
                    <p className="text-gray-400 text-sm mt-2">Preencha os dados abaixo para análise.</p>
                </div>

                <Card className="bg-slate-900 border-white/10 p-8 shadow-2xl">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-6 flex items-center gap-2 animate-shake">
                            <X size={16} /> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Nome Completo</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-slate-800 border-white/5 border rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all placeholder:text-gray-600"
                                    placeholder="Seu nome"
                                    autoComplete="off"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">E-mail Profissional</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-800 border-white/5 border rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all placeholder:text-gray-600"
                                    placeholder="exemplo@email.com"
                                    autoComplete="off"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">WhatsApp / Telefone</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full bg-slate-800 border-white/5 border rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all placeholder:text-gray-600"
                                    placeholder="(00) 00000-0000"
                                    autoComplete="off"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Defina sua Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-800 border-white/5 border rounded-xl py-3 pl-10 pr-10 text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all placeholder:text-gray-600"
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl mt-4 shadow-xl shadow-purple-900/40 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Processando...
                                </>
                            ) : (
                                <>
                                    Enviar Candidatura <ArrowRight size={20} />
                                </>
                            )}
                        </Button>
                    </form>

                    <p className="text-[10px] text-gray-500 text-center mt-6 uppercase tracking-widest leading-relaxed">
                        Ao se candidatar, você concorda que seus dados serão analisados por nossa equipe conforme nossos termos de parceria.
                    </p>
                </Card>
            </div>
        </div>
    );
};

export default AffiliateApplicationView;
