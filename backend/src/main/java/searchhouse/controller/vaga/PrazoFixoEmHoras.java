package searchhouse.vaga;

import java.time.LocalDateTime;

/** Estratégia atual: a reserva vale um número fixo de horas a partir do momento em que foi feita. */
public class PrazoFixoEmHoras implements PoliticaExpiracaoReserva {

    private final long horas;

    public PrazoFixoEmHoras(long horas) {
        if (horas <= 0) {
            throw new IllegalArgumentException("O prazo da reserva deve ser maior que zero");
        }
        this.horas = horas;
    }

    public long getHoras() { return horas; }

    @Override
    public LocalDateTime expiraEm(LocalDateTime reservadaEm) {
        return reservadaEm.plusHours(horas);
    }
}
