package br.com.edengreen_impact.repository;

import br.com.edengreen_impact.model.Relatorio;
import br.com.edengreen_impact.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RelatorioRepository extends JpaRepository<Relatorio, Long> {
    List<Relatorio> findByUser(User user);
}
