

// Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard
    initializeDashboard();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load initial data
    loadDashboardData();
    
    // Start real-time updates
    startRealTimeUpdates();
});

// Dashboard state
let dashboardState = {
    vms: [],
    storage: [],
    networks: [],
    alerts: [],
    metrics: {}
};

// Initialize dashboard components
function initializeDashboard() {
    // Mobile navigation toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
                
                // Update active nav link
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                
                // Close mobile menu
                document.querySelector('.nav-menu')?.classList.remove('active');
            }
        });
    });
    
    // Initialize charts
    initializeCharts();
}

// Set up event listeners
function setupEventListeners() {
    // VM search functionality
    const vmSearch = document.getElementById('vmSearch');
    if (vmSearch) {
        vmSearch.addEventListener('input', filterVMs);
    }
    
    // VM status filter
    const vmStatusFilter = document.getElementById('vmStatusFilter');
    if (vmStatusFilter) {
        vmStatusFilter.addEventListener('change', filterVMs);
    }
    
    // Quick action buttons
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', handleQuickAction);
    });
    
    // VM action buttons
    document.querySelectorAll('.btn-icon').forEach(btn => {
        btn.addEventListener('click', handleVMAction);
    });
}

// Load dashboard data
function loadDashboardData() {
    // Simulate API calls
    setTimeout(() => {
        dashboardState = {
            vms: [
                {
                    id: 1,
                    name: 'web-server-01',
                    type: 'c5.xlarge',
                    status: 'running',
                    ip: '203.192.12.45',
                    cpu: 4,
                    ram: 8,
                    uptime: '15d 4h',
                    icon: 'fas fa-server'
                },
                {
                    id: 2,
                    name: 'db-cluster-01',
                    type: 'r5.2xlarge',
                    status: 'running',
                    ip: '203.192.12.46',
                    cpu: 8,
                    ram: 64,
                    uptime: '30d 12h',
                    icon: 'fas fa-database'
                },
                {
                    id: 3,
                    name: 'app-server-02',
                    type: 't3.medium',
                    status: 'stopped',
                    ip: '-',
                    cpu: 2,
                    ram: 4,
                    uptime: '-',
                    icon: 'fas fa-cog'
                },
                {
                    id: 4,
                    name: 'cache-redis-01',
                    type: 't3.small',
                    status: 'running',
                    ip: '203.192.12.47',
                    cpu: 2,
                    ram: 2,
                    uptime: '7d 8h',
                    icon: 'fas fa-memory'
                },
                {
                    id: 5,
                    name: 'monitoring-01',
                    type: 't3.micro',
                    status: 'running',
                    ip: '203.192.12.48',
                    cpu: 1,
                    ram: 1,
                    uptime: '45d 12h',
                    icon: 'fas fa-chart-line'
                }
            ],
            storage: [
                { name: 'vol-web-01', size: 100, used: 75, type: 'SSD', attached: 'web-server-01' },
                { name: 'vol-db-01', size: 500, used: 320, type: 'SSD', attached: 'db-cluster-01' },
                { name: 'vol-backup-01', size: 1000, used: 650, type: 'HDD', attached: 'backup-server' }
            ],
            networks: [
                { name: 'prod-vpc', cidr: '10.0.0.0/16', subnets: 12, instances: 45 },
                { name: 'dev-vpc', cidr: '10.1.0.0/16', subnets: 8, instances: 23 }
            ],
            alerts: [
                {
                    type: 'critical',
                    title: 'High CPU Usage',
                    message: 'db-cluster-01 CPU usage at 95%',
                    time: '5 minutes ago'
                },
                {
                    type: 'warning',
                    title: 'Disk Space Low',
                    message: 'vol-web-01 has only 10% free space',
                    time: '30 minutes ago'
                }
            ],
            metrics: {
                cpu: 68,
                memory: 72,
                network: 1.2,
                cost: 3974.60
            }
        };
        
        updateDashboard();
    }, 1000);
}

// Update dashboard with loaded data
function updateDashboard() {
    updateVMTable();
    updateMetrics();
    updateAlerts();
}

// Update VM table
function updateVMTable() {
    const tbody = document.querySelector('#vmTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    dashboardState.vms.forEach(vm => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="vm-info">
                    <i class="${vm.icon}"></i>
                    <span>${vm.name}</span>
                </div>
            </td>
            <td>${vm.type}</td>
            <td><span class="status-badge status-${vm.status}">${vm.status}</span></td>
            <td>${vm.ip}</td>
            <td>${vm.cpu} vCPU / ${vm.ram}GB</td>
            <td>${vm.uptime}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" title="Start" onclick="startVM(${vm.id})">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="btn-icon" title="Stop" onclick="stopVM(${vm.id})">
                        <i class="fas fa-stop"></i>
                    </button>
                    <button class="btn-icon" title="Restart" onclick="restartVM(${vm.id})">
                        <i class="fas fa-redo"></i>
                    </button>
                    <button class="btn-icon" title="Delete" onclick="deleteVM(${vm.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Filter VMs based on search and status
function filterVMs() {
    const searchTerm = document.getElementById('vmSearch')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('vmStatusFilter')?.value || 'all';
    
    const filteredVMs = dashboardState.vms.filter(vm => {
        const matchesSearch = vm.name.toLowerCase().includes(searchTerm) || 
                             vm.type.toLowerCase().includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || vm.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });
    
    updateFilteredVMTable(filteredVMs);
}

// Update VM table with filtered results
function updateFilteredVMTable(vms) {
    const tbody = document.querySelector('#vmTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    vms.forEach(vm => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="vm-info">
                    <i class="${vm.icon}"></i>
                    <span>${vm.name}</span>
                </div>
            </td>
            <td>${vm.type}</td>
            <td><span class="status-badge status-${vm.status}">${vm.status}</span></td>
            <td>${vm.ip}</td>
            <td>${vm.cpu} vCPU / ${vm.ram}GB</td>
            <td>${vm.uptime}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" title="Start" onclick="startVM(${vm.id})">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="btn-icon" title="Stop" onclick="stopVM(${vm.id})">
                        <i class="fas fa-stop"></i>
                    </button>
                    <button class="btn-icon" title="Restart" onclick="restartVM(${vm.id})">
                        <i class="fas fa-redo"></i>
                    </button>
                    <button class="btn-icon" title="Delete" onclick="deleteVM(${vm.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Update metrics display
function updateMetrics() {
    // Update hero stats
    document.getElementById('total-vms').textContent = dashboardState.vms.length;
    document.getElementById('total-storage').textContent = '12.5 TB';
    document.getElementById('total-networks').textContent = dashboardState.networks.length;
    document.getElementById('security-score').textContent = '98%';
    
    // Update utilization metrics
    const cpuElement = document.querySelector('.metric-value');
    if (cpuElement) {
        cpuElement.textContent = dashboardState.metrics.cpu + '%';
    }
}

// Update alerts
function updateAlerts() {
    const alertList = document.querySelector('.alert-list');
    if (!alertList) return;
    
    alertList.innerHTML = '';
    
    dashboardState.alerts.forEach(alert => {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert ${alert.type}`;
        alertDiv.innerHTML = `
            <i class="fas fa-${alert.type === 'critical' ? 'times-circle' : 'exclamation-triangle'}"></i>
            <div>
                <h4>${alert.title}</h4>
                <p>${alert.message}</p>
                <small>${alert.time}</small>
            </div>
        `;
        alertList.appendChild(alertDiv);
    });
}

// Initialize charts
function initializeCharts() {
    // Cost chart placeholder
    const costChart = document.getElementById('costChart');
    if (costChart) {
        const ctx = costChart.getContext('2d');
        if (ctx) {
            // Simple line chart simulation
            ctx.strokeStyle = '#2563eb';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, 80);
            ctx.lineTo(50, 60);
            ctx.lineTo(100, 70);
            ctx.lineTo(150, 40);
            ctx.lineTo(200, 50);
            ctx.lineTo(250, 30);
            ctx.lineTo(300, 45);
            ctx.stroke();
        }
    }
}

// Handle quick actions
function handleQuickAction(event) {
    const action = event.target.textContent.trim();
    
    switch(action) {
        case 'Create VM':
            createVM();
            break;
        case 'Upload Image':
            uploadImage();
            break;
        case 'Backup Now':
            backupNow();
            break;
        case 'Emergency Stop':
            emergencyStop();
            break;
    }
}

// VM actions
function createVM() {
    alert('Create VM functionality would open a modal here');
}

function startVM(id) {
    const vm = dashboardState.vms.find(v => v.id === id);
    if (vm) {
        vm.status = 'running';
        updateVMTable();
        showNotification(`VM ${vm.name} started successfully`);
    }
}

function stopVM(id) {
    const vm = dashboardState.vms.find(v => v.id === id);
    if (vm) {
        vm.status = 'stopped';
        updateVMTable();
        showNotification(`VM ${vm.name} stopped successfully`);
    }
}

function restartVM(id) {
    const vm = dashboardState.vms.find(v => v.id === id);
    if (vm) {
        showNotification(`VM ${vm.name} restarted successfully`);
    }
}

function deleteVM(id) {
    const vm = dashboardState.vms.find(v => v.id === id);
    if (vm && confirm(`Are you sure you want to delete ${vm.name}?`)) {
        dashboardState.vms = dashboardState.vms.filter(v => v.id !== id);
        updateVMTable();
        showNotification(`VM ${vm.name} deleted successfully`);
    }
}

// Other actions
function uploadImage() {
    alert('Image upload functionality would open here');
}

function backupNow() {
    showNotification('Backup initiated successfully');
}

function emergencyStop() {
    if (confirm('Are you sure you want to perform an emergency stop? This will stop all running VMs.')) {
        dashboardState.vms.forEach(vm => {
            if (vm.status === 'running') {
                vm.status = 'stopped';
            }
        });
        updateVMTable();
        showNotification('Emergency stop executed');
    }
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 1rem 2rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Real-time updates simulation
function startRealTimeUpdates() {
    setInterval(() => {
        // Simulate real-time metric updates
        dashboardState.metrics.cpu = Math.floor(Math.random() * 30) + 50;
        dashboardState.metrics.memory = Math.floor(Math.random() * 20) + 60;
        
        // Update progress ring
        const progressCircle = document.querySelector('.progress-circle');
        if (progressCircle) {
            const offset = 314 - (314 * dashboardState.metrics.cpu / 100);
            progressCircle.style.strokeDashoffset = offset;
        }
        
        // Update progress text
        const progressText = document.querySelector('.progress-text');
        if (progressText) {
            progressText.textContent = dashboardState.metrics.cpu + '%';
        }
    }, 5000);
}

// CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Handle VMAction function
function handleVMAction(event) {
    const action = event.target.getAttribute('title');
    const row = event.target.closest('tr');
    const vmName = row.querySelector('.vm-info span').textContent;
    
    switch(action) {
        case 'Start':
            showNotification(`Starting ${vmName}...`);
            break;
        case 'Stop':
            showNotification(`Stopping ${vmName}...`);
            break;
        case 'Restart':
            showNotification(`Restarting ${vmName}...`);
            break;
        case 'Delete':
            if (confirm(`Are you sure you want to delete ${vmName}?`)) {
                showNotification(`Deleting ${vmName}...`);
            }
            break;
    }
}

// Export functions for global access
window.createVM = createVM;
window.startVM = startVM;
window.stopVM = stopVM;
window.restartVM = restartVM;
window.deleteVM = deleteVM;

