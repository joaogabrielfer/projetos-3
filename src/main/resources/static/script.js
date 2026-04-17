let chartInstance = null;

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
                <input type="number" class="anos-cartao" placeholder="Ex: 2" min="1" required>
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

document.getElementById('impactForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const cartoes = [];
    document.querySelectorAll('.cartao-item').forEach(item => {
        const tipo = item.querySelector('.tipo-cartao').value;
        const anos = parseInt(item.querySelector('.anos-cartao').value);
        if (tipo && !isNaN(anos)) {
            cartoes.push({ tipo: tipo, anos: anos });
        }
    });

    if (cartoes.length === 0) {
        alert("Por favor, preencha os dados de pelo menos um cartão.");
        return;
    }

    const payload = { cartoes: cartoes };

    const loading = document.getElementById('loadingState');
    const result = document.getElementById('resultState');
    
    loading.classList.remove('hidden');
    result.classList.add('hidden');

    try {
        const [resIndividual, resComparar, resGrafico] = await Promise.all([
            fetch('/dados', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload) }).then(r => r.text()),
            fetch('/comparar', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload) }).then(r => r.json()),
            fetch('/graficos', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload) }).then(r => r.json())
        ]);
        
        document.getElementById('valorIndividual').innerText = resIndividual;
        document.getElementById('valorFisico').innerText = resComparar.emissaoFisico.toFixed(5);
        document.getElementById('valorDigital').innerText = resComparar.emissaoDigital.toFixed(5);
        document.getElementById('reducaoAbs').innerText = resComparar.reducao.toFixed(5);
        document.getElementById('reducaoPct').innerText = resComparar.percentualReducao.toFixed(2);
        renderGrafico(resGrafico);

        loading.classList.add('hidden');
        result.classList.remove('hidden');
        
        // Smooth scroll to results
        result.scrollIntoView({ behavior: 'smooth' });

    } catch (err) {
        console.error("Erro na busca de dados:", err);
        loading.classList.add('hidden');
        alert("Ocorreu um erro ao processar sua simulação. Verifique os dados e tente novamente.");
    }
});

function renderGrafico(dados) {
    const ctx = document.getElementById('impactoChart').getContext('2d');
    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dados.labels,
            datasets: [{
                label: 'kg CO2e',
                data: dados.values,
                backgroundColor: ['#e74c3c', '#2ecc71'],
                borderColor: ['#c0392b', '#27ae60'],
                borderWidth: 1
            }]
        },
        options: { 
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { 
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'kg CO2e'
                    }
                }
            }
        }
    });
}
