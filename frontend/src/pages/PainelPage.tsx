import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { CarregandoCartoes, EstadoErro } from "../components/Estados";
import { IconeCalendario, IconeCasa, IconeMais, IconePessoas } from "../components/Icones";
import { TituloPagina } from "../components/TituloPagina";
import { useCarregar } from "../hooks/useCarregar";
import { formatarDia, formatarHora } from "../lib/formatar";
import { api } from "../services/api";

function Indicador({ valor, rotulo, icone, para }: { valor: number; rotulo: string; icone: ReactNode; para: string }) {
  return (
    <Link
      to={para}
      className="cartao foco flex items-center gap-4 p-5 transition-shadow hover:shadow-md"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-marca-100 text-marca-700 dark:bg-marca-900/60 dark:text-marca-200">
        {icone}
      </span>
      <span>
        <span className="block text-2xl font-bold text-slate-900 dark:text-white">{valor}</span>
        <span className="block text-sm text-slate-600 dark:text-slate-300">{rotulo}</span>
      </span>
    </Link>
  );
}

export function PainelPage() {
  const { estado, recarregar } = useCarregar(
    () => Promise.all([api.listarRepublicas({ somenteComVagas: false }), api.listarHorarios(), api.listarEstudantes()]),
    [],
  );

  const dados = estado.status === "sucesso" ? estado.dados : estado.status === "carregando" ? estado.dados : undefined;

  return (
    <>
      <TituloPagina
        titulo="Painel"
        descricao="Calouros e repúblicas de João Monlevade se encontrando."
        acoes={
          <Link to="/republicas/nova" className="botao-primario">
            <IconeMais className="h-4 w-4" />
            Cadastrar república
          </Link>
        }
      />

      {estado.status === "erro" && <EstadoErro mensagem={estado.mensagem} aoTentarDeNovo={recarregar} />}
      {!dados && estado.status === "carregando" && <CarregandoCartoes quantidade={3} />}

      {dados && (() => {
        const [republicas, horarios, estudantes] = dados;
        const vagasLivres = republicas.reduce((s, r) => s + r.vagasDisponiveis, 0);
        const horariosLivres = horarios.filter((h) => h.disponivel);
        const procurando = estudantes.filter((e) => !e.temLugarMorar).length;
        const proximos = [...horariosLivres].sort((a, b) => a.dataVisita.localeCompare(b.dataVisita)).slice(0, 4);

        return (
          <div className="space-y-8">
            <section aria-label="Resumo" className="grid gap-4 sm:grid-cols-3">
              <Indicador valor={vagasLivres} rotulo={`vagas livres em ${republicas.length} repúblicas`} icone={<IconeCasa />} para="/republicas" />
              <Indicador valor={horariosLivres.length} rotulo="horários de visita livres" icone={<IconeCalendario />} para="/visitas" />
              <Indicador valor={procurando} rotulo="calouros procurando lugar" icone={<IconePessoas />} para="/estudantes" />
            </section>

            <section aria-labelledby="titulo-proximas" className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h2 id="titulo-proximas" className="text-lg font-semibold">
                  Próximos horários livres
                </h2>
                <Link to="/visitas" className="foco rounded text-sm font-medium text-marca-700 hover:underline dark:text-marca-300">
                  Ver todos
                </Link>
              </div>
              {proximos.length === 0 ? (
                <p className="cartao p-5 text-sm text-slate-600 dark:text-slate-300">Nenhum horário livre no momento.</p>
              ) : (
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {proximos.map((h) => (
                    <li key={h.id} className="cartao p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 first-letter:uppercase dark:text-slate-400">
                        {formatarDia(h.dataVisita)}
                      </p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{formatarHora(h.dataVisita)}</p>
                      <p className="truncate text-sm text-slate-600 dark:text-slate-300">{h.imovelTitulo}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        );
      })()}
    </>
  );
}
