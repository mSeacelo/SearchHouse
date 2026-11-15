-- Criação da tabela de reservas de visita para o sistema SearchHouse
CREATE TABLE IF NOT EXISTS reservas_visita (
    id BIGSERIAL PRIMARY KEY,
    estudante_id BIGINT REFERENCES estudantes(id) ON DELETE SET NULL,
    imovel_titulo VARCHAR(150) NOT NULL,
    data_visita TIMESTAMP NOT NULL,
    disponivel BOOLEAN NOT NULL DEFAULT TRUE
);

TRUNCATE TABLE reservas_visita RESTART IDENTITY CASCADE;


INSERT INTO reservas_visita (estudante_id, imovel_titulo, data_visita, disponivel) VALUESgit
    (NULL, 'Republica Kalango', '2026-11-20 14:00:00', TRUE),
    (2, 'Republica Kalango', '2026-11-20 16:00:00', FALSE),
    (NULL, 'Republica Kalango', '2026-11-21 10:00:00', TRUE),
    (3, 'Republica Kalango', '2026-11-21 15:30:00', FALSE),
    (NULL, 'Republica Kalango', '2026-11-22 09:30:00', TRUE),
    (5, 'Republica Kalango', '2026-11-22 14:00:00', FALSE),
    (NULL, 'Republica Kalango', '2026-11-23 11:00:00', TRUE);
