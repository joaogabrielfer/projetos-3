package br.com.edengreen_impact.controller;

public class JwtResponse {
    private String token;
    private String email;
    private String nome;

    public JwtResponse(String token, String email, String nome) {
        this.token = token;
        this.email = email;
        this.nome = nome;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
}
