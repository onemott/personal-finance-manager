// SCCIPC智能车实验室财务管理系统 - 最终完整版本
console.log('Script开始加载...');

// 全局变量
let records = [];
let filteredRecords = [];
let currentPage = 1;
const recordsPerPage = 10;
const STORAGE_KEY = 'sccipc_lab_finance_records';
let currentEditId = null;
let sortColumn = '';
let sortDirection = 'asc';

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM加载完成，开始初始化...');
    initializeApp();
});

// 初始化应用
function initializeApp() {
    try {
        loadRecords();
        updateDashboard();
        updateRecordTable();
        updateSelectableTable();
        bindEventListeners();
        console.log('应用初始化完成');
    } catch (error) {
        console.error('初始化失败:', error);
    }
}

// 加载记录数据
function loadRecords() {
    try {
        const savedRecords = localStorage.getItem(STORAGE_KEY);
        if (savedRecords) {
            const parsed = JSON.parse(savedRecords);
            records = Array.isArray(parsed) ? parsed : [];
            console.log('加载了', records.length, '条记录');
        } else {
            records = createSampleData();
            saveRecords();
            console.log('创建了示例数据');
        }
        filteredRecords = [...records];
    } catch (error) {
        console.error('加载记录失败:', error);
        records = createSampleData();
        filteredRecords = [...records];
        saveRecords();
    }
}

// 保存记录数据
function saveRecords() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
        localStorage.setItem(STORAGE_KEY + '_lastSaved', new Date().toISOString());
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
            notes: '用于智能车项目',
            createTime: '2024-01-15T10:30:00Z'
        },
        {
            id: '2',
            date: '2024-01-20',
            type: 'income',
            category: '项目资金',
            description: '智能车竞赛资助',
            amount: 5000.00,
            notes: '学校提供的竞赛资金',
            createTime: '2024-01-20T14:20:00Z'
        },
        {
            id: '3',
            date: '2024-01-25',
            type: 'expense',
            category: '维护费用',
            description: '实验室设备维护',
            amount: 800.00,
            notes: '定期维护费用',
            createTime: '2024-01-25T09:15:00Z'
        }
    ];
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
        alert('数据管理界面未找到');
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
    } else {
        console.error('未找到editModal');
        alert('新增记录界面未找到');
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
    
    // 根据标签页类型筛选数据
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
    
    recordCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
    
    updateBatchDeleteButton();
}

function toggleSelectAll() {
    selectAll();
}

function updateSelectableTable() {
    // 更新可选择表格的状态
    updateBatchDeleteButton();
}

function updateBatchDeleteButton() {
    const checkedBoxes = document.querySelectorAll('.record-checkbox:checked');
    const batchDeleteBtn = document.getElementById('batchDeleteBtn');
    
    if (batchDeleteBtn) {
        batchDeleteBtn.disabled = checkedBoxes.length === 0;
        batchDeleteBtn.textContent = checkedBoxes.length > 0 ? 
            `批量删除 (${checkedBoxes.length})` : '批量删除';
    }
}

function batchDelete() {
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
    filteredRecords = filteredRecords.filter(record => !idsToDelete.includes(record.id));
    
    saveRecords();
    updateDashboard();
    updateRecordTable();
    
    alert('删除成功！');
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
                icon.className = sortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
            } else {
                icon.className = 'fas fa-sort';
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
        document.getElementById('recordDetails').innerHTML = `
            <p><strong>日期:</strong> ${record.date}</p>
            <p><strong>类型:</strong> ${record.type === 'income' ? '收入' : record.type === 'expense' ? '支出' : '订单'}</p>
            <p><strong>分类:</strong> ${record.category}</p>
            <p><strong>描述:</strong> ${record.description}</p>
            <p><strong>金额:</strong> ¥${record.amount.toFixed(2)}</p>
            <p><strong>备注:</strong> ${record.notes || '无'}</p>
            <p><strong>创建时间:</strong> ${new Date(record.createTime).toLocaleString()}</p>
        `;
        modal.style.display = 'block';
        currentEditId = id;
    }
}

function editRecord() {
    if (!currentEditId) return;
    
    closeModal();
    
    const record = records.find(r => r.id === currentEditId);
    if (!record) return;
    
    const modal = document.getElementById('editModal');
    if (modal) {
        modal.style.display = 'block';
        document.getElementById('editModalTitle').textContent = '编辑记录';
        
        // 填充表单
        document.getElementById('editType').value = record.type;
        document.getElementById('editCategory').value = record.category;
        document.getElementById('editDescription').value = record.description;
        document.getElementById('editAmount').value = record.amount;
        document.getElementById('editDate').value = record.date;
        document.getElementById('editNotes').value = record.notes || '';
        
        updateCategoryOptions();
    }
}

function deleteRecord(id) {
    if (!confirm('确定要删除这条记录吗？')) return;
    
    records = records.filter(r => r.id !== id);
    filteredRecords = filteredRecords.filter(r => r.id !== id);
    
    saveRecords();
    updateDashboard();
    updateRecordTable();
    
    alert('删除成功！');
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
    }
}

function saveRecord() {
    const form = document.getElementById('editRecordForm');
    if (!form) return;
    
    const type = document.getElementById('editType').value;
    const category = document.getElementById('editCategory').value;
    const description = document.getElementById('editDescription').value;
    const amount = parseFloat(document.getElementById('editAmount').value) || 0;
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
        date,
        notes,
        createTime: new Date().toISOString()
    };
    
    if (currentEditId) {
        // 编辑现有记录
        const index = records.findIndex(r => r.id === currentEditId);
        if (index !== -1) {
            records[index] = { ...records[index], ...recordData };
        }
    } else {
        // 新增记录
        recordData.id = Date.now().toString();
        records.push(recordData);
    }
    
    filteredRecords = [...records];
    saveRecords();
    updateDashboard();
    updateRecordTable();
    closeEditModal();
    
    alert(currentEditId ? '记录更新成功！' : '记录添加成功！');
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
                    records = importedData;
                    filteredRecords = [...records];
                    saveRecords();
                    updateDashboard();
                    updateRecordTable();
                    alert('数据导入成功！');
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

function handleAlipayImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const csvData = e.target.result;
            const lines = csvData.split('\n');
            const importedRecords = [];
            
            // 跳过标题行，从第二行开始解析
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;
                
                const columns = line.split(',');
                if (columns.length >= 5) {
                    const record = {
                        id: Date.now().toString() + '_' + i,
                        date: columns[0].replace(/"/g, ''),
                        type: parseFloat(columns[4]) > 0 ? 'income' : 'expense',
                        category: '支付宝导入',
                        description: columns[1].replace(/"/g, ''),
                        amount: Math.abs(parseFloat(columns[4]) || 0),
                        notes: '从支付宝账单导入',
                        createTime: new Date().toISOString()
                    };
                    importedRecords.push(record);
                }
            }
            
            if (importedRecords.length > 0) {
                if (confirm(`解析到 ${importedRecords.length} 条支付宝记录，确定导入吗？`)) {
                    records = records.concat(importedRecords);
                    filteredRecords = [...records];
                    saveRecords();
                    updateDashboard();
                    updateRecordTable();
                    alert('支付宝数据导入成功！');
                }
            } else {
                alert('未能解析到有效数据');
            }
        } catch (error) {
            alert('支付宝文件解析失败：' + error.message);
        }
    };
    reader.readAsText(file, 'utf-8');
}

function handleWechatImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (typeof XLSX === 'undefined') {
        alert('XLSX库未加载，无法解析Excel文件');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            const importedRecords = jsonData.map((row, index) => ({
                id: Date.now().toString() + '_wx_' + index,
                date: row['交易时间'] ? new Date(row['交易时间']).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                type: (row['收/支'] === '收入' || parseFloat(row['金额(元)']) > 0) ? 'income' : 'expense',
                category: '微信导入',
                description: row['交易对方'] || row['商品'] || '微信交易',
                amount: Math.abs(parseFloat(row['金额(元)']) || 0),
                notes: '从微信账单导入',
                createTime: new Date().toISOString()
            }));
            
            if (importedRecords.length > 0) {
                if (confirm(`解析到 ${importedRecords.length} 条微信记录，确定导入吗？`)) {
                    records = records.concat(importedRecords);
                    filteredRecords = [...records];
                    saveRecords();
                    updateDashboard();
                    updateRecordTable();
                    alert('微信数据导入成功！');
                }
            } else {
                alert('未能解析到有效数据');
            }
        } catch (error) {
            alert('微信文件解析失败：' + error.message);
        }
    };
    reader.readAsArrayBuffer(file);
}

function exportToCSV() {
    if (!Array.isArray(records) || records.length === 0) {
        alert('没有数据可导出');
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
    
    alert('CSV数据导出成功！');
}

function exportToJSON() {
    if (!Array.isArray(records) || records.length === 0) {
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
    
    alert('JSON数据导出成功！');
}

// ===== 数据操作功能 =====

function generateSampleData() {
    if (!confirm('确定要生成示例数据吗？这将添加一些测试记录。')) return;
    
    const sampleData = createSampleData();
    records = records.concat(sampleData);
    filteredRecords = [...records];
    saveRecords();
    updateDashboard();
    updateRecordTable();
    
    alert('示例数据生成成功！');
}

function clearAllData() {
    if (!confirm('确定要清空所有数据吗？此操作不可恢复！')) return;
    
    records = [];
    filteredRecords = [];
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY + '_lastSaved');
    
    updateDashboard();
    updateRecordTable();
    updateStorageInfo();
    
    alert('所有数据已清空！');
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
    
    // 更新显示
    updateElementText('totalBalance', `¥${balance.toFixed(2)}`);
    updateElementText('totalIncome', `¥${totalIncome.toFixed(2)}`);
    updateElementText('totalExpense', `¥${(totalExpense + totalOrder).toFixed(2)}`);
    updateElementText('netIncome', `¥${netIncome.toFixed(2)}`);
    
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

function updateRecordTable() {
    const recordsToShow = filteredRecords || records;
    
    if (!Array.isArray(recordsToShow)) {
        console.error('recordsToShow不是数组');
        return;
    }
    
    const tbody = document.querySelector('#recordTable tbody');
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
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #666;">暂无数据</td></tr>';
        updatePagination();
        return;
    }
    
    pageRecords.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox" class="record-checkbox" data-id="${record.id}" onchange="updateBatchDeleteButton()"></td>
            <td>${record.date || ''}</td>
            <td><span class="type-badge ${record.type}">${record.type === 'income' ? '收入' : record.type === 'expense' ? '支出' : '订单'}</span></td>
            <td>${record.category || ''}</td>
            <td>${record.description || ''}</td>
            <td class="amount ${record.type}">¥${(parseFloat(record.amount) || 0).toFixed(2)}</td>
            <td>
                <button class="btn btn-sm btn-outline" onclick="viewRecord('${record.id}')" title="查看详情">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-primary" onclick="editRecord('${record.id}')" title="编辑">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteRecord('${record.id}')" title="删除">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // 更新分页信息
    updatePagination();
    updateSelectableTable();
    
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
        const lastSavedTime = localStorage.getItem(STORAGE_KEY + '_lastSaved');
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
    
    // 全选复选框
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', toggleSelectAll);
    }
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

console.log('Script加载完成，所有函数已定义');