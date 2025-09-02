// JavaScript修复补丁 - 添加缺失的函数

// 如果showDataManagement函数不存在，创建它
if (typeof showDataManagement === 'undefined') {
    function showDataManagement() {
        openDataManagementModal();
    }
}

// 如果openDataManagementModal函数不存在，创建它
if (typeof openDataManagementModal === 'undefined') {
    function openDataManagementModal() {
        const modal = document.getElementById('dataManagementModal');
        if (modal) {
            modal.style.display = 'block';
            updateStorageInfo();
        } else {
            console.error('数据管理模态框未找到');
            alert('数据管理功能暂时不可用，请刷新页面重试');
        }
    }
}

// 如果closeDataManagementModal函数不存在，创建它
if (typeof closeDataManagementModal === 'undefined') {
    function closeDataManagementModal() {
        const modal = document.getElementById('dataManagementModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
}

// 如果updateStorageInfo函数不存在，创建它
if (typeof updateStorageInfo === 'undefined') {
    function updateStorageInfo() {
        const recordCount = records ? records.length : 0;
        const storageSize = localStorage.getItem('sccipc_lab_finance_records') ? 
            Math.round(localStorage.getItem('sccipc_lab_finance_records').length / 1024) : 0;
        const lastSaved = localStorage.getItem('sccipc_lab_finance_records_timestamp') || '未知';
        
        document.getElementById('storageRecordCount').textContent = recordCount;
        document.getElementById('storageSize').textContent = storageSize + ' KB';
        document.getElementById('lastSaved').textContent = lastSaved;
    }
}

console.log('JavaScript修复补丁已加载');