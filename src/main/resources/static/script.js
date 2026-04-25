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
        alert("Você precisa informar pelo menos um cartão para a simulação.");
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
    result.classList.remove('fade-in'); 

    try {
        
        const [resIndividual, resComparar, resGrafico] = await Promise.all([
            fetch('/dados', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload) }).then(r => r.text()),
            fetch('/comparar', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload) }).then(r => r.json()),
            fetch('/graficos', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload) }).then(r => r.json())
        ]);
        
        loading.classList.add('hidden');
        result.classList.remove('hidden');
        result.classList.add('fade-in');

        document.getElementById('valorIndividual').innerText = parseFloat(resIndividual).toFixed(5);
        
        renderGrafico(resGrafico);


        animarContador('valorFisico', resComparar.emissaoFisico, 1500, 5);
        animarContador('valorDigital', resComparar.emissaoDigital, 1500, 5);
        animarContador('reducaoAbs', resComparar.reducao, 2000, 5); 
        animarContador('reducaoPct', resComparar.percentualReducao, 2000, 2);

        result.scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch (err) {
        console.error("Erro na busca de dados:", err);
        loading.classList.add('hidden');
        alert("Ocorreu um erro ao processar sua simulação. Verifique se o servidor Spring Boot está rodando.");
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
                label: 'kg CO₂e',
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
                    title: { display: true, text: 'Emissão (kg CO₂e)' }
                }
            }
        }
    });
}


function animarContador(elementId, valorFinal, duracao, casasDecimais) {
    const elemento = document.getElementById(elementId);
    if (!elemento) return;

    let tempoInicial = null;

    const passoAnimação = (tempoAtual) => {
        if (!tempoInicial) tempoInicial = tempoAtual;
   
        const progresso = Math.min((tempoAtual - tempoInicial) / duracao, 1);

        const easingProgresso = 1 - Math.pow(1 - progresso, 3);
        
        const valorAtual = (easingProgresso * valorFinal).toFixed(casasDecimais);
        elemento.innerText = valorAtual;

        if (progresso < 1) {
            window.requestAnimationFrame(passoAnimação);
        } else {

            elemento.innerText = valorFinal.toFixed(casasDecimais);
        }
    };

    window.requestAnimationFrame(passoAnimação);
}


