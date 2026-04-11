# Documentação do Backend - EdenGreen Impact (Projeto 3)

Esta documentação detalha os endpoints e a estrutura de dados do backend para integração com o frontend.

## Visão Geral
O backend é responsável por calcular o impacto ambiental (emissões de CO₂e) de transações financeiras, comparando o uso de cartões físicos versus pagamentos digitais.

---

## Modelos de Dados (DTOs)

### 1. DadosForm
Objeto enviado pelo frontend com os parâmetros da simulação.

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `numeroTransacoes` | Integer | Quantidade de transações a serem calculadas. |
| `tipoPagamento` | String | "FISICO" ou "DIGITAL". |
| `tipoMaterial` | String | (Opcional) PVC virgem, reciclado ou metal. |
| `pesoMedioCartao` | Double | (Opcional) Peso em gramas (ex: 5.0). |
| `fatorEmissaoMaterial` | Double | (Opcional) kg CO₂e por kg de material. |
| `emissoesChipAntena` | Double | (Opcional) Emissões fixas do hardware do cartão. |
| `distanciaLogistica` | Double | (Opcional) Distância em km para transporte. |
| `meioTransporte` | String | (Opcional) Meio de transporte utilizado. |
| `localFabricacao` | String | (Opcional) Local de origem do cartão. |
| `tempoUsoAnos` | Integer | (Opcional) Vida útil média do cartão. |
| `transacoesAno` | Integer | (Opcional) Média de transações anuais. |
| `totalTransacoesVidaUtil`| Integer | (Opcional) Total de transações que o cartão suporta (Padrão: 3000). |
| `tipoDescarte` | String | (Opcional) Aterro, incineração ou reciclagem. |
| `fatorEmissaoDescarte` | Double | (Opcional) kg CO₂e associado ao descarte. |
| `taxaPerdaSubstituicao` | Double | (Opcional) Taxa anual de substituição. |
| `frequenciaReemissao` | Integer | (Opcional) Frequência em meses. |

### 2. ImpactoComparativo
Retorno do endpoint de comparação.

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `emissaoFisico` | Double | Emissão total calculada para o meio físico. |
| `emissaoDigital` | Double | Emissão total calculada para o meio digital. |
| `reducao` | Double | Diferença absoluta (Fisico - Digital). |
| `percentualReducao` | Double | Redução em percentual (0 a 100). |

### 3. GraficoImpacto
Estrutura otimizada para bibliotecas de gráficos (ex: Chart.js).

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `labels` | List<String> | Rótulos das categorias (ex: ["Físico", "Digital"]). |
| `values` | List<Double> | Valores correspondentes às emissões. |
| `extras` | Map<String, Double>| Dados adicionais (ex: {"reducao": 0.045}). |

---

## Endpoints API

### 1. Calcular Impacto Individual
Retorna o valor de emissão para o tipo de pagamento selecionado no `DadosForm`.

- **URL:** `/dados`
- **Método:** `POST`
- **Corpo (JSON):** `DadosForm`
- **Resposta:** `String` (Valor formatado com 5 casas decimais).

### 2. Comparar Impactos
Calcula simultaneamente os dois cenários (Físico e Digital) e retorna a diferença.

- **URL:** `/comparar`
- **Método:** `POST`
- **Corpo (JSON):** `DadosForm`
- **Resposta:** `ImpactoComparativo` (JSON).

### 3. Dados para Gráficos
Retorna os dados estruturados para exibição visual.

- **URL:** `/graficos`
- **Método:** `POST`
- **Corpo (JSON):** `DadosForm`
- **Resposta:** `GraficoImpacto` (JSON).

---

## Lógica de Cálculo (Referência)

### Pagamento Físico
O cálculo segue o ciclo de vida:
1.  **Produção:** `(peso / 1000 * fatorMaterial) + emissoesChipAntena`
2.  **Fim de Vida:** `fatorEmissaoDescarte`
3.  **Fator por Transação:** `(Produção + Fim de Vida) / totalTransacoesVidaUtil`
4.  **Resultado Final:** `numeroTransacoes * Fator por Transação`

*Valores padrão (se omitidos):*
- Emissão Material: 0.0210
- Chip/Antena: 0.0075
- Descarte: 0.0102
- Vida Útil (Transações): 3000

### Pagamento Digital
Fator fixo baseado em processamento de dados:
- `numeroTransacoes * 0.000005`
