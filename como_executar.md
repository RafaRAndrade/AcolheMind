# AcolheMind – MVP

Código do MVP derivado do protótipo (`prototipo.html`).

- `backend/`: Node.js + Express (API REST, JWT, dados em arquivo JSON para o MVP; troque por Postgres/SQLite).
- `frontend/`: Next.js (App Router, React), mobile-first, PWA (manifest + Service Worker com cache offline e fila de envio offline).

## Como rodar

### Protótipo HTML (`prototipo.html`)
O protótipo é um arquivo único, sem build, sem dependências e sem backend. Os dados ficam só na memória da página (o histórico do SOS Inteligente usa `localStorage`).

```bash
# Opção A: abrir direto no navegador (duplo clique no arquivo, ou:)
open prototipo.html          # macOS
xdg-open prototipo.html      # Linux
start prototipo.html         # Windows

# Opção B: servir por HTTP local (recomendado para testar a câmera da teleconsulta)
python3 -m http.server 8080  # depois abra http://localhost:8080/prototipo.html
# ou: npx serve .
```
Dicas:
- Login de demonstração: qualquer e-mail válido e senha com 4 ou mais caracteres.
- O botão "Preciso de ajuda" na capa abre o guia SOS sem login.
- A câmera da teleconsulta só funciona em `localhost` ou HTTPS (use a opção B). A sala é uma simulação; para uma chamada real, cole a URL da sua sala Daily.co em `DAILY_ROOM_URL`, dentro do `<script>`.
- No desktop o app aparece em uma moldura de celular. Em telas até 500 px, ocupa a tela toda.
- As fontes (Inter e Poppins) vêm do Google Fonts; sem internet, o navegador usa as fontes do sistema.
- Consultas, pagamentos e convênios são simulados e nada é enviado.

### MVP (API + Web)
```bash
# 1) API
cd backend && npm install && JWT_SECRET=minha-chave npm start      # http://localhost:4000
# 2) Web
cd frontend && npm install && cp .env.local.example .env.local && npm run dev   # http://localhost:3000
```
O conteúdo do SOS (`frontend/data/sos.json`) é gerado do protótipo com `npm run extract-sos`.
Para testar o PWA: `npm run build && npm start` (o Service Worker só vale em produção/HTTPS ou localhost).

## Endpoints
`POST /api/auth/register|login` · `GET|POST /api/children` · `GET|POST /api/records` · `DELETE /api/records/:id` ·
`GET /api/reports/weekly?childId=` · `GET|POST /api/sos/history` · `PATCH /api/sos/history/:id`

## Já no MVP
Login/cadastro, crianças, Diário (registro rápido, lista por dia, relatório semanal), SOS Inteligente offline com histórico, PWA offline.

## Ainda falta portar do protótipo
Onboarding, Início, SOS Anticrise (checklist), pausa de respiração, Nino, Apoio ao cuidador, Consultas/telepsicologia (vídeo), perfil, tela "O que funciona para nossa família" e avaliação das orientações do SOS (a API já aceita `PATCH`).

## Ajustes desta versão
- SOS: detecção de emergência ampliada para dificuldade de respirar (`EMG_EXTRA` em `frontend/lib/sos.js`; esta regra extra existe só no MVP, não no protótipo).
- Service Worker (v2): não guarda respostas da API no cache. Sair da conta limpa token, dados das crianças e cache do aparelho.
- Registros enviam data e hora do aparelho (antes a hora vinha do servidor, em UTC).
- Offline: a lista do dia mostra a última cópia e os registros ainda na fila; a fila só descarta itens rejeitados como inválidos pelo servidor.

## Antes de produção
Trocar `JWT_SECRET`, usar HTTPS, banco real, ícones PNG 192/512 no manifest e revisão por profissional de saúde do conteúdo do SOS.
