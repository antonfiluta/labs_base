class SurveyResults {
    constructor() {
        this.STORAGE_KEY = 'supermarket_surveys';
        this.surveys = [];
        this.currentSurvey = null;
        this.init();
    }

    init() {
        this.loadData();
        
        if (this.surveys.length > 0) {
            this.displayCurrentSurvey();
            this.displayTable();
            this.displayParticipantsSelect();
            this.displayStats();
        } else {
            this.showNoData();
        }
        
        window.surveyResults = this;
    }

    loadData() {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
            try {
                this.surveys = JSON.parse(saved);
                this.currentSurvey = this.surveys[this.surveys.length - 1];
            } catch (e) {
                console.error('Error loading surveys:', e);
                this.surveys = [];
            }
        }
        
        console.log('Loaded surveys:', this.surveys);
    }

    displayCurrentSurvey() {
        const container = document.getElementById('currentSurvey');
        
        if (!this.currentSurvey) {
            container.innerHTML = '<div class="empty-state">No current survey data</div>';
            return;
        }

        const survey = this.currentSurvey;
        const departments = survey.preferences.departments || [];
        
        const visitDate = survey.personalInfo.visitDate !== 'Not specified' 
            ? new Date(survey.personalInfo.visitDate).toLocaleString() 
            : 'Not specified';
        
        const submissionDate = new Date(survey.timestamp).toLocaleString();

        const departmentsHtml = departments.length > 0 
            ? departments.map(d => `<span class="department-tag">${d}</span>`).join('')
            : '<span class="empty-value">None selected</span>';

        container.innerHTML = `
            <div class="survey-detail-grid">
                <div class="detail-item">
                    <span class="detail-label">Name</span>
                    <span class="detail-value">${this.escapeHtml(survey.personalInfo.fullName)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Visit Date</span>
                    <span class="detail-value">${this.escapeHtml(visitDate)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Submission Time</span>
                    <span class="detail-value">${this.escapeHtml(submissionDate)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Frequency</span>
                    <span class="detail-value">${this.escapeHtml(survey.preferences.frequency)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Satisfaction</span>
                    <span class="detail-value">${this.escapeHtml(survey.preferences.satisfaction)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Rating</span>
                    <span class="detail-value">${survey.preferences.rating}/10</span>
                </div>
                <div class="detail-item" style="grid-column: span 2;">
                    <span class="detail-label">Departments Visited</span>
                    <div class="detail-value departments">
                        ${departmentsHtml}
                    </div>
                </div>
            </div>
        `;
    }

    displayTable() {
        const tbody = document.getElementById('tableBody');
        
        if (this.surveys.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-value">No data available</td></tr>';
            return;
        }

        tbody.innerHTML = this.surveys.map((survey, index) => {
            const departments = survey.preferences.departments || [];
            const deptString = departments.length > 0 
                ? departments.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')
                : 'None';
            
            const visitDate = survey.personalInfo.visitDate !== 'Not specified'
                ? new Date(survey.personalInfo.visitDate).toLocaleDateString()
                : 'N/A';

            return `
                <tr>
                    <td>${index + 1}</td>
                    <td>${this.escapeHtml(survey.personalInfo.fullName)}</td>
                    <td>${this.escapeHtml(visitDate)}</td>
                    <td>${this.escapeHtml(deptString)}</td>
                    <td>${this.escapeHtml(survey.preferences.frequency)}</td>
                    <td>${this.escapeHtml(survey.preferences.satisfaction)}</td>
                    <td>${survey.preferences.rating}/10</td>
                </tr>
            `;
        }).join('');
    }

    displayParticipantsSelect() {
        const select = document.getElementById('participantsSelect');
        
        if (this.surveys.length === 0) {
            select.innerHTML = '<option>No participants yet</option>';
            return;
        }

        const grouped = {};
        
        this.surveys.forEach(survey => {
            const name = survey.personalInfo.fullName || 'Anonymous';
            const firstLetter = name.charAt(0).toUpperCase();
            
            if (!grouped[firstLetter]) {
                grouped[firstLetter] = [];
            }
            
            grouped[firstLetter].push({
                name: name,
                rating: survey.preferences.rating,
                date: new Date(survey.timestamp).toLocaleDateString()
            });
        });

        const sortedLetters = Object.keys(grouped).sort();

        select.innerHTML = sortedLetters.map(letter => {
            const options = grouped[letter]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(p => 
                    `<option value="${this.escapeHtml(p.name)}">
                        ${this.escapeHtml(p.name)} (Rating: ${p.rating}/10, ${p.date})
                    </option>`
                ).join('');
            
            return `<optgroup label="${letter}">${options}</optgroup>`;
        }).join('');

        select.addEventListener('change', (e) => {
            this.highlightParticipant(e.target.value);
        });
    }

    displayStats() {
        const statsGrid = document.getElementById('statsGrid');
        
        if (this.surveys.length === 0) {
            statsGrid.innerHTML = '<div class="empty-value">No statistics available</div>';
            return;
        }

        const total = this.surveys.length;
        
        const avgRating = (this.surveys.reduce((sum, s) => sum + (s.preferences.rating || 0), 0) / total).toFixed(1);
        
        const deptCount = {};
        this.surveys.forEach(s => {
            (s.preferences.departments || []).forEach(d => {
                deptCount[d] = (deptCount[d] || 0) + 1;
            });
        });
        
        let mostPopular = 'None';
        let maxCount = 0;
        for (const [dept, count] of Object.entries(deptCount)) {
            if (count > maxCount) {
                maxCount = count;
                mostPopular = dept;
            }
        }

        const freqCount = {};
        this.surveys.forEach(s => {
            const freq = s.preferences.frequency;
            freqCount[freq] = (freqCount[freq] || 0) + 1;
        });
        
        let mostFrequent = 'None';
        let maxFreq = 0;
        for (const [freq, count] of Object.entries(freqCount)) {
            if (count > maxFreq && freq !== 'not_specified') {
                maxFreq = count;
                mostFrequent = freq;
            }
        }

        statsGrid.innerHTML = `
            <div class="stat-card">
                <span class="stat-value">${total}</span>
                <span class="stat-label">Total Surveys</span>
            </div>
            <div class="stat-card">
                <span class="stat-value">${avgRating}</span>
                <span class="stat-label">Avg Rating</span>
            </div>
            <div class="stat-card">
                <span class="stat-value">${mostPopular}</span>
                <span class="stat-label">Most Popular</span>
            </div>
            <div class="stat-card">
                <span class="stat-value">${mostFrequent}</span>
                <span class="stat-label">Most Frequent</span>
            </div>
        `;
    }

    highlightParticipant(name) {
        const rows = document.querySelectorAll('#tableBody tr');
        rows.forEach(row => {
            const rowName = row.cells[1]?.textContent;
            if (rowName === name) {
                row.style.background = 'rgba(116, 62, 228, 0.3)';
                row.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                row.style.background = '';
            }
        });
    }

    printResults() {
        window.print();
    }

    showNoData() {
        const container = document.querySelector('.results-container');
        container.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 3rem;">
                <h2>No Survey Data</h2>
                <p style="color: #a78bfa; margin: 1rem 0;">Please complete a survey first.</p>
                <button class="btn btn-primary" onclick="window.close()">Close Window</button>
            </div>
        `;
    }

    escapeHtml(text) {
        if (!text) return 'N/A';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SurveyResults();
});