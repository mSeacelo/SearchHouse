export interface Estudante {
  id: number;
  nome: string;
  telefone: string;
  temLugarMorar: boolean;
}

export interface NovoEstudante {
  nome: string;
  telefone: string;
  temLugarMorar: boolean;
}

export interface Reserva {
  id: number;
  estudanteId: number | null;
  imovelTitulo: string;
  dataVisita: string; // ISO, ex.: 2026-11-20T14:00:00
  disponivel: boolean;
}
