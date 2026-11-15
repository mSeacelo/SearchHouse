import { useMemo, useState } from "react";
import { api } from "../api";
import { diaDe } from "../format";
import { useDados } from "../useCarregar";
import type { Reserva } from "../types";

export default function Reservar() {
  const { estudantes, reservas, carregando, erro, recarregar } = useDados();
  const [estudanteId, setEstudanteId] = useState<number | "">("");
  const [ocupado, setOcupado] = useState<number | null>(null);
  const [msg, setMsg] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);

  const porDia = useMemo(() => {
    const grupos = new Map<string, Reserva[]>();
    [...reservas]
      .sort((a, b) => a.dataVisita.localeCompare(b.dataVisita))
      .forEach((r) => {
        const dia = diaDe(r.dataVisita);
        grupos.set(dia, [...(grupos.get(dia) ?? []), r]);
      });
    return [...grupos.entries()];
  }, [reservas]);

  const nomeDe = (id: number | null) =>
    id === null ? "" : (estudantes.find((e) => e.id === id)?.nome ?? `#${id}`);

  async function acao(r: Reserva, tipo: "reservar" | "cancelar") {
    if (tipo === "reservar" && estudanteId === "") {
      setMsg({ tipo: "erro", texto: "Escolha um estudante antes de reservar." });
      return;
    }
    setOcupado(r.id);
    setMsg(null);
    try {
      if (tipo === "reservar") await api.reservar(r.id, Number(estudanteId));
      else await api.cancelarReserva(r.id);
      setMsg({ tipo: "ok", texto: tipo === "reservar" ? "Horário reservado." : "Reserva cancelada; horário liberado." });
      await recarregar();
    } catch (err) {
      setMsg({ tipo: "erro", texto: err instanceof Error ? err.message : "Falha na operação" });
    } finally {
      setOcupado(null);
    }
  }

  return (
    <>
      <div className="titulo"><h1>Reservar visita</h1></div>
      {erro && <p className="alerta erro">Não foi possível falar com a API: {erro}</p>}

      <div className="form inline">
        <label>
          Estudante
          <select value={estudanteId} onChange={(e) => setEstudanteId(e.target.value === "" ? "" : Number(e.target.value))}>
            <option value="">Selecione…</option>
            {estudantes.map((e) => (
              <option key={e.id} value={e.id}>{e.nome}</option>
            ))}
          </select>
        </label>
      </div>

      {msg && <p className={`alerta ${msg.tipo}`}>{msg.texto}</p>}
      {carregando && <p className="vazio">Carregando horários…</p>}

      {porDia.map(([dia, lista]) => (
        <section key={dia}>
          <h2 className="dia">{dia}</h2>
          <div className="slots">
            {lista.map((r) => (
              <div key={r.id} className={`slot ${r.disponivel ? "livre" : "ocupado"}`}>
                <div>
                  <strong>
                    {new Date(r.dataVisita).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </strong>
                  <small>{r.imovelTitulo}</small>
                  {!r.disponivel && <small>Reservado por {nomeDe(r.estudanteId) || "—"}</small>}
                </div>
                {r.disponivel ? (
                  <button className="btn" disabled={ocupado === r.id} onClick={() => void acao(r, "reservar")}>
                    Reservar
                  </button>
                ) : (
                  <button className="btn ghost" disabled={ocupado === r.id} onClick={() => void acao(r, "cancelar")}>
                    Não reservar
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
