import { formatarDataHora } from "../format";
import { useDados } from "../useCarregar";

export default function Painel() {
  const { estudantes, reservas, carregando, erro, recarregar } = useDados();
  const nomeDe = (id: number | null) =>
    id === null ? "—" : (estudantes.find((e) => e.id === id)?.nome ?? `#${id}`);

  const livres = reservas.filter((r) => r.disponivel).length;

  return (
    <>
      <div className="titulo">
        <h1>Painel</h1>
        <button className="btn ghost" onClick={() => void recarregar()} disabled={carregando}>
          {carregando ? "Carregando…" : "Atualizar"}
        </button>
      </div>

      {erro && <p className="alerta erro">Não foi possível falar com a API: {erro}</p>}

      <div className="cards">
        <div className="card"><span>{estudantes.length}</span>estudantes</div>
        <div className="card"><span>{livres}</span>horários livres</div>
        <div className="card"><span>{reservas.length - livres}</span>reservados</div>
      </div>

      <section>
        <h2>Estudantes</h2>
        <div className="tabela">
          <table>
            <thead>
              <tr><th>Nome</th><th>Telefone</th><th>Já tem lugar para morar?</th></tr>
            </thead>
            <tbody>
              {estudantes.map((e) => (
                <tr key={e.id}>
                  <td>{e.nome}</td>
                  <td>{e.telefone}</td>
                  <td>
                    <span className={`tag ${e.temLugarMorar ? "off" : "on"}`}>
                      {e.temLugarMorar ? "Sim" : "Procurando"}
                    </span>
                  </td>
                </tr>
              ))}
              {!estudantes.length && !carregando && (
                <tr><td colSpan={3} className="vazio">Nenhum estudante cadastrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2>Reservas de visita</h2>
        <div className="tabela">
          <table>
            <thead>
              <tr><th>Imóvel</th><th>Data e hora</th><th>Situação</th><th>Estudante</th></tr>
            </thead>
            <tbody>
              {reservas.map((r) => (
                <tr key={r.id}>
                  <td>{r.imovelTitulo}</td>
                  <td>{formatarDataHora(r.dataVisita)}</td>
                  <td>
                    <span className={`tag ${r.disponivel ? "on" : "off"}`}>
                      {r.disponivel ? "Disponível" : "Reservado"}
                    </span>
                  </td>
                  <td>{nomeDe(r.estudanteId)}</td>
                </tr>
              ))}
              {!reservas.length && !carregando && (
                <tr><td colSpan={4} className="vazio">Nenhum horário cadastrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
