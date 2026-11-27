import type {
  Estudante,
  FiltrosRepublica,
  HorarioVisita,
  NovaRepublica,
  NovoEstudante,
  RepublicaDetalhe,
  RepublicaResumo,
  Vaga,
} from "../types/dominio";
import { requisitar } from "./http";

/**
 * Único ponto de acesso ao back-end (regra de dependência da Etapa 2).
 * Os normalizadores convertem a resposta crua no contrato tipado e descartam campos
 * que a tela não deve ter — o telefone dos estudantes nunca chega aos componentes (C02).
 */

type Cru = Record<string, unknown>;

const num = (v: unknown): number => Number(v ?? 0);
const numOuNulo = (v: unknown): number | null => (v === null || v === undefined ? null : Number(v));
const texto = (v: unknown): string => (v === null || v === undefined ? "" : String(v));
const textoOuNulo = (v: unknown): string | null => (v === null || v === undefined ? null : String(v));

function paraVaga(c: Cru): Vaga {
  return {
    id: num(c.id),
    republicaId: num(c.republicaId),
    numero: num(c.numero),
    estado: (texto(c.estado) || "DISPONIVEL") as Vaga["estado"],
    estudanteId: numOuNulo(c.estudanteId),
    reservadaEm: textoOuNulo(c.reservadaEm),
    reservadaAte: textoOuNulo(c.reservadaAte),
  };
}

function paraResumo(c: Cru): RepublicaResumo {
  return {
    id: num(c.id),
    nome: texto(c.nome),
    descricao: texto(c.descricao),
    valorMensal: num(c.valorMensal),
    vagasTotais: num(c.vagasTotais),
    vagasDisponiveis: num(c.vagasDisponiveis),
  };
}

function paraDetalhe(c: Cru): RepublicaDetalhe {
  return {
    id: num(c.id),
    nome: texto(c.nome),
    descricao: texto(c.descricao),
    valorMensal: num(c.valorMensal),
    vagas: Array.isArray(c.vagas) ? (c.vagas as Cru[]).map(paraVaga) : [],
  };
}

function paraEstudante(c: Cru): Estudante {
  return { id: num(c.id), nome: texto(c.nome), temLugarMorar: Boolean(c.temLugarMorar) };
}

function paraHorario(c: Cru): HorarioVisita {
  return {
    id: num(c.id),
    estudanteId: numOuNulo(c.estudanteId),
    imovelTitulo: texto(c.imovelTitulo),
    dataVisita: texto(c.dataVisita),
    disponivel: Boolean(c.disponivel),
  };
}

function query(filtros: FiltrosRepublica): string {
  const p = new URLSearchParams();
  if (filtros.somenteComVagas) p.set("somenteComVagas", "true");
  if (filtros.valorMaximo !== undefined) p.set("valorMaximo", String(filtros.valorMaximo));
  const q = p.toString();
  return q ? `?${q}` : "";
}

const json = (corpo: unknown): RequestInit => ({ body: JSON.stringify(corpo) });

export const api = {
  // Repúblicas e vagas (módulo vaga — H01, H07)
  listarRepublicas: async (filtros: FiltrosRepublica) =>
    (await requisitar<Cru[]>(`/republicas${query(filtros)}`)).map(paraResumo),

  buscarRepublica: async (id: number) => paraDetalhe(await requisitar<Cru>(`/republicas/${id}`)),

  cadastrarRepublica: async (dados: NovaRepublica) =>
    paraDetalhe(await requisitar<Cru>("/republicas", { method: "POST", ...json(dados) })),

  reservarVaga: async (vagaId: number, estudanteId: number) =>
    paraVaga(await requisitar<Cru>(`/vagas/${vagaId}/reservar`, { method: "PUT", ...json({ estudanteId }) })),

  liberarVaga: async (vagaId: number) => paraVaga(await requisitar<Cru>(`/vagas/${vagaId}/liberar`, { method: "PUT" })),

  // Estudantes (módulo estudante)
  listarEstudantes: async () => (await requisitar<Cru[]>("/estudantes")).map(paraEstudante),

  cadastrarEstudante: async (dados: NovoEstudante) =>
    paraEstudante(await requisitar<Cru>("/estudantes", { method: "POST", ...json(dados) })),

  // Horários de visita (módulo reserva — H04)
  listarHorarios: async () => (await requisitar<Cru[]>("/reservas")).map(paraHorario),

  reservarHorario: async (horarioId: number, estudanteId: number) =>
    paraHorario(await requisitar<Cru>(`/reservas/${horarioId}/reservar`, { method: "PUT", ...json({ estudanteId }) })),

  cancelarHorario: async (horarioId: number) =>
    paraHorario(await requisitar<Cru>(`/reservas/${horarioId}/cancelar`, { method: "PUT" })),
};
