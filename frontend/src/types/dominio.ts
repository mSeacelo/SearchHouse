/**
 * Contratos de dados do SearchHouse — espelham as respostas da API (/api).
 * Regra da arquitetura (ADR-003, C02): nenhum tipo exibido na tela carrega telefone,
 * exceto o formulário de cadastro, que só envia.
 */

/** Ciclo da vaga (RN02). */
export type EstadoVaga = "DISPONIVEL" | "EM_VISITA" | "RESERVADA" | "OCUPADA";

export interface RepublicaResumo {
  id: number;
  nome: string;
  descricao: string;
  valorMensal: number;
  vagasTotais: number;
  vagasDisponiveis: number;
}

export interface Vaga {
  id: number;
  republicaId: number;
  numero: number;
  estado: EstadoVaga;
  estudanteId: number | null;
  /** ISO 8601 (horário local do servidor), ex.: 2026-11-28T14:00:00 */
  reservadaEm: string | null;
  reservadaAte: string | null;
}

export interface RepublicaDetalhe {
  id: number;
  nome: string;
  descricao: string;
  valorMensal: number;
  vagas: Vaga[];
}

export interface NovaRepublica {
  nome: string;
  descricao: string;
  valorMensal: number;
  quantidadeVagas: number;
}

/** Estudante como a tela o usa: sem telefone (C02). */
export interface Estudante {
  id: number;
  nome: string;
  temLugarMorar: boolean;
}

export interface NovoEstudante {
  nome: string;
  telefone: string;
  temLugarMorar: boolean;
}

/** Horário de visita (H04). */
export interface HorarioVisita {
  id: number;
  estudanteId: number | null;
  imovelTitulo: string;
  dataVisita: string;
  disponivel: boolean;
}

export interface FiltrosRepublica {
  somenteComVagas: boolean;
  valorMaximo?: number;
}
