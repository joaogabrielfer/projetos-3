package br.com.edengreen_impact.model;

import java.util.List;

public record SimulacaoRequest(List<CartaoInput> cartoes, double percentualMigracao) {}
