package br.com.projetos3.projeto3.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import br.com.projetos3.projeto3.*;

@Controller
public class AppController {

    @GetMapping("/index")
    public String getIndex() {
        return "forward:/index.html";
    }

    @PostMapping("/dados")
    @ResponseBody
    public String postDados(DadosForm dados) {
        
        System.out.println("ID recebido no backend: " + dados.id());
        
        return "Dados recebidos com sucesso! O ID enviado foi: " + dados.id();
    }
}
