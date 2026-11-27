import type { ReactNode } from "react";
import type { EstadoVaga } from "../types/dominio";
import { rotuloEstado } from "../lib/formatar";

export type CorEtiqueta = "neutra" | "marca" | "aviso" | "perigo" | "info";

const cores: Record<CorEtiqueta, string> = {
  neutra: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  marca: "bg-marca-100 text-marca-800 dark:bg-marca-900/60 dark:text-marca-100",
  aviso: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  perigo: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
  info: "bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200",
};

export function Etiqueta({ cor = "neutra", children }: { cor?: CorEtiqueta; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cores[cor]}`}>
      {children}
    </span>
  );
}

const corPorEstado: Record<EstadoVaga, CorEtiqueta> = {
  DISPONIVEL: "marca",
  EM_VISITA: "info",
  RESERVADA: "aviso",
  OCUPADA: "neutra",
};

export function EtiquetaEstado({ estado }: { estado: EstadoVaga }) {
  return <Etiqueta cor={corPorEstado[estado]}>{rotuloEstado[estado]}</Etiqueta>;
}
