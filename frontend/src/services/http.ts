/**
 * Cliente HTTP mínimo sobre o fetch.
 * - Tempo limite em cada chamada: a tela não fica carregando para sempre.
 * - Toda falha vira ErroApi, com mensagem que dá para mostrar ao usuário.
 */

const BASE = "/api";
const TEMPO_LIMITE_MS = 10_000;

export class ErroApi extends Error {
  /** Código HTTP, ou 0 quando nem houve resposta (rede fora, back-end desligado, tempo esgotado). */
  readonly status: number;

  constructor(mensagem: string, status: number) {
    super(mensagem);
    this.name = "ErroApi";
    this.status = status;
  }
}

function mensagemPadrao(status: number): string {
  if (status === 400) return "Alguns dados enviados são inválidos.";
  if (status === 404) return "Não encontramos o que você procurou.";
  if (status === 409) return "Essa ação entrou em conflito com o estado atual. Atualize e tente de novo.";
  if (status === 502 || status === 503 || status === 504) return "O back-end está fora do ar. Verifique se o Docker está rodando.";
  if (status >= 500) return "O servidor teve um problema. Tente de novo em instantes.";
  return "Não foi possível concluir a ação.";
}

export async function requisitar<T>(caminho: string, opcoes: RequestInit = {}): Promise<T> {
  const controle = new AbortController();
  const timer = window.setTimeout(() => controle.abort(), TEMPO_LIMITE_MS);

  let resposta: Response;
  try {
    resposta = await fetch(BASE + caminho, {
      ...opcoes,
      headers: { "Content-Type": "application/json", Accept: "application/json", ...opcoes.headers },
      signal: controle.signal,
    });
  } catch (erro) {
    const esgotado = erro instanceof DOMException && erro.name === "AbortError";
    throw new ErroApi(
      esgotado ? "O servidor demorou demais para responder." : "Sem conexão com o servidor. Verifique se o back-end está rodando.",
      0,
    );
  } finally {
    window.clearTimeout(timer);
  }

  if (!resposta.ok) {
    let mensagem = mensagemPadrao(resposta.status);
    try {
      const corpo: unknown = await resposta.json();
      if (corpo && typeof corpo === "object" && "message" in corpo && typeof corpo.message === "string" && corpo.message) {
        mensagem = corpo.message;
      }
    } catch {
      // corpo vazio ou não-JSON: fica a mensagem padrão
    }
    throw new ErroApi(mensagem, resposta.status);
  }

  if (resposta.status === 204) return undefined as T;
  return (await resposta.json()) as T;
}
