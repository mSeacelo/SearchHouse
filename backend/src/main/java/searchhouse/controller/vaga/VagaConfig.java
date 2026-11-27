package searchhouse.vaga;

import java.time.Clock;
import java.time.ZoneId;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

@Configuration
@EnableScheduling
public class VagaConfig {

    /**
     * Relógio injetado: em teste, troca-se por um relógio fixo (dublê) em vez do horário real.
     * Usa o fuso de João Monlevade, e não o do container (que no Docker é UTC), para o
     * prazo da reserva sair no mesmo horário que o usuário vê na tela.
     */
    @Bean
    public Clock relogio(@Value("${searchhouse.fuso:America/Sao_Paulo}") String fuso) {
        return Clock.system(ZoneId.of(fuso));
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
