let chartInstance = null;
let backendDataCache = null;

let arvoreElementosEsquerda = [];
let arvoreElementosDireita = [];

function marcarComoDesatualizado() {
    const result = document.getElementById('resultState');
    if (!result.classList.contains('hidden')) {
        result.classList.add('desatualizado');
    }
}

document.getElementById('cartoesContainer').addEventListener('change', () => {
    marcarComoDesatualizado();
    atualizarVisualizacaoCartoes();
});
document.getElementById('cartoesContainer').addEventListener('input', () => {
    marcarComoDesatualizado();
    atualizarVisualizacaoCartoes();
});

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
    atualizarVisualizacaoCartoes();
});

function removerCartao(btn) {
    const item = btn.closest('.cartao-item');
    if (document.querySelectorAll('.cartao-item').length > 1) {
        item.remove();
        marcarComoDesatualizado();
        atualizarVisualizacaoCartoes();
    } else {
        alert("Você precisa informar pelo menos um cartão.");
    }
}

const sliderMigracao = document.getElementById('percentualMigracao');
const labelMigracao = document.getElementById('percentualLabel');

sliderMigracao.addEventListener('input', function() {
    labelMigracao.innerText = this.value;
    document.getElementById('displayPctMigracao').innerText = this.value;
    atualizarVisualizacaoCartoes();
    atualizarArvoresLaterais(); 
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

    renderGrafico({ labels: ['Físico Atual', 'Digital Simulado'], values: [fisico, emissaoSimulada] }, animarLongo);
}

function renderGrafico(dados, animarLongo) {
    const ctx = document.getElementById('impactoChart').getContext('2d');
    if (chartInstance) chartInstance.destroy();
    
    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dados.labels,
            datasets: [{ 
                label: 'kg CO₂e', 
                data: dados.values, 
                backgroundColor: ['#E5001C', '#10B981'], 
                borderRadius: 4,
                barThickness: 45
            }]
        },
        options: { 
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: animarLongo ? 800 : 150 }, 
            plugins: { 
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.9)',
                    titleFont: { family: 'Outfit', size: 13, weight: 'bold' },
                    bodyFont: { family: 'Outfit', size: 12 },
                    padding: 10,
                    cornerRadius: 6,
                    displayColors: false
                }
            },
            scales: {
                y: {
                    grid: { color: 'rgba(0, 0, 0, 0.04)' },
                    ticks: { font: { family: 'Outfit', size: 11, weight: '500' } }
                },
                x: {
                    grid: { display: false },
                    ticks: { font: { family: 'Outfit', size: 12, weight: '600' } }
                }
            }
        }
    });
}

function criarArvoreSVG(tipo) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 100 120");
    svg.setAttribute("class", "tree-svg-root");
    
    let content = "";
    if (tipo === 0) {
        content = `
            <rect x="46" y="70" width="8" height="50" rx="4" class="trunk" fill="#8B5A2B" />
            <circle cx="50" cy="45" r="30" class="leaves" fill="#10B981" opacity="0.9" />
            <circle cx="65" cy="35" r="15" class="leaves" fill="#047857" opacity="0.8" />
        `;
    } else if (tipo === 1) {
        content = `
            <rect x="46" y="80" width="8" height="40" rx="4" class="trunk" fill="#8B5A2B" />
            <path d="M50 20 L20 85 L80 85 Z" class="leaves" fill="#059669" />
            <path d="M50 40 L28 85 L72 85 Z" class="leaves" fill="#047857" opacity="0.6" />
        `;
    } else {
        content = `
            <rect x="46" y="60" width="8" height="60" rx="4" class="trunk" fill="#8B5A2B" />
            <path d="M20 65 C 20 20, 80 20, 80 65 Z" class="leaves" fill="#34D399" />
        `;
    }
    svg.innerHTML = content;
    return svg;
}

function inicializarPaineisLaterais() {
    const left = document.getElementById('side-panel-left');
    const right = document.getElementById('side-panel-right');
    if (!left || !right) return;
    
    left.innerHTML = '';
    right.innerHTML = '';
    arvoreElementosEsquerda = [];
    arvoreElementosDireita = [];
    
    for (let i = 0; i < 5; i++) {
        const t1 = document.createElement('div');
        t1.className = 'tree-wrapper';
        t1.appendChild(criarArvoreSVG(i % 3));
        left.appendChild(t1);
        arvoreElementosEsquerda.push(t1);
        
        const t2 = document.createElement('div');
        t2.className = 'tree-wrapper';
        t2.appendChild(criarArvoreSVG((i + 1) % 3));
        right.appendChild(t2);
        arvoreElementosDireita.push(t2);
    }
    
    atualizarArvoresLaterais(); 
}

function atualizarArvoresLaterais() {
    const slider = document.getElementById('percentualMigracao');
    if (!slider) return;
    const value = parseFloat(slider.value); 
    
    const totalTrees = 10;
    
    for (let idx = 0; idx < totalTrees; idx++) {
        const threshold = idx * 10; 
        
        let scale = 0;
        let opacity = 0;
        let rotation = 0;
        let dropY = 0;
        let secar = 0; 
        
        const direcaoQueda = (idx % 2 === 0) ? -80 : 80; 

        if (value >= threshold + 10) {
            scale = 1;
            opacity = 0.85;
            rotation = 0;
            dropY = 0;
            secar = 0;
        } else if (value <= threshold) {
            scale = 0.6; 
            opacity = 0;
            rotation = direcaoQueda;
            dropY = 60; 
            secar = 100;
        } else {
            const pct = (value - threshold) / 10.0; 
            const pctInverso = 1 - pct; 
            
            scale = 0.6 + (0.4 * pct);
            opacity = 0.85 * pct;
            rotation = direcaoQueda * Math.pow(pctInverso, 2); 
            dropY = 60 * pctInverso;
            secar = 100 * pctInverso;
        }
        
        const elementList = (idx % 2 === 0) ? arvoreElementosEsquerda : arvoreElementosDireita;
        const listIdx = Math.floor(idx / 2);
        
        if (elementList[listIdx]) {
            const arvore = elementList[listIdx];
            
            arvore.style.transform = `translateY(${dropY}px) rotate(${rotation}deg) scale(${scale})`;
            arvore.style.opacity = opacity;
            
            arvore.style.filter = `grayscale(${secar * 0.8}%) sepia(${secar}%) hue-rotate(-${secar * 0.4}deg) saturate(${100 + secar}%)`;
        }
    }
}

function obterEquivArvoreSVG() {
    return `
        <svg viewBox="0 0 64 64" class="equiv-icon-svg">
            <path d="M32 56 L32 40 M28 48 L32 44 M36 52 L32 48" stroke="#78350F" stroke-width="3.5" stroke-linecap="round" fill="none" />
            <g class="tree-equiv-foliage">
                <circle cx="32" cy="26" r="14" fill="#10B981" opacity="0.95" />
                <circle cx="24" cy="32" r="10" fill="#059669" opacity="0.9" />
                <circle cx="40" cy="32" r="10" fill="#047857" opacity="0.9" />
                <circle cx="32" cy="18" r="8" fill="#34D399" opacity="0.95" />
            </g>
        </svg>
    `;
}

function obterEquivPlasticoSVG() {
    return `
        <svg viewBox="0 0 64 64" class="equiv-icon-svg">
            <g class="bottle-pet">
                <rect x="29" y="10" width="6" height="4" rx="1" fill="#E5001C" />
                <path d="M28 14 L36 14 L36 20 L28 20 Z" fill="#EF4444" opacity="0.8" />
                <path d="M24 20 C24 20, 26 22, 26 26 L26 48 C26 52, 28 54, 32 54 C36 54, 38 52, 38 48 L38 26 C38 22, 40 20, 40 20 Z" fill="#FCA5A5" opacity="0.4" stroke="#E5001C" stroke-width="2" />
                <path d="M26 30 Q 32 28 38 30" stroke="#E5001C" stroke-width="1.2" fill="none" opacity="0.3" />
                <path d="M26 38 Q 32 36 38 38" stroke="#E5001C" stroke-width="1.2" fill="none" opacity="0.3" />
                <path d="M26 46 Q 32 44 38 46" stroke="#E5001C" stroke-width="1.2" fill="none" opacity="0.3" />
            </g>
        </svg>
    `;
}

function obterEquivCarroSVG() {
    return `
        <svg viewBox="0 0 64 64" class="equiv-icon-svg">
            <g>
                <circle cx="15" cy="46" r="3" class="smoke-cloud-1" fill="#9CA3AF" />
                <circle cx="10" cy="43" r="4" class="smoke-cloud-2" fill="#D1D5DB" />
                <g class="car-body">
                    <path d="M16 46 L48 46 C52 46, 54 44, 54 40 L54 34 C54 30, 50 28, 44 28 L40 18 C38 16, 36 16, 30 16 L24 16 C20 16, 18 18, 16 22 L14 30 L12 34 C10 34, 10 36, 10 38 L10 42 C10 45, 13 46, 16 46 Z" fill="#EF4444" />
                    <path d="M22 20 L29 20 L29 26 L19 26 Z" fill="#E0F2FE" />
                    <path d="M31 20 L38 20 L41 26 L31 26 Z" fill="#E0F2FE" />
                    <circle cx="20" cy="46" r="6" fill="#1F2937" stroke="white" stroke-width="1.5" />
                    <circle cx="44" cy="46" r="6" fill="#1F2937" stroke="white" stroke-width="1.5" />
                </g>
            </g>
        </svg>
    `;
}

function inicializarIconesEquivalencia() {
    const arvoresContainer = document.getElementById('equiv-icon-arvores');
    const plasticoContainer = document.getElementById('equiv-icon-plastico');
    const kmContainer = document.getElementById('equiv-icon-km');
    
    if (arvoresContainer) arvoresContainer.innerHTML = obterEquivArvoreSVG();
    if (plasticoContainer) plasticoContainer.innerHTML = obterEquivPlasticoSVG();
    if (kmContainer) kmContainer.innerHTML = obterEquivCarroSVG();
}

function atualizarVisualizacaoCartoes() {
    const container = document.getElementById('visualCardsList');
    if (!container) return;
    container.innerHTML = '';
    
    const cartoes = [];
    document.querySelectorAll('.cartao-item').forEach(item => {
        const tipo = item.querySelector('.tipo-cartao').value || 'Cartão Edenred';
        const anos = parseFloat(item.querySelector('.anos-cartao').value) || 0;
        cartoes.push({ tipo, anos });
    });
    
    const percentual = parseFloat(sliderMigracao.value);
    const totalCartoes = cartoes.length;
    
    cartoes.forEach((c, idx) => {
        const cardDiv = document.createElement('div');
        
        const threshold = (idx / totalCartoes) * 100;
        const isDigital = percentual > threshold;
        
        let brandClass = 'card-generic';
        if (c.tipo.includes('VR')) {
            brandClass = 'card-vr';
        } else if (c.tipo.includes('Flash')) {
            brandClass = 'card-flash';
        } else if (c.tipo.includes('Alelo')) {
            brandClass = 'card-alelo';
        } else if (c.tipo.includes('Sodexo') || c.tipo.includes('Benefícios')) {
            brandClass = 'card-sodexo';
        }
        
        cardDiv.className = `visual-card ${brandClass} ${isDigital ? 'card-digital' : ''}`;
        
        cardDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <span class="card-brand">${c.tipo}</span>
                <span class="card-status-badge">${isDigital ? 'DIGITAL' : 'PLÁSTICO'}</span>
            </div>
            <div class="card-chip"></div>
            <div style="display: flex; justify-content: space-between; align-items: flex-end; width: 100%;">
                <div>
                    <div style="font-size: 0.5rem; opacity: 0.7; text-transform: uppercase;">Uso</div>
                    <div class="card-years">${c.anos.toFixed(1)} Ano(s)</div>
                </div>
                <div style="font-size: 0.8rem; font-weight: bold; letter-spacing: 0.5px;">
                    ${isDigital ? 'DIGI' : 'PHYS'}
                </div>
            </div>
        `;
        container.appendChild(cardDiv);
    });
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
    inicializarIconesEquivalencia();
    atualizarUIAuth();
    atualizarVisualizacaoCartoes();
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

