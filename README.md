# Buscar Preços

Página pessoal em React, Vite, JavaScript e Tailwind CSS. Uma função em `api/search.js` consulta o Google Shopping pela SerpApi e devolve ofertas ordenadas por preço. Sem banco, autenticação ou SDK de API.

## API escolhida

Opções consultadas em 11/09/2026 (valores em dólares, sujeitos a alteração):

| API | Oferta inicial | Motivo |
| --- | --- | --- |
| [SerpApi](https://serpapi.com/pricing) | 250 buscas gratuitas/mês | Escolhida: possui mecanismo próprio para Google Shopping e localização para o Brasil. |
| [SearchApi](https://www.searchapi.io/pricing) | 100 buscas de teste; US$ 40/mês por 10 mil buscas | Integração simples, mas custo mensal inicial maior. |

SerpApi: `GET https://serpapi.com/search.json` com `engine=google_shopping`, `gl=br` e `hl=pt`. A chave é lida somente no servidor. Não há scraping direto de lojas.

## Rodar localmente

Use Node.js 22.12 ou superior da linha 22.

```sh
npm install
```

Crie uma conta na [SerpApi](https://serpapi.com/), obtenha sua chave e preencha o `.env` já criado:

```dotenv
SERPAPI_API_KEY=sua_chave_aqui
```

Em um checkout novo, copie `.env.example` para `.env`. Nunca use prefixo `VITE_` na chave nem faça commit do `.env`.

```sh
npm run dev
```

Abra o endereço informado pelo Vite (normalmente http://localhost:5173). O adaptador em `vite.config.js` executa a mesma função serverless localmente, sem Express nem Vercel CLI. Reinicie o servidor ao alterar o `.env`.

## Testar

```sh
npm test
npm run build
```

Os testes usam `node:test` e respostas simuladas, sem gastar créditos. Cobrem validação, preços brasileiros, ordenação, campos ausentes, links inválidos, chave ausente, falhas da API e timeout.

Teste manual com `npm run dev`:

1. Sem chave: buscar deve mostrar a mensagem de configuração ausente.
2. Com chave válida: buscar `Logitech G305`, observar carregamento e preços crescentes; abrir uma oferta em nova aba.
3. Pesquisa só com espaços: deve ser rejeitada sem chamar o provedor.
4. Abrir `/api/search`: deve devolver HTTP 400 com mensagem em JSON.
5. Com chave inválida: a página deve mostrar um erro e permitir tentar de novo.
6. Em uma janela estreita, verificar campo, botão e cards em uma coluna.

`npm run preview` serve somente o build estático; para testar a API local, use `npm run dev`.

## Deploy na Vercel

1. Envie este projeto a um repositório Git, sem `.env` e sem `node_modules`.
2. Importe o repositório na Vercel, com preset **Vite** e Node.js **22.x**.
3. Cadastre `SERPAPI_API_KEY` em **Settings → Environment Variables** para Production e Preview, se desejar testar previews.
4. Faça deploy. `vercel.json` define `npm run build`, saída `dist` e até 30 segundos para a função. A pasta `api` gera `/api/search` automaticamente.
5. Se alterar a variável na Vercel, faça novo deploy e teste uma busca no endereço publicado.

Referências: [Vite na Vercel](https://vercel.com/docs/frameworks/frontend/vite), [Tailwind com Vite](https://tailwindcss.com/docs/installation/using-vite).

## Estrutura

```text
api/search.js                   # Integração, validação e normalização
src/App.jsx                     # Formulário, estados e resultados
src/components/ProductCard.jsx  # Card reutilizado por oferta
src/main.jsx
src/style.css
tests/search.test.js
vite.config.js                  # Vite, Tailwind e API local
vercel.json
.env.example
```

## Comportamento e limites

- Ordena as ofertas recebidas pelo preço do produto, sem somar frete. Não garante o menor preço de toda a internet.
- Frete só é exibido quando informado; não há cálculo por CEP.
- Descarta preços ausentes, zerados, negativos, ambíguos ou de outras moedas; aceita preços numéricos e formatos BRL. Descarta também ofertas sem título ou URL HTTP(S).
- Usa os links fornecidos pela SerpApi. A cobertura e eventuais redirecionamentos dependem do provedor e das lojas.
- Retorna `[]` quando não há ofertas válidas. Respostas inesperadas do provedor geram erro, sem expor detalhes internos.
- A chave fica protegida no servidor, mas a rota é pública, conforme o escopo sem autenticação. Chamadas ao endereço publicado consomem os créditos da conta.
- Uma busca real requer sua chave; os testes automatizados não confirmam a cobertura atual de lojas ou os links do provedor.
