import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";

interface Base {
  rotulo: string;
  erro?: string;
  dica?: ReactNode;
  obrigatorio?: boolean;
}

/** Rótulo, dica e erro ligados ao campo por ARIA (leitor de tela lê tudo junto). */
function useIds(erro?: string, dica?: ReactNode) {
  const id = useId();
  const idDica = dica && !erro ? `${id}-dica` : undefined;
  const idErro = erro ? `${id}-erro` : undefined;
  return { id, idDica, idErro, descritoPor: [idDica, idErro].filter(Boolean).join(" ") || undefined };
}

function Moldura({ id, rotulo, obrigatorio, erro, dica, idDica, idErro, children }: Base & {
  id: string;
  idDica?: string;
  idErro?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="rotulo">
        {rotulo}
        {obrigatorio && (
          <span className="text-red-600 dark:text-red-400" aria-hidden="true">
            {" "}*
          </span>
        )}
      </label>
      {children}
      {idDica && (
        <p id={idDica} className="text-xs text-slate-500 dark:text-slate-400">
          {dica}
        </p>
      )}
      {idErro && (
        <p id={idErro} className="text-xs font-medium text-red-600 dark:text-red-400">
          {erro}
        </p>
      )}
    </div>
  );
}

type PropsTexto = Base & Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "required">;

export const CampoTexto = forwardRef<HTMLInputElement, PropsTexto>(function CampoTexto(
  { rotulo, erro, dica, obrigatorio, className, ...resto },
  ref,
) {
  const ids = useIds(erro, dica);
  return (
    <Moldura rotulo={rotulo} erro={erro} dica={dica} obrigatorio={obrigatorio} {...ids}>
      <input
        ref={ref}
        id={ids.id}
        className={`campo ${className ?? ""}`}
        aria-invalid={erro ? true : undefined}
        aria-describedby={ids.descritoPor}
        aria-required={obrigatorio || undefined}
        {...resto}
      />
    </Moldura>
  );
});

type PropsArea = Base & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id" | "required">;

export const CampoArea = forwardRef<HTMLTextAreaElement, PropsArea>(function CampoArea(
  { rotulo, erro, dica, obrigatorio, className, ...resto },
  ref,
) {
  const ids = useIds(erro, dica);
  return (
    <Moldura rotulo={rotulo} erro={erro} dica={dica} obrigatorio={obrigatorio} {...ids}>
      <textarea
        ref={ref}
        id={ids.id}
        className={`campo min-h-24 resize-y ${className ?? ""}`}
        aria-invalid={erro ? true : undefined}
        aria-describedby={ids.descritoPor}
        aria-required={obrigatorio || undefined}
        {...resto}
      />
    </Moldura>
  );
});
