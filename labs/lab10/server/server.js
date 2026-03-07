const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3006;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const DATA_DIR = path.join(__dirname, 'data');
const ORIGINAL_FILE = path.join(DATA_DIR, 'original.txt');
const PROCESSED_FILE = path.join(DATA_DIR, 'processed.txt');

async function ensureDataDir() {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
}

const citiesWithErrors = [
    'мосКва',
    'санкт-петербург',
    'нОвосибирск',
    'екатеринбург',
    'казаНЬ',
    'челябинск',
    'омск',
    'самара',
    'ростов-на-дону',
    'уФа',
    'красноярск',
    'пермь',
    'воронеж',
    'волгоград',
    'краснодар',
    'саратов',
    'тюмень',
    'тольятти',
    'ижевск',
    'барнаул',
    'ульяновск',
    'иркутск',
    'хабаровск',
    'ярославль',
    'владивосток'
];

function capitalizeFirstLetter(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function processCities(cities) {
    return cities
        .map(city => capitalizeFirstLetter(city.trim()))
        .filter(city => city.length > 0)
        .sort((a, b) => a.localeCompare(b, 'ru'));
}

app.post('/api/init', async (req, res) => {
    try {
        await ensureDataDir();
        
        await fs.writeFile(ORIGINAL_FILE, citiesWithErrors.join('\n'), 'utf8');
        
        const processed = processCities(citiesWithErrors);
        
        await fs.writeFile(PROCESSED_FILE, processed.join('\n'), 'utf8');
        
        res.json({
            success: true,
            message: 'Data initialized successfully',
            original: citiesWithErrors,
            processed: processed
        });
    } catch (error) {
        console.error('Init error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to initialize data' 
        });
    }
});

app.get('/api/original', async (req, res) => {
    try {
        const data = await fs.readFile(ORIGINAL_FILE, 'utf8');
        const cities = data.split('\n').filter(line => line.trim() !== '');
        
        res.json({
            success: true,
            data: cities
        });
    } catch (error) {
        console.error('Read original error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to read original data' 
        });
    }
});

app.get('/api/processed', async (req, res) => {
    try {
        const data = await fs.readFile(PROCESSED_FILE, 'utf8');
        const cities = data.split('\n').filter(line => line.trim() !== '');
        
        res.json({
            success: true,
            data: cities
        });
    } catch (error) {
        console.error('Read processed error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to read processed data' 
        });
    }
});

app.post('/api/process', async (req, res) => {
    try {
        const { cities } = req.body;
        
        if (!cities || !Array.isArray(cities)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid data format' 
            });
        }
        
        const processed = processCities(cities);
        
        await fs.writeFile(ORIGINAL_FILE, cities.join('\n'), 'utf8');
        await fs.writeFile(PROCESSED_FILE, processed.join('\n'), 'utf8');
        
        res.json({
            success: true,
            original: cities,
            processed: processed
        });
    } catch (error) {
        console.error('Process error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to process data' 
        });
    }
});

app.post('/api/save', async (req, res) => {
    try {
        const { text } = req.body;
        
        if (!text) {
            return res.status(400).json({ 
                success: false, 
                error: 'No text provided' 
            });
        }
        
        const lines = text.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);
        
        await fs.writeFile(ORIGINAL_FILE, lines.join('\n'), 'utf8');
        
        const processed = processCities(lines);
        await fs.writeFile(PROCESSED_FILE, processed.join('\n'), 'utf8');
        
        res.json({
            success: true,
            original: lines,
            processed: processed
        });
    } catch (error) {
        console.error('Save error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to save data' 
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📁 Data directory: ${DATA_DIR}`);
    
    ensureDataDir().then(async () => {
        try {
            await fs.access(ORIGINAL_FILE);
            console.log('📄 Data files already exist');
        } catch {
            // Если нет - создаем
            await fs.writeFile(ORIGINAL_FILE, citiesWithErrors.join('\n'), 'utf8');
            const processed = processCities(citiesWithErrors);
            await fs.writeFile(PROCESSED_FILE, processed.join('\n'), 'utf8');
            console.log('✅ Initial data created');
        }
    }).catch(console.error);
});