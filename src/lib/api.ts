// src/lib/api.ts
import { APP_CONFIG } from './constants';
import { useAuthStore } from '../auth/stores/auth';
import { router } from '@/router';
interface FieldError {
  messages: string[];      // lista de mensajes de validación
  touched?: boolean;       // si ya el usuario interactuó con ese campo
  code?: string;           // opcional, un código de error para internacionalización
}


export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, FieldError>;
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface ApiRequestConfig {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

class ApiClient {
  private readonly baseURL = APP_CONFIG.API_BASE_URL;
  private readonly defaultHeaders: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  /*───────────────────────────  Helpers  ───────────────────────────*/

  private getToken() {
    return localStorage.getItem(`${APP_CONFIG.STORAGE_PREFIX}token`);
  }

  private buildHeaders(custom?: Record<string, string>) {
    const headers = { ...this.defaultHeaders, ...custom };
    const token = this.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  }
  private async parseResponse<T>(res: Response): Promise<ApiResponse<T>> {
    const isJson = res.headers.get('content-type')?.includes('application/json');
    if (!isJson) throw new Error('Invalid response format');

    const data: any = await res.json();

    // ⚠️ Logout si token no válido
    if (res.status === 4010) {
      const auth = useAuthStore();
      await auth.logout();
      router.replace('/login');
    }

    // ⚠️ Manejo especial para 404 personalizado
    if (res.status === 404 && data.message === 'No hay viaje activo') {
      return { success: false, message: data.message, data: null as any };
    }

    if (!res.ok) {
      const fieldErrors: Record<string, FieldError> = {};
      if (data.errors && typeof data.errors === 'object') {
        for (const [field, msgs] of Object.entries<any>(data.errors)) {
          const arr = Array.isArray(msgs) ? msgs.map(String) : [String(msgs)];
          fieldErrors[field] = {
            messages: arr,
            touched: false,    // inicializamos como "no tocado"
            // code: 'VALIDATION_ERROR', // podrías asignar un código
          };
        }
      }

      // Elegimos el primer mensaje para show
      const firstKey = Object.keys(fieldErrors)[0];
      const friendlyMessage = firstKey
        ? fieldErrors[firstKey].messages[0]
        : data.message || 'Error de validación';

      return {
        success: false,
        message: friendlyMessage,
        errors: fieldErrors,
        data: null as any,
      };
    }

    return data;
  }


  /*───────────────────────────  Método genérico  ───────────────────────────*/

  async request<T = unknown>(
    endpoint: string,
    { method = 'GET', body, headers, signal }: ApiRequestConfig = {},
  ): Promise<ApiResponse<T>> {
    try {
      const res = await fetch(`${this.baseURL}${endpoint}`, {
        method,
        headers: this.buildHeaders(headers),
        body: body ? JSON.stringify(body) : undefined,
        signal,
      });
      return await this.parseResponse<T>(res);
    } catch (err) {
      if (err instanceof Error) throw err;
      throw new Error('Network error');
    }
  }

  /*───────────────────────────  Convenience helpers  ───────────────────────────*/

  get = <T>(e: string, s?: AbortSignal) => this.request<T>(e, { method: 'GET', signal: s });
  post = <T>(e: string, b: unknown, s?: AbortSignal) => this.request<T>(e, { method: 'POST', body: b, signal: s });
  put = <T>(e: string, b: unknown, s?: AbortSignal) => this.request<T>(e, { method: 'PUT', body: b, signal: s });
  patch = <T>(e: string, b: unknown, s?: AbortSignal) => this.request<T>(e, { method: 'PATCH', body: b, signal: s });
  delete = <T>(e: string, s?: AbortSignal) => this.request<T>(e, { method: 'DELETE', signal: s });
}

export const api = new ApiClient();
