// SCCIPC智能车实验室财务管理系统 - v2.0.0
console.log('🚗 SCCIPC财务管理系统 v2.0.0 开始加载...');

// 应用配置
const APP_CONFIG = {
    version: '2.0.0',
    name: 'SCCIPC智能车实验室财务管理系统',
    recordsPerPage: 10,
    storageKey: 'sccipc_lab_finance_records',
    autoSaveDelay: 1000, // 自动保存延迟（毫秒）
    searchDebounceDelay: 300, // 搜索防抖延迟
    animationDuration: 300 // 动画持续时间
};

// 兼容性变量（为了向后兼容）
let records = [];
let filteredRecords = [];
let currentPage = 1;
let currentEditId = null;
const recordsPerPage = 10;
let selectedIds = new Set();
let isBatchDeleting = false;

// 全局状态管理
const AppState = {
    records: [],
    filteredRecords: [],
    currentPage: 1,
    currentEditId: null,
    sortColumn: '',
    sortDirection: 'asc',
    selectedIds: new Set(),
    isLoading: false,
    lastSaved: null,
    
    // 状态更新方法
    updateRecords(newRecords) {
        this.records = newRecords;
        this.filteredRecords = [...newRecords];
        this.selectedIds.clear();
        this.currentPage = 1;
    },
    
    updateFilteredRecords(filtered) {
        this.filteredRecords = filtered;
        this.currentPage = 1;
        this.selectedIds.clear();
    },
    
    setLoading(loading) {
        this.isLoading = loading;
        this.updateLoadingUI();
    },
    
    updateLoadingUI() {
        const loadingElements = document.querySelectorAll('.loading-indicator');
        loadingElements.forEach(el => {
            el.style.display = this.isLoading ? 'block' : 'none';
        });
    }
};

// 性能监控
const PerformanceMonitor = {
    startTime: Date.now(),
    
    mark(label) {
        console.log(`⏱️ ${label}: ${Date.now() - this.startTime}ms`);
    },
    
    measureFunction(fn, label) {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        console.log(`📊 ${label}: ${(end - start).toFixed(2)}ms`);
        return result;
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 DOM加载完成，开始初始化应用...');
    PerformanceMonitor.mark('DOM Ready');
    initializeApp();
});

// 应用初始化
async function initializeApp() {
    try {
        console.log('🚀 开始初始化应用...');
        AppState.setLoading(true);
        
        // 初始化各个模块
        console.log('📊 加载数据...');
        loadRecords();
        
        console.log('📈 更新仪表板...');
        updateDashboard();
        
        console.log('📋 更新记录表格...');
        updateRecordTable();
        
        console.log('🔗 绑定事件监听器...');
        bindEventListeners();
        
        // 初始化描述输入历史功能
        console.log('📝 初始化描述输入历史...');
        initDescriptionHistory();
        
        // 初始化PWA功能
        console.log('📱 初始化PWA功能...');
        initializePWA();
        
        // 检查URL参数
        handleURLParams();
        
        AppState.setLoading(false);
        console.log('✅ 应用初始化成功');
        
        // 显示欢迎提示（仅首次访问）
        showWelcomeMessage();
        
    } catch (error) {
        console.error('❌ 初始化失败:', error);
        showErrorMessage('应用初始化失败，请刷新页面重试');
        AppState.setLoading(false);
    }
}

// PWA功能初始化
function initializePWA() {
    // 注册Service Worker（如果需要）
    if ('serviceWorker' in navigator) {
        // 暂时不注册，避免缓存问题
        console.log('🔧 Service Worker支持已检测到');
    }
    
    // 监听安装提示
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        showInstallPrompt(deferredPrompt);
    });
    
    // 监听应用安装
    window.addEventListener('appinstalled', () => {
        console.log('📱 应用已安装到设备');
        showNotification('应用已成功安装到您的设备！', 'success');
    });
}

// 处理URL参数
function handleURLParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    
    switch (action) {
        case 'add':
            setTimeout(() => showAddRecordModal(), 500);
            break;
        case 'export':
            setTimeout(() => showDataManagement(), 500);
            break;
        default:
            break;
    }
}

// 显示启动画面（简化版本）
function showSplashScreen() {
    console.log('🎬 启动画面已禁用，直接进入应用');
    // 不再显示启动画面，直接返回
    return;
}

// 隐藏启动画面（简化版本）
function hideSplashScreen() {
    console.log('🎬 启动画面隐藏完成');
    // 不需要隐藏，因为没有显示
    return;
}

// 显示欢迎消息
function showWelcomeMessage() {
    const isFirstVisit = !localStorage.getItem(APP_CONFIG.storageKey + '_visited');
    if (isFirstVisit) {
        localStorage.setItem(APP_CONFIG.storageKey + '_visited', 'true');
        setTimeout(() => {
            showNotification('欢迎使用SCCIPC财务管理系统！点击右上角"新增记录"开始记账。', 'info', 5000);
        }, 1000);
    }
}

// 显示安装提示
function showInstallPrompt(deferredPrompt) {
    const installBanner = document.createElement('div');
    installBanner.className = 'install-banner';
    installBanner.innerHTML = `
        <div class="install-content">
            <i class="fa-solid fa-download"></i>
            <span>安装应用到桌面，获得更好的使用体验</span>
            <button class="btn btn-sm btn-primary" onclick="installApp()">安装</button>
            <button class="btn btn-sm btn-outline" onclick="dismissInstall()">稍后</button>
        </div>
    `;
    
    document.body.appendChild(installBanner);
    
    // 保存提示对象供后续使用
    window.deferredPrompt = deferredPrompt;
}

// 安装应用
function installApp() {
    if (window.deferredPrompt) {
        window.deferredPrompt.prompt();
        window.deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('用户接受了安装提示');
            }
            window.deferredPrompt = null;
            dismissInstall();
        });
    }
}

// 关闭安装提示
function dismissInstall() {
    const banner = document.querySelector('.install-banner');
    if (banner) {
        banner.remove();
    }
}

// 通知系统
const NotificationSystem = {
    container: null,
    
    init() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'notification-container';
            this.container.className = 'notification-container';
            document.body.appendChild(this.container);
        }
    },
    
    show(message, type = 'info', duration = 3000) {
        this.init();
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icon = this.getIcon(type);
        notification.innerHTML = `
            <div class="notification-content">
                <i class="${icon}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fa-solid fa-times"></i>
            </button>
        `;
        
        this.container.appendChild(notification);
        
        // 自动移除
        if (duration > 0) {
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.style.animation = 'slideOutRight 0.3s ease forwards';
                    setTimeout(() => notification.remove(), 300);
                }
            }, duration);
        }
        
        return notification;
    },
    
    getIcon(type) {
        const icons = {
            success: 'fa-solid fa-check-circle',
            error: 'fa-solid fa-exclamation-circle',
            warning: 'fa-solid fa-exclamation-triangle',
            info: 'fa-solid fa-info-circle'
        };
        return icons[type] || icons.info;
    }
};

// 全局通知函数
function showNotification(message, type = 'info', duration = 3000) {
    return NotificationSystem.show(message, type, duration);
}

function showErrorMessage(message) {
    return showNotification(message, 'error', 5000);
}

function showSuccessMessage(message) {
    return showNotification(message, 'success', 3000);
}

// 加载记录数据
function loadRecords() {
    try {
        AppState.setLoading(true);
        
        // 尝试从当前键读取；若无数据，自动从旧版本键迁移
        const legacyKeys = ['sccipc_records', 'sccipc_finance_records'];
        let savedRaw = localStorage.getItem(APP_CONFIG.storageKey);
        if (!savedRaw) {
            for (const k of legacyKeys) {
                const v = localStorage.getItem(k);
                if (v) {
                    savedRaw = v;
                    // 迁移至新键（忽略可能的存储异常）
                    try { localStorage.setItem(APP_CONFIG.storageKey, v); } catch (e) { console.warn('迁移主数据失败:', e); }
                    const last = localStorage.getItem(k + '_lastSaved');
                    try { localStorage.setItem(APP_CONFIG.storageKey + '_lastSaved', last || new Date().toISOString()); } catch (e) {}
                    try { localStorage.setItem(APP_CONFIG.storageKey + '_version', APP_CONFIG.version); } catch (e) {}
                    console.log('📦 已从旧键迁移数据:', k, '->', APP_CONFIG.storageKey);
                    break;
                }
            }
        }
        if (savedRaw) {
            const parsed = JSON.parse(savedRaw);
            const validRecords = ensureUniqueRecordIds(Array.isArray(parsed) ? parsed : []);
            AppState.updateRecords(validRecords);
            // 同步到全局变量
            records = [...AppState.records];
            filteredRecords = [...AppState.records];
            console.log('📊 加载了', AppState.records.length, '条记录');
        } else {
            const sampleData = ensureUniqueRecordIds(createSampleData());
            AppState.updateRecords(sampleData);
            // 同步到全局变量
            records = [...AppState.records];
            filteredRecords = [...AppState.records];
            saveRecords();
            console.log('🎯 创建了示例数据');
        }
        
        // 更新最后加载时间
        AppState.lastLoaded = new Date().toISOString();
        
    } catch (error) {
        console.error('❌ 加载记录失败:', error);
        showErrorMessage('数据加载失败，已创建示例数据');
        
        const fallbackData = ensureUniqueRecordIds(createSampleData());
        AppState.updateRecords(fallbackData);
        saveRecords();
    } finally {
        AppState.setLoading(false);
    }
}

// 保存记录数据（带重试机制）
function saveRecords(retryCount = 0) {
    const maxRetries = 3;
    
    try {
        // 同步数据：确保AppState.records和全局records一致
        // 优先使用records数组（包括空数组的情况，因为可能是删除操作的结果）
        if (records !== undefined && Array.isArray(records)) {
            AppState.records = [...records];
        } else if (AppState.records && AppState.records.length > 0) {
            records = [...AppState.records];
        }
        
        // 检查localStorage是否可用
        if (typeof(Storage) === "undefined") {
            console.warn('⚠️ 浏览器不支持localStorage，数据将无法持久化');
            return;
        }
        
        // 使用实际有数据的数组
        const dataToSave = AppState.records.length > 0 ? AppState.records : records;
        
        // 检查存储空间
        const dataSize = JSON.stringify(dataToSave).length;
        if (dataSize > 5 * 1024 * 1024) { // 5MB限制
            throw new Error('数据量过大，超出存储限制');
        }
        
        localStorage.setItem(APP_CONFIG.storageKey, JSON.stringify(dataToSave));
        localStorage.setItem(APP_CONFIG.storageKey + '_lastSaved', new Date().toISOString());
        localStorage.setItem(APP_CONFIG.storageKey + '_version', APP_CONFIG.version);
        
        AppState.lastSaved = new Date().toISOString();
        console.log('💾 保存了', dataToSave.length, '条记录');
        
        // 更新存储信息显示（如果函数存在）
        if (typeof updateStorageInfo === 'function') {
            updateStorageInfo();
        }
        
    } catch (error) {
        console.error('❌ 保存记录失败:', error);
        
        if (retryCount < maxRetries) {
            console.log(`🔄 重试保存 (${retryCount + 1}/${maxRetries})`);
            setTimeout(() => saveRecords(retryCount + 1), 1000);
        } else {
            console.error('💥 保存失败，已达到最大重试次数');
            // 不再显示错误通知，只在控制台记录
            // showErrorMessage('数据保存失败，请检查存储空间或刷新页面重试');
        }
    }
}

// 自动保存功能
let autoSaveTimer = null;
function scheduleAutoSave() {
    if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
    }
    
    autoSaveTimer = setTimeout(() => {
        saveRecords();
    }, APP_CONFIG.autoSaveDelay);
}

/** 生成唯一ID（字符串） */
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/** 规范化：确保每条记录拥有唯一的字符串ID */
function ensureUniqueRecordIds(list) {
    try {
        const seen = new Set();
        return (Array.isArray(list) ? list : []).map(r => {
            let id = (r && r.id != null) ? String(r.id) : '';
            if (!id || seen.has(id)) {
                id = generateUniqueId();
            }
            seen.add(id);
            return { ...r, id };
        });
    } catch (e) {
        console.warn('ensureUniqueRecordIds 失败，返回原数据', e);
        return list;
    }
}

// 创建示例数据
function createSampleData() {
    const currentDate = new Date();
    const formatDate = (date) => date.toISOString().split('T')[0];
    
    return [
        {
            id: generateUniqueId(),
            date: formatDate(new Date(currentDate.getTime() - 15 * 24 * 60 * 60 * 1000)),
            type: 'expense',
            category: '实验器材',
            description: '购买传感器模块',
            amount: 299.00,
            invoiceAmount: 299.00,
            invoiceStatus: 'available',
            notes: '用于智能车项目开发',
            createTime: new Date(currentDate.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: generateUniqueId(),
            date: formatDate(new Date(currentDate.getTime() - 10 * 24 * 60 * 60 * 1000)),
            type: 'income',
            category: '项目资金',
            description: '智能车竞赛资助',
            amount: 5000.00,
            invoiceAmount: 0,
            invoiceStatus: 'none',
            notes: '学校提供的竞赛资金支持',
            createTime: new Date(currentDate.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: generateUniqueId(),
            date: formatDate(new Date(currentDate.getTime() - 5 * 24 * 60 * 60 * 1000)),
            type: 'expense',
            category: '维护费用',
            description: '实验室设备维护',
            amount: 800.00,
            invoiceAmount: 800.00,
            invoiceStatus: 'reimbursed',
            notes: '定期维护费用，已完成报销',
            createTime: new Date(currentDate.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: generateUniqueId(),
            date: formatDate(new Date(currentDate.getTime() - 3 * 24 * 60 * 60 * 1000)),
            type: 'order',
            category: '电子产品',
            description: '购买开发板和调试器',
            amount: 450.00,
            invoiceAmount: 450.00,
            invoiceStatus: 'issued',
            notes: '用于新项目开发，发票已开具',
            createTime: new Date(currentDate.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: generateUniqueId(),
            date: formatDate(new Date(currentDate.getTime() - 1 * 24 * 60 * 60 * 1000)),
            type: 'expense',
            category: '交通费',
            description: '参加技术交流会议',
            amount: 120.00,
            invoiceAmount: 120.00,
            invoiceStatus: 'available',
            notes: '前往北京参加智能车技术研讨会',
            createTime: new Date(currentDate.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: generateUniqueId(),
            date: formatDate(currentDate),
            type: 'income',
            category: '兼职收入',
            description: '技术咨询服务费',
            amount: 800.00,
            invoiceAmount: 0,
            invoiceStatus: 'none',
            notes: '为其他团队提供技术指导',
            createTime: currentDate.toISOString()
        }
    ];
}

// 数据验证和清理
function validateRecord(record) {
    const errors = [];
    
    if (!record.id) errors.push('缺少记录ID');
    if (!record.date) errors.push('缺少日期');
    if (!record.type || !['income', 'expense', 'order'].includes(record.type)) {
        errors.push('无效的记录类型');
    }
    if (!record.category) errors.push('缺少分类');
    if (!record.description) errors.push('缺少描述');
    if (typeof record.amount !== 'number' || record.amount <= 0) {
        errors.push('无效的金额');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

// 数据迁移和版本兼容
function migrateData(data, fromVersion = '1.0.0') {
    console.log(`🔄 数据迁移: ${fromVersion} -> ${APP_CONFIG.version}`);
    
    if (!Array.isArray(data)) {
        console.warn('⚠️ 数据格式不正确，使用默认数据');
        return createSampleData();
    }
    
    return data.map(record => {
        // 确保所有必需字段存在
        const migratedRecord = {
            id: record.id || generateUniqueId(),
            date: record.date || new Date().toISOString().split('T')[0],
            type: record.type || 'expense',
            category: record.category || '其他',
            description: record.description || '未知项目',
            amount: parseFloat(record.amount) || 0,
            invoiceAmount: parseFloat(record.invoiceAmount) || 0,
            invoiceStatus: record.invoiceStatus || 'none',
            notes: record.notes || '',
            createTime: record.createTime || new Date().toISOString()
        };
        
        // 验证迁移后的记录
        const validation = validateRecord(migratedRecord);
        if (!validation.isValid) {
            console.warn('⚠️ 记录验证失败:', validation.errors, record);
        }
        
        return migratedRecord;
    });
}

// ===== 主要按钮功能 =====

// 数据管理功能
function showDataManagement() {
    console.log('显示数据管理界面');
    const modal = document.getElementById('dataManagementModal');
    if (modal) {
        modal.style.display = 'block';
        updateStorageInfo();
    } else {
        console.error('未找到dataManagementModal');
    }
}

function closeDataManagementModal() {
    const modal = document.getElementById('dataManagementModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 导出数据功能
function exportData() {
    console.log('导出数据为CSV');
    exportToCSV();
}

function exportDataAsJSON() {
    console.log('导出数据为JSON');
    exportToJSON();
}

// 新增记录功能
function showAddRecordModal() {
    console.log('显示新增记录界面');
    currentEditId = null;
    const modal = document.getElementById('editModal');
    if (modal) {
        modal.style.display = 'block';
        document.getElementById('editModalTitle').textContent = '新增记录';
        resetEditForm();
        updateCategoryOptions();
        // 发票：新增记录默认无需发票且金额为0，并禁用输入框
        safeSetElementValue('editInvoiceStatus', 'none');
        safeSetElementValue('editInvoiceAmount', 0);
        if (typeof updateInvoiceAmountFieldState === 'function') { updateInvoiceAmountFieldState(); }
    } else {
        console.error('未找到editModal');
    }
}

function closeEditModal() {
    const modal = document.getElementById('editModal');
    if (modal) {
        modal.style.display = 'none';
        currentEditId = null;
    }
}

// ===== 标签页切换功能 =====

function switchTab(tabType) {
    console.log('切换标签页:', tabType);
    
    // 更新标签页样式
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.tab === tabType) {
            tab.classList.add('active');
        }
    });
    
    // 根据标签页类型筛选数据和显示相应界面
    const tableSection = document.querySelector('.table-section');
    const merchantGroupsSection = document.getElementById('merchantGroupsSection');
    
    if (tabType === 'merchant-groups') {
        // 显示商家分组界面
        tableSection.style.display = 'none';
        merchantGroupsSection.style.display = 'block';
        updateMerchantGroups();
    } else {
        // 显示普通表格界面
        tableSection.style.display = 'block';
        merchantGroupsSection.style.display = 'none';
        
        if (tabType === 'all') {
            filteredRecords = [...records];
        } else if (tabType === 'income') {
            filteredRecords = records.filter(r => r.type === 'income');
        } else if (tabType === 'expense') {
            filteredRecords = records.filter(r => r.type === 'expense');
        } else if (tabType === 'orders') {
            filteredRecords = records.filter(r => r.type === 'order' || (r.category && r.category.includes('订单')));
        }
        
        currentPage = 1;
        updateRecordTable();
    }
}

// ===== 筛选和搜索功能 =====

function filterRecords() {
    if (!Array.isArray(records)) {
        console.error('records不是数组，无法筛选');
        return;
    }
    
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('categoryFilter')?.value || '';
    const typeFilter = document.getElementById('typeFilter')?.value || '';
    const startDate = document.getElementById('startDate')?.value || '';
    const endDate = document.getElementById('endDate')?.value || '';
    
    filteredRecords = records.filter(record => {
        const matchesSearch = !searchTerm || 
            (record.description && record.description.toLowerCase().includes(searchTerm)) ||
            (record.category && record.category.toLowerCase().includes(searchTerm)) ||
            (record.notes && record.notes.toLowerCase().includes(searchTerm));
        
        const matchesCategory = !categoryFilter || record.category === categoryFilter;
        const matchesType = !typeFilter || record.type === typeFilter;
        
        const matchesDateRange = (!startDate || record.date >= startDate) &&
                                (!endDate || record.date <= endDate);
        
        return matchesSearch && matchesCategory && matchesType && matchesDateRange;
    });
    
    currentPage = 1;
    updateRecordTable();
}

function resetFilters() {
    // 重置所有筛选条件
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const typeFilter = document.getElementById('typeFilter');
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    
    if (searchInput) searchInput.value = '';
    if (categoryFilter) categoryFilter.value = '';
    if (typeFilter) typeFilter.value = '';
    if (startDate) startDate.value = '';
    if (endDate) endDate.value = '';
    
    // 重置到全部记录
    filteredRecords = [...records];
    currentPage = 1;
    
    // 重置标签页
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.tab === 'all') {
            tab.classList.add('active');
        }
    });
    
    updateRecordTable();
}

// ===== 表格操作功能 =====

function selectAll() {
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    const recordCheckboxes = document.querySelectorAll('.record-checkbox');
    // 计算当前页记录
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    const src = (filteredRecords && filteredRecords.length ? filteredRecords : records) || [];
    const pageRecords = src.slice(startIndex, endIndex);

    if (selectAllCheckbox && recordCheckboxes.length > 0) {
        // 勾选当前页所有行并更新 selectedIds
        selectAllCheckbox.checked = true;
        selectAllCheckbox.indeterminate = false;
        pageRecords.forEach(r => selectedIds.add(String(r.id)));
        recordCheckboxes.forEach(cb => { 
            cb.checked = true; 
            // 确保DOM复选框的data-id也在selectedIds中
            if (cb.dataset && cb.dataset.id) {
                selectedIds.add(String(cb.dataset.id));
            }
        });
        updateBatchDeleteButton();
        updateHeaderSelectAllState();
        console.log('全选(当前页)完成，当前selectedIds:', Array.from(selectedIds));
    }
}

function toggleSelectAll() {
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    const recordCheckboxes = document.querySelectorAll('.record-checkbox');

    // 计算当前页记录
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    const src = (filteredRecords && filteredRecords.length ? filteredRecords : records) || [];
    const pageRecords = src.slice(startIndex, endIndex);

    if (selectAllCheckbox && recordCheckboxes.length > 0) {
        if (selectAllCheckbox.checked) {
            // 全选：添加当前页所有记录ID到selectedIds，并勾选所有复选框
            pageRecords.forEach(r => selectedIds.add(String(r.id)));
            recordCheckboxes.forEach(cb => { 
                cb.checked = true; 
                // 确保DOM复选框的data-id也在selectedIds中
                if (cb.dataset && cb.dataset.id) {
                    selectedIds.add(String(cb.dataset.id));
                }
            });
        } else {
            // 取消全选：从selectedIds中移除当前页所有记录ID，并取消勾选所有复选框
            pageRecords.forEach(r => selectedIds.delete(String(r.id)));
            recordCheckboxes.forEach(cb => { 
                cb.checked = false; 
                // 确保从selectedIds中移除DOM复选框的data-id
                if (cb.dataset && cb.dataset.id) {
                    selectedIds.delete(String(cb.dataset.id));
                }
            });
        }
        selectAllCheckbox.indeterminate = false;
        updateBatchDeleteButton();
        updateHeaderSelectAllState();
        console.log('切换全选(当前页):', selectAllCheckbox.checked, '当前selectedIds:', Array.from(selectedIds));
    }
}

/* 取消全选（当前页） */
function deselectAll() {
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    const src = (filteredRecords && filteredRecords.length ? filteredRecords : records) || [];
    const pageRecords = src.slice(startIndex, endIndex);

    pageRecords.forEach(r => selectedIds.delete(String(r.id)));
    document.querySelectorAll('.record-checkbox').forEach(cb => cb.checked = false);
    if (selectAllCheckbox) { selectAllCheckbox.checked = false; selectAllCheckbox.indeterminate = false; }
    updateBatchDeleteButton();
    updateHeaderSelectAllState();
    console.log('取消全选(当前页)完成');
}

/* 反选（当前页） */
function invertSelection() { console.log('反选功能已禁用'); return;
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    const src = (filteredRecords && filteredRecords.length ? filteredRecords : records) || [];
    const pageRecords = src.slice(startIndex, endIndex);

    // 逐行反转
    pageRecords.forEach(r => {
        if (selectedIds.has(String(r.id))) selectedIds.delete(String(r.id));
        else selectedIds.add(String(r.id));
    });
    // 同步UI
    document.querySelectorAll('.record-checkbox').forEach(cb => {
        const id = cb.dataset.id;
        cb.checked = selectedIds.has(id);
    });
    updateBatchDeleteButton();
    updateHeaderSelectAllState();
    console.log('反选(当前页)完成');
}

/* 行复选框变更 */
function onRowCheckboxChange(cb) {
    const id = cb && cb.dataset ? cb.dataset.id : null;
    if (!id) return;
    const stringId = String(id); // 确保ID统一为字符串类型
    if (cb.checked) selectedIds.add(stringId);
    else selectedIds.delete(stringId);
    updateBatchDeleteButton();
    updateHeaderSelectAllState();
}

/* 表头复选框状态（全选/半选/未选） */
function updateHeaderSelectAllState() {
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    if (!selectAllCheckbox) return;

    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    const src = (filteredRecords && filteredRecords.length ? filteredRecords : records) || [];
    const pageRecords = src.slice(startIndex, endIndex);

    const total = pageRecords.length;
    const selectedCount = pageRecords.filter(r => selectedIds.has(String(r.id))).length;

    if (total === 0) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
        return;
    }
    if (selectedCount === 0) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
    } else if (selectedCount === total) {
        selectAllCheckbox.checked = true;
        selectAllCheckbox.indeterminate = false;
    } else {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = true;
    }
}

/* 渲染后绑定行复选框事件 */
function attachRowCheckboxHandlers() {
    document.querySelectorAll('.record-checkbox').forEach(cb => {
        cb.onchange = function() { onRowCheckboxChange(this); };
    });
}

/* 渲染后应用已选状态到当前页 */
function applySelectionToCurrentPage() {
    document.querySelectorAll('.record-checkbox').forEach(cb => {
        const id = cb.dataset.id;
        cb.checked = selectedIds.has(id);
    });
}

function updateSelectableTable() {
    // 更新可选择表格的状态
    updateBatchDeleteButton();
}

function updateBatchDeleteButton() {
    const batchDeleteBtn = document.getElementById('batchDeleteBtn');

    // 计算当前页与合计
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    const src = (filteredRecords && filteredRecords.length ? filteredRecords : records) || [];
    const pageRecords = src.slice(startIndex, endIndex);

    // 组合：selectedIds ∪ DOM中已勾选的行
    const domCheckedIds = new Set();
    document.querySelectorAll('.record-checkbox:checked').forEach(cb => {
        if (cb && cb.dataset && cb.dataset.id) domCheckedIds.add(String(cb.dataset.id));
    });
    const union = new Set([...selectedIds, ...domCheckedIds]);

    const pageCount = pageRecords.filter(r => union.has(String(r.id))).length;
    const totalCount = union.size;

    if (batchDeleteBtn) {
        const shouldDisable = totalCount === 0;
        batchDeleteBtn.disabled = shouldDisable;
        if (shouldDisable) {
            batchDeleteBtn.setAttribute('disabled', 'disabled');
            batchDeleteBtn.classList.add('disabled');
            batchDeleteBtn.setAttribute('aria-disabled', 'true');
        } else {
            batchDeleteBtn.removeAttribute('disabled');
            batchDeleteBtn.classList.remove('disabled');
            batchDeleteBtn.setAttribute('aria-disabled', 'false');
        }

        // 写入“已选ID快照”，点击时可直接读取，避免 :checked 查询偶发失效
        try { batchDeleteBtn.dataset.selectedIds = JSON.stringify(Array.from(union)); } catch (e) {}

        batchDeleteBtn.innerHTML = totalCount > 0
            ? `<i class="fa-solid fa-trash"></i> 批量删除 (本页 ${pageCount} / 合计 ${totalCount})`
            : '<i class="fa-solid fa-trash"></i> 批量删除';
    }
}

function batchDelete() {
    // 重入保护，避免一次点击触发两次导致“请先选择”的误判
    if (isBatchDeleting) return;
    isBatchDeleting = true;
    try {
        // 强制同步DOM复选框状态到selectedIds（解决最后一条记录删不掉的问题）
        document.querySelectorAll('.record-checkbox:checked').forEach(cb => {
            if (cb.dataset && cb.dataset.id) {
                selectedIds.add(String(cb.dataset.id));
            }
        });

        // 收集选中ID（selectedIds ∪ DOM 复选框 ∪ 按钮快照）
        const domCheckedIds = Array.from(document.querySelectorAll('.record-checkbox:checked'))
            .map(cb => String(cb.dataset.id))
            .filter(Boolean);

        let snapIds = [];
        const btn = document.getElementById('batchDeleteBtn');
        try {
            snapIds = btn && btn.dataset && btn.dataset.selectedIds ? JSON.parse(btn.dataset.selectedIds) : [];
            if (!Array.isArray(snapIds)) snapIds = [];
        } catch (e) { snapIds = []; }

        const unionSet = new Set([
            ...Array.from(selectedIds || []).map(String),
            ...domCheckedIds,
            ...snapIds.map(String)
        ]);

        // 添加详细的调试信息
        console.log('批量删除调试信息:');
        console.log('selectedIds:', Array.from(selectedIds));
        console.log('domCheckedIds:', domCheckedIds);
        console.log('snapIds:', snapIds);
        console.log('unionSet:', Array.from(unionSet));
        console.log('按钮状态:', btn ? btn.disabled : '按钮不存在');

        const count = unionSet.size;
        if (count === 0) { 
            console.log('没有选中任何记录');
            alert('请先选择要删除的记录'); 
            return; 
        }
        const confirmResult = confirm(`确定要删除选中的 ${count} 条记录吗？`);
        console.log('用户确认结果:', confirmResult);
        if (!confirmResult) {
            console.log('用户取消了删除操作');
            return;
        }
        console.log('开始执行删除操作...');

        const idsToDelete = Array.from(unionSet);
        console.log('要删除的ID列表:', idsToDelete);
        console.log('删除前records长度:', records.length);
        console.log('删除前records内容:', records.map(r => ({id: r.id, type: typeof r.id})));
        
        // 执行删除操作
        const beforeRecords = records.length;
        records = records.filter(r => {
            const shouldKeep = !idsToDelete.includes(String(r.id));
            if (!shouldKeep) {
                console.log('删除记录:', r.id, '类型:', typeof r.id);
            }
            return shouldKeep;
        });
        
        const beforeFiltered = filteredRecords.length;
        filteredRecords = filteredRecords.filter(r => {
            const shouldKeep = !idsToDelete.includes(String(r.id));
            return shouldKeep;
        });
        
        console.log('删除后records长度:', records.length, '(删除了', beforeRecords - records.length, '条)');
        console.log('删除后filteredRecords长度:', filteredRecords.length, '(删除了', beforeFiltered - filteredRecords.length, '条)');

        // 清理已删除ID
        idsToDelete.forEach(id => selectedIds.delete(id));

        saveRecords();
        
        // 清空选择状态
        selectedIds.clear();
        
        // 更新所有相关组件（不重新加载数据，避免覆盖删除结果）
        updateDashboard();
        filterRecords(); // 重新执行筛选以更新 filteredRecords
        
        // 检查并调整当前页码（防止删除后当前页为空）
        const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
        if (currentPage > totalPages && totalPages > 0) {
            currentPage = totalPages;
            console.log('调整页码到:', currentPage);
        } else if (filteredRecords.length === 0) {
            currentPage = 1;
            console.log('重置页码到第1页');
        }
        
        updateRecordTable();
        updateBatchDeleteButton();
        
        // 重置页面状态
        const selectAllCheckbox = document.getElementById('selectAllCheckbox');
        if (selectAllCheckbox) {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = false;
        }
        
        console.log(`批量删除成功，删除了 ${count} 条记录`);
        console.log('页面状态已重置，当前records长度:', records.length);
    } finally {
        isBatchDeleting = false;
    }
}

// ===== 排序功能 =====

function sortTable(column) {
    if (sortColumn === column) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        sortColumn = column;
        sortDirection = 'asc';
    }
    
    filteredRecords.sort((a, b) => {
        let aVal = a[column];
        let bVal = b[column];
        
        if (column === 'amount') {
            aVal = parseFloat(aVal) || 0;
            bVal = parseFloat(bVal) || 0;
        } else if (column === 'date') {
            aVal = new Date(aVal);
            bVal = new Date(bVal);
        } else {
            aVal = String(aVal).toLowerCase();
            bVal = String(bVal).toLowerCase();
        }
        
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
    
    updateRecordTable();
    updateSortIcons(column);
}

function updateSortIcons(activeColumn) {
    const headers = document.querySelectorAll('th[onclick]');
    headers.forEach(header => {
        const icon = header.querySelector('i');
        if (icon) {
            if (header.getAttribute('onclick').includes(activeColumn)) {
                icon.className = sortDirection === 'asc' ? 'fa-solid fa-sort-up' : 'fa-solid fa-sort-down';
            } else {
                icon.className = 'fa-solid fa-sort';
            }
        }
    });
}

// ===== 分页功能 =====

function changePage(direction) {
    const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
    const newPage = currentPage + direction;
    
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        updateRecordTable();
    }
}

function previousPage() {
    changePage(-1);
}

function nextPage() {
    changePage(1);
}

function goToPage(page) {
    const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        updateRecordTable();
    }
}

// ===== 记录操作功能 =====

function viewRecord(id) {
    const record = records.find(r => r.id === id);
    if (!record) return;
    
    const modal = document.getElementById('recordModal');
    if (modal) {
        // 填充记录详情
        const recordDetails = document.getElementById('recordDetails');
        if (recordDetails) {
            recordDetails.innerHTML = `
                <p><strong>日期:</strong> ${record.date}</p>
                <p><strong>类型:</strong> ${record.type === 'income' ? '收入' : record.type === 'expense' ? '支出' : '订单'}</p>
                <p><strong>分类:</strong> ${record.category}</p>
                <p><strong>描述:</strong> ${record.description}</p>
                <p><strong>金额:</strong> ¥${record.amount.toFixed(2)}</p>
                <p><strong>发票金额:</strong> ${record.invoiceAmount > 0 ? '¥' + record.invoiceAmount.toFixed(2) : '无'}</p>
                <p><strong>发票状态:</strong> ${record.invoiceStatus === 'none' ? '无需发票' : 
                      record.invoiceStatus === 'available' ? '可开发票' : 
                      record.invoiceStatus === 'issued' ? '已开发票' : 
                      record.invoiceStatus === 'reimbursed' ? '已报销' : '无需发票'}</p>
                <p><strong>备注:</strong> ${record.notes || '无'}</p>
                <p><strong>创建时间:</strong> ${new Date(record.createTime).toLocaleString()}</p>
            `;
        }
        modal.style.display = 'block';
        currentEditId = id;
    }
}

function editRecord() {
    if (!currentEditId) return;
    
    closeModal();
    editRecordById(currentEditId);
}

function editRecordById(id) {
    const record = records.find(r => r.id === id);
    if (!record) return;
    
    currentEditId = id;
    const modal = document.getElementById('editModal');
    if (modal) {
        modal.style.display = 'block';
        document.getElementById('editModalTitle').textContent = '编辑记录';
        
        // 填充表单
        document.getElementById('editType').value = record.type;
        document.getElementById('editCategory').value = record.category;
        document.getElementById('editDescription').value = record.description;
        document.getElementById('editAmount').value = record.amount;
        safeSetElementValue('editInvoiceAmount', record.invoiceAmount || 0);
        safeSetElementValue('editInvoiceStatus', record.invoiceStatus || 'none');
        document.getElementById('editDate').value = record.date;
        document.getElementById('editNotes').value = record.notes || '';
        
        updateCategoryOptions();
        if (typeof updateInvoiceAmountFieldState === 'function') { updateInvoiceAmountFieldState(); }
    }
}

function deleteRecord(id) {
    if (!confirm('确定要删除这条记录吗？')) return;

    // 统一为字符串比较，避免类型不一致导致删除失败
    const targetId = String(id);
    records = records.filter(r => String(r.id) !== targetId);
    filteredRecords = filteredRecords.filter(r => String(r.id) !== targetId);

    // 同步清理已选集合及表头全选状态
    selectedIds.delete(targetId);

    saveRecords();
    updateDashboard();
    updateRecordTable();
    updateBatchDeleteButton();
    updateHeaderSelectAllState();

    console.log('记录删除成功');
}

function closeModal() {
    const modal = document.getElementById('recordModal');
    if (modal) {
        modal.style.display = 'none';
    }
    currentEditId = null;
}

// ===== 表单处理功能 =====

function updateCategoryOptions() {
    const typeSelect = document.getElementById('editType');
    const categorySelect = document.getElementById('editCategory');
    
    if (!typeSelect || !categorySelect) return;
    
    const type = typeSelect.value;
    const categories = {
        income: ['工资收入', '项目资金', '奖学金', '兼职收入', '投资收益', '其他收入'],
        expense: ['实验器材', '维护费用', '交通费', '餐饮费', '学习用品', '其他支出'],
        order: ['电子产品', '书籍资料', '生活用品', '服装鞋帽', '食品饮料', '其他订单']
    };
    
    categorySelect.innerHTML = '';
    (categories[type] || []).forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categorySelect.appendChild(option);
    });
}

function resetEditForm() {
    const form = document.getElementById('editRecordForm');
    if (form) {
        form.reset();
        document.getElementById('editDate').value = new Date().toISOString().split('T')[0];
        // 发票：重置为无需发票且金额0，并禁用输入框
        safeSetElementValue('editInvoiceStatus', 'none');
        safeSetElementValue('editInvoiceAmount', 0);
        if (typeof updateInvoiceAmountFieldState === 'function') { updateInvoiceAmountFieldState(); }
    }
}

function saveRecord() {
    const form = document.getElementById('editRecordForm');
    if (!form) return;
    
    const type = document.getElementById('editType').value;
    const category = document.getElementById('editCategory').value;
    const description = document.getElementById('editDescription').value;
    const amount = parseFloat(document.getElementById('editAmount').value) || 0;
    const invoiceAmount = parseFloat(safeGetElementValue('editInvoiceAmount', '0')) || 0;
    const invoiceStatus = safeGetElementValue('editInvoiceStatus', 'none');
    const date = document.getElementById('editDate').value;
    const notes = document.getElementById('editNotes').value;
    
    // 验证必填字段
    if (!type || !category || !description || amount <= 0 || !date) {
        alert('请填写所有必填字段，金额必须大于0');
        return;
    }
    
    const recordData = {
        type,
        category,
        description,
        amount,
        // 规范：无需发票时，发票金额强制保存为0
        invoiceAmount: (invoiceStatus === 'none' ? 0 : invoiceAmount),
        invoiceStatus,
        date,
        notes,
        createTime: new Date().toISOString()
    };
    
    if (currentEditId) {
        // 编辑现有记录
        const index = records.findIndex(r => r.id === currentEditId);
        if (index !== -1) {
            records[index] = { ...records[index], ...recordData };
            console.log('记录已更新:', records[index]);
        }
    } else {
        // 新增记录
        recordData.id = generateUniqueId();
        records.push(recordData);
        console.log('新增记录:', recordData);
        console.log('当前记录总数:', records.length);
        
        // 添加到描述历史记录
        addRecordToHistory(recordData);
    }
    
    // 确保filteredRecords包含新记录
    filteredRecords = [...records];
    
    // 保存数据
    saveRecords();
    
    // 更新显示
    updateDashboard();
    updateRecordTable();
    
    // 关闭模态框
    closeEditModal();
    
    // 静默成功（移除弹窗）
    const message = currentEditId ? '记录更新成功！' : '记录添加成功！';
    console.log(message);
    
    // 强制刷新表格显示
    setTimeout(() => {
        console.log('延迟刷新表格，当前filteredRecords长度:', filteredRecords.length);
        updateRecordTable();
    }, 100);
}

// ===== 数据导入导出功能 =====

function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (Array.isArray(importedData)) {
                if (confirm(`确定要导入 ${importedData.length} 条记录吗？这将覆盖现有数据。`)) {
                    records = ensureUniqueRecordIds(importedData);
                    filteredRecords = [...records];
                    saveRecords();
                    updateDashboard();
                    updateRecordTable();
                    console.log('数据导入成功！');
                }
            } else {
                alert('文件格式不正确');
            }
        } catch (error) {
            alert('文件解析失败：' + error.message);
        }
    };
    reader.readAsText(file);
}

function exportToCSV() {
    if (!Array.isArray(records) || records.length === 0) {
        console.log('没有数据可导出');
        return;
    }
    
    const headers = ['日期', '类型', '分类', '描述', '金额', '备注'];
    const csvContent = [
        headers.join(','),
        ...records.map(record => [
            record.date,
            record.type === 'income' ? '收入' : record.type === 'expense' ? '支出' : '订单',
            record.category,
            `"${record.description}"`,
            record.amount,
            `"${record.notes || ''}"`
        ].join(','))
    ].join('\n');
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `SCCIPC财务记录_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('CSV数据导出成功！');
}

function exportToJSON() {
    if (!Array.isArray(records) || records.length === 0) {
        console.log('没有数据可导出');
        return;
    }
    
    const dataStr = JSON.stringify(records, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `SCCIPC财务记录_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('JSON数据导出成功！');
}

// ===== 数据操作功能 =====

function generateSampleData() {
    if (!confirm('确定要生成示例数据吗？这将添加一些测试记录。')) return;
    
    const sampleData = createSampleData();
    records = ensureUniqueRecordIds(records.concat(sampleData));
    filteredRecords = [...records];
    saveRecords();
    updateDashboard();
    updateRecordTable();
    
    console.log('示例数据生成成功！');
}

function clearAllData() {
    if (!confirm('确定要清空所有数据吗？此操作不可恢复！')) return;
    
    records = [];
    filteredRecords = [];
    selectedIds.clear();
    localStorage.removeItem(APP_CONFIG.storageKey);
    localStorage.removeItem(APP_CONFIG.storageKey + '_lastSaved');
    localStorage.removeItem(APP_CONFIG.storageKey + '_version');
    
    updateDashboard();
    updateRecordTable();
    updateStorageInfo();
    
    console.log('所有数据已清空！');
}

// ===== 显示更新功能 =====

function updateDashboard() {
    if (!Array.isArray(records)) {
        console.error('records不是数组:', records);
        return;
    }
    
    const totalIncome = records.filter(r => r.type === 'income').reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
    const totalExpense = records.filter(r => r.type === 'expense').reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
    const totalOrder = records.filter(r => r.type === 'order').reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
    const balance = totalIncome - totalExpense - totalOrder;
    const netIncome = balance;
    
    // 计算发票金额统计
    const totalInvoiceAmount = records.reduce((sum, r) => sum + (parseFloat(r.invoiceAmount) || 0), 0);
    const availableInvoiceAmount = records.filter(r => r.invoiceStatus === 'available').reduce((sum, r) => sum + (parseFloat(r.invoiceAmount) || 0), 0);
    const issuedInvoiceAmount = records.filter(r => r.invoiceStatus === 'issued').reduce((sum, r) => sum + (parseFloat(r.invoiceAmount) || 0), 0);
    const reimbursedInvoiceAmount = records.filter(r => r.invoiceStatus === 'reimbursed').reduce((sum, r) => sum + (parseFloat(r.invoiceAmount) || 0), 0);
    
    // 更新显示
    updateElementText('totalBalance', `¥${balance.toFixed(2)}`);
    updateElementText('totalIncome', `¥${totalIncome.toFixed(2)}`);
    updateElementText('totalExpense', `¥${(totalExpense + totalOrder).toFixed(2)}`);
    updateElementText('netIncome', `¥${netIncome.toFixed(2)}`);
    
    // 更新发票金额统计（拆分为未报销/已报销）
    updateElementText('unreimbursedInvoiceAmount', `¥${(availableInvoiceAmount + issuedInvoiceAmount).toFixed(2)}`);
    updateElementText('unreimbursedBreakdown', `已开: ¥${issuedInvoiceAmount.toFixed(2)} | 可开: ¥${availableInvoiceAmount.toFixed(2)}`);
    updateElementText('reimbursedInvoiceAmount', `¥${reimbursedInvoiceAmount.toFixed(2)}`);
    
    // 更新月度统计
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyIncome = records.filter(r => r.type === 'income' && r.date.startsWith(currentMonth))
        .reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
    const monthlyExpense = records.filter(r => (r.type === 'expense' || r.type === 'order') && r.date.startsWith(currentMonth))
        .reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
    
    updateElementText('monthlyIncome', `本月: +¥${monthlyIncome.toFixed(2)}`);
    updateElementText('monthlyExpense', `本月: -¥${monthlyExpense.toFixed(2)}`);
    updateElementText('monthlyNet', `本月: ¥${(monthlyIncome - monthlyExpense).toFixed(2)}`);
    
    console.log('仪表板更新完成');
}

function updateElementText(id, text) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = text;
    } else {
        console.warn(`未找到元素: ${id}`);
    }
}

// 安全获取元素值的函数
function safeGetElementValue(id, defaultValue = '') {
    const element = document.getElementById(id);
    return element ? element.value : defaultValue;
}

// 安全设置元素值的函数
function safeSetElementValue(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.value = value;
    } else {
        console.warn(`未找到元素: ${id}`);
    }
}

/**
 * 根据发票状态同步“发票金额”输入框：
 * - 状态为 none（无需发票）：金额设为0并禁用输入框
 * - 其他状态：启用输入框
 */
function updateInvoiceAmountFieldState() {
    const statusEl = document.getElementById('editInvoiceStatus');
    const amountEl = document.getElementById('editInvoiceAmount');
    if (!statusEl || !amountEl) return;
    if (statusEl.value === 'none') {
        amountEl.value = 0;
        amountEl.setAttribute('disabled', 'disabled');
    } else {
        amountEl.removeAttribute('disabled');
    }
}

function updateRecordTable() {
    const recordsToShow = filteredRecords || records;
    
    if (!Array.isArray(recordsToShow)) {
        console.error('recordsToShow不是数组');
        return;
    }
    
    // 尝试多种方式找到表格tbody
    let tbody = document.querySelector('#recordsTableBody');
    if (!tbody) {
        tbody = document.querySelector('#recordsTable tbody');
    }
    if (!tbody) {
        tbody = document.querySelector('table tbody');
    }
    if (!tbody) {
        console.warn('未找到记录表格tbody');
        return;
    }
    
    // 分页处理
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    const pageRecords = recordsToShow.slice(startIndex, endIndex);
    
    tbody.innerHTML = '';
    
    if (pageRecords.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: #666;">暂无数据</td></tr>';
        updatePagination();
        return;
    }
    
    pageRecords.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox" class="record-checkbox" data-id="${record.id}" onchange="onRowCheckboxChange(this)"></td>
            <td>${record.date || ''}</td>
            <td><span class="type-badge ${record.type}">${record.type === 'income' ? '收入' : record.type === 'expense' ? '支出' : '订单'}</span></td>
            <td>${record.category || ''}</td>
            <td>${record.description || ''}</td>
            <td class="amount ${record.type}">¥${(parseFloat(record.amount) || 0).toFixed(2)}</td>
            <td class="invoice-amount">${record.invoiceAmount > 0 ? '¥' + (parseFloat(record.invoiceAmount) || 0).toFixed(2) : '-'}</td>
            <td class="invoice-status">
                <span class="status-badge ${record.invoiceStatus || 'none'}">
                    ${record.invoiceStatus === 'none' ? '无需发票' : 
                      record.invoiceStatus === 'available' ? '可开发票' : 
                      record.invoiceStatus === 'issued' ? '已开发票' : 
                      record.invoiceStatus === 'reimbursed' ? '已报销' : '无需发票'}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-outline" onclick="viewRecord('${record.id}')" title="查看详情">
                    <i class="fa-solid fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-primary" onclick="editRecordById('${record.id}')" title="编辑">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteRecord('${record.id}')" title="删除">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // 更新分页信息
    updatePagination();
    // 渲染后绑定与应用已选状态
    attachRowCheckboxHandlers();
    applySelectionToCurrentPage();
    updateSelectableTable();
    updateHeaderSelectAllState();
    
    console.log('记录表格更新完成，显示', pageRecords.length, '条记录');
}

function updatePagination() {
    const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
    const pageInfo = document.getElementById('pageInfo');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (pageInfo) {
        pageInfo.textContent = `第 ${currentPage} 页，共 ${totalPages} 页`;
    }
    
    if (prevBtn) {
        prevBtn.disabled = currentPage <= 1;
    }
    
    if (nextBtn) {
        nextBtn.disabled = currentPage >= totalPages;
    }
}

function updateStorageInfo() {
    const recordCount = document.getElementById('storageRecordCount');
    const storageSize = document.getElementById('storageSize');
    const lastSaved = document.getElementById('lastSaved');
    
    if (recordCount) {
        recordCount.textContent = records.length;
    }
    
    if (storageSize) {
        const dataSize = JSON.stringify(records).length;
        storageSize.textContent = (dataSize / 1024).toFixed(2) + ' KB';
    }
    
    if (lastSaved) {
        const lastSavedTime = localStorage.getItem(APP_CONFIG.storageKey + '_lastSaved');
        if (lastSavedTime) {
            lastSaved.textContent = new Date(lastSavedTime).toLocaleString();
        } else {
            lastSaved.textContent = '未知';
        }
    }
}

// ===== 事件绑定 =====

function bindEventListeners() {
    // 搜索功能
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterRecords, 300));
    }
    
    // 筛选功能
    const categoryFilter = document.getElementById('categoryFilter');
    const typeFilter = document.getElementById('typeFilter');
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    
    if (categoryFilter) categoryFilter.addEventListener('change', filterRecords);
    if (typeFilter) typeFilter.addEventListener('change', filterRecords);
    if (startDate) startDate.addEventListener('change', filterRecords);
    if (endDate) endDate.addEventListener('change', filterRecords);
    
    // 发票状态联动
    const invoiceStatusSelect = document.getElementById('editInvoiceStatus');
    const invoiceAmountInput = document.getElementById('editInvoiceAmount');
    if (invoiceStatusSelect && typeof updateInvoiceAmountFieldState === 'function') {
        invoiceStatusSelect.addEventListener('change', updateInvoiceAmountFieldState);
        // 初始化一次，防止首次打开时状态与输入框不同步
        updateInvoiceAmountFieldState();
    }
    
    // 全选复选框
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', toggleSelectAll);
    }

    // 批量删除按钮：使用 index.html 的 onclick 绑定，避免重复绑定
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===== 模态框控制 =====

// 点击模态框外部关闭
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
};

// ESC键关闭模态框
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (modal.style.display === 'block') {
                modal.style.display = 'none';
            }
        });
    }
});

// ===== 商家分组功能 =====

function updateMerchantGroups() {
    console.log('更新商家分组显示');
    
    // 获取所有订单类型的记录
    const orderRecords = records.filter(r => r.type === 'order' || (r.category && r.category.includes('订单')));
    
    if (orderRecords.length === 0) {
        showEmptyMerchants();
        return;
    }
    
    // 按商家分组
    const merchantGroups = groupByMerchant(orderRecords);
    
    // 更新统计信息
    updateGroupsSummary(merchantGroups);
    
    // 渲染商家分组
    renderMerchantGroups(merchantGroups);
}

function groupByMerchant(orderRecords) {
    const groups = {};
    
    orderRecords.forEach(record => {
        // 从描述中提取商家名称，或使用分类作为商家名称
        let merchantName = extractMerchantName(record);
        
        if (!groups[merchantName]) {
            groups[merchantName] = {
                name: merchantName,
                orders: [],
                totalAmount: 0,
                count: 0
            };
        }
        
        groups[merchantName].orders.push(record);
        groups[merchantName].totalAmount += parseFloat(record.amount) || 0;
        groups[merchantName].count++;
    });
    
    // 按总金额降序排序
    return Object.values(groups).sort((a, b) => b.totalAmount - a.totalAmount);
}

function extractMerchantName(record) {
    // 尝试从描述中提取商家名称
    const description = record.description || '';
    const category = record.category || '';
    
    // 常见的商家关键词
    const merchantKeywords = ['淘宝', '京东', '天猫', '拼多多', '苏宁', '唯品会', '亚马逊', '当当', '网易严选'];
    
    // 检查描述中是否包含商家关键词
    for (const keyword of merchantKeywords) {
        if (description.includes(keyword) || category.includes(keyword)) {
            return keyword;
        }
    }
    
    // 尝试提取描述中的第一个词作为商家名称
    const words = description.split(/[\s\-\|\/]/);
    if (words.length > 0 && words[0].length > 0) {
        return words[0];
    }
    
    // 如果无法提取，使用分类或默认名称
    return category || '未知商家';
}

function updateGroupsSummary(merchantGroups) {
    const totalMerchants = merchantGroups.length;
    const totalOrders = merchantGroups.reduce((sum, group) => sum + group.count, 0);
    const totalAmount = merchantGroups.reduce((sum, group) => sum + group.totalAmount, 0);
    
    document.getElementById('totalMerchants').textContent = `共 ${totalMerchants} 个商家`;
    document.getElementById('totalGroupedOrders').textContent = `${totalOrders} 个订单`;
    document.getElementById('totalGroupedAmount').textContent = `总计 ¥${totalAmount.toFixed(2)}`;
}

function renderMerchantGroups(merchantGroups) {
    const container = document.getElementById('merchantGroupsContainer');
    
    if (merchantGroups.length === 0) {
        showEmptyMerchants();
        return;
    }
    
    container.innerHTML = merchantGroups.map((group, index) => `
        <div class="merchant-group">
            <div class="merchant-header">
                <div class="merchant-info">
                    <h3><i class="fa-solid fa-store"></i> ${group.name}</h3>
                    <p>订单详情</p>
                </div>
                <div class="merchant-stats">
                    <div class="amount">¥${group.totalAmount.toFixed(2)}</div>
                    <div class="count">${group.count} 个订单</div>
                </div>
                <button class="merchant-toggle" onclick="toggleMerchantOrders(${index})">
                    <i class="fa-solid fa-chevron-down" id="toggle-icon-${index}"></i>
                </button>
            </div>
            <div class="merchant-orders" id="merchant-orders-${index}">
                <table>
                    <thead>
                        <tr>
                            <th>日期</th>
                            <th>描述</th>
                            <th>金额</th>
                            <th>发票状态</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${group.orders.map(order => `
                            <tr>
                                <td class="date">${order.date || ''}</td>
                                <td class="description">${order.description || ''}</td>
                                <td class="amount">¥${(parseFloat(order.amount) || 0).toFixed(2)}</td>
                                <td>
                                    <span class="status-badge ${order.invoiceStatus || 'none'}">
                                        ${getInvoiceStatusText(order.invoiceStatus)}
                                    </span>
                                </td>
                                <td>
                                    <button class="btn btn-sm btn-outline" onclick="viewRecord('${order.id}')" title="查看详情">
                                        <i class="fa-solid fa-eye"></i>
                                    </button>
                                    <button class="btn btn-sm btn-primary" onclick="editRecordById('${order.id}')" title="编辑">
                                        <i class="fa-solid fa-pen-to-square"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `).join('');
}

function getInvoiceStatusText(status) {
    switch (status) {
        case 'none': return '无需发票';
        case 'available': return '可开发票';
        case 'issued': return '已开发票';
        case 'reimbursed': return '已报销';
        default: return '无需发票';
    }
}

function toggleMerchantOrders(index) {
    const ordersDiv = document.getElementById(`merchant-orders-${index}`);
    const toggleIcon = document.getElementById(`toggle-icon-${index}`);
    
    if (ordersDiv.classList.contains('collapsed')) {
        ordersDiv.classList.remove('collapsed');
        toggleIcon.className = 'fa-solid fa-chevron-down';
    } else {
        ordersDiv.classList.add('collapsed');
        toggleIcon.className = 'fa-solid fa-chevron-right';
    }
}

function showEmptyMerchants() {
    const container = document.getElementById('merchantGroupsContainer');
    container.innerHTML = `
        <div class="empty-merchants">
            <i class="fa-solid fa-store-slash"></i>
            <h3>暂无订单记录</h3>
            <p>还没有任何订单记录，请先添加一些订单类型的记录。<br>
            系统会自动按商家对订单进行分组统计。</p>
        </div>
    `;
    
    // 重置统计信息
    document.getElementById('totalMerchants').textContent = '共 0 个商家';
    document.getElementById('totalGroupedOrders').textContent = '0 个订单';
    document.getElementById('totalGroupedAmount').textContent = '总计 ¥0.00';
}

// ===== 描述输入历史功能 =====

let descriptionHistory = [];
let currentSuggestionIndex = -1;

// 加载描述历史记录
function loadDescriptionHistory() {
    try {
        const saved = localStorage.getItem('sccipc_description_history');
        if (saved) {
            descriptionHistory = JSON.parse(saved);
        }
    } catch (e) {
        console.warn('加载描述历史失败:', e);
        descriptionHistory = [];
    }
}

// 保存描述历史记录
function saveDescriptionHistory() {
    try {
        // 只保留最近的50条记录
        const limitedHistory = descriptionHistory.slice(0, 50);
        localStorage.setItem('sccipc_description_history', JSON.stringify(limitedHistory));
    } catch (e) {
        console.warn('保存描述历史失败:', e);
    }
}

// 添加描述到历史记录
function addToDescriptionHistory(description) {
    if (!description || description.trim().length < 2) return;
    
    const trimmedDesc = description.trim();
    
    // 移除已存在的相同描述
    descriptionHistory = descriptionHistory.filter(item => item.text !== trimmedDesc);
    
    // 添加到开头
    descriptionHistory.unshift({
        text: trimmedDesc,
        count: 1,
        lastUsed: new Date().toISOString()
    });
    
    // 更新使用次数
    const existing = descriptionHistory.find(item => item.text === trimmedDesc);
    if (existing && existing !== descriptionHistory[0]) {
        existing.count++;
        existing.lastUsed = new Date().toISOString();
    }
    
    saveDescriptionHistory();
}

// 显示描述建议
function showDescriptionSuggestions(inputValue) {
    const suggestionsDiv = document.getElementById('descriptionSuggestions');
    if (!suggestionsDiv) return;
    
    const value = inputValue.toLowerCase().trim();
    
    if (value.length === 0) {
        // 显示最近使用的描述
        const recentSuggestions = descriptionHistory.slice(0, 8);
        renderSuggestions(recentSuggestions, '最近使用');
        return;
    }
    
    // 过滤匹配的建议
    const filteredSuggestions = descriptionHistory.filter(item => 
        item.text.toLowerCase().includes(value)
    ).slice(0, 8);
    
    if (filteredSuggestions.length > 0) {
        renderSuggestions(filteredSuggestions, '匹配建议');
    } else {
        suggestionsDiv.innerHTML = '<div class="no-suggestions">暂无匹配的历史记录</div>';
        suggestionsDiv.classList.add('show');
    }
}

// 渲染建议列表
function renderSuggestions(suggestions, title) {
    const suggestionsDiv = document.getElementById('descriptionSuggestions');
    if (!suggestionsDiv) return;
    
    if (suggestions.length === 0) {
        suggestionsDiv.classList.remove('show');
        return;
    }
    
    suggestionsDiv.innerHTML = suggestions.map((item, index) => `
        <div class="suggestion-item" onclick="selectSuggestion('${item.text.replace(/'/g, "\\'")}', event)" 
             onmouseenter="highlightSuggestion(${index})" data-index="${index}">
            <span class="suggestion-text">
                <i class="fa-solid fa-history"></i>
                ${item.text}
            </span>
            <span class="suggestion-count">${item.count}次</span>
        </div>
    `).join('');
    
    suggestionsDiv.classList.add('show');
    currentSuggestionIndex = -1;
}

// 选择建议
function selectSuggestion(text, event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    const input = document.getElementById('editDescription');
    if (input) {
        input.value = text;
        input.focus();
    }
    
    hideDescriptionSuggestions();
}

// 隐藏建议列表
function hideDescriptionSuggestions() {
    setTimeout(() => {
        const suggestionsDiv = document.getElementById('descriptionSuggestions');
        if (suggestionsDiv) {
            suggestionsDiv.classList.remove('show');
        }
        currentSuggestionIndex = -1;
    }, 150);
}

// 高亮建议项
function highlightSuggestion(index) {
    const suggestions = document.querySelectorAll('.suggestion-item');
    suggestions.forEach((item, i) => {
        if (i === index) {
            item.classList.add('highlighted');
            currentSuggestionIndex = index;
        } else {
            item.classList.remove('highlighted');
        }
    });
}

// 键盘导航支持
function handleDescriptionKeydown(event) {
    const suggestionsDiv = document.getElementById('descriptionSuggestions');
    if (!suggestionsDiv || !suggestionsDiv.classList.contains('show')) return;
    
    const suggestions = document.querySelectorAll('.suggestion-item');
    if (suggestions.length === 0) return;
    
    switch (event.key) {
        case 'ArrowDown':
            event.preventDefault();
            currentSuggestionIndex = Math.min(currentSuggestionIndex + 1, suggestions.length - 1);
            highlightSuggestion(currentSuggestionIndex);
            break;
            
        case 'ArrowUp':
            event.preventDefault();
            currentSuggestionIndex = Math.max(currentSuggestionIndex - 1, -1);
            if (currentSuggestionIndex >= 0) {
                highlightSuggestion(currentSuggestionIndex);
            } else {
                suggestions.forEach(item => item.classList.remove('highlighted'));
            }
            break;
            
        case 'Enter':
            if (currentSuggestionIndex >= 0) {
                event.preventDefault();
                const selectedText = suggestions[currentSuggestionIndex].querySelector('.suggestion-text').textContent.trim();
                selectSuggestion(selectedText.replace('', ''));
            }
            break;
            
        case 'Escape':
            hideDescriptionSuggestions();
            break;
    }
}

// 初始化描述输入历史功能
function initDescriptionHistory() {
    loadDescriptionHistory();
    
    const input = document.getElementById('editDescription');
    if (input) {
        input.addEventListener('keydown', handleDescriptionKeydown);
        
        // 添加焦点事件，显示最近使用的建议
        input.addEventListener('focus', function() {
            if (this.value.trim() === '') {
                showDescriptionSuggestions('');
            }
        });
        
        // 添加失焦事件，隐藏建议列表
        input.addEventListener('blur', function() {
            hideDescriptionSuggestions();
        });
    }
}

// 在保存记录时添加到历史
function addRecordToHistory(recordData) {
    if (recordData.description) {
        addToDescriptionHistory(recordData.description);
    }
}

console.log('Script加载完成，所有函数已定义');