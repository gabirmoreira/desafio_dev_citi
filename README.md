# Treinamento de CRUD — CITi

API de exemplo com um **CRUD de usuários** para o treinamento de back-end dos aspirantes.

**Stack:** Node.js · Express · TypeScript · Prisma · PostgreSQL · Docker

> **CRUD** = **C**reate, **R**ead, **U**pdate e **D**elete: as quatro operações básicas de qualquer cadastro (criar, listar/buscar, editar e remover).

| Arquivo | O que tem |
|---|---|
| `README.md` (este) | Como rodar o projeto e como o CRUD de usuários funciona |
| [`DESAFIO.md`](DESAFIO.md) | O enunciado do desafio Folhagem & Cia: o que construir e entregar |

---

## ✅ Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/): roda a API e o banco em containers. **Deixe ele aberto** sempre que for rodar o projeto.
- [Node.js 20+](https://nodejs.org): para rodar os comandos `yarn` na sua máquina.
- Yarn: `npm install -g yarn`
- Um cliente HTTP para testar as rotas: [Thunder Client](https://www.thunderclient.com/) (extensão do VS Code), Insomnia ou Postman.

---

## ⚙️ Como rodar

Com o Docker Desktop aberto, rode na raiz do projeto:

```bash
# 1. Crie o .env a partir do modelo
cp .env.example .env        # no PowerShell ou CMD: copy .env.example .env

# 2. Instale as dependências na sua máquina
#    (sem isso, o yarn migration dá "cross-env não é reconhecido")
yarn

# 3. Suba a API e o banco
docker compose up -d --build

# 4. Crie as tabelas no banco a partir das migrations
yarn migration
```

Para conferir, abra `http://localhost:3001` no navegador. Deve aparecer:

```json
{ "message": "API do treinamento de CRUD do CITi 🚀" }
```

### O `.env`

O `.env` guarda as configurações do projeto e **não vai para o git**. Os valores do `.env.example` já funcionam na sua máquina, então não precisa trocar nada. As únicas variáveis que você pode querer mexer:

| Variável | Quando mexer |
|---|---|
| `SERVER_PORT` | A porta 3001 já está em uso |
| `DATABASE_PORT` | A porta 5432 já está em uso (por exemplo, por um Postgres instalado na máquina) |

> **Por que o host do banco é `treinamento-crud-db` e não `localhost`?** A API roda *dentro* do Docker e enxerga o banco pelo nome do container. Os comandos que rodam na sua máquina (`yarn migration` e `yarn studio`) trocam o host para `localhost` sozinhos.

### Comandos do dia a dia

| Comando | O que faz |
|---|---|
| `docker compose up -d` | Sobe a API e o banco |
| `docker compose logs -f server` | Mostra os logs da API (é aqui que os erros aparecem) |
| `docker compose down` | Derruba os containers (os dados do banco continuam salvos) |
| `yarn migration` | Cria uma migration a partir do `schema.prisma` e aplica no banco |
| `yarn studio` | Abre o Prisma Studio para ver o banco no navegador |
| `yarn typecheck` | Procura erros de tipo no TypeScript |

A API recarrega sozinha quando você salva um arquivo em `src/`. Só precisa rodar `docker compose up -d --build` de novo se mudar o `package.json` ou o `Dockerfile`.

> Prefere npm? Todos os comandos funcionam com `npm install` e `npm run <comando>`.

---

## 📁 Estrutura

```
prisma/
  schema.prisma          # Models (tabelas) do banco
  migrations/            # Histórico de mudanças no banco, gerado pelo yarn migration
src/
  server.ts              # Cria o app Express e sobe o servidor
  routes.ts              # Liga cada rota HTTP a uma função do controller
  database/index.ts      # Conexão com o banco (Prisma Client)
  controllers/           # Recebe a requisição, valida e responde
  repositories/          # Única camada que conversa com o banco
```

O caminho de uma requisição:

```
Requisição → routes.ts → Controller → Repository → Banco
                              ↓
Resposta  ←───────────────────┘  (status HTTP + JSON)
```

---

## 🔌 CRUD de usuários

| Campo | Tipo | Observação |
|---|---|---|
| `id` | número | Gerado pelo banco (1, 2, 3...) |
| `nome` | texto | Obrigatório |
| `conta` | `"CPF"` ou `"CNPJ"` | Obrigatório, em maiúsculas |
| `documento` | texto | Obrigatório e único (não pode repetir) |
| `createdAt` / `updatedAt` | data | Preenchidos pelo banco |

| Método | Rota | O que faz | Sucesso | Erros |
|---|---|---|---|---|
| `POST` | `/users` | Cadastra um usuário | `201` | `400` se faltar campo |
| `GET` | `/users` | Lista todos os usuários | `200` | |
| `GET` | `/users/:id` | Busca um usuário pelo id | `200` | `404` se o id não existir |
| `PATCH` | `/users/:id` | Edita só os campos enviados | `200` | `404` se o id não existir |
| `DELETE` | `/users/:id` | Remove o usuário | `204` | `404` se o id não existir |

Qualquer erro inesperado responde `500`.

Exemplo de corpo para `POST /users`:

```json
{
  "nome": "Maria Silva",
  "conta": "CPF",
  "documento": "12345678900"
}
```

Para o `PATCH`, envie só o que vai mudar: `{ "nome": "Maria S. Silva" }`.

### Testando no Thunder Client

1. Crie uma requisição, escolha o método (`POST`, `GET`...) e use a URL `http://localhost:3001/users`.
2. Para `POST` e `PATCH`, vá em **Body → JSON** e cole o JSON **puro**, sem aspas em volta e sem `\"`.
3. Para as rotas com `:id`, troque pelo número do usuário: `http://localhost:3001/users/1`.

---

## 🆘 Problemas comuns

| Erro | O que fazer |
|---|---|
| `'cross-env' não é reconhecido como um comando` | Faltou instalar as dependências na sua máquina: rode `yarn`. |
| `Environment variable not found: DATABASE_URL` | Falta o `.env` na raiz do projeto: `cp .env.example .env`. |
| `failed to connect to the docker API` | O Docker Desktop está fechado. Abra e espere ele ficar pronto. |
| `port is already allocated` | Troque `SERVER_PORT` ou `DATABASE_PORT` no `.env` e suba de novo. |
| `Can't reach database server` | Os containers não estão de pé: `docker compose up -d`. |
| `Property 'user' does not exist on type 'PrismaClient'` | Rode `yarn migration` e, no VS Code, **Ctrl+Shift+P → Restart TS Server**. |
| A API não responde em `localhost:3001` | Veja o erro em `docker compose logs -f server`. |
| `500` ao criar ou editar depois de mudar o `schema.prisma` | O banco ainda está com as colunas antigas: rode `yarn migration`. |
| `SyntaxError: ... is not valid JSON` ou `req.body` chega `undefined` | O corpo não foi como JSON. Cole o JSON puro em **Body → JSON**. |

> Dica: rode `yarn typecheck` antes de testar. A API não mostra erros de tipo ao rodar, mas o `typecheck` mostra todos de uma vez.


## Desafio Folhagem e Cia:
### Loja de plantas

A implementação foi feita com Node.js, Express, TypeScript, Prisma e PostgreSQL, utilizando Docker para executar a API e o banco de dados.

O projeto segue a estrutura de Repository e Controller já utilizada no CRUD de usuários.

Cada planta possui os campos:

- `id`: identificador numérico gerado automaticamente.
- `nome`: nome popular da planta.
- `especie`: nome científico.
- `preco`: preço armazenado em centavos.
- `estoque`: quantidade disponível.
- `luminosidade`: SOMBRA, MEIA_SOMBRA ou SOL_PLENO.
- `petFriendly`: indica se a planta é segura para cães e gatos.
- `regaACadaDias`: intervalo entre regas, em dias.
- `createdAt`: data de criação.
- `updatedAt`: data da última atualização.

### Rotas disponíveis:

**POST /plantas**

Cadastra uma nova planta. Retorna 201 quando o cadastro é realizado.

**GET /plantas**

Lista todas as plantas cadastradas. Também permite filtros por nome, luminosidade e petFriendly, além de ordenação.

**GET /plantas/:id**

Busca uma planta pelo seu identificador.

**PATCH /plantas/:id**

Atualiza somente os campos enviados na requisição.

**DELETE /plantas/:id**

Exclui uma planta. Retorna 204 quando a exclusão é realizada.

**POST /plantas/:id/venda**

Registra uma venda e diminui a quantidade disponível no estoque.

**GET /plantas/estoque/valor-total**

Calcula o valor total do estoque em centavos e a quantidade total de vasos disponíveis.

**GET /plantas/esgotadas**

Lista apenas as plantas com estoque igual a zero.

### Exemplo de cadastro:

Requisição: `POST /plantas`

Corpo da requisição:

```json
{
  "nome": "Rosa",
  "especie": "Rosa spp.",
  "preco": 3000,
  "estoque": 12,
  "luminosidade": "SOL_PLENO",
  "petFriendly": false,
  "regaACadaDias": 2
}
```

O preço é informado em centavos. Por exemplo, 3000 corresponde a R$ 30,00.

Em um cadastro válido, a API retorna 201 e os dados da planta, incluindo o ID e as datas geradas automaticamente.

### Filtros

A rota GET /plantas permite utilizar diferentes filtros.

Exemplos:

```text
GET /plantas?luminosidade=SOMBRA
GET /plantas?petFriendly=true
GET /plantas?nome=rosa
GET /plantas?luminosidade=SOMBRA&petFriendly=true
```

A busca por nome aceita partes do texto e não diferencia letras maiúsculas de minúsculas.

Também é possível ordenar as plantas em ordem crescente:

```text
GET /plantas?ordem=nome
GET /plantas?ordem=preco
```

Os filtros e a ordenação podem ser combinados.

### Regras

No cadastro, todos os campos informados pelo usuário são obrigatórios.

As principais regras são:

- O preço deve ser um número inteiro maior que zero.
- O estoque deve ser um número inteiro maior ou igual a zero.
- O intervalo de rega deve ser um inteiro maior ou igual a 1.
- A luminosidade deve corresponder a um valor do enum Luminosidade.
- O campo petFriendly deve ser booleano.
- Na edição, apenas os campos enviados são alterados.
- Dados inválidos retornam HTTP 400.
- IDs inexistentes retornam HTTP 404.
- Erros inesperados retornam HTTP 500.

### Registro de vendas:

Requisição: `POST /plantas/:id/venda`

Exemplo de corpo:

```json
{
  "quantidade": 3
}
```

A quantidade deve ser um número inteiro positivo.

A API verifica se existe estoque suficiente antes de realizar a venda. Caso a quantidade solicitada seja maior que o estoque disponível, retorna HTTP 400 e não altera a quantidade armazenada.

A redução do estoque utiliza uma atualização condicional no banco, evitando que vendas simultâneas deixem o estoque negativo.

### Valor total do estoque:

Requisição: `GET /plantas/estoque/valor-total`

Exemplo de resposta:

```json
{
  "valorTotalEmCentavos": 59880,
  "totalDeVasos": 12
}
```

O valor total é calculado somando o preço multiplicado pelo estoque de cada planta.

Os números do exemplo são ilustrativos. A resposta real depende dos produtos cadastrados.

### Plantas esgotadas:

Requisição: `GET /plantas/esgotadas`

Retorna somente plantas com estoque igual a zero.

Caso não existam plantas esgotadas, retorna uma lista vazia:

```json
[]
```

### Seed:

Foi desenvolvido o arquivo `prisma/seed.js`, responsável por cadastrar plantas de exemplo automaticamente.

As plantas utilizadas são Rosa, Violeta e Suculenta.

Para executar:

```bash
yarn seed
```

O script verifica se já existe uma planta com o mesmo nome antes de cadastrá-la, evitando duplicações dos exemplos em novas execuções.

### Como executar:


Para executar a API, siga as instruções de instalação e configuração apresentadas no início deste README.

Com o ambiente configurado, utilize:

- `docker compose up -d --build` para iniciar a API e o banco.
- `yarn migration` para aplicar as migrations.
- `yarn seed` para cadastrar as plantas de exemplo.
- `yarn typecheck` para verificar o TypeScript.

A API fica disponível em `http://localhost:3001`.


### Testes realizados:

A API foi testada localmente com Docker e PostgreSQL.

Foram utilizadas requisições feitas pelo terminal integrado do Visual Studio Code, com comandos curl, e pelo navegador.

Os testes incluíram:

- Cadastro de plantas com dados válidos.
- Listagem de plantas.
- Busca por ID.
- Filtros por luminosidade e petFriendly.
- Edição de preço e estoque.
- Exclusão de plantas.
- Registro de vendas com redução de estoque.
- Cálculo do valor total do estoque.
- Rejeição de vendas com estoque insuficiente.
- Rejeição de preço e luminosidade inválidos.
- Rejeição de cadastro com campos ausentes.
- Retorno 404 para planta inexistente.
- Rejeição de edição com estoque negativo.
- Busca por nome sem diferenciar maiúsculas e minúsculas.
- Ordenação por nome e preço.
- Listagem de plantas esgotadas.
- Execução repetida do seed sem duplicar as plantas de exemplo.

Ao final, o comando `yarn typecheck` foi executado sem erros.

---

