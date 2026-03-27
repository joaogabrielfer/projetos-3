document.getElementById('impactForm').addEventListener('submit', function(e) {
        e.preventDefault(); 
            const loading = document.getElementById('loadingState');
            const result = document.getElementById('resultState');
    loading.classList.remove('hidden');
    result.classList.add('hidden');

    setTimeout(() => {
                loading.classList.add('hidden'); 
                result.classList.remove('hidden'); 
        
        
                document.getElementById('valorCO2e').innerText = "1.25"; 
    }, 800);

}

);



