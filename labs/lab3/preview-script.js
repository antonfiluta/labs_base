const imageMap = {
    'space': {
        src: '../../assets/images/images/gallery/space.jpg',
        name: 'Космос',
        display: 'Космос'
    },
    'mountains': {
        src: '../../assets/images/images/gallery/mountains.jpg',
        name: 'Горы',
        display: 'Горы'
    },
    'sea': {
        src: '../../assets/images/images/gallery/sea.jpg',
        name: 'Море',
        display: 'Море'
    },
    'city': {
        src: '../../assets/images/images/gallery/city.jpg',
        name: 'Город',
        display: 'Город'
    },
    'forest': {
        src: '../../assets/images/images/gallery/forest.jpg',
        name: 'Лес',
        display: 'Лес'
    }
};

function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        caption: decodeURIComponent(params.get('caption') || 'Космический пейзаж'),
        width: params.get('width') || '400',
        border: decodeURIComponent(params.get('border') || '#743ee4'),
        opacity: params.get('opacity') || '1',
        image: params.get('image') || 'space'
    };
}

function getColorName(hex) {
    const colors = {
        '#743ee4': 'Фиолетовый',
        '#3b82f6': 'Синий',
        '#ec4899': 'Розовый',
        '#10b981': 'Зеленый',
        '#f59e0b': 'Оранжевый'
    };
    return colors[hex] || hex;
}

function displayParams(params) {
    const paramsList = document.getElementById('params-list');
    const imageInfo = imageMap[params.image] || imageMap['space'];
    
    const html = `
        <h3>📋 Выбранные параметры:</h3>
        <ul class="params-list">
            <li class="param-item">
                Надпись: <span>${params.caption}</span>
            </li>
            <li class="param-item">
                Ширина: <span>${params.width}px</span>
            </li>
            <li class="param-item">
                Цвет рамки: 
                <span>
                    ${getColorName(params.border)}
                    <span class="color-sample" style="background: ${params.border};"></span>
                </span>
            </li>
            <li class="param-item">
                Прозрачность: <span>${Math.round(parseFloat(params.opacity) * 100)}%</span>
            </li>
            <li class="param-item">
                Изображение: <span>${imageInfo.display}</span>
            </li>
        </ul>
    `;
    
    paramsList.innerHTML = html;
}

function displayImage(params) {
    const captionEl = document.getElementById('image-caption');
    const imageEl = document.getElementById('preview-image');
    const imageInfo = imageMap[params.image] || imageMap['space'];
    
    captionEl.textContent = params.caption;
    
    imageEl.src = imageInfo.src;
    imageEl.alt = imageInfo.name;
    imageEl.style.width = params.width + 'px';
    imageEl.style.border = `4px solid ${params.border}`;
    imageEl.style.opacity = params.opacity;
}

document.addEventListener('DOMContentLoaded', function() {
    try {
        const params = getUrlParams();
        displayImage(params);
        displayParams(params);
    } catch (error) {
        console.error('Error loading preview:', error);
        document.getElementById('preview-container').innerHTML = `
            <h1>❌ Ошибка</h1>
            <p class="error">Не удалось загрузить изображение</p>
            <div class="close-btn">
                <button class="glass-effect" onclick="window.close()">✕ Закрыть</button>
            </div>
        `;
    }
});