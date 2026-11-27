import type { ReactNode } from "react";
import { IconeAlerta, IconeBusca } from "./Icones";

/** Esqueleto de carregamento no formato dos cartões. */
export function CarregandoCartoes({ quantidade = 3 }: { quantidade?: number }) {
  return (
    <div role="status" aria-live="polite" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <span className="sr-only">Carregando…</span>
      {Array.from({ length: quantidade }, (_, i) => (
        <div key={i} className="cartao animate-pulse space-y-3 p-5" aria-hidden="true">
          <div className="h-5 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-5/6 rounded bg-slate-200 dark:bg-slate-800" />
        </div>
      ))}
    </div>
  );
}

export function CarregandoBloco({ texto = "Carregando…" }: { texto?: string }) {
  return (
    <div role="status" aria-live="polite" className="cartao flex items-center gap-3 p-6 text-sm text-slate-600 dark:text-slate-300">
      <Girando />
      {texto}
    </div>
  );
}

export function Girando({ claro = false }: { claro?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-t-transparent ${claro ? "border-white" : "border-marca-500"}`}
    />
  );
}

export function EstadoErro({ mensagem, aoTentarDeNovo }: { mensagem: string; aoTentarDeNovo?: () => void }) {
  return (
    <div role="alert" className="cartao flex animate-surgir flex-col items-center gap-3 p-8 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-300">
        <IconeAlerta />
      </span>
      <p className="font-semibold">Não foi possível carregar</p>
      <p className="max-w-sm text-sm text-slate-600 dark:text-slate-300">{mensagem}</p>
      {aoTentarDeNovo && (
        <button type="button" className="botao-secundario mt-2" onClick={aoTentarDeNovo}>
          Tentar de novo
        </button>
      )}
    </div>
  );
}

export function EstadoVazio({ titulo, children }: { titulo: string; children?: ReactNode }) {
  return (
    <div className="cartao flex animate-surgir flex-col items-center gap-3 p-8 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
        <IconeBusca />
      </span>
      <p className="font-semibold">{titulo}</p>
      {children && <div className="max-w-sm text-sm text-slate-600 dark:text-slate-300">{children}</div>}
    </div>
  );
}
