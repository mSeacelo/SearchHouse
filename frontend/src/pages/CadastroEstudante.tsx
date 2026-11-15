import { FormEvent, useState } from "react";
import { api } from "../api";
import { mascararTelefone } from "../format";

export default function CadastroEstudante() {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [temLugarMorar, setTemLugarMorar] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [msg, setMsg] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);

  const telefoneValido = telefone.replace(/\D/g, "").length >= 10;
  const podeEnviar = nome.trim().length >= 3 && telefoneValido && !enviando;

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setMsg(null);
    try {
      const novo = await api.criarEstudante({ nome: nome.trim(), telefone, temLugarMorar });
      setMsg({ tipo: "ok", texto: `${novo.nome} cadastrado(a) com sucesso.` });
      setNome("");
      setTelefone("");
      setTemLugarMorar(false);
    } catch (err) {
      setMsg({ tipo: "erro", texto: err instanceof Error ? err.message : "Falha ao cadastrar" });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <div className="titulo"><h1>Cadastrar estudante</h1></div>
      <form className="form" onSubmit={enviar}>
        <label>
          Nome completo
          <input value={nome} maxLength={120} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Lucas Andrade Silva" />
        </label>
        <label>
          Telefone
          <input value={telefone} onChange={(e) => setTelefone(mascararTelefone(e.target.value))} placeholder="(31) 99999-9999" inputMode="tel" />
        </label>
        <label className="check">
          <input type="checkbox" checked={temLugarMorar} onChange={(e) => setTemLugarMorar(e.target.checked)} />
          Já tem lugar para morar
        </label>
        <button className="btn" disabled={!podeEnviar}>{enviando ? "Salvando…" : "Cadastrar"}</button>
        {msg && <p className={`alerta ${msg.tipo}`}>{msg.texto}</p>}
      </form>
    </>
  );
}
