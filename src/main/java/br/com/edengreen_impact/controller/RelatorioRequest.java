package br.com.edengreen_impact.controller;

public class RelatorioRequest {
    private Double emissaoAtual;
    private Double emissaoNova;
    private Double reducao;
    private Double reducaoCidade;

    public Double getEmissaoAtual() { return emissaoAtual; }
    public void setEmissaoAtual(Double emissaoAtual) { this.emissaoAtual = emissaoAtual; }
    public Double getEmissaoNova() { return emissaoNova; }
    public void setEmissaoNova(Double emissaoNova) { this.emissaoNova = emissaoNova; }
    public Double getReducao() { return reducao; }
    public void setReducao(Double reducao) { this.reducao = reducao; }
    public Double getReducaoCidade() { return reducaoCidade; }
    public void setReducaoCidade(Double reducaoCidade) { this.reducaoCidade = reducaoCidade; }
}
