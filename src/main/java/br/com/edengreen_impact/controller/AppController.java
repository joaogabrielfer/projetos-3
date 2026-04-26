package br.com.edengreen_impact.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.beans.factory.annotation.Autowired;
import br.com.edengreen_impact.model.DadosForm;
import br.com.edengreen_impact.model.SimulacaoRequest;
import br.com.edengreen_impact.model.SimulacaoResponse;
import br.com.edengreen_impact.service.ImpactoService;

@Controller
public class AppController {

    private final ImpactoService impactoService;

    @Autowired
    public AppController(ImpactoService impactoService) {
        this.impactoService = impactoService;
    }

    @GetMapping("/")
    public String getIndex() {
        return "index";
    }

    @PostMapping("/dados")
    @ResponseBody
    public String postDados(@RequestBody DadosForm dados) {
        double res = impactoService.calcularImpactoFisico(dados);
        return String.format(java.util.Locale.US, "%.5f", res);
    }

    @PostMapping("/simulacao")
    @ResponseBody
    public SimulacaoResponse simularMigracao(@RequestBody SimulacaoRequest request) {
        DadosForm dados = new DadosForm(request.cartoes());
        double fisico = impactoService.calcularImpactoFisico(dados);
        double digital100 = impactoService.calcularImpactoDigital(dados);
        
        double pct = request.percentualMigracao() / 100.0;
        double emissaoNova = (fisico * (1 - pct)) + (digital100 * pct);
        double reducao = fisico - emissaoNova;
        
        // Redução potencial máxima da cidade (100% migração)
        double reducaoPotencialIndividual = fisico - digital100;
        double reducaoCidade = 0;
        if (request.cartoes() != null && !request.cartoes().isEmpty()) {
            double fator = 250000.0 / request.cartoes().size();
            reducaoCidade = reducaoPotencialIndividual * fator;
        }

        return new SimulacaoResponse(
            fisico,
            emissaoNova,
            reducao,
            reducaoCidade,
            impactoService.calcularEquivalencias(reducaoCidade)
        );
    }
}
