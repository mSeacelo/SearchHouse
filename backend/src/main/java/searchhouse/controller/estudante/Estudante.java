package searchhouse.estudante;

import jakarta.persistence.*;

@Entity
@Table(name = "estudantes")
public class Estudante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String nome;

    @Column(nullable = false, length = 20)
    private String telefone;

    @Column(name = "tem_lugar_morar", nullable = false)
    private boolean temLugarMorar;

    protected Estudante() {}

    public Estudante(String nome, String telefone, boolean temLugarMorar) {
        this.nome = nome;
        this.telefone = telefone;
        this.temLugarMorar = temLugarMorar;
    }

    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getTelefone() { return telefone; }
    public boolean isTemLugarMorar() { return temLugarMorar; }
}
