package br.com.edengreen_impact.service;

import br.com.edengreen_impact.model.CartaoInput;
import br.com.edengreen_impact.model.DadosForm;
import br.com.edengreen_impact.model.TipoCartao;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ImpactoService {

    public double calcularImpactoFisico(DadosForm dados) {
        double total = 0;
        List<CartaoInput> cartoes = dados.cartoes();
        if (cartoes != null) {
            for (CartaoInput cartao : cartoes) {
                TipoCartao tipoCartao = TipoCartao.fromDescricao(cartao.tipo());
                total += tipoCartao.getFatorEmissaoFisico() * cartao.anos();
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

    public br.com.edengreen_impact.model.Equivalencias calcularEquivalencias(double reducaoCO2) {
        return new br.com.edengreen_impact.model.Equivalencias(
            reducaoCO2 / 21.0,
            reducaoCO2 / 0.082,
            reducaoCO2 / 0.120
        );
    }
}
