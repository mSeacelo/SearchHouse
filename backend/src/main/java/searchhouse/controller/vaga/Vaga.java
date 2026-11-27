package searchhouse.vaga;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "vagas")
public class Vaga {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "republica_id", nullable = false)
    private Republica republica;

    /** Número da vaga dentro da república (1, 2, 3...), só para exibição. */
    @Column(nullable = false)
    private int numero;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoVaga estado = EstadoVaga.DISPONIVEL;

    @Column(name = "estudante_id")
    private Long estudanteId;

    @Column(name = "reservada_em")
    private LocalDateTime reservadaEm;

    @Column(name = "reservada_ate")
    private LocalDateTime reservadaAte;

    protected Vaga() {}

    public Vaga(Republica republica, int numero) {
        this.republica = republica;
        this.numero = numero;
        this.estado = EstadoVaga.DISPONIVEL;
    }

    public Long getId() { return id; }
    public Republica getRepublica() { return republica; }
    public int getNumero() { return numero; }
    public EstadoVaga getEstado() { return estado; }
    public Long getEstudanteId() { return estudanteId; }
    public LocalDateTime getReservadaEm() { return reservadaEm; }
    public LocalDateTime getReservadaAte() { return reservadaAte; }

    /** Reserva vencida: estava reservada e o prazo já passou (RN05). */
    public boolean reservaVencidaEm(LocalDateTime agora) {
        return estado == EstadoVaga.RESERVADA && reservadaAte != null && !agora.isBefore(reservadaAte);
    }

    /** Pode receber reserva: livre, em visita ou com reserva já vencida (RN04). */
    public boolean aceitaReservaEm(LocalDateTime agora) {
        return estado == EstadoVaga.DISPONIVEL || estado == EstadoVaga.EM_VISITA || reservaVencidaEm(agora);
    }

    public void reservarPara(Long estudanteId, LocalDateTime agora, LocalDateTime expiraEm) {
        this.estado = EstadoVaga.RESERVADA;
        this.estudanteId = estudanteId;
        this.reservadaEm = agora;
        this.reservadaAte = expiraEm;
    }

    /** Volta a vaga para "disponível" (cancelamento ou expiração da reserva). */
    public void liberar() {
        this.estado = EstadoVaga.DISPONIVEL;
        this.estudanteId = null;
        this.reservadaEm = null;
        this.reservadaAte = null;
    }
}
