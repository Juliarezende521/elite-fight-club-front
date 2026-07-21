import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import { getAuthorizationToken } from "@/lib/auth/service";
import { appEnv } from "@/lib/env";

export interface ApiErrorPayload {
  status?: number;
  message?: string;
  mensagem?: string;
  erro?: string;
  fields?: Record<string, string>;
  campos?: Record<string, string>;
  fieldErrors?: Record<string, string>;
  timestamp?: string;
  path?: string;
  code?: string;
}

export class ApiError extends Error {
  status?: number;
  fieldErrors?: Record<string, string>;
  timestamp?: string;
  path?: string;
  code?: string;

  constructor(payload: ApiErrorPayload = {}) {
    super(payload.message ?? payload.mensagem ?? "Não foi possível concluir a solicitação.");
    this.name = "ApiError";
    this.status = payload.status;
    this.fieldErrors = payload.fieldErrors ?? payload.fields ?? payload.campos;
    this.timestamp = payload.timestamp;
    this.path = payload.path;
    this.code = payload.code ?? payload.erro;
  }
}

export const api = axios.create({
  baseURL: appEnv.apiBaseUrl,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(async (config) => {
  const token = await getAuthorizationToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorPayload>) => {
    if (error.code === "ERR_CANCELED") {
      throw new ApiError({ status: 499, message: "Solicitação cancelada." });
    }

    const status = error.response?.status;
    const payload = error.response?.data ?? {};

    throw new ApiError({
      status,
      message: payload.message ?? payload.mensagem ?? fallbackMessage(status),
      fields: payload.fields ?? payload.campos,
      fieldErrors: payload.fieldErrors ?? payload.campos,
      timestamp: payload.timestamp,
      path: payload.path ?? error.config?.url,
      code: payload.code ?? payload.erro,
    });
  },
);

export const http = {
  get: async <T>(url: string, config?: AxiosRequestConfig) => (await api.get<T>(url, config)).data,
  post: async <T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig) =>
    (await api.post<T>(url, body, config)).data,
  put: async <T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig) =>
    (await api.put<T>(url, body, config)).data,
  patch: async <T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig) =>
    (await api.patch<T>(url, body, config)).data,
  delete: async <T>(url: string, config?: AxiosRequestConfig) =>
    (await api.delete<T>(url, config)).data,
};

function fallbackMessage(status?: number) {
  if (status === 401) return "Sessão expirada. Entre novamente.";
  if (status === 403) return "Você não tem permissão para acessar este recurso.";
  if (status === 404) return "Recurso não encontrado.";
  if (status === 409) return "Conflito ao processar a solicitação.";
  if (status === 400) return "Verifique os dados informados.";
  return "Erro de comunicação com o servidor.";
}
