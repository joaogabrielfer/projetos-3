package br.com.edengreen_impact.service;

import br.com.edengreen_impact.model.CartaoInput;
import br.com.edengreen_impact.model.DadosForm;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ImpactoService {

    private double obterCoeficiente(String tipo) {
        if (tipo == null) return 0.0;
        return switch (tipo) {
            case "VR Benefícios" -> 0.02;
            case "Flash" -> 0.03;
            case "Benefícios" -> 0.025;
            case "Alelo Sodexo" -> 0.028;
            default -> 0.0;
        };
    }

    public double calcularImpactoFisico(DadosForm dados) {
        double total = 0;
        List<CartaoInput> cartoes = dados.cartoes();
        if (cartoes != null) {
            for (CartaoInput cartao : cartoes) {
                total += obterCoeficiente(cartao.tipo()) * cartao.anos();
            }
        }
        return total;
    }

    public double calcularImpactoDigital(DadosForm dados) {
        double total = 0;
        List<CartaoInput> cartoes = dados.cartoes();
        if (cartoes != null) {
            for (CartaoInput cartao : cartoes) {
                total += 0.005 * cartao.anos(); // coeficiente anual
            }
        }
        return total;
    }
}
