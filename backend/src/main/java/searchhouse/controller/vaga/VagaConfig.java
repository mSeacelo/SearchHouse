package searchhouse.vaga;

import java.time.Clock;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

@Configuration
@EnableScheduling
public class VagaConfig {

    /** Relógio injetado: em teste, troca-se por um relógio fixo (dublê) em vez do horário real. */
    @Bean
    public Clock relogio() {
        return Clock.systemDefaultZone();
    }

    /**
     * Prazo da reserva (RN05), definido pelo cliente. Muda por configuração:
     * variável de ambiente SEARCHHOUSE_RESERVA_PRAZO_HORAS (padrão: 48 horas).
     */
    @Bean
    public PoliticaExpiracaoReserva politicaExpiracaoReserva(
            @Value("${searchhouse.reserva.prazo-horas:48}") long prazoHoras) {
        return new PrazoFixoEmHoras(prazoHoras);
    }
}
