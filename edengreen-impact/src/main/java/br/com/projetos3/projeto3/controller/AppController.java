package br.com.projetos3.projeto3.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import br.com.projetos3.projeto3.*;
import br.com.projetos3.projeto3.model.DadosForm;

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
