package searchhouse.vaga;

import java.time.LocalDateTime;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vagas")
public class VagaController {

    public record ReservarVagaRequest(Long estudanteId) {}

    /** Sem dados de contato: só o módulo contato libera telefones (ADR-003, C02). */
    public record VagaResponse(Long id, Long republicaId, int numero, EstadoVaga estado,
                               Long estudanteId, LocalDateTime reservadaEm, LocalDateTime reservadaAte) {
        static VagaResponse de(Vaga v) {
            return new VagaResponse(v.getId(), v.getRepublica().getId(), v.getNumero(), v.getEstado(),
                    v.getEstudanteId(), v.getReservadaEm(), v.getReservadaAte());
        }
    }

    private final VagaService service;

    public VagaController(VagaService service) {
        this.service = service;
    }

    /** H07: reservar vaga com prazo de expiração. */
    @PutMapping("/{id}/reservar")
    public VagaResponse reservar(@PathVariable Long id, @RequestBody ReservarVagaRequest req) {
        return VagaResponse.de(service.reservar(id, req.estudanteId()));
    }

    @PutMapping("/{id}/liberar")
    public VagaResponse liberar(@PathVariable Long id) {
        return VagaResponse.de(service.liberar(id));
    }
}
