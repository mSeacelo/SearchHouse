package searchhouse.vaga;

import java.math.BigDecimal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/republicas")
public class RepublicaController {

    public record NovaRepublicaRequest(String nome, String descricao, BigDecimal valorMensal, Integer quantidadeVagas) {}

    public record RepublicaResumoResponse(Long id, String nome, String descricao, BigDecimal valorMensal,
                                          long vagasTotais, long vagasDisponiveis) {
        static RepublicaResumoResponse de(VagaService.RepublicaResumo r) {
            Republica rep = r.republica();
            return new RepublicaResumoResponse(rep.getId(), rep.getNome(), rep.getDescricao(), rep.getValorMensal(),
                    r.vagasTotais(), r.vagasDisponiveis());
        }
    }

    public record RepublicaDetalheResponse(Long id, String nome, String descricao, BigDecimal valorMensal,
                                           List<VagaController.VagaResponse> vagas) {
        static RepublicaDetalheResponse de(VagaService.RepublicaDetalhe d) {
            Republica rep = d.republica();
            return new RepublicaDetalheResponse(rep.getId(), rep.getNome(), rep.getDescricao(), rep.getValorMensal(),
                    d.vagas().stream().map(VagaController.VagaResponse::de).toList());
        }
    }

    private final VagaService service;

    public RepublicaController(VagaService service) {
        this.service = service;
    }

    /** H02 (base): lista repúblicas; filtros opcionais "somenteComVagas" e "valorMaximo". */
    @GetMapping
    public List<RepublicaResumoResponse> listar(@RequestParam(defaultValue = "false") boolean somenteComVagas,
                                                @RequestParam(required = false) BigDecimal valorMaximo) {
        return service.listar(somenteComVagas, valorMaximo).stream().map(RepublicaResumoResponse::de).toList();
    }

    @GetMapping("/{id}")
    public RepublicaDetalheResponse detalhar(@PathVariable Long id) {
        return RepublicaDetalheResponse.de(service.detalhar(id));
    }

    /** H01: cadastrar república e vagas. */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RepublicaDetalheResponse cadastrar(@RequestBody NovaRepublicaRequest req) {
        return RepublicaDetalheResponse.de(
                service.cadastrar(req.nome(), req.descricao(), req.valorMensal(), req.quantidadeVagas()));
    }
}
