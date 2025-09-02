// SCCIPC智能车实验室财务管理系统 - 完整版本
console.log('Script开始加载...');

// 全局变量
let records = [];
let currentPage = 1;
const recordsPerPage = 10;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM加载完成，开始初始化...');
    loadRecords();
    updateDashboard();
    updateRecordTable();
    
    // 绑定事件监听器
    bindEventListeners();
});

// 绑定所有事件监听器
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
    
    // 刷新按钮
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            filterRecords();
            updateDashboard();
        });
    }
}

// 防抖函数
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

// 显示数据管理界面 - 匹配HTML中的函数调用
function showDataManagement() {
    console.log('显示数据管理界面');
    const modal = document.getElementById('dataModal');
    if (modal) {
        modal.style.display = 'block';
        updateRecordTable();
    }
}

// 数据管理模态框函数 - 兼容HTML调用
function showDataManagementModal() {
    showDataManagement();
}

// 关闭数据管理界面
function closeDataManagement() {
    const modal = document.getElementById('dataModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function closeDataManagementModal() {
    closeDataManagement();
}

// 显示导出数据界面
function showExportData() {
    console.log('显示导出数据界面');
    const modal = document.getElementById('exportModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

// 导出数据模态框函数 - 兼容HTML调用
function showExportDataModal() {
    showExportData();
}

// 关闭导出界面
function closeExportModal() {
    const modal = document.getElementById('exportModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function closeExportDataModal() {
    closeExportModal();
}

// 显示新增记录界面
function showAddRecord() {
    console.log('显示新增记录界面');
    const modal = document.getElementById('addRecordModal');
    if (modal) {
        modal.style.display = 'block';
        // 重置表单
        const form = document.getElementById('addRecordForm');
        if (form) {
            form.reset();
            // 设置默认日期为今天
            const dateInput = document.getElementById('recordDate');
            if (dateInput) {
                dateInput.value = new Date().toISOString().split('T')[0];
            }
        }
    }
}

// 新增记录模态框函数 - 兼容HTML调用
function showAddRecordModal() {
    showAddRecord();
}

// 关闭新增记录界面
function closeAddRecord() {
    const modal = document.getElementById('addRecordModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function closeAddRecordModal() {
    closeAddRecord();
}

// 添加新记录
function addRecord() {
    const form = document.getElementById('addRecordForm');
    if (!form) return;
    
    const formData = new FormData(form);
    const newRecord = {
        id: Date.now().toString(),
        date: formData.get('date'),
        type: formData.get('type'),
        category: formData.get('category'),
        description: formData.get('description'),
        amount: parseFloat(formData.get('amount')) || 0,
        createTime: new Date().toISOString()
    };
    
    // 验证必填字段
    if (!newRecord.date || !newRecord.type || !newRecord.category || !newRecord.description || newRecord.amount <= 0) {
        alert('请填写所有必填字段，金额必须大于0');
        return;
    }
    
    records.push(newRecord);
    saveRecords();
    updateDashboard();
    updateRecordTable();
    closeAddRecord();
    
    alert('记录添加成功！');
}

// 导出数据为CSV
function exportToCSV() {
    if (records.length === 0) {
        alert('没有数据可导出');
        return;
    }
    
    const headers = ['日期', '类型', '分类', '描述', '金额'];
    const csvContent = [
        headers.join(','),
        ...records.map(record => [
            record.date,
            record.type === 'income' ? '收入' : '支出',
            record.category,
            `"${record.description}"`,
            record.amount
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
    
    closeExportModal();
    alert('数据导出成功！');
}

// 导出数据为JSON
function exportToJSON() {
    if (records.length === 0) {
        alert('没有数据可导出');
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
    
    closeExportModal();
    alert('数据导出成功！');
}

// 加载记录数据
function loadRecords() {
    try {
        const savedRecords = localStorage.getItem('sccipc_lab_finance_records');
        if (savedRecords) {
            records = JSON.parse(savedRecords);
            console.log('加载了', records.length, '条记录');
        } else {
            // 如果没有数据，创建一些示例数据
            records = createSampleData();
            saveRecords();
        }
    } catch (error) {
        console.error('加载记录失败:', error);
        records = createSampleData();
        saveRecords();
    }
}

// 保存记录数据
function saveRecords() {
    try {
        localStorage.setItem('sccipc_lab_finance_records', JSON.stringify(records));
        console.log('保存了', records.length, '条记录');
    } catch (error) {
        console.error('保存记录失败:', error);
    }
}

// 创建示例数据
function createSampleData() {
    return [
        {
            id: '1',
            date: '2024-01-15',
            type: 'expense',
            category: '实验器材',
            description: '购买传感器模块',
            amount: 299.00,
            createTime: '2024-01-15T10:30:00Z'
        },
        {
            id: '2',
            date: '2024-01-20',
            type: 'income',
            category: '项目资金',
            description: '智能车竞赛资助',
            amount: 5000.00,
            createTime: '2024-01-20T14:20:00Z'
        },
        {
            id: '3',
            date: '2024-01-25',
            type: 'expense',
            category: '维护费用',
            description: '实验室设备维护',
            amount: 800.00,
            createTime: '2024-01-25T09:15:00Z'
        }
    ];
}

// 更新仪表板
function updateDashboard() {
    const totalIncome = records.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0);
    const totalExpense = records.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0);
    const balance = totalIncome - totalExpense;
    const netIncome = balance;
    
    // 更新显示
    updateElementText('totalAmount', `¥${balance.toFixed(2)}`);
    updateElementText('totalIncome', `¥${totalIncome.toFixed(2)}`);
    updateElementText('totalExpense', `¥${totalExpense.toFixed(2)}`);
    updateElementText('netIncome', `¥${netIncome.toFixed(2)}`);
}

// 更新元素文本
function updateElementText(id, text) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = text;
    }
}

// 筛选记录
function filterRecords() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('categoryFilter')?.value || '';
    const typeFilter = document.getElementById('typeFilter')?.value || '';
    const startDate = document.getElementById('startDate')?.value || '';
    const endDate = document.getElementById('endDate')?.value || '';
    
    let filteredRecords = records.filter(record => {
        const matchesSearch = !searchTerm || 
            record.description.toLowerCase().includes(searchTerm) ||
            record.category.toLowerCase().includes(searchTerm);
        
        const matchesCategory = !categoryFilter || record.category === categoryFilter;
        const matchesType = !typeFilter || record.type === typeFilter;
        
        const matchesDateRange = (!startDate || record.date >= startDate) &&
                                (!endDate || record.date <= endDate);
        
        return matchesSearch && matchesCategory && matchesType && matchesDateRange;
    });
    
    updateRecordTable(filteredRecords);
}

// 更新记录表格
function updateRecordTable(filteredRecords = null) {
    const recordsToShow = filteredRecords || records;
    const tbody = document.querySelector('#recordTable tbody');
    if (!tbody) return;
    
    // 分页处理
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    const pageRecords = recordsToShow.slice(startIndex, endIndex);
    
    tbody.innerHTML = '';
    
    if (pageRecords.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #666;">暂无数据</td></tr>';
        return;
    }
    
    pageRecords.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox" class="record-checkbox" data-id="${record.id}"></td>
            <td>${record.date}</td>
            <td><span class="type-badge ${record.type}">${record.type === 'income' ? '收入' : '支出'}</span></td>
            <td>${record.category}</td>
            <td>${record.description}</td>
            <td class="amount ${record.type}">¥${record.amount.toFixed(2)}</td>
        `;
        tbody.appendChild(row);
    });
    
    // 更新分页信息
    updatePagination(recordsToShow.length);
}

// 更新分页
function updatePagination(totalRecords) {
    const totalPages = Math.ceil(totalRecords / recordsPerPage);
    const paginationInfo = document.querySelector('.pagination-info');
    if (paginationInfo) {
        paginationInfo.textContent = `第 ${currentPage} 页，共 ${totalPages} 页`;
    }
}

// 删除选中记录
function deleteSelectedRecords() {
    const checkboxes = document.querySelectorAll('.record-checkbox:checked');
    if (checkboxes.length === 0) {
        alert('请选择要删除的记录');
        return;
    }
    
    if (!confirm(`确定要删除选中的 ${checkboxes.length} 条记录吗？`)) {
        return;
    }
    
    const idsToDelete = Array.from(checkboxes).map(cb => cb.dataset.id);
    records = records.filter(record => !idsToDelete.includes(record.id));
    
    saveRecords();
    updateDashboard();
    updateRecordTable();
    
    alert('删除成功！');
}

// 全选/取消全选
function toggleSelectAll() {
    const selectAllCheckbox = document.getElementById('selectAll');
    const recordCheckboxes = document.querySelectorAll('.record-checkbox');
    
    recordCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
}

// 页面跳转
function goToPage(page) {
    const totalPages = Math.ceil(records.length / recordsPerPage);
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    updateRecordTable();
}

// 上一页
function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        updateRecordTable();
    }
}

// 下一页
function nextPage() {
    const totalPages = Math.ceil(records.length / recordsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        updateRecordTable();
    }
}

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

console.log('Script加载完成');