// 全局变量
let records = [];
let filteredRecords = [];
let currentPage = 1;
let itemsPerPage = 10;
let sortColumn = '';
let sortDirection = 'asc';
let selectedRecords = new Set();
let currentEditingRecord = null;
let currentTab = 'all';

// 本地存储管理
const STORAGE_KEY = 'sccipc_lab_finance_records';
const STORAGE_VERSION = '2.0';

// 分类配置
const categories = {
    income: [
        { value: 'salary', label: '工资收入' },
        { value: 'bonus', label: '奖金' },
        { value: 'investment', label: '投资收益' },
        { value: 'freelance', label: '兼职收入' },
        { value: 'gift', label: '礼金收入' },
        { value: 'other_income', label: '其他收入' }
    ],
    expense: [
        { value: 'food', label: '餐饮' },
        { value: 'transport', label: '交通' },
        { value: 'shopping', label: '购物' },
        { value: 'entertainment', label: '娱乐' },
        { value: 'utilities', label: '生活缴费' },
        { value: 'healthcare', label: '医疗' },
        { value: 'education', label: '教育' },
        { value: 'housing', label: '住房' },
        { value: 'other_expense', label: '其他支出' }
    ],
    order: [
        { value: 'online_shopping', label: '网购' },
        { value: 'grocery', label: '生鲜超市' },
        { value: 'clothing', label: '服装' },
        { value: 'electronics', label: '数码电子' },
        { value: 'books', label: '图书' },
        { value: 'other_order', label: '其他订单' }
    ]
};

// 初始化数据
function initializeData() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    
    if (savedData) {
        const loadedRecords = loadRecordsFromStorage();
        if (loadedRecords !== null) {
            records = loadedRecords.map(record => ({
                ...record,
                date: new Date(record.date)
            }));
            console.log(`从本地存储加载了 ${records.length} 条记录`);
            
            filteredRecords = [...records];
            updateDisplay();
            
            if (records.length === 0) {
                showNotification('本地存储为空，如需生成示例数据请点击"数据管理"', 'info');
            } else {
                showNotification(`已加载 ${records.length} 条记录（来源：本地存储）`, 'info');
            }
            return;
        }
    }
    
    // 如果没有本地存储数据，生成示例数据
    generateSampleRecords();
    console.log('生成了新的示例数据');
    
    filteredRecords = [...records];
    updateDisplay();
    showNotification(`已加载 ${records.length} 条记录（来源：示例数据）`, 'info');
}

// 生成示例记录数据
function generateSampleRecords() {
    records = [];
    const today = new Date();
    
    // 生成最近3个月的示例数据
    for (let i = 0; i < 30; i++) {
        const date = new Date(today.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000);
        
        // 收入记录
        if (Math.random() > 0.7) {
            records.push({
                id: records.length + 1,
                type: 'income',
                category: 'salary',
                description: '工资收入',
                amount: (Math.random() * 5000 + 8000).toFixed(2),
                date: date,
                notes: '月度工资'
            });
        }
        
        // 支出记录
        const expenseCategories = ['food', 'transport', 'shopping', 'entertainment', 'utilities'];
        const expenseDescriptions = {
            food: ['午餐', '晚餐', '早餐', '零食', '饮料'],
            transport: ['地铁', '公交', '打车', '加油', '停车费'],
            shopping: ['日用品', '衣服', '鞋子', '化妆品', '礼品'],
            entertainment: ['电影', '游戏', 'KTV', '旅游', '健身'],
            utilities: ['电费', '水费', '网费', '手机费', '房租']
        };
        
        const category = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
        const descriptions = expenseDescriptions[category];
        const description = descriptions[Math.floor(Math.random() * descriptions.length)];
        
        records.push({
            id: records.length + 1,
            type: 'expense',
            category: category,
            description: description,
            amount: (Math.random() * 500 + 10).toFixed(2),
            date: new Date(date.getTime() + Math.random() * 24 * 60 * 60 * 1000),
            notes: ''
        });
        
        // 购物订单
        if (Math.random() > 0.8) {
            records.push({
                id: records.length + 1,
                type: 'order',
                category: 'online_shopping',
                description: '网购订单',
                amount: (Math.random() * 300 + 50).toFixed(2),
                date: new Date(date.getTime() + Math.random() * 24 * 60 * 60 * 1000),
                notes: '在线购物'
            });
        }
    }
    
    // 添加一些投资收益
    records.push({
        id: records.length + 1,
        type: 'income',
        category: 'investment',
        description: '股票收益',
        amount: '1200.00',
        date: new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000),
        notes: '股票分红'
    });
    
    saveRecordsToStorage();
}

// 更新显示
function updateDisplay() {
    updateFinancialOverview();
    updateTable();
    updatePagination();
}

// 更新财务概览
function updateFinancialOverview() {
    const today = new Date();
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    
    let totalIncome = 0;
    let totalExpense = 0;
    let monthlyIncome = 0;
    let monthlyExpense = 0;
    let lastMonthIncome = 0;
    let lastMonthExpense = 0;
    
    records.forEach(record => {
        const amount = parseFloat(record.amount);
        const recordDate = new Date(record.date);
        
        if (record.type === 'income') {
            totalIncome += amount;
            if (recordDate >= thisMonth) {
                monthlyIncome += amount;
            }
            if (recordDate >= lastMonth && recordDate < thisMonth) {
                lastMonthIncome += amount;
            }
        } else {
            totalExpense += amount;
            if (recordDate >= thisMonth) {
                monthlyExpense += amount;
            }
            if (recordDate >= lastMonth && recordDate < thisMonth) {
                lastMonthExpense += amount;
            }
        }
    });
    
    const totalBalance = totalIncome - totalExpense;
    const monthlyNet = monthlyIncome - monthlyExpense;
    const lastMonthNet = lastMonthIncome - lastMonthExpense;
    const balanceChange = monthlyNet - lastMonthNet;
    
    document.getElementById('totalBalance').textContent = `¥${totalBalance.toFixed(2)}`;
    document.getElementById('totalIncome').textContent = `¥${totalIncome.toFixed(2)}`;
    document.getElementById('totalExpense').textContent = `¥${totalExpense.toFixed(2)}`;
    document.getElementById('netIncome').textContent = `¥${(totalIncome - totalExpense).toFixed(2)}`;
    
    document.getElementById('monthlyIncome').textContent = `本月: +¥${monthlyIncome.toFixed(2)}`;
    document.getElementById('monthlyExpense').textContent = `本月: -¥${monthlyExpense.toFixed(2)}`;
    document.getElementById('monthlyNet').textContent = `本月: ¥${monthlyNet.toFixed(2)}`;
    
    const trendText = balanceChange >= 0 ? `+¥${balanceChange.toFixed(2)}` : `¥${balanceChange.toFixed(2)}`;
    document.getElementById('balanceTrend').textContent = `本月变化: ${trendText}`;
    document.getElementById('balanceTrend').style.color = balanceChange >= 0 ? '#28a745' : '#dc3545';
}

// 更新表格
function updateTable() {
    const tbody = document.getElementById('recordsTableBody');
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageRecords = filteredRecords.slice(startIndex, endIndex);
    
    if (pageRecords.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <h3>暂无记录数据</h3>
                    <p>请尝试调整筛选条件或添加新记录</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = pageRecords.map(record => `
        <tr class="${selectedRecords.has(record.id) ? 'selected-row' : ''}">
            <td>
                <input type="checkbox" 
                       ${selectedRecords.has(record.id) ? 'checked' : ''} 
                       onchange="toggleRecordSelection(${record.id})">
            </td>
            <td>${formatDate(record.date)}</td>
            <td>
                <span class="type-badge type-${record.type}">
                    ${getTypeText(record.type)}
                </span>
            </td>
            <td>${getCategoryText(record.category)}</td>
            <td>${record.description}</td>
            <td>
                <span class="amount-${record.type === 'income' ? 'positive' : 'negative'}">
                    ${record.type === 'income' ? '+' : '-'}¥${record.amount}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn btn-view tooltip" onclick="viewRecord(${record.id})">
                        <i class="fas fa-eye"></i>
                        <span class="tooltiptext">查看详情</span>
                    </button>
                    <button class="action-btn btn-edit tooltip" onclick="editRecordModal(${record.id})">
                        <i class="fas fa-edit"></i>
                        <span class="tooltiptext">编辑记录</span>
                    </button>
                    <button class="action-btn btn-delete tooltip" onclick="deleteRecord(${record.id})">
                        <i class="fas fa-trash"></i>
                        <span class="tooltiptext">删除记录</span>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    updateSelectAllCheckbox();
}

// 更新分页
function updatePagination() {
    const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
    document.getElementById('pageInfo').textContent = `第 ${currentPage} 页，共 ${totalPages} 页`;
    document.getElementById('prevBtn').disabled = currentPage <= 1;
    document.getElementById('nextBtn').disabled = currentPage >= totalPages;
}

// 获取类型文本
function getTypeText(type) {
    const typeMap = {
        income: '收入',
        expense: '支出',
        order: '订单'
    };
    return typeMap[type] || type;
}

// 获取分类文本
function getCategoryText(category) {
    for (const type in categories) {
        const found = categories[type].find(cat => cat.value === category);
        if (found) return found.label;
    }
    return category;
}

// 格式化日期
function formatDate(date) {
    return new Date(date).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

// 切换标签页
function switchTab(tab) {
    currentTab = tab;
    
    // 更新标签页样式
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    
    // 更新表格标题
    const titles = {
        all: '全部记录',
        income: '收入记录',
        expense: '支出记录',
        orders: '购物订单'
    };
    document.getElementById('tableTitle').textContent = titles[tab];
    
    // 重新筛选数据
    filterRecords();
}

// 筛选记录
function filterRecords() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    filteredRecords = records.filter(record => {
        // 标签页筛选
        let matchesTab = true;
        if (currentTab === 'income') {
            matchesTab = record.type === 'income';
        } else if (currentTab === 'expense') {
            matchesTab = record.type === 'expense';
        } else if (currentTab === 'orders') {
            matchesTab = record.type === 'order';
        }
        
        // 搜索筛选
        const matchesSearch = !searchTerm || 
            record.description.toLowerCase().includes(searchTerm) ||
            getCategoryText(record.category).toLowerCase().includes(searchTerm);
        
        // 分类筛选
        const matchesCategory = !categoryFilter || record.category === categoryFilter;
        
        // 日期筛选
        let matchesDate = true;
        const recordDate = new Date(record.date);
        const today = new Date();
        
        if (dateFilter) {
            switch (dateFilter) {
                case 'today':
                    matchesDate = recordDate.toDateString() === today.toDateString();
                    break;
                case 'week':
                    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                    matchesDate = recordDate >= weekAgo;
                    break;
                case 'month':
                    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                    matchesDate = recordDate >= monthStart;
                    break;
                case 'quarter':
                    const quarterStart = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);
                    matchesDate = recordDate >= quarterStart;
                    break;
                case 'year':
                    const yearStart = new Date(today.getFullYear(), 0, 1);
                    matchesDate = recordDate >= yearStart;
                    break;
            }
        }
        
        // 自定义日期范围
        if (startDate) {
            matchesDate = matchesDate && recordDate >= new Date(startDate);
        }
        if (endDate) {
            matchesDate = matchesDate && recordDate <= new Date(endDate + ' 23:59:59');
        }
        
        return matchesTab && matchesSearch && matchesCategory && matchesDate;
    });
    
    currentPage = 1;
    selectedRecords.clear();
    updateDisplay();
}

// 重置筛选
function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('dateFilter').value = '';
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    
    filterRecords();
}

// 排序表格
function sortTable(column) {
    if (sortColumn === column) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        sortColumn = column;
        sortDirection = 'asc';
    }
    
    filteredRecords.sort((a, b) => {
        let aValue = a[column];
        let bValue = b[column];
        
        // 处理数字类型
        if (column === 'amount') {
            aValue = parseFloat(aValue);
            bValue = parseFloat(bValue);
        }
        
        // 处理日期类型
        if (column === 'date') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
        }
        
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
    
    updateTable();
}

// 切换页面
function changePage(direction) {
    const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
    const newPage = currentPage + direction;
    
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        updateTable();
        updatePagination();
    }
}

// 选择记录
function toggleRecordSelection(recordId) {
    if (selectedRecords.has(recordId)) {
        selectedRecords.delete(recordId);
    } else {
        selectedRecords.add(recordId);
    }
    
    updateTable();
    updateBatchDeleteButton();
}

// 全选/取消全选
function toggleSelectAll() {
    const checkbox = document.getElementById('selectAllCheckbox');
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageRecords = filteredRecords.slice(startIndex, endIndex);
    
    if (checkbox.checked) {
        pageRecords.forEach(record => selectedRecords.add(record.id));
    } else {
        pageRecords.forEach(record => selectedRecords.delete(record.id));
    }
    
    updateTable();
    updateBatchDeleteButton();
}

// 更新全选复选框状态
function updateSelectAllCheckbox() {
    const checkbox = document.getElementById('selectAllCheckbox');
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageRecords = filteredRecords.slice(startIndex, endIndex);
    
    const selectedPageRecords = pageRecords.filter(record => selectedRecords.has(record.id));
    
    if (selectedPageRecords.length === 0) {
        checkbox.checked = false;
        checkbox.indeterminate = false;
    } else if (selectedPageRecords.length === pageRecords.length) {
        checkbox.checked = true;
        checkbox.indeterminate = false;
    } else {
        checkbox.checked = false;
        checkbox.indeterminate = true;
    }
}

// 更新批量删除按钮状态
function updateBatchDeleteButton() {
    const btn = document.getElementById('batchDeleteBtn');
    if (btn) {
        btn.disabled = selectedRecords.size === 0;
        btn.innerHTML = selectedRecords.size > 0 ? 
            `<i class="fas fa-trash"></i> 批量删除 (${selectedRecords.size})` : 
            '<i class="fas fa-trash"></i> 批量删除';
    }
}

// 显示新增记录模态框
function showAddRecordModal() {
    currentEditingRecord = null;
    document.getElementById('editModalTitle').textContent = '新增记录';
    
    // 重置表单
    document.getElementById('editType').value = 'expense';
    document.getElementById('editDescription').value = '';
    document.getElementById('editAmount').value = '';
    document.getElementById('editDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('editNotes').value = '';
    
    updateCategoryOptions();
    document.getElementById('editModal').style.display = 'block';
}

// 更新分类选项
function updateCategoryOptions() {
    const typeSelect = document.getElementById('editType');
    const categorySelect = document.getElementById('editCategory');
    const selectedType = typeSelect.value;
    
    categorySelect.innerHTML = '';
    
    if (categories[selectedType]) {
        categories[selectedType].forEach(category => {
            const option = document.createElement('option');
            option.value = category.value;
            option.textContent = category.label;
            categorySelect.appendChild(option);
        });
    }
}

// 查看记录详情
function viewRecord(recordId) {
    const record = records.find(r => r.id === recordId);
    if (!record) return;
    
    const detailsHtml = `
        <div class="record-detail-item">
            <span class="record-detail-label">日期:</span>
            <span class="record-detail-value">${formatDate(record.date)}</span>
        </div>
        <div class="record-detail-item">
            <span class="record-detail-label">类型:</span>
            <span class="record-detail-value">
                <span class="type-badge type-${record.type}">
                    ${getTypeText(record.type)}
                </span>
            </span>
        </div>
        <div class="record-detail-item">
            <span class="record-detail-label">分类:</span>
            <span class="record-detail-value">${getCategoryText(record.category)}</span>
        </div>
        <div class="record-detail-item">
            <span class="record-detail-label">描述:</span>
            <span class="record-detail-value">${record.description}</span>
        </div>
        <div class="record-detail-item">
            <span class="record-detail-label">金额:</span>
            <span class="record-detail-value">
                <span class="amount-${record.type === 'income' ? 'positive' : 'negative'}">
                    ${record.type === 'income' ? '+' : '-'}¥${record.amount}
                </span>
            </span>
        </div>
        <div class="record-detail-item">
            <span class="record-detail-label">备注:</span>
            <span class="record-detail-value">${record.notes || '无'}</span>
        </div>
    `;
    
    document.getElementById('recordDetails').innerHTML = detailsHtml;
    document.getElementById('recordModal').style.display = 'block';
    currentEditingRecord = record;
}

// 编辑记录模态框
function editRecordModal(recordId) {
    const record = records.find(r => r.id === recordId);
    if (!record) return;
    
    currentEditingRecord = record;
    document.getElementById('editModalTitle').textContent = '编辑记录';
    
    document.getElementById('editType').value = record.type;
    updateCategoryOptions();
    document.getElementById('editCategory').value = record.category;
    document.getElementById('editDescription').value = record.description;
    document.getElementById('editAmount').value = record.amount;
    document.getElementById('editDate').value = record.date.toISOString().split('T')[0];
    document.getElementById('editNotes').value = record.notes;
    
    document.getElementById('editModal').style.display = 'block';
}

// 保存记录
function saveRecord() {
    const type = document.getElementById('editType').value;
    const category = document.getElementById('editCategory').value;
    const description = document.getElementById('editDescription').value;
    const amount = document.getElementById('editAmount').value;
    const date = document.getElementById('editDate').value;
    const notes = document.getElementById('editNotes').value;
    
    if (!type || !category || !description || !amount || !date) {
        alert('请填写必填字段！');
        return;
    }
    
    if (currentEditingRecord) {
        // 编辑现有记录
        currentEditingRecord.type = type;
        currentEditingRecord.category = category;
        currentEditingRecord.description = description;
        currentEditingRecord.amount = parseFloat(amount).toFixed(2);
        currentEditingRecord.date = new Date(date);
        currentEditingRecord.notes = notes;
        
        // 更新filteredRecords中的数据
        const filteredIndex = filteredRecords.findIndex(r => r.id === currentEditingRecord.id);
        if (filteredIndex !== -1) {
            filteredRecords[filteredIndex] = { ...currentEditingRecord };
        }
        
        showNotification('记录更新成功！', 'success');
    } else {
        // 新增记录
        const newRecord = {
            id: records.length > 0 ? Math.max(...records.map(r => r.id)) + 1 : 1,
            type: type,
            category: category,
            description: description,
            amount: parseFloat(amount).toFixed(2),
            date: new Date(date),
            notes: notes
        };
        
        records.unshift(newRecord);
        filterRecords(); // 重新筛选以更新显示
        
        showNotification('记录添加成功！', 'success');
    }
    
    saveRecordsToStorage();
    closeEditModal();
    updateDisplay();
}

// 删除记录
function deleteRecord(recordId) {
    if (confirm('确定要删除这条记录吗？')) {
        const recordIndex = records.findIndex(r => r.id === recordId);
        if (recordIndex !== -1) {
            records.splice(recordIndex, 1);
        }
        
        const filteredIndex = filteredRecords.findIndex(r => r.id === recordId);
        if (filteredIndex !== -1) {
            filteredRecords.splice(filteredIndex, 1);
        }
        
        selectedRecords.delete(recordId);
        
        const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
        if (currentPage > totalPages && totalPages > 0) {
            currentPage = totalPages;
        }
        
        saveRecordsToStorage();
        updateDisplay();
        showNotification('记录删除成功！', 'success');
    }
}

// 批量删除
function batchDelete() {
    if (selectedRecords.size === 0) return;
    
    if (confirm(`确定要删除选中的 ${selectedRecords.size} 条记录吗？`)) {
        const deletedCount = selectedRecords.size;
        
        records = records.filter(r => !selectedRecords.has(r.id));
        filteredRecords = filteredRecords.filter(r => !selectedRecords.has(r.id));
        
        selectedRecords.clear();
        
        const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
        if (currentPage > totalPages && totalPages > 0) {
            currentPage = totalPages;
        } else if (filteredRecords.length === 0) {
            currentPage = 1;
        }
        
        saveRecordsToStorage();
        updateDisplay();
        showNotification(`成功删除 ${deletedCount} 条记录！`, 'success');
    }
}

// 全选当前页
function selectAll() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageRecords = filteredRecords.slice(startIndex, endIndex);
    
    pageRecords.forEach(record => selectedRecords.add(record.id));
    updateTable();
    updateBatchDeleteButton();
}

// 本地存储功能
function saveRecordsToStorage() {
    try {
        const dataToSave = {
            version: STORAGE_VERSION,
            timestamp: new Date().toISOString(),
            records: records,
            totalCount: records.length
        };
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
        console.log(`已保存 ${records.length} 条记录到本地存储`);
        return true;
    } catch (error) {
        console.error('保存记录数据失败:', error);
        showNotification('保存数据失败，请检查浏览器存储空间', 'error');
        return false;
    }
}

function loadRecordsFromStorage() {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (!savedData) {
            return null;
        }
        
        const parsedData = JSON.parse(savedData);
        
        if (parsedData.version !== STORAGE_VERSION) {
            console.warn('数据版本不匹配，将重新生成数据');
            return null;
        }
        
        console.log(`从本地存储加载了 ${parsedData.totalCount} 条记录数据`);
        return parsedData.records || [];
    } catch (error) {
        console.error('加载记录数据失败:', error);
        showNotification('加载本地数据失败，将使用默认数据', 'error');
        return null;
    }
}

// 数据管理功能
function showDataManagement() {
    updateStorageInfo();
    const modal = document.getElementById('dataManagementModal');
    modal.style.display = 'block';
    
    // 检查是否需要滚动提示
    setTimeout(() => {
        const modalBody = modal.querySelector('.modal-body');
        if (modalBody.scrollHeight > modalBody.clientHeight) {
            modalBody.classList.add('has-scroll');
            
            // 添加滚动提示元素
            if (!modalBody.querySelector('.scroll-indicator')) {
                const indicator = document.createElement('div');
                indicator.className = 'scroll-indicator';
                indicator.textContent = '↓ 可滚动查看更多';
                modalBody.appendChild(indicator);
                
                // 滚动时隐藏提示
                modalBody.addEventListener('scroll', function() {
                    if (this.scrollTop > 20) {
                        indicator.style.opacity = '0';
                    }
                });
            }
        }
    }, 100);
}

function closeDataManagementModal() {
    document.getElementById('dataManagementModal').style.display = 'none';
}

function updateStorageInfo() {
    const info = getStorageInfo();
    document.getElementById('storageRecordCount').textContent = info.recordCount;
    document.getElementById('storageSize').textContent = info.storageSize;
    document.getElementById('lastSaved').textContent = info.lastSaved ? 
        new Date(info.lastSaved).toLocaleString('zh-CN') : '未知';
}

function getStorageInfo() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        const sizeInBytes = data ? new Blob([data]).size : 0;
        const sizeInKB = (sizeInBytes / 1024).toFixed(2);
        
        return {
            recordCount: records.length,
            storageSize: `${sizeInKB} KB`,
            lastSaved: data ? JSON.parse(data).timestamp : null
        };
    } catch (error) {
        return {
            recordCount: 0,
            storageSize: '0 KB',
            lastSaved: null
        };
    }
}

function generateSampleData() {
    if (confirm('确定要生成示例数据吗？这将添加一些示例记录。')) {
        generateSampleRecords();
        filteredRecords = [...records];
        selectedRecords.clear();
        currentPage = 1;
        updateDisplay();
        closeDataManagementModal();
        showNotification('已生成示例数据', 'success');
    }
}

function clearAllData() {
    if (confirm('确定要清空所有数据吗？此操作不可恢复！')) {
        try {
            localStorage.removeItem(STORAGE_KEY);
            records = [];
            filteredRecords = [];
            selectedRecords.clear();
            currentPage = 1;
            
            updateDisplay();
            closeDataManagementModal();
            showNotification('所有数据已清空', 'success');
        } catch (error) {
            console.error('清空数据失败:', error);
            showNotification('清空数据失败', 'error');
        }
    }
}

// 导出功能
function exportData() {
    const csvContent = "data:text/csv;charset=utf-8," 
        + "日期,类型,分类,描述,金额,备注\n"
        + filteredRecords.map(record => 
            `${formatDate(record.date)},${getTypeText(record.type)},${getCategoryText(record.category)},${record.description},${record.type === 'income' ? '+' : '-'}${record.amount},${record.notes}`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `财务记录_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('数据导出成功！', 'success');
}

function exportDataAsJSON() {
    try {
        const dataToExport = {
            exportTime: new Date().toISOString(),
            version: STORAGE_VERSION,
            totalCount: records.length,
            records: records
        };
        
        const jsonString = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `财务记录_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        showNotification('JSON数据导出成功！', 'success');
    } catch (error) {
        console.error('导出JSON失败:', error);
        showNotification('导出失败', 'error');
    }
}

function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.type !== 'application/json') {
        showNotification('请选择JSON格式的文件', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const jsonData = e.target.result;
            const parsedData = JSON.parse(jsonData);
            
            let importRecords = [];
            if (parsedData.records && Array.isArray(parsedData.records)) {
                importRecords = parsedData.records;
            } else if (Array.isArray(parsedData)) {
                importRecords = parsedData;
            } else {
                throw new Error('不支持的文件格式');
            }
            
            // 验证数据结构
            const requiredFields = ['type', 'category', 'description', 'amount', 'date'];
            const isValidData = importRecords.every(record => 
                requiredFields.every(field => record.hasOwnProperty(field))
            );
            
            if (!isValidData) {
                throw new Error('导入的数据缺少必要字段');
            }
            
            // 重新分配ID以避免冲突
            const maxId = records.length > 0 ? Math.max(...records.map(r => r.id)) : 0;
            const processedRecords = importRecords.map((record, index) => ({
                ...record,
                id: maxId + index + 1,
                date: new Date(record.date)
            }));
            
            records.push(...processedRecords);
            filteredRecords = [...records];
            
            saveRecordsToStorage();
            updateDisplay();
            closeDataManagementModal();
            
            showNotification(`成功导入 ${processedRecords.length} 条记录`, 'success');
        } catch (error) {
            console.error('文件解析失败:', error);
            showNotification('文件格式错误或损坏', 'error');
        }
    };
    
    reader.readAsText(file);
    event.target.value = '';
}

// 模态框控制
function closeModal() {
    document.getElementById('recordModal').style.display = 'none';
    currentEditingRecord = null;
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    currentEditingRecord = null;
}

function editRecord() {
    if (currentEditingRecord) {
        closeModal();
        editRecordModal(currentEditingRecord.id);
    }
}

// 显示通知
function showNotification(message, type = 'info') {
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    let iconClass = 'info-circle';
    let bgColor = '#d1ecf1';
    let textColor = '#0c5460';
    
    switch(type) {
        case 'success':
            iconClass = 'check-circle';
            bgColor = '#d4edda';
            textColor = '#155724';
            break;
        case 'error':
            iconClass = 'exclamation-triangle';
            bgColor = '#f8d7da';
            textColor = '#721c24';
            break;
        case 'warning':
            iconClass = 'exclamation-circle';
            bgColor = '#fff3cd';
            textColor = '#856404';
            break;
    }
    
    notification.innerHTML = `
        <i class="fas fa-${iconClass}"></i>
        ${message}
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
        color: ${textColor};
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideInRight 0.3s ease;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-size: 14px;
        max-width: 300px;
        border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : '#ffeaa7'};
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification && notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification && notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, type === 'error' ? 5000 : 3000);
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 事件监听
window.addEventListener('click', function(event) {
    const recordModal = document.getElementById('recordModal');
    const editModal = document.getElementById('editModal');
    const dataManagementModal = document.getElementById('dataManagementModal');
    
    if (recordModal && event.target === recordModal) {
        closeModal();
    }
    if (editModal && event.target === editModal) {
        closeEditModal();
    }
    if (dataManagementModal && event.target === dataManagementModal) {
        closeDataManagementModal();
    }
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
        closeEditModal();
        closeDataManagementModal();
    }
    
    if (event.ctrlKey && event.key === 'a') {
        event.preventDefault();
        selectAll();
    }
    
    if (event.key === 'Delete' && selectedRecords.size > 0) {
        batchDelete();
    }
});

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeData();
    
    // 设置默认日期为今天
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('editDate').value = today;
});

// 实时搜索防抖
let searchTimeout;
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(filterRecords, 300);
        });
    }
});

// 页面卸载时保存数据
window.addEventListener('beforeunload', function() {
    saveRecordsToStorage();
});

// 定期自动保存（每5分钟）
setInterval(function() {
    if (records.length > 0) {
        saveRecordsToStorage();
        console.log('自动保存记录数据');
    }
}, 5 * 60 * 1000);
