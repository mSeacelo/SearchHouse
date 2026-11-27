-- Repúblicas e vagas (H01, H07) para o sistema SearchHouse. Dados fictícios (RN07).
-- Executado na primeira subida do banco (docker-entrypoint-initdb.d), depois de estudantes.sql.

CREATE TABLE IF NOT EXISTS republicas (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    descricao VARCHAR(500) NOT NULL,
    valor_mensal NUMERIC(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS vagas (
    id BIGSERIAL PRIMARY KEY,
    republica_id BIGINT NOT NULL REFERENCES republicas(id) ON DELETE CASCADE,
    numero INT NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'DISPONIVEL',
    estudante_id BIGINT REFERENCES estudantes(id) ON DELETE SET NULL,
    reservada_em TIMESTAMP,
    reservada_ate TIMESTAMP
);

TRUNCATE TABLE vagas, republicas RESTART IDENTITY CASCADE;

INSERT INTO republicas (nome, descricao, valor_mensal) VALUES
    ('República Kalango', 'Casa a 10 minutos a pé do ICEA, com quintal e internet de fibra. Contas divididas igualmente.', 450.00),
    ('República Toca do Lobo', 'Quartos duplos e área de estudos silenciosa. Perto do ponto de ônibus para o campus.', 520.00),
    ('República Ninho', 'No centro, perto de mercado e farmácia. Regras de convivência combinadas entre os moradores.', 380.00);

INSERT INTO vagas (republica_id, numero, estado) VALUES
    (1, 1, 'DISPONIVEL'), (1, 2, 'DISPONIVEL'), (1, 3, 'OCUPADA'),
    (2, 1, 'DISPONIVEL'), (2, 2, 'OCUPADA'),
    (3, 1, 'OCUPADA'), (3, 2, 'OCUPADA');
