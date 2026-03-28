package br.com.edengreen_impact.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;
import br.com.edengreen_impact.model.DadosForm;

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
            double somaTotal = 0.0210 + 0.0075 + 0.0102;
            res = dados.numeroTransacoes() * (somaTotal / 3000);
        } else if (dados.tipoPagamento().equals("DIGITAL")) {
            res = dados.numeroTransacoes() * 0.000005;
        } else {
            return "erro";
        }return String.format("%.5f", res);
    }
}

