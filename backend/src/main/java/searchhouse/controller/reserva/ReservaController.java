package searchhouse.reserva;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reservas")
public class ReservaController {

    public record ReservarRequest(Long estudanteId) {}

    public record ReservaResponse(Long id, Long estudanteId, String imovelTitulo,
                                  LocalDateTime dataVisita, boolean disponivel) {
        static ReservaResponse de(ReservaVisita r) {
            return new ReservaResponse(r.getId(), r.getEstudanteId(), r.getImovelTitulo(),
                    r.getDataVisita(), r.isDisponivel());
        }
    }

    private final ReservaService service;

    public ReservaController(ReservaService service) {
        this.service = service;
    }

    @GetMapping
    public List<ReservaResponse> listar() {
        return service.listar().stream().map(ReservaResponse::de).toList();
    }

    @PutMapping("/{id}/reservar")
    public ReservaResponse reservar(@PathVariable Long id, @RequestBody ReservarRequest req) {
        return ReservaResponse.de(service.reservar(id, req.estudanteId()));
    }

    @PutMapping("/{id}/cancelar")
    public ReservaResponse cancelar(@PathVariable Long id) {
        return ReservaResponse.de(service.cancelar(id));
    }
}
