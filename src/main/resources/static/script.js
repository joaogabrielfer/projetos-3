let chartInstance = null;

document.getElementById('impactForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const loading = document.getElementById('loadingState');
    const result = document.getElementById('resultState');
    
    const payload = {
    numeroTransacoes: parseInt(document.getElementById('numeroTransacoes').value),
    tipoPagamento: document.getElementById('tipoPagamento').value,
    pesoMedioCartao: parseFloat(document.getElementById('pesoMedioCartao').value) || 5.0,
    fatorEmissaoMaterial: parseFloat(document.getElementById('fatorEmissaoMaterial').value)
};

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

    } catch (err) {
        console.error("Erro na busca de dados:", err);
        loading.classList.add('hidden');
        alert("Erro ao processar simulação.");
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
                backgroundColor: ['#e74c3c', '#2ecc71']
            }]
        },
        options: { responsive: true }
    });
}

