package br.com.edengreen_impact.model;

public class SimulacaoMigracao {
    private static final double FATOR_EMISSAO_FISICO = 0.05;
    private static final double FATOR_EMISSAO_DIGITAL = 0.005;

    private final long transacoes;
    private final double percentualDigital;

    public SimulacaoMigracao(long transacoes, double percentualDigital) {
        this.transacoes = transacoes;
        this.percentualDigital = percentualDigital;
    }

    public double calcularEmissaoAtual() {
        return this.transacoes * FATOR_EMISSAO_FISICO;
    }

    public double calcularEmissaoNova() {
        double transacoesDigitais = this.transacoes * (this.percentualDigital / 100.0);
        double transacoesFisicas = this.transacoes - transacoesDigitais;

        return (transacoesFisicas * FATOR_EMISSAO_FISICO) + (transacoesDigitais * FATOR_EMISSAO_DIGITAL);
    }

    public double calcularReducao() {
        return calcularEmissaoAtual() - calcularEmissaoNova();
    }
}