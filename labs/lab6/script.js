class CargoService {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        
        this.serviceLists = new Map();
        this.descriptions = new Map();
        
        this.initData();
    }
    
    initData() {
        this.serviceLists.set(0, [
            'Вывоз строительного мусора',
            'Доставка стройматериалов',
            'Аренда спецтехники',
            'Перевозка бетонных плит'
        ]);
        
        this.serviceLists.set(1, [
            'Офисный переезд',
            'Перевозка мебели',
            'Упаковка документов',
            'Монтаж оборудования'
        ]);
        
        this.serviceLists.set(2, [
            'Курьерская доставка',
            'Перевозка продуктов',
            'Доставка мебели',
            'Срочная доставка'
        ]);
        
        this.descriptions.set(0, [
            'Вывоз и утилизация строительных отходов',
        ]);
        
        this.descriptions.set(1, [
            'Полный комплекс услуг по переезду офиса',
        ]);
        
        this.descriptions.set(2, [
            'Быстрая и надежная доставка товаров',
        ]);
    }
    
    createListElement(items, listIndex) {
        const list = document.createElement('ul');
        list.className = 'service-list';
        list.dataset.listIndex = listIndex;
        
        items.forEach((item, index) => {
            const li = document.createElement('li');
            li.textContent = item;
            li.dataset.itemIndex = index;
            list.appendChild(li);
        });
        
        return list;
    }
    
    createDescriptionElements(descriptions, blockIndex) {
        const container = document.createElement('div');
        container.className = 'descriptions-container';
        container.dataset.blockIndex = blockIndex;
        
        descriptions.forEach((text, index) => {
            const p = document.createElement('p');
            p.className = 'service-description';
            p.textContent = text;
            p.dataset.descriptionIndex = index;
            container.appendChild(p);
        });
        
        return container;
    }
    
    createServiceCard(listIndex, title) {
        const card = document.createElement('div');
        card.className = 'service-card';
        card.dataset.cardIndex = listIndex;
        
        const titleElement = document.createElement('h4');
        titleElement.textContent = title;
        
        const list = this.createListElement(this.serviceLists.get(listIndex), listIndex);
        
        const descriptions = this.descriptions.get(listIndex) || [];
        const descContainer = this.createDescriptionElements(descriptions, listIndex);
        
        card.appendChild(titleElement);
        card.appendChild(list);
        card.appendChild(descContainer);
        
        return card;
    }
    
    render() {
        if (!this.container) return;
        
        this.container.innerHTML = '';
        
        const titles = ['Стройматериалы', 'Офисные переезды', 'Доставка товаров'];
        
        for (let i = 0; i < 3; i++) {
            if (this.serviceLists.has(i)) {
                const card = this.createServiceCard(i, titles[i]);
                this.container.appendChild(card);
            }
        }
    }
    
    getStats() {
        const totalDescriptions = Array.from(this.descriptions.values())
            .reduce((acc, desc) => acc + desc.length, 0);
        
        return {
            totalLists: this.serviceLists.size,
            totalItems: Array.from(this.serviceLists.values()).reduce((acc, list) => acc + list.length, 0),
            totalDescriptions: totalDescriptions
        };
    }
    
    updateStats() {
        const stats = this.getStats();
        const statsDisplay = document.getElementById('statsDisplay');
        
        if (statsDisplay) {
            statsDisplay.innerHTML = `
                <div class="stat-item">
                    <span class="stat-value">${stats.totalLists}</span>
                    <span class="stat-label">Списков услуг</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${stats.totalItems}</span>
                    <span class="stat-label">Всего услуг</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${stats.totalDescriptions}</span>
                    <span class="stat-label">Всего описаний</span>
                </div>
            `;
        }
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

class EditableCargoService extends CargoService {
    constructor(containerId) {
        super(containerId);
    }
    
    insertService(listIndex, serviceText, position = 'end') {
        if (!serviceText.trim()) {
            this.showNotification('Введите название услуги', 'error');
            return false;
        }
        
        if (!this.serviceLists.has(listIndex)) {
            this.showNotification('Список не найден', 'error');
            return false;
        }
        
        const list = this.serviceLists.get(listIndex);
        
        switch(position) {
            case 'begin':
                list.unshift(serviceText);
                break;
            case 'end':
                list.push(serviceText);
                break;
            case 'after1':
                list.splice(1, 0, serviceText);
                break;
            case 'after2':
                list.splice(2, 0, serviceText);
                break;
            case 'after3':
                list.splice(3, 0, serviceText);
                break;
            default:
                list.push(serviceText);
        }
        
        this.serviceLists.set(listIndex, list);
        this.render();
        this.updateStats();
        this.showNotification(`Услуга добавлена в список ${listIndex + 1}`, 'success');
        return true;
    }
    
    insertDescription(blockIndex, descriptionText, position = 'after') {
        if (!descriptionText.trim()) {
            this.showNotification('Введите описание', 'error');
            return false;
        }
        
        if (!this.descriptions.has(blockIndex)) {
            this.descriptions.set(blockIndex, []);
        }
        
        const descriptions = this.descriptions.get(blockIndex);
        
        switch(position) {
            case 'before':
                descriptions.unshift(descriptionText);
                break;
            case 'after':
                descriptions.push(descriptionText);
                break;
            case 'after1':
                descriptions.splice(1, 0, descriptionText);
                break;
            case 'after2':
                descriptions.splice(2, 0, descriptionText);
                break;
            default:
                descriptions.push(descriptionText);
        }
        
        this.descriptions.set(blockIndex, descriptions);
        this.render();
        this.updateStats();
        this.showNotification(`Описание добавлено в блок ${blockIndex + 1}`, 'success');
        return true;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const serviceApp = new EditableCargoService('servicesContainer');
    
    serviceApp.render();
    serviceApp.updateStats();
    
    window.serviceApp = serviceApp;
    
    const addServiceBtn = document.getElementById('addServiceBtn');
    if (addServiceBtn) {
        addServiceBtn.addEventListener('click', () => {
            const serviceText = document.getElementById('newServiceInput').value;
            const listIndex = parseInt(document.getElementById('serviceListSelect').value);
            const position = document.getElementById('servicePositionSelect').value;
            
            if (serviceApp.insertService(listIndex, serviceText, position)) {
                document.getElementById('newServiceInput').value = '';
            }
        });
    }
    
    const addDescriptionBtn = document.getElementById('addDescriptionBtn');
    if (addDescriptionBtn) {
        addDescriptionBtn.addEventListener('click', () => {
            const descriptionText = document.getElementById('newDescriptionInput').value;
            const blockIndex = parseInt(document.getElementById('descriptionBlockSelect').value);
            const position = document.getElementById('descriptionPositionSelect').value;
            
            if (serviceApp.insertDescription(blockIndex, descriptionText, position)) {
                document.getElementById('newDescriptionInput').value = '';
            }
        });
    }
    
    const inputs = document.querySelectorAll('.control-input');
    inputs.forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                if (input.id === 'newServiceInput') {
                    addServiceBtn.click();
                } else if (input.id === 'newDescriptionInput') {
                    addDescriptionBtn.click();
                }
            }
        });
    });
});