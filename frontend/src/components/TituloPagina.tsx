import type { ReactNode } from "react";

export function TituloPagina({ titulo, descricao, acoes }: { titulo: string; descricao?: string; acoes?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl dark:text-white">{titulo}</h1>
        {descricao && <p className="text-slate-600 dark:text-slate-300">{descricao}</p>}
      </div>
      {acoes && <div className="flex flex-wrap gap-2">{acoes}</div>}
    </header>
  );
}
