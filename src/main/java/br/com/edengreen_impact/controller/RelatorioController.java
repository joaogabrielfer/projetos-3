package br.com.edengreen_impact.controller;

import br.com.edengreen_impact.model.Relatorio;
import br.com.edengreen_impact.model.User;
import br.com.edengreen_impact.repository.RelatorioRepository;
import br.com.edengreen_impact.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/relatorios")
public class RelatorioController {

    private final RelatorioRepository relatorioRepository;
    private final UserRepository userRepository;

    public RelatorioController(RelatorioRepository relatorioRepository, UserRepository userRepository) {
        this.relatorioRepository = relatorioRepository;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<?> saveRelatorio(@RequestBody RelatorioRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Acesso negado");
        }

        UserDetails userDetails = (UserDetails) auth.getPrincipal();
        User user = userRepository.findByEmail(userDetails.getUsername()).orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuário não encontrado");
        }

        Relatorio relatorio = new Relatorio(
                user,
                request.getEmissaoAtual(),
                request.getEmissaoNova(),
                request.getReducao(),
                request.getReducaoCidade()
        );

        relatorioRepository.save(relatorio);
        return ResponseEntity.status(HttpStatus.CREATED).body("Relatório salvo com sucesso");
    }

    @GetMapping
    public ResponseEntity<?> getRelatorios() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Acesso negado");
        }

        UserDetails userDetails = (UserDetails) auth.getPrincipal();
        User user = userRepository.findByEmail(userDetails.getUsername()).orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuário não encontrado");
        }

        List<Relatorio> relatorios = relatorioRepository.findByUser(user);
        return ResponseEntity.ok(relatorios);
    }
}
