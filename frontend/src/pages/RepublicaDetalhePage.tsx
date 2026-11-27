import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Aviso, type AvisoTipo } from "../components/Aviso";
import { CarregandoBloco, EstadoErro, Girando } from "../components/Estados";
import { EtiquetaEstado } from "../components/Etiqueta";
import { IconeAtualizar, IconeRelogio, IconeVoltar } from "../components/Icones";
import { useCarregar } from "../hooks/useCarregar";
import { formatarDataHora, formatarMoeda, tempoRestante, textoVagas } from "../lib/formatar";
import { api } from "../services/api";
import type { Estudante, RepublicaDetalhe, Vaga } from "../types/dominio";
import { NaoEncontradaPage } from "./NaoEncontradaPage";

function LinkVoltar() {
  return (
    <Link to="/republicas" className="foco mb-4 inline-flex items-center gap-1 rounded-lg text-sm font-medium text-marca-700 hover:underline dark:text-marca-300">
      <IconeVoltar />
      Voltar para repúblicas
    </Link>
  );
}

/** Atualiza o "expira em…" a cada 30 s sem recarregar a página. */
function useAgora(intervaloMs = 30_000) {
  const [agora, setAgora] = useState(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setAgora(new Date()), intervaloMs);
    return () => window.clearInterval(t);
  }, [intervaloMs]);
  return agora;
}

interface PropsLinha {
  vaga: Vaga;
  estudantes: Estudante[];
  ocupada: boolean;
  agora: Date;
  aoReservar: (vaga: Vaga, estudanteId: number) => Promise<void>;
  aoLiberar: (vaga: Vaga) => Promise<void>;
}

/** Uma vaga e suas ações. H07: reservar com prazo; RN04: vaga reservada não aceita nova reserva. */
function LinhaVaga({ vaga, estudantes, ocupada, agora, aoReservar, aoLiberar }: PropsLinha) {
  const [escolhendo, setEscolhendo] = useState(false);
  const [estudanteId, setEstudanteId] = useState("");
  const [erroCampo, setErroCampo] = useState("");
  const idSelect = `estudante-vaga-${vaga.id}`;
  const nomeDe = (id: number | null) => estudantes.find((e) => e.id === id)?.nome ?? (id ? `Estudante #${id}` : "—");
  const podeReservar = vaga.estado === "DISPONIVEL" || vaga.estado === "EM_VISITA";

  // Calouros sem lugar primeiro: são eles que procuram vaga.
  const opcoes = useMemo(
    () => [...estudantes].sort((a, b) => Number(a.temLugarMorar) - Number(b.temLugarMorar) || a.nome.localeCompare(b.nome)),
    [estudantes],
  );

  async function confirmar() {
    if (!estudanteId) {
      setErroCampo("Escolha o estudante que vai reservar.");
      document.getElementById(idSelect)?.focus();
      return;
    }
    setErroCampo("");
    try {
      await aoReservar(vaga, Number(estudanteId));
      setEscolhendo(false);
      setEstudanteId("");
    } catch {
      // o erro já aparece no aviso da página; o painel fica aberto para tentar de novo
    }
  }

  return (
    <li className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-900 dark:text-white">Vaga {vaga.numero}</span>
          <EtiquetaEstado estado={vaga.estado} />
        </div>
        {vaga.estado === "RESERVADA" && (
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-600 dark:text-slate-300">
            <span>Reservada para {nomeDe(vaga.estudanteId)}</span>
            <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300">
              <IconeRelogio />
              {tempoRestante(vaga.reservadaAte, agora)} ({formatarDataHora(vaga.reservadaAte)})
            </span>
          </p>
        )}
      </div>

      {podeReservar && !escolhendo && (
        <button type="button" className="botao-primario shrink-0 whitespace-nowrap sm:w-auto" onClick={() => setEscolhendo(true)} disabled={ocupada}>
          Reservar vaga
        </button>
      )}

      {podeReservar && escolhendo && (
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-start">
          <div className="space-y-1 sm:w-64">
            <label htmlFor={idSelect} className="sr-only">
              Estudante que vai reservar a vaga {vaga.numero}
            </label>
            <select
              id={idSelect}
              className="campo"
              value={estudanteId}
              onChange={(e) => setEstudanteId(e.target.value)}
              aria-invalid={erroCampo ? true : undefined}
              aria-describedby={erroCampo ? `${idSelect}-erro` : undefined}
              disabled={ocupada}
              autoFocus
            >
              <option value="">Escolha o estudante…</option>
              {opcoes.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nome}
                  {e.temLugarMorar ? " (já tem lugar)" : ""}
                </option>
              ))}
            </select>
            {erroCampo && (
              <p id={`${idSelect}-erro`} className="text-xs font-medium text-red-600 dark:text-red-400">
                {erroCampo}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button type="button" className="botao-primario flex-1" onClick={() => void confirmar()} disabled={ocupada}>
              {ocupada && <Girando claro />}
              Confirmar
            </button>
            <button
              type="button"
              className="botao-secundario flex-1"
              onClick={() => {
                setEscolhendo(false);
                setErroCampo("");
              }}
              disabled={ocupada}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {vaga.estado === "RESERVADA" && (
        <button type="button" className="botao-perigo shrink-0 whitespace-nowrap sm:w-auto" onClick={() => void aoLiberar(vaga)} disabled={ocupada}>
          {ocupada && <Girando />}
          Cancelar reserva
        </button>
      )}
    </li>
  );
}

export function RepublicaDetalhePage() {
  const { id } = useParams();
  const local = useLocation();
  const idNum = Number(id);
  const idValido = Number.isInteger(idNum) && idNum > 0;
  const agora = useAgora();

  const { estado, recarregar } = useCarregar(
    () =>
      idValido
        ? Promise.all([api.buscarRepublica(idNum), api.listarEstudantes()])
        : Promise.reject(new Error("República não encontrada.")),
    [idNum, idValido],
  );

  // Aviso vindo do cadastro (H01) ou das ações desta tela.
  const [aviso, setAviso] = useState<AvisoTipo | null>(
    (local.state as { aviso?: AvisoTipo } | null)?.aviso ?? null,
  );
  const [vagaOcupada, setVagaOcupada] = useState<number | null>(null);
  const [detalheLocal, setDetalheLocal] = useState<RepublicaDetalhe | null>(null);

  useEffect(() => {
    if (estado.status === "sucesso") setDetalheLocal(estado.dados[0]);
  }, [estado]);

  if (!idValido) return <NaoEncontradaPage />;

  if (estado.status === "erro") {
    if (estado.codigo === 404) return <NaoEncontradaPage />;
    return (
      <>
        <LinkVoltar />
        <EstadoErro mensagem={estado.mensagem} aoTentarDeNovo={recarregar} />
      </>
    );
  }

  const dados = estado.status === "sucesso" ? estado.dados : estado.dados;
  if (!dados || !detalheLocal) {
    return (
      <>
        <LinkVoltar />
        <CarregandoBloco texto="Carregando república…" />
      </>
    );
  }

  const republica = detalheLocal;
  const estudantes = dados[1];
  const livres = republica.vagas.filter((v) => v.estado === "DISPONIVEL").length;

  // Atualiza só a vaga alterada, na hora (feedback imediato), sem recarregar a página.
  const trocarVaga = (nova: Vaga) =>
    setDetalheLocal((atual) => (atual ? { ...atual, vagas: atual.vagas.map((v) => (v.id === nova.id ? nova : v)) } : atual));

  async function reservar(vaga: Vaga, estudanteId: number) {
    setVagaOcupada(vaga.id);
    setAviso(null);
    try {
      const nova = await api.reservarVaga(vaga.id, estudanteId);
      trocarVaga(nova);
      const nome = estudantes.find((e) => e.id === estudanteId)?.nome ?? "o estudante";
      setAviso({
        tipo: "sucesso",
        texto: `Vaga ${nova.numero} reservada para ${nome} até ${formatarDataHora(nova.reservadaAte)}. Depois disso, ela volta a ficar disponível.`,
      });
    } catch (erro) {
      setAviso({ tipo: "erro", texto: erro instanceof Error ? erro.message : "Não foi possível reservar." });
      recarregar(); // outra pessoa pode ter reservado antes: mostra o estado real
      throw erro;
    } finally {
      setVagaOcupada(null);
    }
  }

  async function liberar(vaga: Vaga) {
    setVagaOcupada(vaga.id);
    setAviso(null);
    try {
      trocarVaga(await api.liberarVaga(vaga.id));
      setAviso({ tipo: "sucesso", texto: `Reserva da vaga ${vaga.numero} cancelada. A vaga está disponível de novo.` });
    } catch (erro) {
      setAviso({ tipo: "erro", texto: erro instanceof Error ? erro.message : "Não foi possível cancelar." });
      recarregar();
    } finally {
      setVagaOcupada(null);
    }
  }

  return (
    <div className="animate-surgir">
      <LinkVoltar />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:items-start">
        <article className="cartao space-y-4 p-5 md:p-7 lg:sticky lg:top-24">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl dark:text-white">{republica.nome}</h1>
          <p className="leading-relaxed text-slate-700 dark:text-slate-300">{republica.descricao}</p>
          <dl className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
              <dt className="text-xs text-slate-500 dark:text-slate-400">Valor mensal</dt>
              <dd className="text-lg font-bold">{formatarMoeda(republica.valorMensal)}</dd>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
              <dt className="text-xs text-slate-500 dark:text-slate-400">Vagas</dt>
              <dd className="text-lg font-bold">
                {livres} de {republica.vagas.length}
              </dd>
            </div>
          </dl>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            O contato da república só é liberado depois que a visita é deferida.
          </p>
        </article>

        <section aria-labelledby="titulo-vagas" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="titulo-vagas" className="text-lg font-semibold">
              Vagas <span className="font-normal text-slate-500 dark:text-slate-400">· {textoVagas(livres)}</span>
            </h2>
            <button
              type="button"
              className="botao-secundario"
              onClick={recarregar}
              disabled={estado.status === "carregando"}
              aria-label="Atualizar vagas"
            >
              {estado.status === "carregando" ? <Girando /> : <IconeAtualizar />}
              Atualizar
            </button>
          </div>

          <Aviso aviso={aviso} aoFechar={() => setAviso(null)} />

          {republica.vagas.length === 0 ? (
            <p className="cartao p-5 text-sm text-slate-600 dark:text-slate-300">Esta república ainda não tem vagas cadastradas.</p>
          ) : (
            <ul className="cartao divide-y divide-slate-100 dark:divide-slate-800">
              {republica.vagas.map((v) => (
                <LinhaVaga
                  key={v.id}
                  vaga={v}
                  estudantes={estudantes}
                  agora={agora}
                  ocupada={vagaOcupada === v.id}
                  aoReservar={reservar}
                  aoLiberar={liberar}
                />
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
