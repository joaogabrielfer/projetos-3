let chartInstance = null;
let backendDataCache = null;

function marcarComoDesatualizado() {
    const result = document.getElementById('resultState');
    if (!result.classList.contains('hidden')) {
        result.classList.add('desatualizado');
    }
}

document.getElementById('cartoesContainer').addEventListener('change', marcarComoDesatualizado);
document.getElementById('cartoesContainer').addEventListener('input', marcarComoDesatualizado);

document.getElementById('btnAddCartao').addEventListener('click', function() {
    const container = document.getElementById('cartoesContainer');
    const item = document.createElement('div');
    item.className = 'cartao-item';
    item.innerHTML = `
        <div class="cartao-row">
            <div class="field-group">
                <label>Tipo do Cartão</label>
                <select class="tipo-cartao" required>
                    <option value="">Selecione...</option>
                    <option value="VR Benefícios">VR Benefícios</option>
                    <option value="Flash">Flash</option>
                    <option value="Benefícios">Benefícios</option>
                    <option value="Alelo Sodexo">Alelo Sodexo</option>
                </select>
            </div>
            <div class="field-group">
                <label>Anos de Posse</label>
                <input type="number" class="anos-cartao" placeholder="Ex: 2.5" min="0" step="any" required>
            </div>
            <button type="button" class="btn-remove" onclick="removerCartao(this)">Remover</button>
        </div>
    `;
    container.appendChild(item);
    marcarComoDesatualizado();
});

function removerCartao(btn) {
    const item = btn.closest('.cartao-item');
    if (document.querySelectorAll('.cartao-item').length > 1) {
        item.remove();
        marcarComoDesatualizado();
    } else {
        alert("Você precisa informar pelo menos um cartão.");
    }
}

const sliderMigracao = document.getElementById('percentualMigracao');
const labelMigracao = document.getElementById('percentualLabel');

sliderMigracao.addEventListener('input', function() {
    labelMigracao.innerText = this.value;
    document.getElementById('displayPctMigracao').innerText = this.value;
    if (backendDataCache) {
        marcarComoDesatualizado();
    }
});

document.getElementById('impactForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const cartoes = [];
    document.querySelectorAll('.cartao-item').forEach(item => {
        const tipo = item.querySelector('.tipo-cartao').value;
        const anos = parseFloat(item.querySelector('.anos-cartao').value);
        if (tipo && !isNaN(anos)) cartoes.push({ tipo, anos });
    });
    
    const percentualMigracao = parseFloat(sliderMigracao.value);

    const loading = document.getElementById('loadingState');
    const result = document.getElementById('resultState');
    loading.classList.remove('hidden');
    result.classList.add('hidden');

    try {
        const [resIndividual, resSimulacao] = await Promise.all([
            fetch('/dados', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ cartoes }) }).then(r => r.text()),
            fetch('/simulacao', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ cartoes, percentualMigracao }) }).then(r => r.json())
        ]);

        backendDataCache = {
            resIndividual: parseFloat(resIndividual),
            emissaoFisico: resSimulacao.emissaoAtual,
            emissaoSimulada: resSimulacao.emissaoNova,
            reducaoSimulada: resSimulacao.reducao,
            reducaoCidade: resSimulacao.reducaoCidade,
            equivalenciasCidade: resSimulacao.equivalenciasCidade
        };

        loading.classList.add('hidden');
        result.classList.remove('hidden', 'desatualizado');
        result.classList.add('fade-in');
        atualizarDashboardSimulado(true);
        result.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
        loading.classList.add('hidden');
        alert("Erro ao processar simulação.");
    }
});

function atualizarDashboardSimulado(animarLongo) {
    if (!backendDataCache) return;
    
    const fisico = backendDataCache.emissaoFisico;
    const emissaoSimulada = backendDataCache.emissaoSimulada;
    const reducaoSimulada = backendDataCache.reducaoSimulada;
    const reducaoPctSimulada = fisico > 0 ? (reducaoSimulada / fisico) * 100 : 0;
    
    const reducaoCidade = backendDataCache.reducaoCidade;
    const equivalencias = backendDataCache.equivalenciasCidade;

    const duracao = animarLongo ? 1500 : 300;
    document.getElementById('valorIndividual').innerText = backendDataCache.resIndividual.toFixed(5);
    animarContador('valorFisico', fisico, duracao, 5);
    animarContador('valorDigital', emissaoSimulada, duracao, 5);
    animarContador('reducaoAbs', reducaoSimulada, duracao, 5);
    animarContador('reducaoPct', reducaoPctSimulada, duracao, 1);
    
    animarContador('reducaoAbsCidade', reducaoCidade, duracao, 2);
    
    animarContador('eqArvores', equivalencias.arvores, duracao, 0);
    animarContador('eqPlastico', equivalencias.plastico, duracao, 0);
    animarContador('eqKm', equivalencias.km, duracao, 0);

    renderGrafico({ labels: ['Cenário Atual', 'Simulado'], values: [fisico, emissaoSimulada] }, animarLongo);
    
    document.getElementById('side-panel-left').classList.add('active');
    document.getElementById('side-panel-right').classList.add('active');
}

function renderGrafico(dados, animarLongo) {
    const ctx = document.getElementById('impactoChart').getContext('2d');
    if (chartInstance) chartInstance.destroy();
    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dados.labels,
            datasets: [{ label: 'kg CO₂e', data: dados.values, backgroundColor: ['#e74c3c', '#3498db'], borderRadius: 5 }]
        },
        options: { animation: { duration: animarLongo ? 1000 : 200 }, plugins: { legend: { display: false } } }
    });
}

function inicializarPaineisLaterais() {
    const left = document.getElementById('side-panel-left');
    const right = document.getElementById('side-panel-right');
    const trees = ['🌳', '🌲', '🌴', '🌿'];
    
    for (let i = 0; i < 5; i++) {
        const t1 = document.createElement('div');
        t1.className = 'tree-container';
        t1.innerText = trees[i % trees.length];
        t1.style.transitionDelay = `${i * 0.2}s`;
        left.appendChild(t1);
        
        const t2 = document.createElement('div');
        t2.className = 'tree-container';
        t2.innerText = trees[(i + 1) % trees.length];
        t2.style.transitionDelay = `${i * 0.2}s`;
        right.appendChild(t2);
    }
}

function atualizarUIAuth() {
    const token = localStorage.getItem('token');
    const nome = localStorage.getItem('userName');
    
    const guestLinks = document.getElementById('guestLinks');
    const userWelcome = document.getElementById('userWelcome');
    const userNameSpan = document.getElementById('userName');
    const ctaBox = document.querySelector('.cta-box');

    if (token && nome) {
        guestLinks.classList.add('hidden');
        userWelcome.classList.remove('hidden');
        userNameSpan.innerText = nome;
        if (ctaBox) ctaBox.classList.add('hidden');
    } else {
        guestLinks.classList.remove('hidden');
        userWelcome.classList.add('hidden');
        if (ctaBox) ctaBox.classList.remove('hidden');
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    atualizarUIAuth();
    alert('Você saiu da sua conta.');
}

window.addEventListener('DOMContentLoaded', () => {
    inicializarPaineisLaterais();
    atualizarUIAuth();
});

function animarContador(id, fim, dur, casas) {
    const el = document.getElementById(id);
    if (!el) return;
    let ini = null;
    const step = (t) => {
        if (!ini) ini = t;
        const prog = Math.min((t - ini) / dur, 1);
        el.innerText = ((1 - Math.pow(1 - prog, 3)) * fim).toFixed(casas);
        if (prog < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
}


function abrirModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
    
    if(modalId === 'loginModal') {
        document.getElementById('formLogin').reset();
        document.getElementById('loginErro').classList.add('hidden');
    } else {
        document.getElementById('formCadastro').reset();
        document.getElementById('cadastroErro').classList.add('hidden');
        document.getElementById('cadastroSucesso').classList.add('hidden');
    }
}

function fecharModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.add('hidden');
    }
}

document.getElementById('formLogin').addEventListener('submit', async function(e) {
    e.preventDefault(); 
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginSenha').value;
    const erroDiv = document.getElementById('loginErro');
    
    erroDiv.classList.add('hidden');

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('userName', data.nome);
            fecharModal('loginModal');
            atualizarUIAuth();
            alert('Login efetuado com sucesso!');
        } else {
            erroDiv.classList.remove('hidden');
            erroDiv.innerText = "Credenciais inválidas";
        }
    } catch (err) {
        erroDiv.classList.remove('hidden');
        erroDiv.innerText = "Erro ao conectar com o servidor.";
    }
});

document.getElementById('formCadastro').addEventListener('submit', async function(e) {
    e.preventDefault(); 
    const nome = document.getElementById('cadNome').value;
    const email = document.getElementById('cadEmail').value;
    const password = document.getElementById('cadSenha').value;
    const confSenha = document.getElementById('cadConfSenha').value;
    const erroDiv = document.getElementById('cadastroErro');
    const sucessoDiv = document.getElementById('cadastroSucesso');

    erroDiv.classList.add('hidden');
    sucessoDiv.classList.add('hidden');

    if (password !== confSenha) {
        erroDiv.classList.remove('hidden');
        erroDiv.innerText = "As senhas digitadas não coincidem.";
        return;
    }

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, password })
        });

        if (response.ok) {
            sucessoDiv.classList.remove('hidden');
            setTimeout(() => {
                fecharModal('cadastroModal');
                abrirModal('loginModal');
            }, 2000);
        } else {
            const errorText = await response.text();
            erroDiv.classList.remove('hidden');
            erroDiv.innerText = errorText || "Erro no cadastro.";
        }
    } catch (err) {
        erroDiv.classList.remove('hidden');
        erroDiv.innerText = "Erro ao conectar com o servidor.";
    }
});
document.getElementById('btnGerarRelatorio').addEventListener('click', async function() {
    const btnGerar = document.getElementById('btnGerarRelatorio');
    const loadingRelatorio = document.getElementById('relatorioLoading');
    const areaDocumento = document.getElementById('areaDocumentoGerado');
    const documentoFormal = document.getElementById('documentoFormalA4');

    
    btnGerar.classList.add('hidden');
    loadingRelatorio.classList.remove('hidden');

   
    setTimeout(async () => {
        
        const cartoes = [];
        document.querySelectorAll('.cartao-item').forEach(item => {
            const tipo = item.querySelector('.tipo-cartao').value;
            const anos = parseFloat(item.querySelector('.anos-cartao').value);
            if (tipo && !isNaN(anos)) cartoes.push({ tipo, anos });
        });

        const pctMigracao = document.getElementById('percentualMigracao').value;
        const dataAtual = new Date().toLocaleDateString('pt-BR');
        const horaAtual = new Date().toLocaleTimeString('pt-BR');

        
        const htmlCartoes = cartoes.map(c => `<li><strong>Cartão ${c.tipo}:</strong> Possui há ${c.anos} anos</li>`).join('');

        
        const relatorioHTML = `
            <h2>Relatório de Impacto Ambiental</h2>
            <div style="text-align: center; margin-bottom: 25px; font-size: 0.9rem; color: #7f8c8d;">
                Data de emissão: ${dataAtual} às ${horaAtual}
            </div>

            <div class="doc-secao">
                <h3>1. Parâmetros da Simulação</h3>
                <p>Os cálculos foram baseados no cenário em que o usuário informou a seguinte configuração de uso de cartões físicos de benefícios corporativos:</p>
                <ul class="doc-lista">
                    ${htmlCartoes}
                </ul>
                <p style="margin-top: 10px;"><strong>Taxa de Migração Simulada:</strong> A simulação projetou um cenário onde <strong>${pctMigracao}%</strong> desses cartões são convertidos para o modelo 100% digital.</p>
            </div>

            <div class="doc-secao">
                <h3>2. Resultados da Pegada de Carbono Pessoal</h3>
                <table class="doc-tabela">
                    <tr>
                        <th>Métrica</th>
                        <th>Valores (kg CO₂e)</th>
                    </tr>
                    <tr>
                        <td>Pegada de Carbono Atual (Físico)</td>
                        <td>${backendDataCache.emissaoFisico.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td>Pegada no Cenário Projetado (Digital)</td>
                        <td>${backendDataCache.emissaoSimulada.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td><strong>Economia Total Absoluta</strong></td>
                        <td><strong>${backendDataCache.reducaoSimulada.toFixed(2)}</strong></td>
                    </tr>
                </table>
            </div>

            <div class="doc-secao">
                <h3>3. Projeção de Impacto em Escala (Recife)</h3>
                <p>Caso a taxa de migração simulada (${pctMigracao}%) fosse aplicada a todos os usuários corporativos ativos na região metropolitana de Recife, teríamos o seguinte cenário macroambiental:</p>
                <ul class="doc-lista">
                    <li><strong>Redução Total Estimada:</strong> ${backendDataCache.reducaoCidade.toFixed(2)} kg CO₂e</li>
                </ul>
                <p style="margin-top: 15px;"><strong>Essa redução é equivalente a:</strong></p>
                <ul class="doc-lista">
                    <li>A absorção de carbono de <strong>${backendDataCache.equivalenciasCidade.arvores.toFixed(0)} árvores</strong> ao longo de um ano.</li>
                    <li>A não produção de <strong>${backendDataCache.equivalenciasCidade.plastico.toFixed(0)} garrafas plásticas (PET)</strong>.</li>
                    <li>A eliminação da queima de combustível referente a <strong>${backendDataCache.equivalenciasCidade.km.toFixed(0)} km rodados</strong> por um veículo de passeio.</li>
                </ul>
            </div>

            <div class="doc-footer">
                Relatório gerado automaticamente pelo Simulador EdenGreen Impact.<br>
                Este documento serve para fins de conscientização e acompanhamento de metas ASG.
            </div>
        `;

        
        documentoFormal.innerHTML = relatorioHTML;

        
        loadingRelatorio.classList.add('hidden');
        areaDocumento.classList.remove('hidden');

        
        const token = localStorage.getItem('token');
        if (token && backendDataCache) {
            try {
                await fetch('/api/relatorios', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                    body: JSON.stringify({
                        emissaoAtual: backendDataCache.emissaoFisico,
                        emissaoNova: backendDataCache.emissaoSimulada,
                        reducao: backendDataCache.reducaoSimulada,
                        reducaoCidade: backendDataCache.reducaoCidade
                    })
                });
            } catch (e) { console.error('Erro ao salvar relatório no perfil', e); }
        }

      
        areaDocumento.scrollIntoView({ behavior: 'smooth', block: 'start' });

    }, 800); 
});


document.getElementById('btnBaixarPdf').addEventListener('click', function() {
    const btnPdf = document.getElementById('btnBaixarPdf');
    const loadingText = document.getElementById('pdfLoading');
    const relatorioParaImprimir = document.getElementById('documentoFormalA4');

    btnPdf.classList.add('hidden');
    loadingText.classList.remove('hidden');

    const opt = {
        margin:       15,
        filename:     'Relatorio_Analitico_EdenGreen.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, scrollY: 0 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(relatorioParaImprimir).save().then(() => {
        btnPdf.classList.remove('hidden');
        loadingText.classList.add('hidden');
    }).catch(err => {
        alert("Erro ao realizar o download do PDF. Tente novamente.");
        btnPdf.classList.remove('hidden');
        loadingText.classList.add('hidden');
    });
});
