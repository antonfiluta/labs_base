document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        loadOriginalData();
    }
    
    if (window.location.pathname === '/result.html') {
        loadComparisonData();
    }
});

function loadResults() {
    window.location.href = "/result.html"
}

function createCityTable(cities, title) {
    let table = `<h3>${title}</h3>`;
    table += '<table class="city-table">';
    table += '<thead><tr><th>№</th><th>Название города</th></tr></thead>';
    table += '<tbody>';
    
    cities.forEach((city, index) => {
        table += '<tr>';
        table += `<td>${index + 1}</td>`;
        table += `<td>${city}</td>`;
        table += '</tr>';
    });
    
    table += '</tbody>';
    table += '</table>';
    
    return table;
}

async function loadOriginalData() {
    const container = document.getElementById('originalCitiesContainer');
    
    try {
        const response = await fetch('/api/cities');
        const data = await response.json();
        
        container.innerHTML = createCityTable(data.original, 'Исходные названия городов (с ошибками)');
    } catch (error) {
        container.innerHTML = '<div class="error">Ошибка загрузки данных</div>';
        console.error('Error:', error);
    }
}

async function loadProcessedData() {
    const processedContainer = document.getElementById('processedCitiesContainer');
    
    try {
        const response = await fetch('/api/cities');
        const data = await response.json();
        
        processedContainer.innerHTML = createCityTable(data.processed, 'Обработанные названия городов (исправлены и отсортированы)');
        processedContainer.style.display = 'block';
        
        processedContainer.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        processedContainer.innerHTML = '<div class="error">Ошибка загрузки данных</div>';
        console.error('Error:', error);
    }
}

async function loadComparisonData() {
    const container = document.getElementById('comparisonContainer');
    
    try {
        const response = await fetch('/api/cities');
        const data = await response.json();
        
        let html = '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">';
        html += '<div class="table-container">' + createCityTable(data.original, 'До обработки') + '</div>';
        html += '<div class="table-container">' + createCityTable(data.processed, 'После обработки') + '</div>';
        html += '</div>';
        
        const corrections = data.original.filter((city, index) => 
            city !== data.processed[index]
        ).length;
        
        html += `<div class="info-box">
            <h3>Итоги обработки:</h3>
            <p>📊 Всего городов: ${data.processed.length}</p>
            <p>✏️ Исправлено названий: ${corrections}</p>
            <p>🔤 Сортировка: по алфавиту (А-Я)</p>
        </div>`;
        
        container.innerHTML = html;
    } catch (error) {
        container.innerHTML = '<div class="error">Ошибка загрузки данных</div>';
        console.error('Error:', error);
    }
}

document.addEventListener('click', function(e) {
    if (e.target && e.target.id === 'showResultBtn') {
        window.location.href = '/result.html';
    }
});