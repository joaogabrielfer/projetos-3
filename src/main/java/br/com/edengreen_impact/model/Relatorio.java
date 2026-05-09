package br.com.edengreen_impact.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "relatorios")
public class Relatorio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private Double emissaoAtual;
    private Double emissaoNova;
    private Double reducao;
    private Double reducaoCidade;
    
    private LocalDateTime dataCriacao;

    public Relatorio() {}

    public Relatorio(User user, Double emissaoAtual, Double emissaoNova, Double reducao, Double reducaoCidade) {
        this.user = user;
        this.emissaoAtual = emissaoAtual;
        this.emissaoNova = emissaoNova;
        this.reducao = reducao;
        this.reducaoCidade = reducaoCidade;
        this.dataCriacao = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Double getEmissaoAtual() {
        return emissaoAtual;
    }

    public void setEmissaoAtual(Double emissaoAtual) {
        this.emissaoAtual = emissaoAtual;
    }

    public Double getEmissaoNova() {
        return emissaoNova;
    }

    public void setEmissaoNova(Double emissaoNova) {
        this.emissaoNova = emissaoNova;
    }

    public Double getReducao() {
        return reducao;
    }

    public void setReducao(Double reducao) {
        this.reducao = reducao;
    }

    public Double getReducaoCidade() {
        return reducaoCidade;
    }

    public void setReducaoCidade(Double reducaoCidade) {
        this.reducaoCidade = reducaoCidade;
    }

    public LocalDateTime getDataCriacao() {
        return dataCriacao;
    }

    public void setDataCriacao(LocalDateTime dataCriacao) {
        this.dataCriacao = dataCriacao;
    }
}
