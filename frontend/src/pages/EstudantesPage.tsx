import { useMemo, useRef, useState, type FormEvent } from "react";
import { Aviso, type AvisoTipo } from "../components/Aviso";
import { CampoTexto } from "../components/Campo";
import { CarregandoBloco, EstadoErro, EstadoVazio, Girando } from "../components/Estados";
import { Etiqueta } from "../components/Etiqueta";
import { TituloPagina } from "../components/TituloPagina";
import { useCarregar } from "../hooks/useCarregar";
import { mascararTelefone } from "../lib/formatar";
import { temErros, validarEstudante, type CamposEstudante, type Erros } from "../lib/validacao";
import { api } from "../services/api";
import type { Estudante } from "../types/dominio";

type Filtro = "todos" | "procurando" | "com-lugar";

const opcoes: { valor: Filtro; rotulo: string }[] = [
  { valor: "todos", rotulo: "Todos" },
  { valor: "procurando", rotulo: "Procurando lugar" },
  { valor: "com-lugar", rotulo: "Já têm lugar" },
];

function FormularioEstudante({ aoCadastrar }: { aoCadastrar: (e: Estudante) => void }) {
  const [campos, setCampos] = useState<CamposEstudante>({ nome: "", telefone: "" });
  const [temLugar, setTemLugar] = useState(false);
  const [erros, setErros] = useState<Erros<keyof CamposEstudante>>({});
  const [tentou, setTentou] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState<AvisoTipo | null>(null);
  const refNome = useRef<HTMLInputElement>(null);
  const refTel = useRef<HTMLInputElement>(null);

  function alterar(campo: keyof CamposEstudante, valor: string) {
    const novos = { ...campos, [campo]: valor };
    setCampos(novos);
    if (tentou) setErros(validarEstudante(novos));
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (enviando) return;
    setTentou(true);
    const encontrados = validarEstudante(campos);
    setErros(encontrados);
    if (temErros(encontrados)) {
      (encontrados.nome ? refNome : refTel).current?.focus();
      return;
    }
    setEnviando(true);
    setAviso(null);
    try {
      const novo = await api.cadastrarEstudante({
        nome: campos.nome.trim().replace(/\s+/g, " "),
        telefone: campos.telefone,
        temLugarMorar: temLugar,
      });
      aoCadastrar(novo);
      setCampos({ nome: "", telefone: "" });
      setTemLugar(false);
      setTentou(false);
      setErros({});
      setAviso({ tipo: "sucesso", texto: `${novo.nome} cadastrado(a).` });
      refNome.current?.focus();
    } catch (erro) {
      setAviso({ tipo: "erro", texto: erro instanceof Error ? erro.message : "Não foi possível cadastrar." });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} noValidate className="cartao space-y-4 p-5" aria-labelledby="titulo-cadastro">
      <h2 id="titulo-cadastro" className="text-lg font-semibold">
        Cadastrar estudante
      </h2>
      <CampoTexto
        ref={refNome}
        rotulo="Nome completo"
        obrigatorio
        autoComplete="name"
        maxLength={120}
        value={campos.nome}
        onChange={(e) => alterar("nome", e.target.value)}
        erro={erros.nome}
        disabled={enviando}
      />
      <CampoTexto
        ref={refTel}
        rotulo="Telefone (WhatsApp)"
        obrigatorio
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        placeholder="(31) 99999-9999"
        value={campos.telefone}
        onChange={(e) => alterar("telefone", mascararTelefone(e.target.value))}
        erro={erros.telefone}
        dica="Fica protegido: só é liberado para a república depois do pedido de visita."
        disabled={enviando}
      />
      <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
        <input
          type="checkbox"
          className="foco h-5 w-5 rounded accent-marca-600"
          checked={temLugar}
          onChange={(e) => setTemLugar(e.target.checked)}
          disabled={enviando}
        />
        Já tem lugar para morar
      </label>
      <Aviso aviso={aviso} />
      <button type="submit" className="botao-primario w-full" disabled={enviando}>
        {enviando && <Girando claro />}
        {enviando ? "Salvando…" : "Cadastrar"}
      </button>
    </form>
  );
}

export function EstudantesPage() {
  const { estado, recarregar } = useCarregar(() => api.listarEstudantes(), []);
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [novos, setNovos] = useState<Estudante[]>([]);

  const todos = useMemo(() => {
    const base = estado.status === "sucesso" || estado.status === "carregando" ? (estado.dados ?? []) : [];
    const ids = new Set(base.map((e) => e.id));
    return [...base, ...novos.filter((n) => !ids.has(n.id))].sort((a, b) => a.nome.localeCompare(b.nome));
  }, [estado, novos]);

  const lista = todos.filter((e) => (filtro === "procurando" ? !e.temLugarMorar : filtro === "com-lugar" ? e.temLugarMorar : true));
  const carregou = estado.status === "sucesso";

  return (
    <>
      <TituloPagina titulo="Estudantes" descricao="Calouros cadastrados. Telefones não aparecem aqui, por privacidade." />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <section aria-label="Lista de estudantes" aria-busy={estado.status === "carregando"} className="space-y-4">
          <fieldset>
            <legend className="sr-only">Filtrar estudantes</legend>
            <div className="inline-flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
              {opcoes.map((o) => (
                <label key={o.valor} className="cursor-pointer">
                  <input
                    type="radio"
                    name="filtro"
                    value={o.valor}
                    checked={filtro === o.valor}
                    onChange={() => setFiltro(o.valor)}
                    className="peer sr-only"
                  />
                  <span className="block min-h-9 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 peer-checked:bg-marca-600 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-marca-500 dark:text-slate-300 dark:hover:bg-slate-800">
                    {o.rotulo}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {estado.status === "carregando" && todos.length === 0 && <CarregandoBloco texto="Carregando estudantes…" />}
          {estado.status === "erro" && <EstadoErro mensagem={estado.mensagem} aoTentarDeNovo={recarregar} />}
          {carregou && lista.length === 0 && <EstadoVazio titulo="Nenhum estudante neste filtro" />}

          {lista.length > 0 && (
            <ul className="cartao divide-y divide-slate-100 dark:divide-slate-800">
              {lista.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <span className="min-w-0 truncate font-medium">{e.nome}</span>
                  <Etiqueta cor={e.temLugarMorar ? "neutra" : "aviso"}>{e.temLugarMorar ? "Tem lugar" : "Procurando"}</Etiqueta>
                </li>
              ))}
            </ul>
          )}
        </section>

        <FormularioEstudante aoCadastrar={(e) => setNovos((n) => [...n, e])} />
      </div>
    </>
  );
}
