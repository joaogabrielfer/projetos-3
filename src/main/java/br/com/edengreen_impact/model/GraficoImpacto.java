package br.com.edengreen_impact.model;

import java.util.List;
import java.util.Map;

public record GraficoImpacto(
    List<String> labels,
    List<Double> values,
    Map<String, Double> extras
) {
}
