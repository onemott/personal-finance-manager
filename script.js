// SCCIPC智能车实验室财务管理系统 - 清理版本
console.log('Script开始加载...');

// 全局变量
let records = [];
let filteredRecords = [];
let currentPage = 1;
let itemsPerPage = 10;

// 本地存储管理
const STORAGE_KEY = 'sccipc_lab_finance_records';

// 数据管理功能
function showDataManagement() {
    console.log('showDataManagement函数被调用');
    const modal = document.getElementById('dataManagementModal');
    if (modal) {
        modal.style.display = 'block';
        console.log('数据管理模态框已打开');
    } else {
        console.error('未找到dataManagementModal元素');
        alert('数据管理模态框未找到');
    }
}

function closeDataManagementModal() {
    console.log('closeDataManagementModal函数被调用');
    const modal = document.getElementById('dataManagementModal');
    if (modal) {
        modal.style.display = 'none';
        console.log('数据管理模态框已关闭');
    }
}

// 基础功能
function showAddRecordModal() {
    console.log('showAddRecordModal函数被调用');
    alert('新增记录功能正在开发中');
}

function exportData() {
    console.log('exportData函数被调用');
    alert('导出数据功能正在开发中');
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('页面加载完成，开始初始化...');
    
    // 初始化数据
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
        try {
            records = JSON.parse(savedData);
            console.log('成功加载本地数据，记录数量:', records.length);
        } catch (error) {
            console.error('解析本地数据失败:', error);
            records = [];
        }
    } else {
        console.log('未找到本地数据，使用空数组');
        records = [];
    }
    
    filteredRecords = [...records];
    
    // 更新显示
    updateDisplay();
    
    console.log('初始化完成！');
});

// 更新显示函数
function updateDisplay() {
    console.log('更新显示...');
    
    // 更新统计卡片
    updateOverviewCards();
    
    // 更新记录列表
    updateRecordsList();
}

function updateOverviewCards() {
    // 计算统计数据
    const totalIncome = records
        .filter(r => r.type === 'income')
        .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
    
    const totalExpense = records
        .filter(r => r.type === 'expense')
        .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
    
    const netIncome = totalIncome - totalExpense;
    
    // 更新DOM元素
    const totalBalanceEl = document.getElementById('totalBalance');
    const totalIncomeEl = document.getElementById('totalIncome');
    const totalExpenseEl = document.getElementById('totalExpense');
    const netIncomeEl = document.getElementById('netIncome');
    
    if (totalBalanceEl) totalBalanceEl.textContent = `¥${netIncome.toFixed(2)}`;
    if (totalIncomeEl) totalIncomeEl.textContent = `¥${totalIncome.toFixed(2)}`;
    if (totalExpenseEl) totalExpenseEl.textContent = `¥${totalExpense.toFixed(2)}`;
    if (netIncomeEl) netIncomeEl.textContent = `¥${netIncome.toFixed(2)}`;
    
    console.log('统计卡片更新完成');
}

function updateRecordsList() {
    console.log('更新记录列表...');
    
    const recordsContainer = document.querySelector('.records-list');
    if (!recordsContainer) {
        console.log('未找到记录列表容器');
        return;
    }
    
    if (filteredRecords.length === 0) {
        recordsContainer.innerHTML = '<div class="no-records">暂无记录数据</div>';
    } else {
        recordsContainer.innerHTML = '<div class="records-placeholder">记录列表功能开发中...</div>';
    }
    
    console.log('记录列表更新完成');
}

console.log('Script加载完成！');