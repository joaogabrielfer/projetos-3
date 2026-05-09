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

window.addEventListener('DOMContentLoaded', () => {
    inicializarPaineisLaterais();
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
            fecharModal('loginModal');
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

document.getElementById('btnGerarPdf').addEventListener('click', async function() {
    const btnPdf = document.getElementById('btnGerarPdf');
    const loadingText = document.getElementById('pdfLoading');
    const areaRelatorio = document.getElementById('areaRelatorio');

    btnPdf.classList.add('hidden');
    loadingText.classList.remove('hidden');

    areaRelatorio.style.backgroundColor = '#f0f8f4'; 
    areaRelatorio.style.padding = '20px';
    areaRelatorio.style.borderRadius = '16px';

    const token = localStorage.getItem('token');
    if (token && backendDataCache) {
        try {
            await fetch('/api/relatorios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({
                    emissaoAtual: backendDataCache.emissaoFisico,
                    emissaoNova: backendDataCache.emissaoSimulada,
                    reducao: backendDataCache.reducaoSimulada,
                    reducaoCidade: backendDataCache.reducaoCidade
                })
            });
        } catch (e) {
            console.error('Erro ao salvar relatório no perfil', e);
        }
    }

    const opt = {
        margin:       10,
        filename:     'Relatorio_Impacto_EdenGreen.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { 
            scale: 2, 
            scrollY: 0, 
            useCORS: true 
        },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(areaRelatorio).save().then(() => {
        btnPdf.classList.remove('hidden');
        loadingText.classList.add('hidden');
        areaRelatorio.style.backgroundColor = 'transparent';
        areaRelatorio.style.padding = '0';
    }).catch(err => {
        alert("Erro ao gerar o PDF. Tente novamente.");
        btnPdf.classList.remove('hidden');
        loadingText.classList.add('hidden');
    });
});
