import { useCallback, useEffect, useRef, useState } from "react";
import { ErroApi } from "../services/http";

/**
 * Carrega dados e expõe os três estados que toda tela trata: carregando, erro e sucesso.
 * Ignora respostas antigas quando as dependências mudam rápido (ex.: trocar filtro),
 * para nunca mostrar resultado fora de ordem.
 */
export type EstadoCarga<T> =
  | { status: "carregando"; dados?: T }
  | { status: "erro"; mensagem: string; codigo: number }
  | { status: "sucesso"; dados: T };

export function useCarregar<T>(buscar: () => Promise<T>, dependencias: readonly unknown[]) {
  const [estado, setEstado] = useState<EstadoCarga<T>>({ status: "carregando" });
  const ultima = useRef(0);

  const executar = useCallback(() => {
    const id = ++ultima.current;
    // Mantém os dados anteriores enquanto recarrega: a tela não "pisca" vazia.
    setEstado((anterior) => ({ status: "carregando", dados: anterior.status === "sucesso" ? anterior.dados : undefined }));
    buscar()
      .then((dados) => {
        if (id === ultima.current) setEstado({ status: "sucesso", dados });
      })
      .catch((erro: unknown) => {
        if (id !== ultima.current) return;
        const mensagem = erro instanceof Error && erro.message ? erro.message : "Algo deu errado.";
        setEstado({ status: "erro", mensagem, codigo: erro instanceof ErroApi ? erro.status : 0 });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencias);

  useEffect(() => {
    executar();
    return () => {
      ultima.current++;
    };
  }, [executar]);

  return { estado, recarregar: executar };
}
