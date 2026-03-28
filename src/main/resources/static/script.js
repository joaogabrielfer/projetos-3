document.getElementById('impactForm').addEventListener('submit', function(event) {
    event.preventDefault(); 

    const loading = document.getElementById('loadingState');
    const result = document.getElementById('resultState');
    const valorCO2e = document.getElementById('valorCO2e');
    const transacoes = document.getElementById('numeroTransacoes').value;
    const tipo = document.getElementById('tipoPagamento').value;

    if (transacoes == "") {
        alert("O número de transações precisa ser informado");
        return; 
    }
    if (transacoes <= 0) {
        alert("o numero de transações precisa ser maior que 0");
        return;
    }
    if (tipo == "") {
        alert("Selecione um meio de pagamento");
        return;
    }

    if (loading) loading.classList.remove('hidden');
        if (result) result.classList.add('hidden');
    const payload = {
        numeroTransacoes: parseInt(transacoes),
        tipoPagamento: tipo
    };

    fetch('/dados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    }
)
    .then(response => response.text())
    .then(data => {
        if (data == "erro") {
            alert("erro no servidor!");
        } else {
            if (loading) loading.classList.add('hidden');
            if (result) {
                result.classList.remove('hidden');
                valorCO2e.innerText = data; 
            }
        }
    }
)
}
);

