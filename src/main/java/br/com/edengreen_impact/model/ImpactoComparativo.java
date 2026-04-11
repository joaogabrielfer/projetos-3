package br.com.edengreen_impact.model;

public record ImpactoComparativo(
    Double emissaoFisico,
    Double emissaoDigital,
    Double reducao,
    Double percentualReducao
) {
}
