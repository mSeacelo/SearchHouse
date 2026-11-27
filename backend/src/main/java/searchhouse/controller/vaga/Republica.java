package searchhouse.vaga;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "republicas")
public class Republica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String nome;

    @Column(nullable = false, length = 500)
    private String descricao;

    @Column(name = "valor_mensal", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorMensal;

    protected Republica() {}

    public Republica(String nome, String descricao, BigDecimal valorMensal) {
        this.nome = nome;
        this.descricao = descricao;
        this.valorMensal = valorMensal;
    }

    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getDescricao() { return descricao; }
    public BigDecimal getValorMensal() { return valorMensal; }
}
