# SearchHouse

Sistema para conectar calouros e repúblicas de João Monlevade (projeto de curso CSI410 — Engenharia de Software II, UFOP/ICEA, 2026/2). Cliente principal: república Kalango. **Todos os dados são fictícios.**

## Stack


| Parte     | Tecnologia                                  |
| --------- | ------------------------------------------- |
| Front-end | TypeScript, React, Vite (servido por nginx) |
| Back-end  | Java 21, Spring Boot 3.3 (Web + JPA)        |
| Banco     | PostgreSQL 16                               |
| Infra     | Docker Compose                              |
| CI        | GitHub Actions                              |

## Estrutura de pastas (visão de módulos)

```
backend/src/main/java/searchhouse/
  estudante/   módulo Estudante  → entidade, repositório, endpoints de cadastro e listagem
  reserva/     módulo Reserva    → entidade, regras de reservar/cancelar (service), endpoints
  erro/        módulo Erro       → padroniza erros da API em JSON {"message": "..."}
backend/src/test/java/...          testes espelhando os pacotes acima
frontend/src/
  pages/       telas (Painel, Cadastro de estudante, Reservar visita)
  api.ts       único ponto de acesso à API
db/            scripts SQL de criação e carga inicial (dados fictícios)
docs/adr/      registros de decisão de arquitetura
.github/       pipeline de CI e modelo de pull request
```

Dependência permitida: `reserva` → `estudante` (para validar o estudante). `estudante` não depende de `reserva`. O front só conversa com o back pela API (`/api`).

## Como executar

Pré-requisito: Docker Desktop.

```bash
git clone url-do-repositorio
cd SearchHouse
cp .env.example .env        # Windows PowerShell: Copy-Item .env.example .env
docker compose up --build

### Em linux, antes de buildar a imagem com o comando docker build -f backend/Dockerfile -t searchhouse . && docker compose up --build
rode nano ~/.docker/config.json, edite para que fique apenas
 {
  "auths": {}
}
Para salvar, use ctrl + o, enter, ctrl+x
```

- Front-end: http://localhost:3000
- API: http://localhost:8080/api/reservas
- Na primeira subida do volume, o Postgres carrega `db/estudantes.sql` e `db/reservas_visita.sql`. Para recarregar do zero: `docker compose down -v`.

## Fluxo mínimo ponta a ponta

Tela **Reservar visita** → `PUT /api/reservas/{id}/reservar` → `ReservaService` (regra de estado e trava do horário) → tabela `reservas_visita` no PostgreSQL. Reservar um horário já ocupado retorna 409 e a mensagem aparece na tela.

## Endpoints


| Método | Rota                          | Descrição                          |
| ------- | ----------------------------- | ------------------------------------ |
| GET     | `/api/estudantes`             | lista estudantes                     |
| POST    | `/api/estudantes`             | cadastra estudante                   |
| GET     | `/api/reservas`               | lista horários de visita            |
| PUT     | `/api/reservas/{id}/reservar` | reserva (corpo:`{"estudanteId": 1}`) |
| PUT     | `/api/reservas/{id}/cancelar` | libera o horário                    |

## Testes

```bash
cd backend && mvn verify      # testes de serviço e de controller (não precisam de banco)
cd frontend && npm ci && npm run build
```

## Contribuindo

1. Crie uma branch a partir da `main`: `feat/...`, `fix/...`, `chore/...`.
2. Commits no padrão Conventional Commits: `feat(reserva): ...`, `fix(db): ...`, `build(docker): ...`, `test(reserva): ...`, `docs: ...`.
3. Abra um pull request para a `main` usando o modelo do repositório.
4. O PR só entra com **CI verde** e **aprovação de outro integrante**. Ninguém faz push direto na `main`(REP NÃO ADAPTADO, AINDA SERÁ IMPLEMENTADO CI/CD).

## Declaração de IA

- Declaração de IA
- O projeto foi elaborado com auxílio do Claude para ajudar a implementar o frontend.
