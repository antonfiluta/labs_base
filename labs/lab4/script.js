class SupermarketSurvey {
    constructor() {
        this.form = document.getElementById('surveyForm');
        this.STORAGE_KEY = 'supermarket_surveys';
        this.surveys = this.loadSurveys();
        this.init();
    }

    init() {
        this.loadSavedData();
        
        this.updateStatistics();
        
        this.displayRecentParticipants();
        
        this.attachEventListeners();
    }

    attachEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.form.addEventListener('reset', () => this.handleReset());
        
        const inputs = this.form.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.validateField(input));
        });

        const checkboxes = document.querySelectorAll('input[name="departments"]');
        checkboxes.forEach(cb => {
            cb.addEventListener('change', () => this.validateCheckboxes());
        });

        const radio = document.querySelectorAll('input[name="frequency"]');
        radio.forEach(cb => {
            cb.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.clearFieldError(document.querySelector('.radio-group'));
                }
            });
        });
    }

    loadSurveys() {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Error loading surveys:', e);
                return [];
            }
        }
        return [];
    }

    saveSurveys() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.surveys));
        this.updateStatistics();
        this.displayRecentParticipants();
    }

    collectFormData() {
        const fullName = document.getElementById('fullName').value.trim();
        const visitDate = document.getElementById('visitDate').value;
        const satisfaction = document.getElementById('satisfaction').value;
        const rating = document.getElementById('rating').value;
        
        const departments = [];
        document.querySelectorAll('input[name="departments"]:checked').forEach(cb => {
            departments.push(cb.value);
        });
        
        let frequency = '';
        document.querySelectorAll('input[name="frequency"]:checked').forEach(radio => {
            frequency = radio.value;
        });

        return {
            id: 'survey_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            formId: document.getElementById('formId').value,
            timestamp: new Date().toISOString(),
            personalInfo: {
                fullName: fullName || 'Anonymous',
                visitDate: visitDate || 'Not specified'
            },
            preferences: {
                departments: departments,
                frequency: frequency || 'not_specified',
                satisfaction: satisfaction || 'not_specified',
                rating: parseInt(rating) || 0
            }
        };
    }

    validateForm() {
        let isValid = true;
        
        this.clearAllErrors();

        const fullName = document.getElementById('fullName');
        if (!fullName.value.trim()) {
            this.showError(fullName, 'Name is required');
            isValid = false;
        } else if (fullName.value.trim().length < 2) {
            this.showError(fullName, 'Name must be at least 2 characters');
            isValid = false;
        }

        const visitDate = document.getElementById('visitDate');
        if (!visitDate.value) {
            this.showError(visitDate, 'Please select visit date and time');
            isValid = false;
        }

        const checkedDepartments = document.querySelectorAll('input[name="departments"]:checked');
        if (checkedDepartments.length === 0) {
            this.showCheckboxError('Please select at least one department');
            isValid = false;
        }

        const checkedFrequency = document.querySelectorAll('input[name="frequency"]:checked');
        if (checkedFrequency.length === 0) {
            this.showError(document.querySelector('.radio-group'), 'Please select shopping frequency');
            isValid = false;
        }

        const satisfaction = document.getElementById('satisfaction');
        if (!satisfaction.value) {
            this.showError(satisfaction, 'Please select satisfaction level');
            isValid = false;
        }

        const rating = document.getElementById('rating');
        const ratingValue = parseInt(rating.value);
        if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 10) {
            this.showError(rating, 'Rating must be between 1 and 10');
            isValid = false;
        }

        return isValid;
    }

    validateField(field) {
        this.clearFieldError(field);
        
        if (field.required && !field.value.trim()) {
            this.showError(field, 'This field is required');
            return false;
        }
        
        if (field.id === 'fullName' && field.value.length < 2 && field.value.length > 0) {
            this.showError(field, 'Name must be at least 2 characters');
            return false;
        }
        
        if (field.id === 'rating') {
            const val = parseInt(field.value);
            if (isNaN(val) || val < 1 || val > 10) {
                this.showError(field, 'Rating must be 1-10');
                return false;
            }
        }
        
        return true;
    }

    validateCheckboxes() {
        const checkboxGroup = document.querySelector('.checkbox-group');
        const errorElement = checkboxGroup.parentNode.querySelector('.checkbox-error');
        if (errorElement) errorElement.remove();
        
        const checked = document.querySelectorAll('input[name="departments"]:checked');
        if (checked.length === 0) {
            this.showCheckboxError('Please select at least one department');
            return false;
        }
        return true;
    }

    showError(field, message) {
        field.classList.add('error-field');
        
        let errorDiv = field.parentNode.querySelector('.error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            field.parentNode.appendChild(errorDiv);
        }
        errorDiv.textContent = message;
        
        field.style.animation = 'shake 0.3s ease';
        setTimeout(() => {
            field.style.animation = '';
        }, 300);
    }

    showCheckboxError(message) {
        const checkboxGroup = document.querySelector('.checkbox-group');
        let errorDiv = checkboxGroup.parentNode.querySelector('.checkbox-error');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message checkbox-error';
            checkboxGroup.parentNode.appendChild(errorDiv);
        }
        errorDiv.textContent = message;
    }

    clearFieldError(field) {
        field.classList.remove('error-field');
        const errorDiv = field.parentNode.querySelector('.error-message');
        if (errorDiv) errorDiv.remove();
    }

    clearAllErrors() {
        document.querySelectorAll('.error-field').forEach(f => f.classList.remove('error-field'));
        document.querySelectorAll('.error-message, .checkbox-error').forEach(e => e.remove());
    }

    handleSubmit(e) {
        e.preventDefault();
        
        if (!this.validateForm()) {
            return;
        }
        
        if (!confirm("Отправить форму?")) {
            return
        }
        
        const formData = this.collectFormData();
        this.surveys.push(formData);
        this.saveSurveys();
    
        this.form.reset();

        this.openResultsWindow();
    }

    handleReset() {
        this.clearAllErrors();
    }

    updateStatistics() {
        const totalSurveys = this.surveys.length;
        document.getElementById('totalSurveys').textContent = totalSurveys;
        
        if (totalSurveys > 0) {
            const avgRating = this.surveys.reduce((sum, s) => sum + (s.preferences.rating || 0), 0) / totalSurveys;
            document.getElementById('avgRating').textContent = avgRating.toFixed(1);
        } else {
            document.getElementById('avgRating').textContent = '0.0';
        }
        
        const today = new Date().toDateString();
        const todayVisitors = this.surveys.filter(s => {
            const surveyDate = new Date(s.timestamp).toDateString();
            return surveyDate === today;
        }).length;
        document.getElementById('todayVisitors').textContent = todayVisitors;
        
        this.updateMostPopularDepartment();
    }

    updateMostPopularDepartment() {
        const deptCount = {
            grocery: 0,
            electronics: 0,
            clothing: 0,
            home: 0
        };
        
        this.surveys.forEach(survey => {
            survey.preferences.departments.forEach(dept => {
                deptCount[dept]++;
            });
        });
        
        let mostPopular = 'Grocery';
        let maxCount = 0;
        
        for (const [dept, count] of Object.entries(deptCount)) {
            if (count > maxCount) {
                maxCount = count;
                mostPopular = dept;
            }
        }
        
        document.getElementById('mostPopular').textContent = mostPopular;
    }

    displayRecentParticipants() {
        const container = document.getElementById('recentParticipants');
        
        if (this.surveys.length === 0) {
            container.innerHTML = '<div class="participant-placeholder">No surveys yet</div>';
            return;
        }
        
        const recent = [...this.surveys].reverse().slice(0, 5);
        
        container.innerHTML = recent.map(survey => {
            const name = survey.personalInfo.fullName || 'Anonymous';
            const rating = survey.preferences.rating || 0;
            const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
            
            return `
                <div class="participant-item">
                    <div class="participant-avatar">${initials}</div>
                    <div class="participant-info">
                        <div class="participant-name">${name}</div>
                        <div class="participant-rating">
                            ${'⭐'.repeat(Math.floor(rating/2))} ${rating}/10
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    loadSavedData() {
        if (this.surveys.length > 0) {
            const last = this.surveys[this.surveys.length - 1];
            console.log('Last survey:', last);
        }
    }

    openResultsWindow() {
        const width = 800;
        const height = 600;
        const left = (screen.width - width) / 2;
        const top = (screen.height - height) / 2;
        
        const features = [
            `width=${width}`,
            `height=${height}`,
            `left=${left}`,
            `top=${top}`,
            'resizable=yes',
            'scrollbars=yes',
            'status=yes'
        ].join(',');
        
        window.open(
            'results.html', 
            'SurveyResults', 
            features
        );
    }
}


document.addEventListener('DOMContentLoaded', () => {
    window.surveyApp = new SupermarketSurvey();
});