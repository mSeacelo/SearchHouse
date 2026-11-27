import { useState } from "react";
import { Link } from "react-router-dom";
import { CarregandoCartoes, EstadoErro, EstadoVazio } from "../components/Estados";
import { Etiqueta } from "../components/Etiqueta";
import { IconeMais } from "../components/Icones";
import { TituloPagina } from "../components/TituloPagina";
import { useCarregar } from "../hooks/useCarregar";
import { formatarMoeda, textoVagas } from "../lib/formatar";
import { api } from "../services/api";
import type { RepublicaResumo } from "../types/dominio";

const opcoesValor = [
  { rotulo: "Qualquer valor", valor: "" },
  { rotulo: "Até R$ 400", valor: "400" },
  { rotulo: "Até R$ 450", valor: "450" },
  { rotulo: "Até R$ 500", valor: "500" },
  { rotulo: "Até R$ 600", valor: "600" },
];

function CartaoRepublica({ republica }: { republica: RepublicaResumo }) {
  const livres = republica.vagasDisponiveis;
  return (
    <article className="cartao group relative flex h-full animate-surgir flex-col gap-3 p-5 transition-shadow focus-within:ring-2 focus-within:ring-marca-500 hover:shadow-md">
      <div className="flex flex-wrap items-center gap-2">
        <Etiqueta cor={livres === 0 ? "perigo" : livres === 1 ? "aviso" : "marca"}>{textoVagas(livres)}</Etiqueta>
        <Etiqueta>{republica.vagasTotais} no total</Etiqueta>
      </div>
      <h2 className="text-lg font-semibold leading-tight text-slate-900 dark:text-white">
        {/* O link cobre o cartão inteiro, mas o texto lido é só o nome. */}
        <Link
          to={`/republicas/${republica.id}`}
          className="outline-none after:absolute after:inset-0 after:rounded-2xl group-hover:text-marca-700 dark:group-hover:text-marca-300"
        >
          {republica.nome}
        </Link>
      </h2>
      <p className="line-clamp-3 text-sm text-slate-600 dark:text-slate-400">{republica.descricao}</p>
      <p className="mt-auto pt-2 text-sm text-slate-500 dark:text-slate-400">
        <span className="text-xl font-bold text-slate-900 dark:text-white">{formatarMoeda(republica.valorMensal)}</span> /mês
      </p>
    </article>
  );
}

export function RepublicasPage() {
  const [somenteComVagas, setSomenteComVagas] = useState(false);
  const [valorMaximo, setValorMaximo] = useState("");

  const { estado, recarregar } = useCarregar(
    () => api.listarRepublicas({ somenteComVagas, valorMaximo: valorMaximo ? Number(valorMaximo) : undefined }),
    [somenteComVagas, valorMaximo],
  );

  const lista = estado.status === "sucesso" ? estado.dados : estado.status === "carregando" ? estado.dados : undefined;
  const filtrando = somenteComVagas || valorMaximo !== "";

  return (
    <>
      <TituloPagina
        titulo="Repúblicas"
        descricao="Repúblicas cadastradas e as vagas de cada uma."
        acoes={
          <Link to="/republicas/nova" className="botao-primario">
            <IconeMais className="h-4 w-4" />
            Cadastrar república
          </Link>
        }
      />

      <section aria-label="Filtros" className="cartao mb-6 grid gap-3 p-4 sm:grid-cols-[minmax(0,14rem)_auto] sm:items-end">
        <div className="space-y-1.5">
          <label htmlFor="valor" className="rotulo">
            Valor mensal
          </label>
          <select id="valor" className="campo" value={valorMaximo} onChange={(e) => setValorMaximo(e.target.value)}>
            {opcoesValor.map((o) => (
              <option key={o.rotulo} value={o.valor}>
                {o.rotulo}
              </option>
            ))}
          </select>
        </div>
        <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
          <input
            type="checkbox"
            className="foco h-5 w-5 rounded accent-marca-600"
            checked={somenteComVagas}
            onChange={(e) => setSomenteComVagas(e.target.checked)}
          />
          Só com vagas livres
        </label>
      </section>

      <section aria-label="Resultados" aria-busy={estado.status === "carregando"}>
        {estado.status === "carregando" && !lista && <CarregandoCartoes />}
        {estado.status === "erro" && <EstadoErro mensagem={estado.mensagem} aoTentarDeNovo={recarregar} />}

        {lista && lista.length === 0 && (
          <EstadoVazio titulo={filtrando ? "Nenhuma república com esses filtros" : "Nenhuma república cadastrada"}>
            {filtrando ? (
              <button
                type="button"
                className="botao-secundario mt-2"
                onClick={() => {
                  setSomenteComVagas(false);
                  setValorMaximo("");
                }}
              >
                Limpar filtros
              </button>
            ) : (
              <Link to="/republicas/nova" className="botao-primario mt-2">
                Cadastrar a primeira
              </Link>
            )}
          </EstadoVazio>
        )}

        {lista && lista.length > 0 && (
          <>
            <p className="mb-3 text-sm text-slate-500 dark:text-slate-400" aria-live="polite">
              {lista.length === 1 ? "1 república" : `${lista.length} repúblicas`}
            </p>
            <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {lista.map((r) => (
                <li key={r.id}>
                  <CartaoRepublica republica={r} />
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </>
  );
}
