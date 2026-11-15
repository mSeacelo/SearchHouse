package searchhouse.reserva;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import searchhouse.estudante.EstudanteRepository;

@Service
public class ReservaService {

    private final ReservaVisitaRepository reservas;
    private final EstudanteRepository estudantes;

    public ReservaService(ReservaVisitaRepository reservas, EstudanteRepository estudantes) {
        this.reservas = reservas;
        this.estudantes = estudantes;
    }

    @Transactional(readOnly = true)
    public List<ReservaVisita> listar() {
        return reservas.findAllByOrderByDataVisitaAsc();
    }

    @Transactional
    public ReservaVisita reservar(Long reservaId, Long estudanteId) {
        if (estudanteId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe o estudante");
        }
        ReservaVisita r = reservas.buscarParaAtualizar(reservaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Horário não encontrado"));
        if (!r.isDisponivel()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Este horário já está reservado");
        }
        if (!estudantes.existsById(estudanteId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Estudante não encontrado");
        }
        r.reservarPara(estudanteId);
        return r;
    }

    @Transactional
    public ReservaVisita cancelar(Long reservaId) {
        ReservaVisita r = reservas.buscarParaAtualizar(reservaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Horário não encontrado"));
        if (r.isDisponivel()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Este horário já está disponível");
        }
        r.liberar();
        return r;
    }
}
