/**
 * Validação dos formulários na tela — só para dar retorno rápido ao usuário.
 * As regras valem de verdade no back-end, que valida de novo (a tela não decide nada).
 */

export type Erros<C extends string> = Partial<Record<C, string>>;

export interface CamposRepublica {
  nome: string;
  descricao: string;
  valorMensal: string;
  quantidadeVagas: string;
}

export const LIMITE_VAGAS = 30;

/** Aceita "450", "450,50" ou "1.200,00". Devolve NaN se não for número. */
export function lerValor(texto: string): number {
  const limpo = texto.trim().replace(/\s/g, "").replace(/^R\$/i, "");
  if (!limpo) return Number.NaN;
  const normalizado = limpo.includes(",") ? limpo.replace(/\./g, "").replace(",", ".") : limpo;
  return /^\d+(\.\d{1,2})?$/.test(normalizado) ? Number(normalizado) : Number.NaN;
}

export function validarRepublica(c: CamposRepublica): Erros<keyof CamposRepublica> {
  const erros: Erros<keyof CamposRepublica> = {};
  const nome = c.nome.trim();
  if (nome.length < 3) erros.nome = "Informe o nome da república (pelo menos 3 letras).";
  else if (nome.length > 120) erros.nome = "O nome pode ter no máximo 120 caracteres.";

  const descricao = c.descricao.trim();
  if (!descricao) erros.descricao = "Descreva a república: localização, estrutura, regras.";
  else if (descricao.length > 500) erros.descricao = "A descrição pode ter no máximo 500 caracteres.";

  const valor = lerValor(c.valorMensal);
  if (Number.isNaN(valor)) erros.valorMensal = "Informe o valor mensal, ex.: 450 ou 450,50.";
  else if (valor <= 0) erros.valorMensal = "O valor precisa ser maior que zero.";
  else if (valor > 10_000) erros.valorMensal = "O valor máximo é R$ 10.000.";

  const vagas = Number(c.quantidadeVagas);
  if (!c.quantidadeVagas.trim() || !Number.isInteger(vagas)) erros.quantidadeVagas = "Informe quantas vagas a república tem.";
  else if (vagas < 1 || vagas > LIMITE_VAGAS) erros.quantidadeVagas = `O número de vagas deve ficar entre 1 e ${LIMITE_VAGAS}.`;

  return erros;
}

export interface CamposEstudante {
  nome: string;
  telefone: string;
}

export function validarEstudante(c: CamposEstudante): Erros<keyof CamposEstudante> {
  const erros: Erros<keyof CamposEstudante> = {};
  const nome = c.nome.trim().replace(/\s+/g, " ");
  if (nome.length < 3) erros.nome = "Informe o nome (pelo menos 3 letras).";
  else if (nome.length > 120) erros.nome = "O nome pode ter no máximo 120 caracteres.";
  else if (!/^[\p{L}' -]+$/u.test(nome)) erros.nome = "Use apenas letras no nome.";
  else if (nome.split(" ").length < 2) erros.nome = "Informe nome e sobrenome.";

  const digitos = c.telefone.replace(/\D/g, "");
  if (!digitos) erros.telefone = "Informe um telefone para contato.";
  else if (digitos.length < 10 || digitos.length > 11) erros.telefone = "Telefone incompleto. Use DDD + número, ex.: (31) 99999-9999.";
  else if (digitos.length === 11 && digitos[2] !== "9") erros.telefone = "Celular deve começar com 9 depois do DDD.";

  return erros;
}

export const temErros = (erros: object): boolean => Object.keys(erros).length > 0;
