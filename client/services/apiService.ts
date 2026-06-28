const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const getHeaders = () => {
    const token = localStorage.getItem('studr_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// 🚨 TRATAMENTO DE ERRO GLOBAL E RETRY ENGINE
export const apiRequest = async (endpoint: string, method: string = 'GET', body?: any, maxRetries = 3) => {
    const cleanEndpoint = endpoint.replace(/^\/?api/, '').replace(/^\/+/, '/');
    const baseUrlClean = API_URL.replace(/\/+$/, '');
    const url = `${baseUrlClean}${cleanEndpoint.startsWith('/') ? cleanEndpoint : `/${cleanEndpoint}`}`;

    let lastError = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(url, {
                method,
                headers: getHeaders(),
                body: body ? JSON.stringify(body) : undefined
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));

                if (response.status === 401) {
                    console.warn('[API] 401 - Sessão expirada:', errorData.error, '| endpoint:', url);
                    window.dispatchEvent(new CustomEvent('studr:session-expired', {
                        detail: { reason: errorData.error || 'Sessão expirada', endpoint: url }
                    }));
                    const err = new Error('SESSION_EXPIRED');
                    (err as any).status = 401;
                    throw err;
                }

                // Se o Railway estiver a acordar (502, 503, 504) ou der Rate Limit (429), força a repetição
                if ((response.status >= 500 || response.status === 429 || response.status === 408) && attempt < maxRetries) {
                    throw new Error(`Servidor Railway a iniciar ou ocupado (Código ${response.status})`);
                }

                const error = new Error(errorData.error || `API Request failed with status ${response.status}`);
                (error as any).status = response.status;
                throw error;
            }

            return await response.json();

        } catch (error: any) {
            lastError = error;
            
            // Se for erro de sessão, não repete
            if (error.message === 'SESSION_EXPIRED') throw error; 
            
            // Pausa inteligente antes de tentar de novo (1.5s, 3s, 4.5s)
            if (attempt < maxRetries) {
                console.warn(`[API] Lentidão na conexão detectada no Railway. Nova tentativa (${attempt + 1}/${maxRetries}) em breve...`);
                await delay(1500 * (attempt + 1));
            }
        }
    }

    // Só devolve o erro para a interface se falhar as 3 tentativas
    console.error("[API] Falha definitiva após retentativas:", lastError);
    throw lastError;
};