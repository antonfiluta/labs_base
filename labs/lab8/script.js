// ===============================================
// LAB 8 - ТАЙМЕР ОБРАТНОГО ОТСЧЁТА
// setTimeout, setInterval и коллекции
// Вариант 13 - ИТОГОВАЯ ВЕРСИЯ
// ===============================================

class PromoTimer {
    constructor() {
        // Коллекции для хранения данных
        this.products = new Map(); // Map для товаров
        this.history = new Set();   // Set для истории акций
        
        // Состояние таймера
        this.timerInterval = null;
        this.timeoutIds = [];       // Массив для хранения setTimeout
        this.remainingTime = 0;
        this.totalTime = 0;
        this.isRunning = false;
        this.isPaused = false;
        
        // Инициализация
        this.initData();
        this.initEventListeners();
        this.renderCollections();
    }
    
    // Инициализация тестовых данных
    initData() {
        // Map с товарами
        this.products.set('Ноутбук XPS 13', {
            price: 1200,
            description: 'Мощный ноутбук для работы и игр',
            image: '💻',
            oldPrice: 1200
        });
        
        this.products.set('Смартфон Galaxy S25', {
            price: 900,
            description: 'Флагманский смартфон с AI-функциями',
            image: '📱',
            oldPrice: 900
        });
        
        this.products.set('Планшет iPad Pro', {
            price: 800,
            description: 'Профессиональный планшет для творчества',
            image: '📟',
            oldPrice: 800
        });
        
        this.products.set('Наушники AirPods Pro', {
            price: 200,
            description: 'Беспроводные наушники с шумоподавлением',
            image: '🎧',
            oldPrice: 200
        });
        
        this.products.set('Умные часы Watch 8', {
            price: 350,
            description: 'Стильные умные часы с мониторингом здоровья',
            image: '⌚',
            oldPrice: 350
        });
    }
    
    // Инициализация обработчиков событий
    initEventListeners() {
        document.getElementById('startTimerBtn').addEventListener('click', () => this.startTimer());
        document.getElementById('pauseTimerBtn').addEventListener('click', () => this.pauseTimer());
        document.getElementById('resetTimerBtn').addEventListener('click', () => this.resetTimer());
        
        document.getElementById('productSelect').addEventListener('change', () => this.updatePromoBlock());
        document.getElementById('discountSelect').addEventListener('change', () => this.updatePromoBlock());
    }
    
    // Обновление промо-блока
    updatePromoBlock() {
        const productName = document.getElementById('productSelect').value;
        const discount = parseInt(document.getElementById('discountSelect').value);
        const product = this.products.get(productName);
        
        if (product) {
            const newPrice = product.oldPrice * (1 - discount / 100);
            
            document.getElementById('promoTitle').textContent = productName;
            document.getElementById('promoDiscount').textContent = `-${discount}%`;
            document.getElementById('promoImage').textContent = product.image;
            document.getElementById('promoDescription').textContent = product.description;
            document.getElementById('oldPrice').textContent = `${product.oldPrice}$`;
            document.getElementById('newPrice').textContent = `${Math.round(newPrice)}$`;
        }
    }
    
    // Запуск таймера
    startTimer() {
        if (this.isRunning) return;
        
        const promoTime = parseInt(document.getElementById('promoTime').value);
        const intervalTime = parseInt(document.getElementById('intervalTime').value);
        
        this.totalTime = promoTime;
        this.remainingTime = promoTime;
        this.isRunning = true;
        this.isPaused = false;
        
        // Очищаем предыдущие timeout'ы
        this.clearAllTimeouts();
        
        // Обновление UI
        this.updateButtonStates();
        document.getElementById('statusDisplay').textContent = 'Акция активна';
        document.getElementById('statusDisplay').className = 'info-value status-running';
        this.updateTimeDisplay();
        
        // Сохраняем в историю
        const productName = document.getElementById('productSelect').value;
        const discount = document.getElementById('discountSelect').value;
        this.history.add(`${new Date().toLocaleTimeString()}: ${productName} -${discount}%`);
        this.renderCollections();
        
        // Основной таймер (setInterval)
        this.timerInterval = setInterval(() => {
            if (!this.isPaused && this.remainingTime > 0) {
                this.remainingTime--;
                this.updateTimeDisplay();
                this.updateProgressBar();
                
                if (this.remainingTime <= 0) {
                    this.completeTimer();
                }
            }
        }, 1000);
        
        // Запускаем показ оставшегося времени
        this.startTimeDisplay(intervalTime);
    }
    
    // Запуск отображения оставшегося времени
    startTimeDisplay(intervalTime) {
        const showRemainingTime = () => {
            if (this.remainingTime <= 0) return;
            
            this.showCurrentTime();
            
            if (this.remainingTime > 0 && this.isRunning && !this.isPaused) {
                const timeoutId = setTimeout(showRemainingTime, intervalTime * 1000);
                this.timeoutIds.push(timeoutId);
            }
        };
        
        const firstTimeoutId = setTimeout(showRemainingTime, intervalTime * 1000);
        this.timeoutIds.push(firstTimeoutId);
    }
    
    // Отображение текущего оставшегося времени
    showCurrentTime() {
        const container = document.getElementById('numbersContainer');
        
        const timeElement = document.createElement('div');
        timeElement.className = 'time-display';
        timeElement.textContent = this.remainingTime;
        
        const colors = ['#ff6b6b', '#fbbf24', '#4ade80', '#60a5fa', '#c4b5fd', '#f472b6'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        timeElement.style.color = randomColor;
        
        container.innerHTML = '';
        container.appendChild(timeElement);
        
        document.getElementById('currentNumberDisplay').textContent = this.remainingTime;
        
        timeElement.style.animation = 'none';
        timeElement.offsetHeight;
        timeElement.style.animation = 'pulse 0.5s ease-in-out';
        
        setTimeout(() => {
            if (container.contains(timeElement)) {
                timeElement.remove();
            }
        }, 800);
    }
    
    // Пауза/возобновление
    pauseTimer() {
        if (!this.isRunning) return;
        
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            document.getElementById('statusDisplay').textContent = 'Акция на паузе';
            document.getElementById('statusDisplay').className = 'info-value status-paused';
            document.getElementById('pauseTimerBtn').textContent = '▶ Возобновить';
            this.clearAllTimeouts();
        } else {
            document.getElementById('statusDisplay').textContent = 'Акция активна';
            document.getElementById('statusDisplay').className = 'info-value status-running';
            document.getElementById('pauseTimerBtn').textContent = '⏸ Пауза';
            
            const intervalTime = parseInt(document.getElementById('intervalTime').value);
            this.startTimeDisplay(intervalTime);
        }
    }
    
    // Очистка всех setTimeout
    clearAllTimeouts() {
        this.timeoutIds.forEach(id => clearTimeout(id));
        this.timeoutIds = [];
    }
    
    // Сброс таймера
    resetTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        this.clearAllTimeouts();
        
        this.isRunning = false;
        this.isPaused = false;
        this.remainingTime = 0;
        
        this.updateButtonStates();
        document.getElementById('statusDisplay').textContent = 'Ожидание запуска';
        document.getElementById('statusDisplay').className = 'info-value status-waiting';
        document.getElementById('timeDisplay').textContent = '--:--';
        document.getElementById('currentNumberDisplay').textContent = '—';
        document.getElementById('numbersContainer').innerHTML = '';
        document.getElementById('progressBar').style.width = '100%';
    }
    
    // Завершение таймера
    completeTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        this.clearAllTimeouts();
        this.isRunning = false;
        
        this.showCompletionMessage();
        
        document.getElementById('statusDisplay').textContent = 'Акция завершена';
        document.getElementById('statusDisplay').className = 'info-value';
        document.getElementById('timeDisplay').textContent = '00:00';
        
        const container = document.getElementById('numbersContainer');
        container.innerHTML = '<div class="time-display" style="color: #f472b6; font-size: 5rem;">0</div>';
        document.getElementById('currentNumberDisplay').textContent = '0';
        
        this.updateButtonStates();
        
        this.history.add(`${new Date().toLocaleTimeString()}: Акция завершена`);
        this.renderCollections();
    }
    
    // Обновление отображения времени
    updateTimeDisplay() {
        const minutes = Math.floor(this.remainingTime / 60);
        const seconds = this.remainingTime % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('timeDisplay').textContent = timeString;
    }
    
    // Обновление прогресс-бара
    updateProgressBar() {
        const percentage = (this.remainingTime / this.totalTime) * 100;
        document.getElementById('progressBar').style.width = `${percentage}%`;
    }
    
    // Обновление состояния кнопок
    updateButtonStates() {
        document.getElementById('startTimerBtn').disabled = this.isRunning;
        document.getElementById('pauseTimerBtn').disabled = !this.isRunning;
        document.getElementById('resetTimerBtn').disabled = !this.isRunning;
    }
    
    // Отображение коллекций
    renderCollections() {
        const productsDisplay = document.getElementById('productsMapDisplay');
        let productsHtml = '';
        this.products.forEach((value, key) => {
            productsHtml += `<div class="collection-item">📌 ${key}: ${value.price}$ - ${value.description}</div>`;
        });
        productsDisplay.innerHTML = productsHtml || '<div class="collection-item">Нет данных</div>';
        
        const historyDisplay = document.getElementById('historySetDisplay');
        let historyHtml = '';
        this.history.forEach(item => {
            historyHtml += `<div class="collection-item">📝 ${item}</div>`;
        });
        historyDisplay.innerHTML = historyHtml || '<div class="collection-item">История пуста</div>';
    }
    
    // Показать сообщение о завершении
    showCompletionMessage() {
        const message = document.createElement('div');
        message.className = 'completion-message';
        message.innerHTML = `
            <div class="message-content">
                <h2>⏰ Время акции истекло!</h2>
                <p>Осталось 0 секунд. Спешите, следующие акции уже скоро!</p>
                <button onclick="this.parentElement.parentElement.remove()">OK</button>
            </div>
        `;
        
        message.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            animation: fadeIn 0.5s ease;
        `;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            if (message.parentNode) {
                message.remove();
            }
        }, 5000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new PromoTimer();
    window.promoTimer = app;
    app.updatePromoBlock();
});