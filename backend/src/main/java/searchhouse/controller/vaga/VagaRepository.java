package searchhouse.vaga;

import jakarta.persistence.LockModeType;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface VagaRepository extends JpaRepository<Vaga, Long> {

    List<Vaga> findByRepublicaIdOrderByNumeroAsc(Long republicaId);

    long countByRepublicaId(Long republicaId);

    long countByRepublicaIdAndEstado(Long republicaId, EstadoVaga estado);

    /** Trava a vaga até o fim da transação: dois pedidos de reserva simultâneos não passam juntos (RN04). */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select v from Vaga v where v.id = :id")
    Optional<Vaga> buscarParaAtualizar(@Param("id") Long id);

    /** Reservas cujo prazo já passou (RN05). */
    List<Vaga> findByEstadoAndReservadaAteLessThanEqual(EstadoVaga estado, LocalDateTime agora);
}
