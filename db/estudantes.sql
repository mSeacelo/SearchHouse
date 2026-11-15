-- Criação da tabela de estudantes para o sistema SearchHouse
CREATE TABLE IF NOT EXISTS estudantes (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    tem_lugar_morar BOOLEAN NOT NULL DEFAULT FALSE
);

-- População inicial com dados fictícios
INSERT INTO estudantes (nome, telefone, tem_lugar_morar) VALUES
    ('Lucas Andrade Silva', '(31) 99123-4567', TRUE),
    ('Mariana Costa Oliveira', '(31) 98456-7890', FALSE),
    ('Gabriel Ferreira Santos', '(31) 99789-0123', FALSE),
    ('Beatriz Almeida Souza', '(31) 98234-5678', TRUE),
    ('Rafael Martins Pereira', '(31) 99567-8901', FALSE),
    ('Camila Rodrigues Lima', '(31) 98890-1234', TRUE),
    ('Pedro Henrique Rocha', '(31) 99345-6789', FALSE),
    ('Juliana Carvalho Mendes', '(31) 98678-9012', TRUE);
