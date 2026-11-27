package searchhouse.vaga;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RepublicaRepository extends JpaRepository<Republica, Long> {

    List<Republica> findAllByOrderByNomeAsc();
}
