import { useCallback, useEffect, useState } from "react";
import { api } from "./api";
import type { Estudante, Reserva } from "./types";

export function useDados() {
  const [estudantes, setEstudantes] = useState<Estudante[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const recarregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const [e, r] = await Promise.all([api.listarEstudantes(), api.listarReservas()]);
      setEstudantes(e);
      setReservas(r);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Falha ao carregar dados");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void recarregar();
  }, [recarregar]);

  return { estudantes, reservas, carregando, erro, recarregar };
}
