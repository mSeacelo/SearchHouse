package searchhouse.reserva;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reservas_visita")
public class ReservaVisita {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "estudante_id")
    private Long estudanteId;

    @Column(name = "imovel_titulo", nullable = false, length = 150)
    private String imovelTitulo;

    @Column(name = "data_visita", nullable = false)
    private LocalDateTime dataVisita;

    @Column(nullable = false)
    private boolean disponivel = true;

    protected ReservaVisita() {}

    public ReservaVisita(String imovelTitulo, LocalDateTime dataVisita) {
        this.imovelTitulo = imovelTitulo;
        this.dataVisita = dataVisita;
        this.disponivel = true;
    }
    public Long getId() { return id; }
    public Long getEstudanteId() { return estudanteId; }
    public String getImovelTitulo() { return imovelTitulo; }
    public LocalDateTime getDataVisita() { return dataVisita; }
    public boolean isDisponivel() { return disponivel; }

    /** Regra de estado: ocupa o horário para um estudante. */
    public void reservarPara(Long estudanteId) {
        this.estudanteId = estudanteId;
        this.disponivel = false;
    }

    /** Regra de estado: libera o horário. */
    public void liberar() {
        this.estudanteId = null;
        this.disponivel = true;
    }
}

