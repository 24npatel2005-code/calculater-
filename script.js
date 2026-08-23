class Calculator {
    constructor() {
        this.display = document.getElementById('display');
        this.expressionInfo = document.getElementById('expressionInfo');
        this.historyList = document.getElementById('historyList');
        this.clearHistoryBtn = document.getElementById('clearHistory');
        
        this.currentValue = '0';
        this.previousValue = '';
        this.operator = null;
        this.shouldResetDisplay = false;
        this.memory = 0;
        
        this.init();
    }

    init() {
        this.loadHistory();
        this.loadMemory();
        this.attachEventListeners();
        this.updateDisplay();
    }

    attachEventListeners() {
        // Number buttons
        document.querySelectorAll('.number-btn').forEach(btn => {
            btn.addEventListener('click', () => this.handleNumber(btn.dataset.number));
        });

        // Operator buttons
        document.querySelectorAll('.operator-btn').forEach(btn => {
            btn.addEventListener('click', () => this.handleOperator(btn.dataset.operator));
        });

        // Function buttons
        document.querySelectorAll('.function-btn').forEach(btn => {
            btn.addEventListener('click', () => this.handleFunction(btn.dataset.action));
        });

        // Equals button
        document.querySelector('.equals-btn').addEventListener('click', () => this.handleEquals());

        // Memory buttons
        document.getElementById('mc').addEventListener('click', () => this.memoryClear());
        document.getElementById('mr').addEventListener('click', () => this.memoryRecall());
        document.getElementById('mplus').addEventListener('click', () => this.memoryAdd());
        document.getElementById('mminus').addEventListener('click', () => this.memorySubtract());

        // History
        this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());

        // Keyboard support
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    handleNumber(number) {
        if (this.shouldResetDisplay) {
            this.currentValue = number;
            this.shouldResetDisplay = false;
        } else {
            if (this.currentValue === '0' && number !== '.') {
                this.currentValue = number;
            } else if (number === '.' && this.currentValue.includes('.')) {
                return;
            } else {
                this.currentValue += number;
            }
        }
        this.updateDisplay();
    }

    handleOperator(op) {
        if (this.operator !== null && !this.shouldResetDisplay) {
            this.calculateResult();
        }
        this.previousValue = this.currentValue;
        this.operator = op;
        this.shouldResetDisplay = true;
        this.updateDisplay();
    }

    handleFunction(action) {
        switch (action) {
            case 'clear':
                this.clear();
                break;
            case 'delete':
                this.delete();
                break;
            case 'toggle':
                this.toggleSign();
                break;
            case 'percent':
                this.percent();
                break;
        }
        this.updateDisplay();
    }

    handleEquals() {
        if (this.operator && !this.shouldResetDisplay) {
            this.calculateResult();
            this.addToHistory(`${this.previousValue} ${this.getOperatorSymbol(this.operator)} ${this.currentValue}`, this.currentValue);
            this.operator = null;
            this.previousValue = '';
            this.shouldResetDisplay = true;
        }
        this.updateDisplay();
    }

    calculateResult() {
        let result;
        const prev = parseFloat(this.previousValue);
        const current = parseFloat(this.currentValue);

        if (isNaN(prev) || isNaN(current)) return;

        switch (this.operator) {
            case '+':
                result = prev + current;
                break;
            case '-':
                result = prev - current;
                break;
            case '*':
                result = prev * current;
                break;
            case '/':
                result = current === 0 ? 0 : prev / current;
                break;
            default:
                return;
        }

        this.currentValue = this.formatResult(result);
    }

    formatResult(num) {
        if (num === 0) return '0';
        if (!isFinite(num)) return 'Error';
        return parseFloat(num.toPrecision(12)).toString();
    }

    clear() {
        this.currentValue = '0';
        this.previousValue = '';
        this.operator = null;
        this.shouldResetDisplay = false;
    }

    delete() {
        if (this.currentValue.length > 1) {
            this.currentValue = this.currentValue.slice(0, -1);
        } else {
            this.currentValue = '0';
        }
    }

    toggleSign() {
        const num = parseFloat(this.currentValue);
        this.currentValue = (num * -1).toString();
    }

    percent() {
        const num = parseFloat(this.currentValue);
        this.currentValue = (num / 100).toString();
    }

    updateDisplay() {
        this.display.value = this.currentValue;
        
        if (this.operator) {
            this.expressionInfo.textContent = `${this.previousValue} ${this.getOperatorSymbol(this.operator)}`;
        } else {
            this.expressionInfo.textContent = '';
        }
    }

    getOperatorSymbol(op) {
        const symbols = {
            '+': '+',
            '-': '−',
            '*': '×',
            '/': '÷'
        };
        return symbols[op] || op;
    }

    handleKeyboard(e) {
        if (e.key >= '0' && e.key <= '9') {
            this.handleNumber(e.key);
        } else if (e.key === '.') {
            this.handleNumber('.');
        } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
            this.handleOperator(e.key);
        } else if (e.key === 'Enter' || e.key === '=') {
            e.preventDefault();
            this.handleEquals();
        } else if (e.key === 'Backspace') {
            e.preventDefault();
            this.delete();
            this.updateDisplay();
        } else if (e.key === 'Escape') {
            this.clear();
            this.updateDisplay();
        }
    }

    memoryClear() {
        this.memory = 0;
        this.saveMemory();
    }

    memoryRecall() {
        this.currentValue = this.memory.toString();
        this.shouldResetDisplay = true;
        this.updateDisplay();
    }

    memoryAdd() {
        this.memory += parseFloat(this.currentValue);
        this.saveMemory();
        this.shouldResetDisplay = true;
    }

    memorySubtract() {
        this.memory -= parseFloat(this.currentValue);
        this.saveMemory();
        this.shouldResetDisplay = true;
    }

    saveMemory() {
        localStorage.setItem('calculatorMemory', this.memory.toString());
        this.updateMemoryDisplay();
    }

    loadMemory() {
        const saved = localStorage.getItem('calculatorMemory');
        if (saved) {
            this.memory = parseFloat(saved);
        }
        this.updateMemoryDisplay();
    }

    updateMemoryDisplay() {
        const mcBtn = document.getElementById('mc');
        const mrBtn = document.getElementById('mr');
        
        if (this.memory !== 0) {
            mcBtn.classList.add('has-memory');
            mrBtn.classList.add('has-memory');
        } else {
            mcBtn.classList.remove('has-memory');
            mrBtn.classList.remove('has-memory');
        }
    }

    addToHistory(expression, result) {
        let history = JSON.parse(localStorage.getItem('calculatorHistory')) || [];
        
        history.unshift({
            expression: expression,
            result: result,
            timestamp: new Date().toLocaleTimeString()
        });

        history = history.slice(0, 50);
        
        localStorage.setItem('calculatorHistory', JSON.stringify(history));
        this.renderHistory();
    }

    loadHistory() {
        this.renderHistory();
    }

    renderHistory() {
        const history = JSON.parse(localStorage.getItem('calculatorHistory')) || [];
        this.historyList.innerHTML = '';

        history.forEach((item, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div>
                    <div class="history-item-expression">${this.escapeHtml(item.expression)}</div>
                    <div class="history-item-result">= ${this.escapeHtml(item.result)}</div>
                </div>
                <div style="font-size: 11px; color: #999;">${item.timestamp}</div>
            `;
            
            historyItem.addEventListener('click', () => {
                this.currentValue = item.result;
                this.shouldResetDisplay = true;
                this.updateDisplay();
            });

            this.historyList.appendChild(historyItem);
        });
    }

    clearHistory() {
        if (confirm('Are you sure you want to clear all history?')) {
            localStorage.removeItem('calculatorHistory');
            this.renderHistory();
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Calculator();
});