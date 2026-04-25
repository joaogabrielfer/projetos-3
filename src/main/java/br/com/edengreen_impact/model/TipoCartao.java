package br.com.edengreen_impact.model;

public enum TipoCartao {
    VR_BENEFICIOS("VR Benefícios", 0.02),
    FLASH("Flash", 0.03),
    BENEFICIOS("Benefícios", 0.025),
    ALELO_SODEXO("Alelo Sodexo", 0.028),
    OUTRO("Outro", 0.0);

    private final String descricao;
    private final double fatorEmissaoFisico;

    TipoCartao(String descricao, double fatorEmissaoFisico) {
        this.descricao = descricao;
        this.fatorEmissaoFisico = fatorEmissaoFisico;
    }

    public double getFatorEmissaoFisico() {
        return fatorEmissaoFisico;
    }

    public static TipoCartao fromDescricao(String descricao) {
        if (descricao == null) return OUTRO;
        for (TipoCartao tipo : values()) {
            if (tipo.descricao.equals(descricao)) {
                return tipo;
            }
        }
        return OUTRO;
    }
}