import { http } from "@/lib/api";

export type TipoModalidade = "TURMA" | "PERSONAL";

export interface ApiModalidade {
  id: number;
  nome: string;
  descricao?: string | null;
  ativa: boolean;
  tipoModalidade: TipoModalidade | string;
  valorMensalidade: number | string;
}

export interface ModalidadePayload {
  nome: string;
  descricao?: string | null;
  ativa: boolean;
  tipoModalidade: TipoModalidade;
  valorMensalidade: number;
}

export function fetchModalidades() {
  return http.get<ApiModalidade[]>("/modalidades");
}

export function criarModalidade(payload: ModalidadePayload) {
  return http.post<ApiModalidade, ModalidadePayload>("/modalidades", payload);
}

export function atualizarModalidade(id: number, payload: ModalidadePayload) {
  return http.patch<ApiModalidade, ModalidadePayload>(`/modalidades/${id}`, payload);
}
