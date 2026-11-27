import { IconeAlerta, IconeCheck } from "./Icones";

export type AvisoTipo = { tipo: "sucesso" | "erro"; texto: string };

/** Retorno imediato de uma ação (reservar, cadastrar…). Lido pelo leitor de tela na hora. */
export function Aviso({ aviso, aoFechar }: { aviso: AvisoTipo | null; aoFechar?: () => void }) {
  if (!aviso) return null;
  const sucesso = aviso.tipo === "sucesso";
  return (
    <div
      role={sucesso ? "status" : "alert"}
      className={`flex animate-surgir items-start gap-2 rounded-xl p-3 text-sm ${
        sucesso
          ? "bg-marca-50 text-marca-900 dark:bg-marca-950 dark:text-marca-100"
          : "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200"
      }`}
    >
      {sucesso ? <IconeCheck className="mt-0.5 h-4 w-4 shrink-0" /> : <IconeAlerta className="mt-0.5 h-4 w-4 shrink-0" />}
      <span className="flex-1">{aviso.texto}</span>
      {aoFechar && (
        <button type="button" onClick={aoFechar} className="foco -m-1 rounded p-1 text-xs font-semibold underline-offset-2 hover:underline">
          Fechar
        </button>
      )}
    </div>
  );
}
