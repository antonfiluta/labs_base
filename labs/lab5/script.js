class CarObject {
    constructor() {
        this.cars = [];
        this.nextId = 1;
        this.dynamicProperties = {};
    }
    
    init() {
        this.loadFromStorage();
        this.renderTable();
        this.updateSelect();
        this.displayNewProperty();
    }
    
    loadFromStorage() {
        const saved = localStorage.getItem('cars_lab5');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.cars = data.cars || [];
                this.dynamicProperties = data.dynamicProperties || {};
                this.nextId = data.nextId || this.getNextIdFromCars();
            } catch (e) {
                console.error('Error loading data:', e);
                this.cars = [];
                this.dynamicProperties = {};
                this.nextId = 1;
            }
        }
    }
    
    getNextIdFromCars() {
        if (this.cars.length === 0) return 1;
        return Math.max(...this.cars.map(c => c.id)) + 1;
    }
    
    saveToStorage() {
        localStorage.setItem('cars_lab5', JSON.stringify({
            cars: this.cars,
            dynamicProperties: this.dynamicProperties,
            nextId: this.nextId
        }));
    }
    
    addCar(carData) {
        const newCar = {
            id: this.nextId++,
            ...carData
        };
        
        this.cars.push(newCar);
        this.saveToStorage();
        this.renderTable();
        this.updateSelect();
        this.showNotification('Автомобиль добавлен!', 'success');
        
        return newCar;
    }
    
    deleteCar(id) {
        const index = this.cars.findIndex(car => car.id === id);
        if (index !== -1) {
            const deleted = this.cars[index];
            this.cars.splice(index, 1);
            this.saveToStorage();
            this.renderTable();
            this.updateSelect();
            this.showNotification(`Автомобиль ${deleted.brand} ${deleted.model} удален`, 'success');
            return true;
        }
        this.showNotification('Запись не найдена', 'error');
        return false;
    }
    
    clearForm() {
        document.getElementById('carForm').reset();
        this.showNotification('Форма очищена', 'info');
    }
    
    filterByFuelType(fuelType) {
        if (!fuelType) {
            this.showNotification('Выберите тип топлива', 'error');
            return [];
        }
        
        const filtered = this.cars.filter(car => 
            car.fuelType?.toLowerCase() === fuelType.toLowerCase()
        );
        
        this.displayFilterResult(filtered, fuelType);
        return filtered;
    }
    
    addNewProperty(propName, propValue, carId) {
        if (!propName || !propValue) {
            this.showNotification('Введите название и значение свойства', 'error');
            return false;
        }
        
        if (!carId) {
            this.showNotification('Выберите автомобиль для добавления свойства', 'error');
            return false;
        }
        
        const car = this.cars.find(c => c.id === carId);
        if (!car) {
            this.showNotification('Автомобиль не найден', 'error');
            return false;
        }
        
        car[propName] = propValue;
        
        if (!this.dynamicProperties[propName]) {
            this.dynamicProperties[propName] = true;
        }
        
        this.saveToStorage();
        this.renderTable();
        this.updateTableHeaders();
        this.displayNewProperty();
        this.showNotification(`Свойство "${propName}" добавлено к автомобилю ${car.brand} ${car.model}`, 'success');
        
        return true;
    }
    
    updateTableHeaders() {
        const thead = document.querySelector('#carsTable thead tr');
        if (!thead) return;
        
        let headers = ['ID', 'Марка', 'Модель', 'Год', 'Цвет', 'Цена ($)', 'Тип топлива'];
        
        if (Object.keys(this.dynamicProperties).length > 0) {
            headers = headers.concat(Object.keys(this.dynamicProperties));
        }
        
        thead.innerHTML = headers.map(h => `<th>${h}</th>`).join('');
    }
    
    displayFilterResult(cars, fuelType) {
        const resultDiv = document.getElementById('filterResult');
        
        if (cars.length === 0) {
            resultDiv.innerHTML = `🚫 Нет автомобилей с типом топлива "${fuelType}"`;
            return;
        }
        
        const carList = cars.map(car => 
            `• ${car.brand} ${car.model} (${car.year}) - ${car.color || '-'}, $${car.price?.toLocaleString()}`
        ).join('<br>');
        
        resultDiv.innerHTML = `
            <strong>Найдено ${cars.length} автомобилей с топливом "${fuelType}":</strong><br>
            ${carList}
        `;
    }
    
    displayNewProperty() {
        const displayDiv = document.getElementById('newPropertyDisplay');
        
        if (!this.dynamicProperties || Object.keys(this.dynamicProperties).length === 0) {
            displayDiv.innerHTML = '✨ Новые свойства не добавлены';
            return;
        }
        
        const props = Object.keys(this.dynamicProperties)
            .map(key => `<span class="property-tag">${key}</span>`)
            .join(' ');
        
        displayDiv.innerHTML = `📌 Доступные свойства в таблице: ${props}`;
    }
    
    updateSelect() {
        const select = document.getElementById('recordSelect');
        if (!select) return;
        
        select.innerHTML = '<option value="">-- Выберите ID --</option>';
        
        this.cars.forEach(car => {
            const option = document.createElement('option');
            option.value = car.id;
            option.textContent = `ID: ${car.id} - ${car.brand} ${car.model} (${car.year})`;
            select.appendChild(option);
        });
    }
    
    renderTable() {
        const tbody = document.getElementById('tableBody');
        if (!tbody) return;
        
        if (this.cars.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-table">Нет данных. Добавьте первую запись!</td></tr>';
            return;
        }
        
        this.updateTableHeaders();
        
        const dynamicKeys = Object.keys(this.dynamicProperties);
        
        tbody.innerHTML = this.cars.map(car => {
            let cells = [
                car.id,
                this.escapeHtml(car.brand),
                this.escapeHtml(car.model),
                car.year,
                this.escapeHtml(car.color || '-'),
                `$${car.price?.toLocaleString() || '-'}`,
                this.escapeHtml(car.fuelType || '-')
            ];
            
            dynamicKeys.forEach(key => {
                cells.push(this.escapeHtml(car[key] || '-'));
            });
            
            return `<tr>${cells.map(cell => `<td>${cell}</td>`).join('')}</tr>`;
        }).join('');
    }
    
    getFormData() {
        return {
            brand: document.getElementById('brand')?.value.trim() || '',
            model: document.getElementById('model')?.value.trim() || '',
            year: parseInt(document.getElementById('year')?.value) || 0,
            color: document.getElementById('color')?.value.trim() || null,
            price: parseInt(document.getElementById('price')?.value) || 0,
            fuelType: document.getElementById('fuelType')?.value || ''
        };
    }
    
    validateForm(data) {
        if (!data.brand) {
            this.showNotification('Введите марку автомобиля', 'error');
            return false;
        }
        if (!data.model) {
            this.showNotification('Введите модель автомобиля', 'error');
            return false;
        }
        if (data.year < 1900 || data.year > 2026) {
            this.showNotification('Год должен быть между 1900 и 2026', 'error');
            return false;
        }
        if (!data.price || data.price < 1000) {
            this.showNotification('Цена должна быть больше 1000$', 'error');
            return false;
        }
        return true;
    }
    
    escapeHtml(text) {
        if (text === undefined || text === null) return '';
        const div = document.createElement('div');
        div.textContent = String(text);
        return div.innerHTML;
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new CarObject();
    
    app.init();
    
    window.CarApp = app;
    
    const carForm = document.getElementById('carForm');
    if (carForm) {
        carForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = app.getFormData();
            
            if (app.validateForm(formData)) {
                app.addCar(formData);
                e.target.reset();
            }
        });
    }
    
    const clearFormBtn = document.getElementById('clearFormBtn');
    if (clearFormBtn) {
        clearFormBtn.addEventListener('click', () => {
            app.clearForm();
        });
    }
    
    const deleteBtn = document.getElementById('deleteBtn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            const select = document.getElementById('recordSelect');
            const id = parseInt(select?.value);
            
            if (id) {
                if (confirm('Удалить эту запись?')) {
                    app.deleteCar(id);
                }
            } else {
                app.showNotification('Выберите ID записи', 'error');
            }
        });
    }
    
    const filterBtn = document.getElementById('filterByFuelBtn');
    if (filterBtn) {
        filterBtn.addEventListener('click', () => {
            const fuelType = document.getElementById('fuelFilterSelect')?.value;
            app.filterByFuelType(fuelType);
        });
    }
    
    const addPropertyBtn = document.getElementById('addPropertyBtn');
    if (addPropertyBtn) {
        addPropertyBtn.addEventListener('click', () => {
            const propName = document.getElementById('newPropertyName')?.value.trim();
            const propValue = document.getElementById('newPropertyValue')?.value.trim();
            const select = document.getElementById('recordSelect');
            const carId = parseInt(select?.value);
            
            if (app.addNewProperty(propName, propValue, carId)) {
                document.getElementById('newPropertyName').value = '';
                document.getElementById('newPropertyValue').value = '';
            }
        });
    }
});