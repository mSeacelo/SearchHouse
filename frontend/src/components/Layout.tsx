import type { ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useTema } from "../hooks/useTema";
import { IconeCalendario, IconeCasa, IconeLua, IconePainel, IconePessoas, IconeSol } from "./Icones";

interface ItemMenu {
  para: string;
  rotulo: string;
  icone: ReactNode;
  /** Também fica ativo nestas rotas (ex.: detalhe de república). */
  prefixo?: string;
}

const itens: ItemMenu[] = [
  { para: "/", rotulo: "Painel", icone: <IconePainel className="h-4 w-4" /> },
  { para: "/republicas", rotulo: "Repúblicas", icone: <IconeCasa className="h-4 w-4" />, prefixo: "/republicas" },
  { para: "/visitas", rotulo: "Visitas", icone: <IconeCalendario className="h-4 w-4" /> },
  { para: "/estudantes", rotulo: "Estudantes", icone: <IconePessoas className="h-4 w-4" /> },
];

function LinkMenu({ item }: { item: ItemMenu }) {
  const { pathname } = useLocation();
  const ativoExtra = item.prefixo ? pathname.startsWith(item.prefixo) : false;
  return (
    <NavLink
      to={item.para}
      end={item.para === "/"}
      className={({ isActive }) =>
        `foco flex min-h-12 flex-col items-center justify-center gap-0.5 whitespace-nowrap rounded-lg px-2 text-xs font-medium transition-colors md:min-h-11 md:flex-row md:gap-2 md:px-3 md:text-sm ${
          isActive || ativoExtra
            ? "bg-marca-100 text-marca-800 dark:bg-marca-900/60 dark:text-marca-100"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
        }`
      }
    >
      {item.icone}
      {item.rotulo}
    </NavLink>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const { tema, alternar } = useTema();
  const escuro = tema === "escuro";

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#conteudo"
        className="foco sr-only rounded-lg bg-marca-600 px-4 py-2 text-white focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50"
      >
        Pular para o conteúdo
      </a>

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
          <Link to="/" className="foco mr-auto flex items-center gap-2.5 rounded-lg">
            <img src="/kalango.jpeg" alt="" className="h-9 w-9 rounded-xl object-cover" />
            <span className="leading-tight">
              <span className="block font-bold text-slate-900 dark:text-white">SearchHouse</span>
              <span className="block text-xs text-slate-500 dark:text-slate-400">Repúblicas de João Monlevade</span>
            </span>
          </Link>

          <nav aria-label="Principal" className="order-3 w-full md:order-none md:w-auto">
            <ul className="grid grid-cols-4 gap-1 md:flex">
              {itens.map((item) => (
                <li key={item.para}>
                  <LinkMenu item={item} />
                </li>
              ))}
            </ul>
          </nav>

          <button
            type="button"
            onClick={alternar}
            className="botao-secundario order-2 w-11 px-0 md:order-none"
            aria-label={escuro ? "Usar tema claro" : "Usar tema escuro"}
            title={escuro ? "Tema claro" : "Tema escuro"}
          >
            {escuro ? <IconeSol /> : <IconeLua />}
          </button>
        </div>
      </header>

      <main id="conteudo" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 outline-none md:py-10">
        {children}
      </main>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
        SearchHouse · Engenharia de Software II · UFOP/ICEA · dados fictícios
      </footer>
    </div>
  );
}
