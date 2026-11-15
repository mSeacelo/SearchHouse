package searchhouse.estudante;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/estudantes")
public class EstudanteController {

    public record EstudanteRequest(String nome, String telefone, Boolean temLugarMorar) {}

    public record EstudanteResponse(Long id, String nome, String telefone, boolean temLugarMorar) {
        static EstudanteResponse de(Estudante e) {
            return new EstudanteResponse(e.getId(), e.getNome(), e.getTelefone(), e.isTemLugarMorar());
        }
    }

    private final EstudanteRepository repo;

    public EstudanteController(EstudanteRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<EstudanteResponse> listar() {
        return repo.findAllByOrderByNomeAsc().stream().map(EstudanteResponse::de).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EstudanteResponse criar(@RequestBody EstudanteRequest req) {
        String nome = req.nome() == null ? "" : req.nome().trim();
        String telefone = req.telefone() == null ? "" : req.telefone().trim();

        if (nome.length() < 3 || nome.length() > 120) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nome deve ter entre 3 e 120 caracteres");
        }
        if (telefone.isEmpty() || telefone.length() > 20) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Telefone inválido");
        }

        Estudante salvo = repo.save(new Estudante(nome, telefone, Boolean.TRUE.equals(req.temLugarMorar())));
        return EstudanteResponse.de(salvo);
    }
}
