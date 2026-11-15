package searchhouse.reserva;

import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReservaVisitaRepository extends JpaRepository<ReservaVisita, Long> {

    List<ReservaVisita> findAllByOrderByDataVisitaAsc();

    /** Trava a linha até o fim da transação: dois pedidos simultâneos para o mesmo horário não passam juntos. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from ReservaVisita r where r.id = :id")
    Optional<ReservaVisita> buscarParaAtualizar(@Param("id") Long id);
}
