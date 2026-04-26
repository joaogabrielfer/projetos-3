# Documentação do Backend - EdenGreen Impact (Projeto 3)

Esta documentação detalha os endpoints e a estrutura de dados do backend para integração com o frontend.

## Visão Geral
O backend é responsável por calcular o impacto ambiental (emissões de CO₂e) de transações financeiras e uso de cartões, comparando o uso de cartões físicos de diferentes provedores versus pagamentos digitais, além de simular cenários de migração e fornecer equivalências ambientais.

---

## Modelos de Dados (DTOs)

### 1. DadosForm
Objeto enviado pelo frontend para cálculos de impacto baseados no tempo de uso dos cartões.

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `cartoes` | List<CartaoInput> | Lista de cartões que o usuário possui/utiliza. |

### 2. CartaoInput
Detalhes de um cartão individual.

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `tipo` | String | Tipo/Provedor do cartão (Ex: "VR Benefícios", "Flash", "Benefícios", "Alelo Sodexo"). |
| `anos` | Double | Tempo de uso do cartão em anos (aceita valores fracionários). |

### 3. SimulacaoRequest
Parâmetros para a simulação de migração para o digital baseada nos cartões atuais.

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `cartoes` | List<CartaoInput> | Lista de cartões para basear o cálculo de emissão. |
| `percentualMigracao` | Double | Nível de migração para o digital desejado (0 a 100). |

### 4. SimulacaoResponse
Retorno do endpoint de simulação, incluindo equivalências.

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `emissaoAtual` | Double | Emissão total no cenário 100% físico dos cartões informados. |
| `emissaoNova` | Double | Emissão no cenário com o percentual de migração aplicado. |
| `reducao` | Double | Redução absoluta de emissões (Atual - Nova). |
| `equivalencias` | Equivalencias | Objeto contendo as conversões ambientais da redução. |

### 5. Equivalencias
Conversão da redução de CO₂ em métricas do cotidiano.

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `arvores` | Double | Quantidade de árvores necessárias para absorver esse CO₂ em um ano. |
| `plastico` | Double | Quantidade equivalente de garrafas plásticas evitadas. |
| `km` | Double | Quilômetros de carro não percorridos. |

### 6. ImpactoComparativo
Retorno do endpoint de comparação de impacto acumulado.

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `emissaoFisico` | Double | Emissão total calculada para o meio físico. |
| `emissaoDigital` | Double | Emissão total calculada para o meio digital. |
| `reducao` | Double | Diferença absoluta (Fisico - Digital). |
| `percentualReducao` | Double | Redução em percentual (0 a 100). |

### 7. GraficoImpacto
Estrutura otimizada para bibliotecas de gráficos (ex: Chart.js).

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `labels` | List<String> | Rótulos das categorias (ex: ["Físico", "Digital"]). |
| `values` | List<Double> | Valores correspondentes às emissões. |
| `extras` | Map<String, Double>| Dados adicionais (ex: {"reducao": 0.045}). |

---

## Endpoints API

### 1. Calcular Impacto Físico Acumulado
Retorna o valor de emissão total para os cartões físicos informados.

- **URL:** `/dados`
- **Método:** `POST`
- **Corpo (JSON):** `DadosForm`
- **Resposta:** `String` (Valor formatado com 5 casas decimais).

### 2. Comparar Impactos Acumulados
Calcula simultaneamente o impacto físico dos cartões vs um cenário puramente digital equivalente.

- **URL:** `/comparar`
- **Método:** `POST`
- **Corpo (JSON):** `DadosForm`
- **Resposta:** `ImpactoComparativo` (JSON).

### 3. Dados para Gráficos
Retorna os dados estruturados para exibição visual do impacto acumulado.

- **URL:** `/graficos`
- **Método:** `POST`
- **Corpo (JSON):** `DadosForm`
- **Resposta:** `GraficoImpacto` (JSON).

### 4. Simular Migração de Cenários
Simula a redução de emissões e calcula equivalências ao aplicar um percentual de migração sobre a configuração de cartões informada.

- **URL:** `/simulacao`
- **Método:** `POST`
- **Corpo (JSON):** `SimulacaoRequest`
- **Resposta:** `SimulacaoResponse` (JSON).

---

## Lógica de Cálculo (Referência)

### Impacto Físico (Acumulado por Tempo de Uso)
O cálculo é baseado em fatores específicos por provedor:
- **VR Benefícios:** 0.02 / ano
- **Flash:** 0.03 / ano
- **Benefícios:** 0.025 / ano
- **Alelo Sodexo:** 0.028 / ano
- **Fórmula:** `Σ (fator_provedor * anos_uso)`

### Impacto Digital (Cenário Equivalente)
Utiliza um fator fixo de sustentabilidade digital:
- **Fator:** 0.005 / ano
- **Fórmula:** `Σ (0.005 * anos_uso)`

### Simulação de Migração
- **Lógica:** 
  - `emissao_fisica_100 = impacto_fisico(cartoes)`
  - `emissao_digital_100 = impacto_digital(cartoes)`
  - `pct = percentualMigracao / 100`
  - `emissao_nova = (emissao_fisica_100 * (1 - pct)) + (emissao_digital_100 * pct)`

### Fatores de Equivalência
Baseados na redução de CO₂e (kg):
- **Árvores:** `reducao / 21.0`
- **Plástico:** `reducao / 0.082`
- **KM de Carro:** `reducao / 0.120`
