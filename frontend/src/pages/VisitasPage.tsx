import { useMemo, useState } from "react";
import { Aviso, type AvisoTipo } from "../components/Aviso";
import { CarregandoBloco, EstadoErro, EstadoVazio, Girando } from "../components/Estados";
import { Etiqueta } from "../components/Etiqueta";
import { TituloPagina } from "../components/TituloPagina";
import { useCarregar } from "../hooks/useCarregar";
import { formatarDia, formatarHora } from "../lib/formatar";
import { api } from "../services/api";
import type { HorarioVisita } from "../types/dominio";

/** H04 — o calouro reserva um horário livre de visita; dois pedidos não ocupam o mesmo horário (RN06). */
export function VisitasPage() {
  const { estado, recarregar } = useCarregar(() => Promise.all([api.listarHorarios(), api.listarEstudantes()]), []);
  const [estudanteId, setEstudanteId] = useState("");
  const [erroEstudante, setErroEstudante] = useState("");
  const [emAndamento, setEmAndamento] = useState<number | null>(null);
  const [aviso, setAviso] = useState<AvisoTipo | null>(null);
  const [horariosLocais, setHorariosLocais] = useState<HorarioVisita[] | null>(null);

  const dados = estado.status === "sucesso" || estado.status === "carregando" ? estado.dados : undefined;
  const horarios = horariosLocais ?? dados?.[0] ?? [];
  const estudantes = dados?.[1] ?? [];

  const porDia = useMemo(() => {
    const grupos = new Map<string, HorarioVisita[]>();
    [...horarios]
      .sort((a, b) => a.dataVisita.localeCompare(b.dataVisita))
      .forEach((h) => {
        const dia = formatarDia(h.dataVisita);
        grupos.set(dia, [...(grupos.get(dia) ?? []), h]);
      });
    return [...grupos.entries()];
  }, [horarios]);

  const nomeDe = (id: number | null) => estudantes.find((e) => e.id === id)?.nome ?? (id ? `Estudante #${id}` : "—");

  async function agir(h: HorarioVisita, acao: "reservar" | "cancelar") {
    if (acao === "reservar" && !estudanteId) {
      setErroEstudante("Escolha quem vai visitar antes de reservar o horário.");
      document.getElementById("estudante-visita")?.focus();
      return;
    }
    setErroEstudante("");
    setEmAndamento(h.id);
    setAviso(null);
    try {
      const novo = acao === "reservar" ? await api.reservarHorario(h.id, Number(estudanteId)) : await api.cancelarHorario(h.id);
      setHorariosLocais(horarios.map((x) => (x.id === novo.id ? novo : x)));
      setAviso({
        tipo: "sucesso",
        texto:
          acao === "reservar"
            ? `Visita marcada: ${formatarDia(novo.dataVisita)}, às ${formatarHora(novo.dataVisita)}, na ${novo.imovelTitulo}.`
            : "Reserva cancelada. O horário está livre de novo.",
      });
    } catch (erro) {
      setAviso({ tipo: "erro", texto: erro instanceof Error ? erro.message : "Não foi possível concluir." });
      setHorariosLocais(null);
      recarregar(); // alguém pode ter pegado o horário antes: mostra o estado real
    } finally {
      setEmAndamento(null);
    }
  }

  return (
    <>
      <TituloPagina titulo="Visitas" descricao="Horários de visita oferecidos pelas repúblicas." />

      <div className="cartao mb-6 space-y-1.5 p-4 sm:max-w-sm">
        <label htmlFor="estudante-visita" className="rotulo">
          Quem vai visitar?
        </label>
        <select
          id="estudante-visita"
          className="campo"
          value={estudanteId}
          onChange={(e) => setEstudanteId(e.target.value)}
          aria-invalid={erroEstudante ? true : undefined}
          aria-describedby={erroEstudante ? "estudante-visita-erro" : undefined}
        >
          <option value="">Escolha o estudante…</option>
          {estudantes.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nome}
            </option>
          ))}
        </select>
        {erroEstudante && (
          <p id="estudante-visita-erro" className="text-xs font-medium text-red-600 dark:text-red-400">
            {erroEstudante}
          </p>
        )}
      </div>

      <div className="mb-4">
        <Aviso aviso={aviso} aoFechar={() => setAviso(null)} />
      </div>

      {estado.status === "carregando" && !dados && <CarregandoBloco texto="Carregando horários…" />}
      {estado.status === "erro" && <EstadoErro mensagem={estado.mensagem} aoTentarDeNovo={recarregar} />}
      {dados && horarios.length === 0 && <EstadoVazio titulo="Nenhum horário de visita oferecido" />}

      <div className="space-y-6">
        {porDia.map(([dia, lista]) => (
          <section key={dia} aria-labelledby={`dia-${dia}`}>
            <h2 id={`dia-${dia}`} className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 first-letter:uppercase dark:text-slate-400">
              {dia}
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {lista.map((h) => (
                <li
                  key={h.id}
                  className={`cartao flex items-center justify-between gap-3 p-4 ${h.disponivel ? "" : "bg-slate-50 dark:bg-slate-900/60"}`}
                >
                  <div className="min-w-0">
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{formatarHora(h.dataVisita)}</p>
                    <p className="truncate text-sm text-slate-600 dark:text-slate-300">{h.imovelTitulo}</p>
                    {h.disponivel ? (
                      <Etiqueta cor="marca">Livre</Etiqueta>
                    ) : (
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">Reservado por {nomeDe(h.estudanteId)}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    className={h.disponivel ? "botao-primario shrink-0" : "botao-secundario shrink-0"}
                    onClick={() => void agir(h, h.disponivel ? "reservar" : "cancelar")}
                    disabled={emAndamento === h.id}
                    aria-label={`${h.disponivel ? "Reservar" : "Cancelar"} visita das ${formatarHora(h.dataVisita)} (${dia})`}
                  >
                    {emAndamento === h.id && <Girando claro={h.disponivel} />}
                    {h.disponivel ? "Reservar" : "Cancelar"}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
