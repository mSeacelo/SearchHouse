package searchhouse.vaga;

import java.time.LocalDateTime;

/**
 * Padrão Strategy (planejado na Etapa 2 para a RN05 e o cenário C01).
 * Esconde como o prazo de expiração da reserva é calculado: trocar a regra
 * (outro prazo, prazo por tipo de república, prazo em dias úteis...) é criar
 * outra implementação, sem mexer no resto do módulo vaga.
 */
public interface PoliticaExpiracaoReserva {

    LocalDateTime expiraEm(LocalDateTime reservadaEm);
}
