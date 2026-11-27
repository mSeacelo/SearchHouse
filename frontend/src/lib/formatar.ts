import type { EstadoVaga } from "../types/dominio";

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export const formatarMoeda = (valor: number): string => moeda.format(valor);

function paraData(iso: string): Date | null {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatarDataHora(iso: string | null): string {
  if (!iso) return "—";
  const d = paraData(iso);
  if (!d) return iso;
  return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export function formatarHora(iso: string): string {
  const d = paraData(iso);
  return d ? d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : iso;
}

export function formatarDia(iso: string): string {
  const d = paraData(iso);
  return d ? d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" }) : iso;
}

/** "expira em 1 dia e 3 h", "expira em 45 min", "prazo encerrado". */
export function tempoRestante(iso: string | null, agora: Date = new Date()): string {
  if (!iso) return "";
  const fim = paraData(iso);
  if (!fim) return "";
  const minutos = Math.floor((fim.getTime() - agora.getTime()) / 60_000);
  if (minutos <= 0) return "prazo encerrado";
  const dias = Math.floor(minutos / 1440);
  const horas = Math.floor((minutos % 1440) / 60);
  const min = minutos % 60;
  if (dias > 0) return `expira em ${dias} ${dias === 1 ? "dia" : "dias"}${horas ? ` e ${horas} h` : ""}`;
  if (horas > 0) return `expira em ${horas} h${min ? ` ${min} min` : ""}`;
  return `expira em ${min} min`;
}

export const rotuloEstado: Record<EstadoVaga, string> = {
  DISPONIVEL: "Disponível",
  EM_VISITA: "Em visita",
  RESERVADA: "Reservada",
  OCUPADA: "Ocupada",
};

export function textoVagas(disponiveis: number): string {
  if (disponiveis <= 0) return "Sem vagas";
  return disponiveis === 1 ? "1 vaga livre" : `${disponiveis} vagas livres`;
}

/** Máscara (31) 99999-9999 enquanto digita; aceita fixo (8 dígitos) e celular (9). */
export function mascararTelefone(entrada: string): string {
  const d = entrada.replace(/\D/g, "").slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}
