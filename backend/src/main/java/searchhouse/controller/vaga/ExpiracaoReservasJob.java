package searchhouse.vaga;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/** Libera, a cada minuto, as reservas de vaga cujo prazo passou (RN05). */
@Component
public class ExpiracaoReservasJob {

    private final VagaService service;

    public ExpiracaoReservasJob(VagaService service) {
        this.service = service;
    }

    @Scheduled(fixedDelayString = "${searchhouse.reserva.verificacao-ms:60000}")
    public void executar() {
        service.expirarReservasVencidas();
    }
}
