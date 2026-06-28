import React, { useState } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { Button, Card, LoadingSpinner } from './UIComponents';
import Logo from './Logo';
import { Eye, EyeOff } from 'lucide-react';

interface AuthViewProps {
    onLoginSuccess: (userData: any) => void;
    onBack: () => void;
    initialMode?: 'LOGIN' | 'REGISTER';
    isPricingPath?: boolean;
}

type AuthMode = 'LOGIN' | 'REGISTER' | 'VERIFY' | 'VERIFY_DEVICE';

async function getFingerprint(): Promise<string> {
    try {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        return result.visitorId;
    } catch {
        return '';
    }
}

const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess, onBack, initialMode = 'LOGIN', isPricingPath = false }) => {
    const [mode, setMode] = useState<AuthMode | 'FORGOT_PASSWORD' | 'RESET_PASSWORD'>(initialMode);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [code, setCode] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [fingerprint, setFingerprint] = useState('');

    const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/$/, "");

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMsg(null);
        try {
            const resp = await fetch(`${API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await resp.json();
            if (resp.ok) {
                setSuccessMsg(data.message);
                setMode('RESET_PASSWORD');
            } else {
                setError(data.error || 'Erro ao processar solicitação.');
            }
        } catch (err) {
            setError('Erro de conexão.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const resp = await fetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code, newPassword }),
            });
            const data = await resp.json();
            if (resp.ok) {
                setSuccessMsg('Senha alterada com sucesso! Faça login.');
                setMode('LOGIN');
                setPassword(''); // clear old password
            } else {
                setError(data.error || 'Erro ao redefinir senha.');
            }
        } catch (err) {
            setError('Erro de conexão.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMsg(null);

        const referralId = localStorage.getItem('studr_referral_id');
        const referralSource = localStorage.getItem('studr_referral_source');

        try {
            const resp = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, name, password, referralId, referralSource }),
            });
            const data = await resp.json();
            if (resp.ok) {
                setMode('VERIFY');
            } else {
                setError(data.error || 'Erro ao registrar.');
            }
        } catch (err) {
            setError('Erro de conexão com o servidor.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const resp = await fetch(`${API_URL}/auth/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            });
            const data = await resp.json();
            if (resp.ok) {
                onLoginSuccess(data);
            } else {
                setError(data.error || 'Código inválido.');
            }
        } catch (err) {
            setError('Erro de conexão.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMsg(null);
        try {
            const fp = await getFingerprint();
            setFingerprint(fp);

            const resp = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, fingerprint: fp }),
            });
            const data = await resp.json();

            if (resp.ok) {
                if (data.requiresDeviceVerification) {
                    setCode('');
                    setMode('VERIFY_DEVICE');
                } else {
                    onLoginSuccess(data);
                }
            } else {
                setError(data.error || 'Credenciais inválidas.');
            }
        } catch (err) {
            setError('Erro de conexão.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyDevice = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const resp = await fetch(`${API_URL}/auth/verify-device`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code, fingerprint }),
            });
            const data = await resp.json();
            if (resp.ok) {
                onLoginSuccess(data);
            } else {
                setError(data.error || 'Código inválido.');
            }
        } catch (err) {
            setError('Erro de conexão.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors">
            <Card className="max-w-md w-full p-8 shadow-xl border-slate-200 dark:border-slate-800 backdrop-blur-sm">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-3">
                        <Logo className="h-12" variant="color" showText={true} />
                    </div>
                    <p className="text-gray-500 dark:text-slate-400">
                        {mode === 'LOGIN' && 'Entre na sua conta para continuar.'}
                        {mode === 'REGISTER' && (isPricingPath ? 'Crie sua conta para concluir a assinatura.' : 'Comece seu trial de 7 dias grátis.')}
                        {mode === 'VERIFY' && 'Validando seu e-mail...'}
                        {mode === 'VERIFY_DEVICE' && 'Novo aparelho detectado.'}
                        {mode === 'FORGOT_PASSWORD' && 'Recupere o acesso à sua conta.'}
                        {mode === 'RESET_PASSWORD' && 'Defina sua nova senha.'}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm mb-4 border border-red-100 dark:border-red-900/30 animate-shake">
                        {error}
                    </div>
                )}

                {successMsg && (
                    <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-3 rounded-lg text-sm mb-4 border border-green-100 dark:border-green-900/30">
                        {successMsg}
                    </div>
                )}

                {mode === 'LOGIN' && (
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} required
                            className="w-full p-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-enem-blue outline-none transition-colors"
                        />
                        <div className="space-y-1">
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"} placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} required
                                    className="w-full p-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-enem-blue outline-none transition-colors pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            <div className="flex justify-end">
                                <button type="button" onClick={() => setMode('FORGOT_PASSWORD')} className="text-xs text-gray-400 hover:text-enem-blue dark:hover:text-blue-400 transition-colors">Esqueceu sua senha?</button>
                            </div>
                        </div>
                        <Button variant="primary" className="w-full py-3 shadow-lg shadow-blue-500/20" loading={loading}>
                            Entrar
                        </Button>
                        <p className="text-center text-sm text-gray-500 dark:text-slate-500">
                            Não tem conta? <button type="button" onClick={() => setMode('REGISTER')} className="text-enem-blue dark:text-blue-400 font-bold hover:underline">Cadastre-se</button>
                        </p>
                    </form>
                )}

                {mode === 'FORGOT_PASSWORD' && (
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-slate-400 text-center mb-2">
                            Insira seu e-mail abaixo para receber um código de recuperação.
                        </p>
                        <input
                            type="email" placeholder="Seu E-mail" value={email} onChange={e => setEmail(e.target.value)} required
                            className="w-full p-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-enem-blue outline-none transition-colors"
                        />
                        <Button variant="primary" className="w-full py-3" loading={loading}>
                            Enviar Código
                        </Button>
                        <p className="text-center text-sm text-gray-500 dark:text-slate-500">
                            Lembrou a senha? <button type="button" onClick={() => setMode('LOGIN')} className="text-enem-blue dark:text-blue-400 font-bold hover:underline">Fazer Login</button>
                        </p>
                    </form>
                )}

                {mode === 'RESET_PASSWORD' && (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-slate-400 text-center mb-2">
                            Enviamos um código para seu e-mail. Defina sua nova senha abaixo.
                        </p>
                        <input
                            type="text" placeholder="Código de 6 dígitos" value={code} onChange={e => setCode(e.target.value)} required maxLength={6}
                            className="w-full p-3 text-center text-xl font-bold tracking-[0.3em] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-enem-blue outline-none transition-colors"
                        />
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"} placeholder="Nova Senha" value={newPassword} onChange={e => setNewPassword(e.target.value)} required
                                className="w-full p-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-enem-blue outline-none transition-colors pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        <Button variant="primary" className="w-full py-3" loading={loading}>
                            Redefinir Senha
                        </Button>
                        <p className="text-center text-sm text-gray-500 dark:text-slate-500">
                            <button type="button" onClick={() => setMode('FORGOT_PASSWORD')} className="text-enem-blue dark:text-blue-400 font-bold hover:underline">Voltar</button>
                        </p>
                    </form>
                )}

                {mode === 'REGISTER' && (
                    <form onSubmit={handleRegister} className="space-y-4">
                        <input
                            type="text" placeholder="Nome Completo" value={name} onChange={e => setName(e.target.value)} required
                            className="w-full p-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-enem-blue outline-none transition-colors"
                        />
                        <input
                            type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} required
                            className="w-full p-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-enem-blue outline-none transition-colors"
                        />
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"} placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} required
                                className="w-full p-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-enem-blue outline-none transition-colors pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        <Button variant="primary" className="w-full py-3 shadow-lg shadow-blue-500/20" loading={loading}>
                            {isPricingPath ? 'Continuar para Pagamento' : 'Começar Trial Grátis'}
                        </Button>
                        <p className="text-center text-sm text-gray-500 dark:text-slate-500">
                            Já tem conta? <button type="button" onClick={() => setMode('LOGIN')} className="text-enem-blue dark:text-blue-400 font-bold hover:underline">Fazer Login</button>
                        </p>
                    </form>
                )}

                {mode === 'VERIFY' && (
                    <form onSubmit={handleVerify} className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-slate-400 text-center mb-4">
                            Enviamos um código de 6 dígitos para <strong>{email}</strong>. Por favor, insira-o abaixo:
                        </p>
                        <input
                            type="text" placeholder="000000" value={code} onChange={e => setCode(e.target.value)} required maxLength={6}
                            className="w-full p-4 text-center text-2xl font-bold tracking-[0.5em] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-enem-blue outline-none transition-colors"
                        />
                        <Button variant="primary" className="w-full py-3" loading={loading}>
                            Validar E-mail
                        </Button>
                    </form>
                )}

                {mode === 'VERIFY_DEVICE' && (
                    <form onSubmit={handleVerifyDevice} className="space-y-4">
                        <div className="flex flex-col items-center gap-3 mb-2">
                            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-3xl">🔒</div>
                            <p className="text-sm text-gray-600 dark:text-slate-400 text-center">
                                Detectamos um <strong>novo aparelho</strong>. Por segurança, enviamos um código de verificação para:
                            </p>
                            <p className="font-bold text-enem-blue dark:text-blue-400">{email}</p>
                        </div>
                        <input
                            type="text"
                            placeholder="000000"
                            value={code}
                            onChange={e => setCode(e.target.value)}
                            required
                            maxLength={6}
                            autoFocus
                            className="w-full p-4 text-center text-2xl font-bold tracking-[0.5em] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-enem-blue outline-none transition-colors"
                        />
                        <Button variant="primary" className="w-full py-3 shadow-lg shadow-blue-500/20" loading={loading}>
                            Autorizar Este Aparelho
                        </Button>
                        <p className="text-xs text-center text-gray-400 dark:text-slate-600">
                            O código expira em 10 minutos.{' '}
                            <button type="button" onClick={() => setMode('LOGIN')} className="text-enem-blue dark:text-blue-400 underline">
                                Tentar novamente
                            </button>
                        </p>
                    </form>
                )}

                <button onClick={onBack} className="w-full mt-6 text-sm text-gray-400 dark:text-slate-600 hover:text-gray-600 dark:hover:text-slate-400 transition-colors">
                    ← Voltar para Home
                </button>
            </Card>
        </div>
    );
};

export default AuthView;
