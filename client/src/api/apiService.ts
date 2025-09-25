import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, STORAGE_KEYS, ApiResponse, AuthResponse, User } from './config';

class ApiService {
    private baseURL: string;
    private timeout: number;

    constructor() {
        this.baseURL = API_CONFIG.BASE_URL;
        this.timeout = API_CONFIG.TIMEOUT;
    }

    private async getAuthToken(): Promise<string | null> {
        try {
            return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        } catch (error) {
            console.error('Error getting auth token:', error);
            return null;
        }
    }

    private async setAuthToken(token: string): Promise<void> {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        } catch (error) {
            console.error('Error setting auth token:', error);
        }
    }

    private async removeAuthToken(): Promise<void> {
        try {
            await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        } catch (error) {
            console.error('Error removing auth token:', error);
        }
    }

    private async makeRequest<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        try {
            const token = await this.getAuthToken();

            const headers: Record<string, string> = {
                ...(API_CONFIG.DEFAULT_HEADERS as any),
                ...(options.headers as any),
            };

            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            const response = await fetch(`${this.baseURL}${endpoint}`, {
                ...options,
                headers,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    error: data.error || `HTTP ${response.status}: ${response.statusText}`,
                };
            }

            return {
                success: true,
                data,
                message: data.message,
            };
        } catch (error: any) {
            console.error('API request error:', error);

            if (error.name === 'AbortError') {
                return {
                    success: false,
                    error: 'Request timeout. Please check your connection.',
                };
            }

            return {
                success: false,
                error: error.message || 'Network error. Please check your connection.',
            };
        }
    }

    // Auth methods
    async register(email: string, password: string, onboardingData?: any): Promise<ApiResponse<AuthResponse>> {
        const response = await this.makeRequest<AuthResponse>(API_CONFIG.ENDPOINTS.AUTH.REGISTER, {
            method: 'POST',
            body: JSON.stringify({
                email,
                password,
                onboarding_data: onboardingData,
            }),
        });

        if (response.success && response.data?.token) {
            await this.setAuthToken(response.data.token);
            await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.user));
        }

        return response;
    }

    async login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
        const response = await this.makeRequest<AuthResponse>(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        if (response.success && response.data?.token) {
            await this.setAuthToken(response.data.token);
            await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.user));
        }

        return response;
    }

    async loginWithGoogle(idToken: string): Promise<ApiResponse<AuthResponse>> {
        const response = await this.makeRequest<AuthResponse>(API_CONFIG.ENDPOINTS.AUTH.GOOGLE, {
            method: 'POST',
            body: JSON.stringify({ id_token: idToken }),
        });

        if (response.success && response.data?.token) {
            await this.setAuthToken(response.data.token);
            await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.user));
        }

        return response;
    }

    async loginWithApple(identityToken: string, rawNonce: string, givenName?: string, familyName?: string, email?: string): Promise<ApiResponse<AuthResponse>> {
        const response = await this.makeRequest<AuthResponse>(API_CONFIG.ENDPOINTS.AUTH.APPLE, {
            method: 'POST',
            body: JSON.stringify({
                identityToken,
                rawNonce,
                givenName,
                familyName,
                email
            }),
        });

        if (response.success && response.data?.token) {
            await this.setAuthToken(response.data.token);
            await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.user));
        }

        return response;
    }

    async forgotPassword(email: string): Promise<ApiResponse> {
        return this.makeRequest(API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD, {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    }

    async resetPasswordWithCode(email: string, code: string, password: string): Promise<ApiResponse> {
        return this.makeRequest(API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD, {
            method: 'POST',
            body: JSON.stringify({ email, code, new_password: password }),
        });
    }

    async verifyToken(): Promise<ApiResponse<{ valid: boolean; user: User }>> {
        const token = await this.getAuthToken();
        if (!token) {
            return {
                success: false,
                error: 'No authentication token found',
            };
        }

        return this.makeRequest<{ valid: boolean; user: User }>(API_CONFIG.ENDPOINTS.AUTH.VERIFY_TOKEN, {
            method: 'POST',
            body: JSON.stringify({ token }),
        });
    }

    async logout(): Promise<void> {
        await this.removeAuthToken();
        await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
    }

    // User methods
    async getCurrentUser(): Promise<User | null> {
        try {
            const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    async updateOnboardingData(data: any): Promise<ApiResponse> {
        return this.makeRequest(API_CONFIG.ENDPOINTS.USER.ONBOARDING_DATA, {
            method: 'PUT',
            body: JSON.stringify({ onboarding_data: data }),
        });
    }

    // Health check
    async healthCheck(): Promise<ApiResponse> {
        return this.makeRequest(API_CONFIG.ENDPOINTS.HEALTH);
    }

    // Push notifications
    async registerPushToken(expoPushToken: string, userId?: string): Promise<ApiResponse> {
        return this.makeRequest(API_CONFIG.ENDPOINTS.PUSH.REGISTER, {
            method: 'POST',
            body: JSON.stringify({ expo_push_token: expoPushToken, user_id: userId }),
        });
    }

    async sendTestPush(expoPushToken?: string, userId?: string, title?: string, body?: string, data?: any): Promise<ApiResponse> {
        return this.makeRequest(API_CONFIG.ENDPOINTS.PUSH.SEND_TEST, {
            method: 'POST',
            body: JSON.stringify({ expo_push_token: expoPushToken, user_id: userId, title, body, data }),
        });
    }

    // Utility methods
    async isAuthenticated(): Promise<boolean> {
        const token = await this.getAuthToken();
        if (!token) return false;

        const response = await this.verifyToken();
        return response.success && response.data?.valid === true;
    }

    async refreshUserData(): Promise<User | null> {
        const response = await this.verifyToken();
        if (response.success && response.data?.user) {
            await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.user));
            return response.data.user;
        }
        return null;
    }

    // IAP
    async verifyIosReceipt(userId: string, receiptData: string, productId?: string, sandbox: boolean = true): Promise<ApiResponse> {
        return this.makeRequest(API_CONFIG.ENDPOINTS.IAP.VERIFY_IOS, {
            method: 'POST',
            body: JSON.stringify({ user_id: userId, receipt_data: receiptData, product_id: productId, sandbox })
        });
    }

    // Analysis
    async analyzeChart(imageUri: string): Promise<ApiResponse<{ patterns_detected: any[]; summary: string; annotated_image: string; advice: string[] }>> {
        const form = new FormData();
        // @ts-ignore - React Native FormData file spec
        form.append('chart', {
            uri: imageUri,
            name: 'chart.png',
            type: 'image/png',
        });

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const token = await this.getAuthToken();
            const response = await fetch(`${this.baseURL}${API_CONFIG.ENDPOINTS.ANALYSIS.ANALYZE_CHART}`, {
                method: 'POST',
                body: form as any,
                headers: {
                    // Let RN set the proper multipart boundary
                    Accept: 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                } as any,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);
            const data = await response.json();
            if (!response.ok) {
                return { success: false, error: data.error || 'Analysis failed' };
            }
            return { success: true, data };
        } catch (error: any) {
            clearTimeout(timeoutId);
            return { success: false, error: error?.message || 'Network error' };
        }
    }

    async getAnalysisHistory(limit: number, offset: number = 0): Promise<ApiResponse<{ items: any[]; has_more: boolean; offset: number; limit: number }>> {
        const token = await this.getAuthToken();
        const params = new URLSearchParams({ limit: String(limit), offset: String(offset) }).toString();
        return this.makeRequest<{ items: any[]; has_more: boolean; offset: number; limit: number }>(`${API_CONFIG.ENDPOINTS.ANALYSIS.HISTORY}?${params}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
    }

    // Chat
    async askBot(message: string, context?: any, sessionId?: string, opts?: { historyMode?: 'recent' | 'full'; historyLimit?: number }): Promise<ApiResponse<{ text: string; title?: string; session_id?: string }>> {
        return this.makeRequest<{ text: string; title?: string; session_id?: string }>(API_CONFIG.ENDPOINTS.CHAT.ASK, {
            method: 'POST',
            body: JSON.stringify({
                message,
                context,
                session_id: sessionId,
                history_mode: opts?.historyMode,
                history_limit: opts?.historyLimit,
            }),
        });
    }

    async getChatHistory(limit: number = 30, offset: number = 0, sessionId?: string): Promise<ApiResponse<{ items: any[]; has_more: boolean; offset: number; limit: number }>> {
        const token = await this.getAuthToken();
        const qs: Record<string, string> = { limit: String(limit), offset: String(offset) } as any;
        if (sessionId) qs.session_id = sessionId;
        const params = new URLSearchParams(qs).toString();
        return this.makeRequest<{ items: any[]; has_more: boolean; offset: number; limit: number }>(`${API_CONFIG.ENDPOINTS.CHAT.HISTORY}?${params}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
    }

    async listSessions(limit: number = 50, offset: number = 0): Promise<ApiResponse<{ items: any[]; has_more: boolean; offset: number; limit: number }>> {
        const token = await this.getAuthToken();
        const params = new URLSearchParams({ limit: String(limit), offset: String(offset) }).toString();
        return this.makeRequest<{ items: any[]; has_more: boolean; offset: number; limit: number }>(`${API_CONFIG.ENDPOINTS.CHAT.SESSIONS}?${params}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
    }

    // Streaming ask - returns accumulated text and optional session_id via callbacks
    async askBotStream(
        message: string,
        context: any,
        sessionId: string | undefined,
        onMeta: (meta: { session_id?: string; title?: string }) => void,
        onChunk: (text: string) => void,
        opts?: { historyMode?: 'recent' | 'full'; historyLimit?: number },
    ): Promise<{ success: boolean; error?: string }> {
        try {
            const token = await this.getAuthToken();
            return await new Promise((resolve) => {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', `${this.baseURL}${API_CONFIG.ENDPOINTS.CHAT.STREAM}`);
                xhr.setRequestHeader('Content-Type', 'application/json');
                if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                let lastIndex = 0;
                xhr.onreadystatechange = () => {
                    if (xhr.readyState === 3 || xhr.readyState === 4) {
                        const text = xhr.responseText || '';
                        const newText = text.slice(lastIndex);
                        lastIndex = text.length;
                        const lines = newText.split(/\n/);
                        for (const line of lines) {
                            if (!line) continue;
                            if (line.startsWith('META:')) {
                                try { onMeta(JSON.parse(line.slice(5))); } catch { }
                            } else if (line.startsWith('DATA:')) {
                                onChunk(line.slice(5));
                            }
                        }
                    }
                    if (xhr.readyState === 4) {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            resolve({ success: true });
                        } else {
                            resolve({ success: false, error: `HTTP ${xhr.status}` });
                        }
                    }
                };
                xhr.onerror = () => resolve({ success: false, error: 'Network error' });
                xhr.send(JSON.stringify({
                    message,
                    context,
                    session_id: sessionId,
                    history_mode: opts?.historyMode,
                    history_limit: opts?.historyLimit,
                }));
            });
        } catch (e: any) {
            return { success: false, error: e?.message || 'Stream failed' };
        }
    }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;