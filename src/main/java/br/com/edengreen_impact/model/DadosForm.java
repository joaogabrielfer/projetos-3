package br.com.edengreen_impact.model;

import java.util.List;

public record DadosForm(
    List<CartaoInput> cartoes
) {
}