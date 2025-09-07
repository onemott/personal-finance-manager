// SCCIPC智能车实验室财务管理系统 - 简化版本
console.log('🚗 SCCIPC财务管理系统开始加载...');

// 应用配置
const APP_CONFIG = {
    version: '2.0.0',
    name: 'SCCIPC智能车实验室财务管理系统',
    recordsPerPage: 10,
    storageKey: 'sccipc_lab_finance_records'
};

// 全局状态
let records = [];
let filteredRecords = [];
let currentPage = 1;
let currentEditId = null;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 DOM加载完成，开始初始化...');
    initializeApp();
});

// 应用初始化
function initializeApp() {
    try {
        console.log('🚀 初始化应用...');
        
        // 加载数据
        loadRecords();
        
        // 更新界面
        updateDashboard();
        updateRecordTable();
        
        // 绑定事件
        bindEventListeners();
        
        console.log('✅ 应用初始化成功');
        
    } catch (error) {
        console.error('❌ 初始化失败:', error);
        alert('应用初始化失败，请刷新页面重试');
    }
}

// 加载记录数据
function loadRecords() {
    try {
        const savedData = localStorage.getItem(APP_CONFIG.storageKey);
        if (savedData) {
            records = JSON.parse(savedData);
            console.log(`📊 加载了 ${records.length} 条记录`);
        } else {
            // 创建示例数据
            records = createSampleData();
            saveRecords();
            console.log('📝 创建了示例数据');
        }
        filteredRecords = [...records];
    } catch (error) {
        console.error('❌ 数据加载失败:', error);
        records = createSampleData();
        filteredRecords = [...records];
    }
}

// 保存记录
function saveRecords() {
    try {
        localStorage.setItem(APP_CONFIG.storageKey, JSON.stringify(records));
        console.log('💾 数据已保存');
    } catch (error) {
        console.error('❌ 数据保存失败:', error);
        alert('数据保存失败，请检查浏览器存储空间');
    }
}

// 创建示例数据
function createSampleData() {
    const today = new Date();
    const formatDate = (date) => date.toISOString().split('T')[0];
    
    return [
        {
            id: generateUniqueId(),
            date: formatDate(new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)),
            type: 'income',
            category: '项目资金',
            description: '智能车竞赛项目资金',
            amount: 5000.00,
            invoiceAmount: 5000.00,
            invoiceStatus: 'available',
            notes: '用于购买开发器材和参赛费用',
            createTime: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: generateUniqueId(),
            date: formatDate(new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000)),
            type: 'expense',
            category: '实验器材',
            description: '购买传感器模块',
            amount: 299.00,
            invoiceAmount: 299.00,
            invoiceStatus: 'issued',
            notes: '超声波传感器和摄像头模块',
            createTime: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: generateUniqueId(),
            date: formatDate(new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000)),
            type: 'order',
            category: '开发板',
            description: '订购STM32开发板',
            amount: 158.00,
            invoiceAmount: 158.00,
            invoiceStatus: 'none',
            notes: '主控制器开发板',
            createTime: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString()
        }
    ];
}

// 生成唯一ID
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 更新仪表板
function updateDashboard() {
    try {
        const summary = calculateFinancialSummary();
        
        // 更新总余额
        const totalBalanceEl = document.getElementById('totalBalance');
        if (totalBalanceEl) {
            totalBalanceEl.textContent = `¥${summary.balance.toFixed(2)}`;
        }
        
        // 更新总收入
        const totalIncomeEl = document.getElementById('totalIncome');
        if (totalIncomeEl) {
            totalIncomeEl.textContent = `¥${summary.totalIncome.toFixed(2)}`;
        }
        
        // 更新总支出
        const totalExpenseEl = document.getElementById('totalExpense');
        if (totalExpenseEl) {
            totalExpenseEl.textContent = `¥${summary.totalExpense.toFixed(2)}`;
        }
        
        // 更新订单总额
        const totalOrderEl = document.getElementById('totalOrder');
        if (totalOrderEl) {
            totalOrderEl.textContent = `¥${summary.totalOrder.toFixed(2)}`;
        }
        
        console.log('📈 仪表板已更新');
    } catch (error) {
        console.error('❌ 仪表板更新失败:', error);
    }
}

// 计算财务摘要
function calculateFinancialSummary() {
    const summary = {
        totalIncome: 0,
        totalExpense: 0,
        totalOrder: 0,
        balance: 0
    };
    
    records.forEach(record => {
        const amount = parseFloat(record.amount) || 0;
        switch (record.type) {
            case 'income':
                summary.totalIncome += amount;
                break;
            case 'expense':
                summary.totalExpense += amount;
                break;
            case 'order':
                summary.totalOrder += amount;
                break;
        }
    });
    
    summary.balance = summary.totalIncome - summary.totalExpense - summary.totalOrder;
    return summary;
}

// 更新记录表格
function updateRecordTable() {
    try {
        const tableBody = document.getElementById('recordTableBody');
        if (!tableBody) {
            console.warn('⚠️ 记录表格元素未找到');
            return;
        }
        
        // 计算分页
        const startIndex = (currentPage - 1) * APP_CONFIG.recordsPerPage;
        const endIndex = startIndex + APP_CONFIG.recordsPerPage;
        const pageRecords = filteredRecords.slice(startIndex, endIndex);
        
        // 清空表格
        tableBody.innerHTML = '';
        
        // 添加记录行
        pageRecords.forEach(record => {
            const row = createRecordRow(record);
            tableBody.appendChild(row);
        });
        
        // 更新分页信息
        updatePagination();
        
        console.log(`📋 表格已更新，显示 ${pageRecords.length} 条记录`);
    } catch (error) {
        console.error('❌ 表格更新失败:', error);
    }
}

// 创建记录行
function createRecordRow(record) {
    const row = document.createElement('tr');
    
    const typeText = {
        'income': '收入',
        'expense': '支出',
        'order': '订单'
    }[record.type] || record.type;
    
    const statusText = {
        'none': '无需发票',
        'available': '可开发票',
        'issued': '已开发票',
        'reimbursed': '已报销'
    }[record.invoiceStatus] || record.invoiceStatus;
    
    row.innerHTML = `
        <td>${record.date}</td>
        <td><span class="type-badge type-${record.type}">${typeText}</span></td>
        <td>${record.category}</td>
        <td>${record.description}</td>
        <td class="amount ${record.type === 'income' ? 'positive' : 'negative'}">
            ¥${parseFloat(record.amount).toFixed(2)}
        </td>
        <td>¥${parseFloat(record.invoiceAmount).toFixed(2)}</td>
        <td><span class="status-badge status-${record.invoiceStatus}">${statusText}</span></td>
        <td>${record.notes || '-'}</td>
        <td class="actions">
            <button class="btn btn-sm btn-outline" onclick="editRecord('${record.id}')">
                <i class="fa-solid fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-danger" onclick="deleteRecord('${record.id}')">
                <i class="fa-solid fa-trash"></i>
            </button>
        </td>
    `;
    
    return row;
}

// 更新分页
function updatePagination() {
    const totalPages = Math.ceil(filteredRecords.length / APP_CONFIG.recordsPerPage);
    const paginationEl = document.getElementById('pagination');
    
    if (!paginationEl) return;
    
    let paginationHTML = '';
    
    // 上一页按钮
    if (currentPage > 1) {
        paginationHTML += `<button class="btn btn-outline" onclick="changePage(${currentPage - 1})">上一页</button>`;
    }
    
    // 页码按钮
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            paginationHTML += `<button class="btn btn-primary">${i}</button>`;
        } else {
            paginationHTML += `<button class="btn btn-outline" onclick="changePage(${i})">${i}</button>`;
        }
    }
    
    // 下一页按钮
    if (currentPage < totalPages) {
        paginationHTML += `<button class="btn btn-outline" onclick="changePage(${currentPage + 1})">下一页</button>`;
    }
    
    paginationEl.innerHTML = paginationHTML;
}

// 切换页面
function changePage(page) {
    currentPage = page;
    updateRecordTable();
}

// 绑定事件监听器
function bindEventListeners() {
    try {
        // 搜索功能
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                filterRecords(searchTerm);
            });
        }
        
        // 类型筛选
        const typeFilter = document.getElementById('typeFilter');
        if (typeFilter) {
            typeFilter.addEventListener('change', function() {
                const selectedType = this.value;
                filterRecordsByType(selectedType);
            });
        }
        
        // 发票状态筛选
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', function() {
                const selectedStatus = this.value;
                filterRecordsByStatus(selectedStatus);
            });
        }
        
        console.log('🔗 事件监听器已绑定');
    } catch (error) {
        console.error('❌ 事件绑定失败:', error);
    }
}

// 搜索筛选
function filterRecords(searchTerm) {
    if (!searchTerm) {
        filteredRecords = [...records];
    } else {
        filteredRecords = records.filter(record => 
            record.description.toLowerCase().includes(searchTerm) ||
            record.category.toLowerCase().includes(searchTerm) ||
            record.notes.toLowerCase().includes(searchTerm)
        );
    }
    currentPage = 1;
    updateRecordTable();
}

// 按类型筛选
function filterRecordsByType(type) {
    if (!type || type === 'all') {
        filteredRecords = [...records];
    } else {
        filteredRecords = records.filter(record => record.type === type);
    }
    currentPage = 1;
    updateRecordTable();
}

// 按发票状态筛选
function filterRecordsByStatus(status) {
    if (!status || status === 'all') {
        filteredRecords = [...records];
    } else {
        filteredRecords = records.filter(record => record.invoiceStatus === status);
    }
    currentPage = 1;
    updateRecordTable();
}

// 清除所有筛选
function clearFilters() {
    // 重置筛选条件
    const searchInput = document.getElementById('searchInput');
    const typeFilter = document.getElementById('typeFilter');
    const statusFilter = document.getElementById('statusFilter');
    
    if (searchInput) searchInput.value = '';
    if (typeFilter) typeFilter.value = 'all';
    if (statusFilter) statusFilter.value = 'all';
    
    // 重置数据
    filteredRecords = [...records];
    currentPage = 1;
    updateRecordTable();
}

// 批量删除选中记录
function deleteSelectedRecords() {
    const checkboxes = document.querySelectorAll('input[name="recordSelect"]:checked');
    if (checkboxes.length === 0) {
        alert('请先选择要删除的记录');
        return;
    }
    
    if (confirm(`确定要删除选中的 ${checkboxes.length} 条记录吗？`)) {
        const selectedIds = Array.from(checkboxes).map(cb => cb.value);
        records = records.filter(record => !selectedIds.includes(record.id));
        filteredRecords = filteredRecords.filter(record => !selectedIds.includes(record.id));
        
        saveRecords();
        updateDashboard();
        updateRecordTable();
        
        alert(`已删除 ${selectedIds.length} 条记录`);
    }
}

// 全选/取消全选
function toggleSelectAll() {
    const selectAllCheckbox = document.getElementById('selectAll');
    const recordCheckboxes = document.querySelectorAll('input[name="recordSelect"]');
    
    recordCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
}

// 显示数据管理
function showDataManagement() {
    alert('数据管理功能开发中...

可用功能：
- 导出数据：点击"导出数据"按钮
- 删除记录：点击记录行的删除按钮');
}

// 显示新增记录模态框
function showAddRecordModal() {
    const description = prompt('请输入记录描述：');
    if (!description) return;
    
    const amount = prompt('请输入金额：');
    if (!amount || isNaN(amount)) {
        alert('请输入有效的金额');
        return;
    }
    
    const type = prompt('请输入类型（income/expense/order）：', 'expense');
    if (!['income', 'expense', 'order'].includes(type)) {
        alert('类型必须是 income、expense 或 order');
        return;
    }
    
    const category = prompt('请输入分类：', '其他');
    
    // 创建新记录
    const newRecord = {
        id: generateUniqueId(),
        date: new Date().toISOString().split('T')[0],
        type: type,
        category: category || '其他',
        description: description,
        amount: parseFloat(amount),
        invoiceAmount: parseFloat(amount),
        invoiceStatus: 'none',
        notes: '',
        createTime: new Date().toISOString()
    };
    
    // 添加到记录列表
    records.unshift(newRecord);
    filteredRecords = [...records];
    
    // 保存并更新界面
    saveRecords();
    updateDashboard();
    updateRecordTable();
    
    alert('记录添加成功！');
}

// 导出数据
function exportData() {
    try {
        const dataStr = JSON.stringify(records, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `sccipc_finance_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        alert('数据导出成功！');
        console.log('📤 数据导出成功');
    } catch (error) {
        console.error('❌ 数据导出失败:', error);
        alert('数据导出失败');
    }
}

// 编辑记录
function editRecord(id) {
    alert(`编辑记录功能开发中... ID: ${id}`);
}

// 删除记录
function deleteRecord(id) {
    if (confirm('确定要删除这条记录吗？')) {
        records = records.filter(record => record.id !== id);
        filteredRecords = filteredRecords.filter(record => record.id !== id);
        saveRecords();
        updateDashboard();
        updateRecordTable();
        console.log(`🗑️ 记录已删除: ${id}`);
    }
}

console.log('📝 脚本加载完成');