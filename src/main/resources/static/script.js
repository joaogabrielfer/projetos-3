let chartInstance = null;
let backendDataCache = null;

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
});

function removerCartao(btn) {
    const item = btn.closest('.cartao-item');
    if (document.querySelectorAll('.cartao-item').length > 1) {
        item.remove();
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
        atualizarDashboardSimulado(false);
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

    const loading = document.getElementById('loadingState');
    const result = document.getElementById('resultState');
    loading.classList.remove('hidden');
    result.classList.add('hidden');

    try {
        const [resIndividual, resComparar, resGrafico] = await Promise.all([
            fetch('/dados', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ cartoes }) }).then(r => r.text()),
            fetch('/comparar', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ cartoes }) }).then(r => r.json()),
            fetch('/graficos', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ cartoes }) }).then(r => r.json())
        ]);

        backendDataCache = {
            resIndividual: parseFloat(resIndividual),
            emissaoFisico: resComparar.emissaoFisico,
            emissaoDigital100: resComparar.emissaoDigital
        };

        loading.classList.add('hidden');
        result.classList.remove('hidden');
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
    const pct = parseInt(sliderMigracao.value) / 100;
    const fisico = backendDataCache.emissaoFisico;
    const digital100 = backendDataCache.emissaoDigital100;
    const emissaoSimulada = (fisico * (1 - pct)) + (digital100 * pct);
    const reducaoSimulada = fisico - emissaoSimulada;
    const reducaoPctSimulada = fisico > 0 ? (reducaoSimulada / fisico) * 100 : 0;

    const duracao = animarLongo ? 1500 : 300;
    document.getElementById('valorIndividual').innerText = backendDataCache.resIndividual.toFixed(5);
    animarContador('valorFisico', fisico, duracao, 5);
    animarContador('valorDigital', emissaoSimulada, duracao, 5);
    animarContador('reducaoAbs', reducaoSimulada, duracao, 5);
    animarContador('reducaoPct', reducaoPctSimulada, duracao, 1);
    
    animarContador('eqArvores', reducaoSimulada / 21, duracao, 1);
    animarContador('eqPlastico', reducaoSimulada / 0.082, duracao, 0);
    animarContador('eqKm', reducaoSimulada / 0.120, duracao, 1);

    renderGrafico({ labels: ['Cenário Atual', 'Simulado'], values: [fisico, emissaoSimulada] }, animarLongo);
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

