package br.com.edengreen_impact.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import br.com.edengreen_impact.*;
import br.com.edengreen_impact.model.DadosForm;

@Controller
public class AppController {

@GetMapping("/")
public String getIndex() {
    return "index"; 
}

    @PostMapping("/dados")
    @ResponseBody
    public String postDados(DadosForm dados) {
        
        System.out.println("ID recebido no backend: " + dados.id());
        
        return "Dados recebidos com sucesso! O ID enviado foi: " + dados.id();
    }
}
