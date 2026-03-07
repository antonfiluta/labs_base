const API_URL = 'http://localhost:3006/api';

let originalCities = [];
let processedCities = [];

document.addEventListener('DOMContentLoaded', () => {
    checkServerConnection();
    loadInitialData();
});

async function checkServerConnection() {
    const indicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');
    
    indicator.className = 'status-indicator checking';
    statusText.textContent = 'Проверка соединения...';
    
    try {
        const response = await fetch(`${API_URL}/original`);
        
        if (response.ok) {
            indicator.className = 'status-indicator connected';
            statusText.textContent = 'Сервер подключен';
        } else {
            throw new Error('Server not responding');
        }
    } catch (error) {
        console.error('Connection error:', error);
        indicator.className = 'status-indicator disconnected';
        statusText.textContent = 'Сервер недоступен (запустите node server/server.js)';
    }
}

async function loadInitialData() {
    try {
        const response = await fetch(`${API_URL}/original`);
        
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
                originalCities = data.data;
                displayOriginalCities();
            }
        }
        
        const processedResponse = await fetch(`${API_URL}/processed`);
        if (processedResponse.ok) {
            const data = await processedResponse.json();
            if (data.success && data.data) {
                processedCities = data.data;
                displayProcessedCities();
            }
        }
    } catch (error) {
        console.error('Load error:', error);
    }
}

function displayOriginalCities() {
    const card = document.getElementById('originalCard');
    const list = document.getElementById('originalList');
    
    if (!list) return;
    
    if (originalCities.length > 0) {
        card.style.display = 'block';
        list.innerHTML = originalCities
            .map((city, index) => `<li>${city}</li>`)
            .join('');
    } else {
        card.style.display = 'none';
    }
}

function displayProcessedCities() {
    const card = document.getElementById('processedCard');
    const list = document.getElementById('processedList');
    
    if (!list) return;
    
    if (processedCities.length > 0) {
        card.style.display = 'block';
        list.innerHTML = processedCities
            .map((city, index) => `<li>${city}</li>`)
            .join('');
    } else {
        card.style.display = 'none';
    }
}

async function processCities() {
    const textarea = document.getElementById('citiesInput');
    const cities = textarea.value
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
    
    if (cities.length === 0) {
        alert('Введите хотя бы один город');
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch(`${API_URL}/process`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ cities })
        });
        
        if (!response.ok) {
            throw new Error('Server error');
        }
        
        const data = await response.json();
        
        if (data.success) {
            originalCities = data.original;
            processedCities = data.processed;
            
            displayOriginalCities();
            displayProcessedCities();
            
            showNotification('Города успешно обработаны!', 'success');
        }
    } catch (error) {
        console.error('Process error:', error);
        showNotification('Ошибка при обработке', 'error');
    } finally {
        hideLoading();
    }
}

async function loadFromServer() {
    showLoading();
    
    try {
        const [originalRes, processedRes] = await Promise.all([
            fetch(`${API_URL}/original`),
            fetch(`${API_URL}/processed`)
        ]);
        
        if (!originalRes.ok || !processedRes.ok) {
            throw new Error('Failed to load from server');
        }
        
        const originalData = await originalRes.json();
        const processedData = await processedRes.json();
        
        if (originalData.success && originalData.data) {
            originalCities = originalData.data;
            displayOriginalCities();
        }
        
        if (processedData.success && processedData.data) {
            processedCities = processedData.data;
            displayProcessedCities();
            
            const textarea = document.getElementById('citiesInput');
            textarea.value = originalCities.join('\n');
        }
        
        showNotification('Данные загружены из файлов', 'success');
    } catch (error) {
        console.error('Load error:', error);
        showNotification('Ошибка при загрузке', 'error');
    } finally {
        hideLoading();
    }
}

async function resetToDefault() {
    showLoading();
    
    try {
        const response = await fetch(`${API_URL}/init`, {
            method: 'POST'
        });
        
        if (!response.ok) {
            throw new Error('Failed to reset');
        }
        
        const data = await response.json();
        
        if (data.success) {
            originalCities = data.original;
            processedCities = data.processed;
            
            const textarea = document.getElementById('citiesInput');
            textarea.value = originalCities.join('\n');
            
            displayOriginalCities();
            displayProcessedCities();
            
            showNotification('Данные сброшены к примеру', 'success');
        }
    } catch (error) {
        console.error('Reset error:', error);
        showNotification('Ошибка при сбросе', 'error');
    } finally {
        hideLoading();
    }
}

function showLoading() {
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.5';
    });
}

function hideLoading() {
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.disabled = false;
        btn.style.opacity = '1';
    });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 2rem;
        background: ${type === 'success' ? 'rgba(74, 222, 128, 0.9)' : 'rgba(255, 107, 107, 0.9)'};
        color: white;
        border-radius: 16px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);