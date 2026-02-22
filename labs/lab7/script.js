class BlockManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.blocks = [];
        
        this.init();
    }
    
    init() {
        this.createBlock(0, {
            width: '300px',
            height: '250px',
            top: '20px',
            left: '20px',
            bgColor: '#743ee4',
            border: '1px solid white',
            title: 'Блок 1',
            image: '📱',
            text: 'Демонстрационный блок'
        });
        
        this.createBlock(1, {
            width: '300px',
            height: '250px',
            top: '20px',
            left: '350px',
            bgColor: '#e43e3e',
            border: '2px solid #743ee4',
            title: 'Блок 2',
            image: '💻',
            text: 'Еще один демо-блок'
        });
        
        this.updateInfo();
    }
    
    createBlock(index, settings) {
        let block = this.blocks[index];
        
        if (!block) {
            block = document.createElement('div');
            block.className = 'custom-block';
            block.dataset.index = index;
            this.container.appendChild(block);
            this.blocks[index] = block;
        }
        
        block.style.width = settings.width || '300px';
        block.style.height = settings.height || '250px';
        block.style.top = settings.top || '20px';
        block.style.left = settings.left || '20px';
        block.style.backgroundColor = settings.bgColor || '#743ee4';
        block.style.border = settings.border || '1px solid white';
        
        block.innerHTML = `
            <div class="block-header">
                <h3 class="block-title">${settings.title || 'Блок ' + (index + 1)}</h3>
                <span>#${index + 1}</span>
            </div>
            <div class="block-image">${settings.image || '📦'}</div>
            <p class="block-text">${settings.text || 'Настраиваемый блок'}</p>
            <div class="block-footer">ID: ${index} | ${new Date().toLocaleTimeString()}</div>
        `;
        
        return block;
    }
    
    getSettingsFromForm() {
        return {
            width: document.getElementById('widthSelect').value,
            height: document.getElementById('heightSelect').value,
            top: document.getElementById('topSelect').value,
            left: document.getElementById('leftSelect').value,
            bgColor: document.getElementById('bgColorSelect').value,
            border: document.getElementById('borderSelect').value,
            title: document.getElementById('titleSelect').value,
            image: document.getElementById('imageSelect').value,
            text: document.getElementById('textSelect').value
        };
    }
    
    createBlockUpdater(index) {
        return function(settings) {
            this.createBlock(index, settings);
            this.showNotification(`Блок ${index + 1} обновлен через bind()`, 'success');
        }.bind(this);
    }

    updateBlockWithCall(index, settings) {
        this.createBlock.call(this, index, settings);
        this.showNotification(`Блок ${index + 1} обновлен через call()`, 'success');
    }
    
    updateAllBlocksWithApply(settings) {
        const blockIndices = [0, 1, 2];
        
        blockIndices.forEach(index => {
            this.createBlock.apply(this, [index, settings]);
        });
        
        this.showNotification('Все блоки обновлены через apply()', 'success');
    }
    
    updateInfo() {
        const infoDiv = document.getElementById('blocksInfo');
        if (!infoDiv) return;
        
        const activeBlocks = this.blocks.filter(b => b !== undefined).length;
        
        let html = `<div class="info-item">📊 Всего блоков: ${activeBlocks}</div>`;
        
        this.blocks.forEach((block, index) => {
            if (block) {
                const rect = block.getBoundingClientRect();
                html += `
                    <div class="info-item">
                        <strong>Блок ${index + 1}</strong> | 
                        Размер: ${Math.round(rect.width)}x${Math.round(rect.height)}px |
                        Позиция: (${Math.round(rect.left)}, ${Math.round(rect.top)}) |
                        Заголовок: ${block.querySelector('.block-title')?.textContent || 'Нет'}
                    </div>
                `;
            }
        });
        
        infoDiv.innerHTML = html;
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
    const blockManager = new BlockManager('blocksContainer');
    
    window.blockManager = blockManager;
    
    document.getElementById('createBlockBtn').addEventListener('click', () => {
        const index = parseInt(document.getElementById('blockSelector').value);
        const settings = blockManager.getSettingsFromForm();
        
        blockManager.createBlock(index, settings);
        blockManager.updateInfo();
    });
    
    // можно потом вызвать без указания индекса + к нему уже привязан this через bind
    const updateBlock0 = blockManager.createBlockUpdater(0);
    const updateBlock1 = blockManager.createBlockUpdater(1);
    const updateBlock2 = blockManager.createBlockUpdater(2);
    
    document.getElementById('bindNewStyleBtn').addEventListener('click', () => {
        const index = parseInt(document.getElementById('blockSelector').value);
        const settings = blockManager.getSettingsFromForm();
        
        const boundUpdate = blockManager.createBlock.bind(blockManager, index, settings);
        
        boundUpdate();
        blockManager.updateInfo();
    });
    
    document.getElementById('callToSelectedBtn').addEventListener('click', () => {
        const index = parseInt(document.getElementById('blockSelector').value);
        const settings = blockManager.getSettingsFromForm();
        
        blockManager.updateBlockWithCall(index, settings);
        blockManager.updateInfo();
    });
    
    document.getElementById('applyToAllBtn').addEventListener('click', () => {
        const settings = blockManager.getSettingsFromForm();
        
        blockManager.updateAllBlocksWithApply(settings);
        blockManager.updateInfo();
    });
    
    const updateInfo = () => blockManager.updateInfo();
    
    document.querySelectorAll('.control-select').forEach(select => {
        select.addEventListener('change', updateInfo);
    });
    
    function demonstrateClosure() {
        const blockNumber = 0;
        
        const showBlockInfo = function() {
            const block = blockManager.blocks[blockNumber];
            if (block) {
                const title = block.querySelector('.block-title').textContent;
                blockManager.showNotification(`Блок ${blockNumber + 1} имеет заголовок: ${title}`, 'success');
            }
        };
        
        setTimeout(showBlockInfo, 1000);
    }
    
    setTimeout(demonstrateClosure, 2000);
});