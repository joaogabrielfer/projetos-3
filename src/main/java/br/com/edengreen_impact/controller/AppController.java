package br.com.edengreen_impact.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.beans.factory.annotation.Autowired;
import br.com.edengreen_impact.model.DadosForm;
import br.com.edengreen_impact.model.ImpactoComparativo;
import br.com.edengreen_impact.model.GraficoImpacto;
import br.com.edengreen_impact.service.ImpactoService;

import java.util.List;
import java.util.Map;

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

    @PostMapping("/comparar")
    @ResponseBody
    public ImpactoComparativo compararImpactos(@RequestBody DadosForm dados) {
        double fisico = impactoService.calcularImpactoFisico(dados);
        double digital = impactoService.calcularImpactoDigital(dados);
        double reducao = fisico - digital;
        double percentual = (fisico > 0) ? (reducao / fisico) * 100 : 0;

        return new ImpactoComparativo(fisico, digital, reducao, percentual);
    }

    @PostMapping("/graficos")
    @ResponseBody
    public GraficoImpacto obterDadosGraficos(@RequestBody DadosForm dados) {
        double fisico = impactoService.calcularImpactoFisico(dados);
        double digital = impactoService.calcularImpactoDigital(dados);
        
        return new GraficoImpacto(
            List.of("Físico", "Digital"),
            List.of(fisico, digital),
            Map.of("reducao", fisico - digital)
        );
    }
}