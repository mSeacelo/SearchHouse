package searchhouse.vaga;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import searchhouse.estudante.EstudanteRepository;

/** Módulo vaga: cadastro de república e vagas (H01) e reserva de vaga com prazo (H07). */
@Service
public class VagaService {

    static final int MAX_VAGAS = 30;
    static final BigDecimal VALOR_MAXIMO = new BigDecimal("10000");

    /** Resumo usado na listagem: república com a contagem de vagas. */
    public record RepublicaResumo(Republica republica, long vagasTotais, long vagasDisponiveis) {}

    /** Detalhe: república com todas as vagas. */
    public record RepublicaDetalhe(Republica republica, List<Vaga> vagas) {}

    private final RepublicaRepository republicas;
    private final VagaRepository vagas;
    private final EstudanteRepository estudantes;
    private final PoliticaExpiracaoReserva politica;
    private final Clock relogio;

    public VagaService(RepublicaRepository republicas, VagaRepository vagas, EstudanteRepository estudantes,
                       PoliticaExpiracaoReserva politica, Clock relogio) {
        this.republicas = republicas;
        this.vagas = vagas;
        this.estudantes = estudantes;
        this.politica = politica;
        this.relogio = relogio;
    }

    private LocalDateTime agora() {
        return LocalDateTime.now(relogio);
    }

    @Transactional
    public List<RepublicaResumo> listar(boolean somenteComVagas, BigDecimal valorMaximo) {
        expirarReservasVencidas();
        List<RepublicaResumo> resultado = new ArrayList<>();
        for (Republica r : republicas.findAllByOrderByNomeAsc()) {
            long total = vagas.countByRepublicaId(r.getId());
            long disponiveis = vagas.countByRepublicaIdAndEstado(r.getId(), EstadoVaga.DISPONIVEL);
            if (somenteComVagas && disponiveis == 0) continue;
            if (valorMaximo != null && r.getValorMensal().compareTo(valorMaximo) > 0) continue;
            resultado.add(new RepublicaResumo(r, total, disponiveis));
        }
        return resultado;
    }

    @Transactional
    public RepublicaDetalhe detalhar(Long republicaId) {
        expirarReservasVencidas();
        Republica r = republicas.findById(republicaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "República não encontrada"));
        return new RepublicaDetalhe(r, vagas.findByRepublicaIdOrderByNumeroAsc(republicaId));
    }

    /** H01: cadastra a república e cria N vagas no estado "disponível". */
    @Transactional
    public RepublicaDetalhe cadastrar(String nome, String descricao, BigDecimal valorMensal, Integer quantidadeVagas) {
        String n = nome == null ? "" : nome.trim();
        String d = descricao == null ? "" : descricao.trim();

        if (n.length() < 3 || n.length() > 120) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nome deve ter entre 3 e 120 caracteres");
        }
        if (d.isEmpty() || d.length() > 500) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Descrição é obrigatória (até 500 caracteres)");
        }
        if (valorMensal == null || valorMensal.signum() <= 0 || valorMensal.compareTo(VALOR_MAXIMO) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Valor mensal deve ser maior que zero e até R$ 10.000");
        }
        if (quantidadeVagas == null || quantidadeVagas < 1 || quantidadeVagas > MAX_VAGAS) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Número de vagas deve ser entre 1 e " + MAX_VAGAS);
        }

        Republica r = republicas.save(new Republica(n, d, valorMensal));
        List<Vaga> criadas = new ArrayList<>();
        for (int i = 1; i <= quantidadeVagas; i++) {
            criadas.add(new Vaga(r, i));
        }
        return new RepublicaDetalhe(r, vagas.saveAll(criadas));
    }

    /** H07: reserva a vaga para um estudante, com prazo de expiração (RN04 e RN05). */
    @Transactional
    public Vaga reservar(Long vagaId, Long estudanteId) {
        if (estudanteId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe o estudante");
        }
        Vaga v = vagas.buscarParaAtualizar(vagaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vaga não encontrada"));
        LocalDateTime agora = agora();
        if (!v.aceitaReservaEm(agora)) {
            String motivo = v.getEstado() == EstadoVaga.OCUPADA
                    ? "Esta vaga já está ocupada"
                    : "Esta vaga já está reservada";
            throw new ResponseStatusException(HttpStatus.CONFLICT, motivo);
        }
        if (!estudantes.existsById(estudanteId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Estudante não encontrado");
        }
        v.reservarPara(estudanteId, agora, politica.expiraEm(agora));
        return v;
    }

    /** Cancela a reserva: a vaga volta a "disponível". */
    @Transactional
    public Vaga liberar(Long vagaId) {
        Vaga v = vagas.buscarParaAtualizar(vagaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vaga não encontrada"));
        if (v.getEstado() != EstadoVaga.RESERVADA) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Esta vaga não está reservada");
        }
        v.liberar();
        return v;
    }

    /** RN05: reservas vencidas voltam a "disponível". Chamado ao consultar e pela tarefa agendada. */
    @Transactional
    public int expirarReservasVencidas() {
        List<Vaga> vencidas = vagas.findByEstadoAndReservadaAteLessThanEqual(EstadoVaga.RESERVADA, agora());
        vencidas.forEach(Vaga::liberar);
        return vencidas.size();
    }
}
