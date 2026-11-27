import { useCallback, useState } from "react";

type Tema = "claro" | "escuro";
const CHAVE = "searchhouse-tema";

const temaAtual = (): Tema => (document.documentElement.classList.contains("dark") ? "escuro" : "claro");

/** Alterna tema claro/escuro e lembra a escolha no navegador. */
export function useTema() {
  const [tema, setTema] = useState<Tema>(temaAtual);

  const alternar = useCallback(() => {
    const novo: Tema = temaAtual() === "escuro" ? "claro" : "escuro";
    document.documentElement.classList.toggle("dark", novo === "escuro");
    try {
      localStorage.setItem(CHAVE, novo);
    } catch {
      // navegação privada ou armazenamento bloqueado: o tema só não fica salvo
    }
    setTema(novo);
  }, []);

  return { tema, alternar };
}
