import { Link } from "react-router-dom";

export function NaoEncontradaPage() {
  return (
    <div className="cartao mx-auto flex max-w-md animate-surgir flex-col items-center gap-3 p-8 text-center">
      <p className="text-5xl font-bold text-marca-600">404</p>
      <h1 className="text-lg font-semibold">Página não encontrada</h1>
      <p className="text-sm text-slate-600 dark:text-slate-300">O endereço pode estar errado ou a república foi removida.</p>
      <Link to="/republicas" className="botao-primario mt-2">
        Ver repúblicas
      </Link>
    </div>
  );
}
