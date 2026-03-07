const http = require('http');
const fs = require('fs');
const path = require('path');

class CityProcessor {
    constructor() {
        this.originalCities = [
            "москва", "ПАРИЖ", "лондон", "НЬЮ-ЙОРК", "токио",
            "берлин", "РИМ", "мадрид", "ВЕНА", "афины",
            "АМСТЕРДАМ", "прага", "БРЮССЕЛЬ", "даблин", "ОСЛО",
            "стокгольм", "ХЕЛЬСИНКИ", "копенгаген", "ЛИССАБОН", "варшава"
        ];
        this.processedCities = [];
    }

    capitalizeFirstLetter(city) {
        if (!city) return city;
        return city.toLowerCase().charAt(0).toUpperCase() + city.toLowerCase().slice(1);
    }

    processCities() {
        this.processedCities = this.originalCities.map(city => this.capitalizeFirstLetter(city));
        this.processedCities.sort((a, b) => a.localeCompare(b));
        return this.processedCities;
    }

    arrayToTable(arr, title) {
        let table = '<div class="table-container">';
        table += `<h3>${title}</h3>`;
        table += '<table class="city-table">';
        table += '<thead><tr><th>№</th><th>Название города</th></tr></thead>';
        table += '<tbody>';
        
        arr.forEach((city, index) => {
            table += '<tr>';
            table += `<td>${index + 1}</td>`;
            table += `<td>${city}</td>`;
            table += '</tr>';
        });
        
        table += '</tbody>';
        table += '</table>';
        table += '</div>';
        return table;
    }
}

const server = http.createServer((req, res) => {
    console.log(`Запрос: ${req.url}`);

    const cityProcessor = new CityProcessor();
    
    let filePath = '';
    let contentType = 'text/html';

    if (req.url === '/api/cities') {
        const original = cityProcessor.originalCities;
        const processed = cityProcessor.processCities();
        
        const data = {
            original: original,
            processed: processed
        };
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
        return;
    }

    if (req.url === '/' || req.url === '/index.html') {
        filePath = path.join(__dirname, 'html', 'index.html');
    } else if (req.url === '/result.html') {
        filePath = path.join(__dirname, 'html', 'result.html');
    } else if (req.url.startsWith('/css/')) {
        filePath = path.join(__dirname, req.url);
        contentType = 'text/css';
    } else if (req.url.startsWith('/js/')) {
        filePath = path.join(__dirname, req.url);
        contentType = 'application/javascript';
    } else if (req.url.startsWith('/resource/')) {
        filePath = path.join(__dirname, req.url);
        const ext = path.extname(filePath).toLowerCase();
        if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
        else if (ext === '.png') contentType = 'image/png';
        else if (ext === '.gif') contentType = 'image/gif';
    } else {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>404 - Страница не найдена</h1>');
        return;
    }

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end('<h1>404 - Файл не найден</h1>');
            } else {
                res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end('<h1>500 - Внутренняя ошибка сервера</h1>');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
    console.log(`Открой браузер и перейди по адресу: http://localhost:${PORT}/`);
});