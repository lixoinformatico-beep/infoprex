# PRD — App de Rentabilidade da Farmácia por Laboratório

## Problema (original)
Web app que indica quanto a farmácia ganha ou perde nos vários laboratórios.
- Ficheiro XLS (Cardex): produtos disponíveis e descontos por laboratório.
- Ficheiro TXT (INFOPREX): vendas da farmácia.
- Cálculo de rentabilidade por produto = PVP / (1+IVA) − PCU.
- Comparar a rentabilidade calculada das vendas (TXT) com a rentabilidade de referência do Cardex (XLS), usando o PVP e PCU do Excel (o PVP de venda livre pode diferir do TXT).

## Decisões do utilizador
1. Quantidade vendida = soma das colunas V(1) a V(12) (últimos 12 meses). V(0) é o mês corrente (incompleto) e é ignorado.
2. Laboratório obtido da coluna "Laboratório" do XLS.
3. Apenas produtos presentes em AMBOS os ficheiros (chave: CPR no TXT = CNP no XLS).
4. Upload do TXT na página principal; upload do XLS (Cardex) na página de Definições (atualizado esporadicamente).
5. Tema claro.

## Arquitetura
- Backend FastAPI + MongoDB (motor). openpyxl para XLS, csv para TXT (encoding latin-1).
- Frontend React + Tailwind + Shadcn + Recharts. Fonts: Outfit (títulos), IBM Plex Sans (corpo/tabelas).
- Coleções Mongo: `cardex` (doc único id='current' com produtos), `analyses` (histórico de análises).

## Endpoints
- POST /api/cardex/upload, GET /api/cardex
- POST /api/analysis/upload, GET /api/analysis/latest, GET /api/analysis, GET/DELETE /api/analysis/{id}

## Cálculo
- rent_real_unit = PVP_txt/(1+IVA_txt) − PCU_txt
- rent_cardex_unit = PVP_xls/(1+IVA_xls) − PCU_xls
- totais × quantidade (V1..V12); diferença = real − cardex; agregado por laboratório.

## Implementado (2026-06-25)
- Upload Cardex (Definições) com estado, KPIs e amostra de produtos.
- Upload TXT (Dashboard) com KPIs (rentabilidade real, cardex, diferença, nº produtos, nº labs).
- Gráfico Real vs Cardex por laboratório (Recharts).
- Tabela resumo por laboratório + tabela detalhada por produto com pesquisa, filtro por lab e ordenação.
- Code de cores ganho (verde) / perda (vermelho).
- Validado: 5093 produtos no Cardex, 980 produtos com vendas, 17 laboratórios.

## Backlog / Próximos passos
- P1: Exportar análise para Excel/CSV.
- P1: Histórico de análises (UI) — endpoint já existe.
- P2: Incluir colunas de desconto do Cardex (Acordo Tripartido, TFO, Simplex, Bolsa, Delegado) na análise.
- P2: Filtro por intervalo de meses (escolher quais V(n)).
