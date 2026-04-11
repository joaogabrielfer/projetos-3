package br.com.edengreen_impact.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;
import br.com.edengreen_impact.model.DadosForm;

import br.com.edengreen_impact.model.ImpactoComparativo;

import java.util.List;
import java.util.Map;
import br.com.edengreen_impact.model.GraficoImpacto;

@Controller
public class AppController {

    @GetMapping("/")
    public String getIndex() {
        return "index";
    }

    @PostMapping("/dados")
    @ResponseBody
    public String postDados(@RequestBody DadosForm dados) {
        double res = 0;

        if (dados.tipoPagamento().equals("FISICO")) {
            res = calcularImpactoFisico(dados);
        } else if (dados.tipoPagamento().equals("DIGITAL")) {
            res = calcularImpactoDigital(dados);
        } else {
            return "erro";
        }
        return String.format("%.5f", res);
    }

    @PostMapping("/comparar")
    @ResponseBody
    public ImpactoComparativo compararImpactos(@RequestBody DadosForm dados) {
        double fisico = calcularImpactoFisico(dados);
        double digital = calcularImpactoDigital(dados);
        double reducao = fisico - digital;
        double percentual = (fisico > 0) ? (reducao / fisico) * 100 : 0;

        return new ImpactoComparativo(fisico, digital, reducao, percentual);
    }

    @PostMapping("/graficos")
    @ResponseBody
    public GraficoImpacto obterDadosGraficos(@RequestBody DadosForm dados) {
        double fisico = calcularImpactoFisico(dados);
        double digital = calcularImpactoDigital(dados);
        
        return new GraficoImpacto(
            List.of("Físico", "Digital"),
            List.of(fisico, digital),
            Map.of("reducao", fisico - digital)
        );
    }

    private double calcularImpactoFisico(DadosForm dados) {
        double emissaoPorTransacao = obterFatorEmissaoPorTransacao(dados);
        return dados.numeroTransacoes() * emissaoPorTransacao;
    }

    // Optimization: Cacheable factor calculation (T7UH04)
    private double obterFatorEmissaoPorTransacao(DadosForm dados) {
        // a) Produção do cartão (Material + Chip/Antena)
        double emissaoMaterial = (dados.pesoMedioCartao() != null && dados.fatorEmissaoMaterial() != null) 
            ? (dados.pesoMedioCartao() / 1000.0) * dados.fatorEmissaoMaterial() 
            : 0.0210;
        
        double emissaoChipAntena = (dados.emissoesChipAntena() != null) ? dados.emissoesChipAntena() : 0.0075;
        
        // c) Fim de vida
        double emissaoFimVida = (dados.fatorEmissaoDescarte() != null) ? dados.fatorEmissaoDescarte() : 0.0102;
        
        double emissaoTotalCicloVida = emissaoMaterial + emissaoChipAntena + emissaoFimVida;
        
        // b) Vida útil
        int totalTransacoes = (dados.totalTransacoesVidaUtil() != null && dados.totalTransacoesVidaUtil() > 0) 
            ? dados.totalTransacoesVidaUtil() 
            : 3000;
        
        return emissaoTotalCicloVida / totalTransacoes;
    }

    private double calcularImpactoDigital(DadosForm dados) {
        return (double) dados.numeroTransacoes() * 0.000005;
    }
}

