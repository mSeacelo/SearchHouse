import { useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Aviso, type AvisoTipo } from "../components/Aviso";
import { CampoArea, CampoTexto } from "../components/Campo";
import { Girando } from "../components/Estados";
import { IconeVoltar } from "../components/Icones";
import { TituloPagina } from "../components/TituloPagina";
import { LIMITE_VAGAS, lerValor, temErros, validarRepublica, type CamposRepublica, type Erros } from "../lib/validacao";
import { api } from "../services/api";

const vazio: CamposRepublica = { nome: "", descricao: "", valorMensal: "", quantidadeVagas: "" };
const ordemCampos: (keyof CamposRepublica)[] = ["nome", "descricao", "valorMensal", "quantidadeVagas"];

/** H01 — Como representante de uma república, quero cadastrar a república e suas vagas. */
export function NovaRepublicaPage() {
  const navegar = useNavigate();
  const [campos, setCampos] = useState<CamposRepublica>(vazio);
  const [erros, setErros] = useState<Erros<keyof CamposRepublica>>({});
  const [tentou, setTentou] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState<AvisoTipo | null>(null);
  const refs = useRef<Partial<Record<keyof CamposRepublica, HTMLInputElement | HTMLTextAreaElement | null>>>({});

  function alterar(campo: keyof CamposRepublica, valor: string) {
    const novos = { ...campos, [campo]: valor };
    setCampos(novos);
    if (tentou) setErros(validarRepublica(novos)); // revalida enquanto a pessoa corrige
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (enviando) return; // evita clique duplo
    setTentou(true);
    const encontrados = validarRepublica(campos);
    setErros(encontrados);
    if (temErros(encontrados)) {
      const primeiro = ordemCampos.find((c) => encontrados[c]);
      if (primeiro) refs.current[primeiro]?.focus();
      return;
    }

    setEnviando(true);
    setAviso(null);
    try {
      const criada = await api.cadastrarRepublica({
        nome: campos.nome.trim(),
        descricao: campos.descricao.trim(),
        valorMensal: lerValor(campos.valorMensal),
        quantidadeVagas: Number(campos.quantidadeVagas),
      });
      navegar(`/republicas/${criada.id}`, {
        state: { aviso: { tipo: "sucesso", texto: `República cadastrada com ${criada.vagas.length} vaga(s) disponível(is).` } },
      });
    } catch (erro) {
      setAviso({ tipo: "erro", texto: erro instanceof Error ? erro.message : "Não foi possível cadastrar." });
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/republicas" className="foco mb-4 inline-flex items-center gap-1 rounded-lg text-sm font-medium text-marca-700 hover:underline dark:text-marca-300">
        <IconeVoltar />
        Voltar para repúblicas
      </Link>
      <TituloPagina titulo="Cadastrar república" descricao="As vagas são criadas como “disponíveis” e já aparecem para os calouros." />

      <form onSubmit={enviar} noValidate className="cartao space-y-5 p-5 md:p-7">
        <p className="text-xs text-slate-500 dark:text-slate-400">Todos os campos são obrigatórios.</p>

        <CampoTexto
          ref={(el) => (refs.current.nome = el)}
          rotulo="Nome da república"
          obrigatorio
          maxLength={120}
          autoComplete="organization"
          value={campos.nome}
          onChange={(e) => alterar("nome", e.target.value)}
          erro={erros.nome}
          disabled={enviando}
        />

        <CampoArea
          ref={(el) => (refs.current.descricao = el)}
          rotulo="Descrição"
          obrigatorio
          maxLength={500}
          value={campos.descricao}
          onChange={(e) => alterar("descricao", e.target.value)}
          erro={erros.descricao}
          dica={`Localização, estrutura e regras da casa. ${campos.descricao.length}/500`}
          disabled={enviando}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <CampoTexto
            ref={(el) => (refs.current.valorMensal = el)}
            rotulo="Valor mensal (R$)"
            obrigatorio
            inputMode="decimal"
            placeholder="450,00"
            value={campos.valorMensal}
            onChange={(e) => alterar("valorMensal", e.target.value)}
            erro={erros.valorMensal}
            dica="Valor por pessoa."
            disabled={enviando}
          />
          <CampoTexto
            ref={(el) => (refs.current.quantidadeVagas = el)}
            rotulo="Número de vagas"
            obrigatorio
            type="number"
            inputMode="numeric"
            min={1}
            max={LIMITE_VAGAS}
            value={campos.quantidadeVagas}
            onChange={(e) => alterar("quantidadeVagas", e.target.value)}
            erro={erros.quantidadeVagas}
            dica={`De 1 a ${LIMITE_VAGAS}.`}
            disabled={enviando}
          />
        </div>

        <Aviso aviso={aviso} />

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Link to="/republicas" className="botao-secundario">
            Cancelar
          </Link>
          <button type="submit" className="botao-primario" disabled={enviando}>
            {enviando && <Girando claro />}
            {enviando ? "Salvando…" : "Cadastrar república"}
          </button>
        </div>
      </form>
    </div>
  );
}
