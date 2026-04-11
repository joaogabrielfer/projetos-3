package br.com.edengreen_impact.model;

public record DadosForm(
    Integer numeroTransacoes,
    String tipoPagamento,
    // a) Produção do cartão
    String tipoMaterial,
    Double pesoMedioCartao,
    Double fatorEmissaoMaterial,
    Double emissoesChipAntena,
    Double distanciaLogistica,
    String meioTransporte,
    String localFabricacao,
    // b) Vida útil
    Integer tempoUsoAnos,
    Integer transacoesAno,
    Integer totalTransacoesVidaUtil,
    // c) Fim de vida
    String tipoDescarte,
    Double fatorEmissaoDescarte,
    // d) Dados operacionais adicionais
    Double taxaPerdaSubstituicao,
    Integer frequenciaReemissao
) {
}
