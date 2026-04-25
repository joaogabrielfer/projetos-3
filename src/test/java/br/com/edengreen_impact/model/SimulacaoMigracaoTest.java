package br.com.edengreen_impact.model;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class SimulacaoMigracaoTest {

    @Test
    void testCalculosSimulacao() {
        // given
        long transacoes = 1000;
        double percentualDigital = 60.0;
        
        // when
        SimulacaoMigracao simulacao = new SimulacaoMigracao(transacoes, percentualDigital);
        
        // then
        // Atual = 1000 * 0.05 = 50.0
        assertEquals(50.0, simulacao.calcularEmissaoAtual());
        
        // Nova = (400 físicas * 0.05) + (600 digitais * 0.005)
        // 400 * 0.05 = 20.0
        // 600 * 0.005 = 3.0
        // Total nova = 23.0
        assertEquals(23.0, simulacao.calcularEmissaoNova());
        
        // Reducao = 50.0 - 23.0 = 27.0
        assertEquals(27.0, simulacao.calcularReducao());
    }
}