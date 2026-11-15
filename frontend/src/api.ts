import type { Estudante, NovoEstudante, Reserva } from "./types";

const BASE = "/api";

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    let msg = `Erro ${res.status}`;
    try {
      const body = await res.json();
      msg = body.message ?? body.error ?? msg;
    } catch {
      /* corpo vazio */
    }
    throw new Error(msg);
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

// O backend pode serializar em camelCase (JPA padrão) ou snake_case (colunas do SQL).
// Estes normalizadores aceitam os dois.
type Raw = Record<string, unknown>;

function toEstudante(r: Raw): Estudante {
  return {
    id: Number(r.id),
    nome: String(r.nome ?? ""),
    telefone: String(r.telefone ?? ""),
    temLugarMorar: Boolean(r.temLugarMorar ?? r.tem_lugar_morar),
  };
}

function toReserva(r: Raw): Reserva {
  const est = r.estudanteId ?? r.estudante_id ?? (r.estudante as Raw | null)?.id ?? null;
  return {
    id: Number(r.id),
    estudanteId: est === null || est === undefined ? null : Number(est),
    imovelTitulo: String(r.imovelTitulo ?? r.imovel_titulo ?? ""),
    dataVisita: String(r.dataVisita ?? r.data_visita ?? ""),
    disponivel: Boolean(r.disponivel),
  };
}

export const api = {
  listarEstudantes: async () =>
    (await http<Raw[]>("/estudantes")).map(toEstudante),

  criarEstudante: async (dados: NovoEstudante) =>
    toEstudante(
      await http<Raw>("/estudantes", {
        method: "POST",
        body: JSON.stringify(dados),
      }),
    ),

  listarReservas: async () =>
    (await http<Raw[]>("/reservas")).map(toReserva),

  reservar: async (reservaId: number, estudanteId: number) =>
    toReserva(
      await http<Raw>(`/reservas/${reservaId}/reservar`, {
        method: "PUT",
        body: JSON.stringify({ estudanteId }),
      }),
    ),

  cancelarReserva: async (reservaId: number) =>
    toReserva(await http<Raw>(`/reservas/${reservaId}/cancelar`, { method: "PUT" })),
};
