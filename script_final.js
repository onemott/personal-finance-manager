// SCCIPC智能车实验室财务管理系统 - 修复版本
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
        console.log('数据保存成功');
    } catch (error) {
        console.error('数据保存失败:', error);
    }
}

// 创建示例数据
function createSampleData() {
    const sampleData = [
        {
            id: '1',
            date: '2024-01-15',
            type: 'income',
            category: '项目资金',
            description: '智能车竞赛资助',
            amount: 5000,
            notes: '用于购买传感器和开发板',
            createTime: new Date().toISOString()
        },
        {
            id: '2',
            date: '2024-01-16',
            type: 'expense',
            description: '购买Arduino开发板',
            category: '实验器材',
            amount: 299,
            notes: '用于智能车控制系统',
            createTime: new Date().toISOString()
        },
        {
            id: '3',
            date: '2024-01-17',
            type: 'order',
            category: '电子产品',
            description: '超声波传感器',
            amount: 89,
            notes: 'HC-SR04型号',
            createTime: new Date().toISOString()
        }
    ];
    return sampleData;
}

// 绑定事件监听器
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

    console.log('事件监听器绑定完成');
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

// ===== 支付宝导入功能（修复版） =====
function handleAlipayImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    console.log('开始处理支付宝文件:', file.name, '大小:', file.size);
    
    // 尝试多种编码格式
    const encodings = ['utf-8', 'gbk', 'gb2312'];
    let currentEncodingIndex = 0;
    
    function tryReadWithEncoding() {
        const reader = new FileReader();
        const encoding = encodings[currentEncodingIndex];
        
        reader.onload = function(e) {
            try {
                const csvData = e.target.result;
                console.log(`尝试使用${encoding}编码读取文件`);
                console.log('文件内容前500字符:', csvData.substring(0, 500));
                
                const importedRecords = parseAlipayCSV(csvData);
                
                if (importedRecords.length > 0) {
                    console.log(`成功解析${importedRecords.length}条记录`);
                    if (confirm(`解析到 ${importedRecords.length} 条支付宝记录，确定导入吗？`)) {
                        records = records.concat(importedRecords);
                        filteredRecords = [...records];
                        saveRecords();
                        updateDashboard();
                        updateRecordTable();
                        console.log('支付宝数据导入成功！');
                    }
                } else if (currentEncodingIndex < encodings.length - 1) {
                    // 尝试下一种编码
                    currentEncodingIndex++;
                    console.log(`${encoding}编码解析失败，尝试下一种编码`);
                    tryReadWithEncoding();
                } else {
                    alert('无法解析支付宝文件，请检查文件格式是否正确\n\n支持的格式：\n- 支付宝官方导出的CSV文件\n- 包含交易时间、金额、商品说明等字段');
                }
            } catch (error) {
                console.error(`使用${encoding}编码解析失败:`, error);
                if (currentEncodingIndex < encodings.length - 1) {
                    currentEncodingIndex++;
                    tryReadWithEncoding();
                } else {
                    alert('支付宝文件解析失败：' + error.message);
                }
            }
        };
        
        reader.onerror = function() {
            console.error(`使用${encoding}编码读取文件失败`);
            if (currentEncodingIndex < encodings.length - 1) {
                currentEncodingIndex++;
                tryReadWithEncoding();
            } else {
                alert('文件读取失败，请检查文件是否损坏');
            }
        };
        
        reader.readAsText(file, encoding);
    }
    
    tryReadWithEncoding();
}

// 支付宝CSV解析函数（完全重写）
function parseAlipayCSV(csvData) {
    const lines = csvData.split('\n');
    const importedRecords = [];
    
    console.log('CSV总行数:', lines.length);
    console.log('前10行内容:', lines.slice(0, 10));
    
    // 查找数据开始行 - 支付宝CSV可能有多种格式
    let dataStartIndex = -1;
    let headerLine = '';
    
    // 常见的支付宝表头关键词
    const headerKeywords = ['交易时间', '交易创建时间', '付款时间', '商品名称', '商品说明', '交易对方', '金额', '收/支', '交易状态'];
    
    for (let i = 0; i < Math.min(20, lines.length); i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // 检查是否包含表头关键词
        const matchCount = headerKeywords.filter(keyword => line.includes(keyword)).length;
        if (matchCount >= 3) { // 至少匹配3个关键词
            dataStartIndex = i + 1;
            headerLine = line;
            console.log(`找到表头行 ${i}:`, line);
            break;
        }
    }
    
    if (dataStartIndex === -1) {
        console.warn('未找到标准表头，尝试从第1行开始解析');
        dataStartIndex = 1;
        headerLine = lines[0] || '';
    }
    
    // 解析表头，确定字段位置
    const headers = parseCSVLine(headerLine);
    console.log('解析的表头:', headers);
    
    // 字段映射
    const fieldMap = {};
    headers.forEach((header, index) => {
        const cleanHeader = header.replace(/"/g, '').trim();
        if (cleanHeader.includes('时间') || cleanHeader.includes('日期')) {
            fieldMap.date = index;
        } else if (cleanHeader.includes('商品') || cleanHeader.includes('说明') || cleanHeader.includes('备注')) {
            fieldMap.description = index;
        } else if (cleanHeader.includes('对方') || cleanHeader.includes('收款方') || cleanHeader.includes('付款方')) {
            fieldMap.counterparty = index;
        } else if (cleanHeader.includes('金额') && !cleanHeader.includes('手续费')) {
            fieldMap.amount = index;
        } else if (cleanHeader.includes('收/支') || cleanHeader.includes('类型')) {
            fieldMap.type = index;
        } else if (cleanHeader.includes('状态')) {
            fieldMap.status = index;
        }
    });
    
    console.log('字段映射:', fieldMap);
    
    // 解析数据行
    for (let i = dataStartIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const columns = parseCSVLine(line);
        if (columns.length < 3) continue; // 至少需要3列数据
        
        try {
            // 提取数据
            const dateStr = extractDate(columns[fieldMap.date] || columns[0]);
            const amountStr = extractAmount(columns[fieldMap.amount] || findAmountColumn(columns));
            const amount = Math.abs(parseFloat(amountStr) || 0);
            
            if (amount <= 0 || !dateStr) {
                console.log(`跳过无效行 ${i}:`, columns);
                continue;
            }
            
            // 判断收支类型
            let type = 'expense'; // 默认支出
            if (fieldMap.type !== undefined) {
                const typeStr = columns[fieldMap.type].replace(/"/g, '').trim();
                if (typeStr.includes('收入') || typeStr.includes('收') || typeStr === '+') {
                    type = 'income';
                }
            } else {
                // 根据金额符号判断
                const originalAmount = columns[fieldMap.amount] || findAmountColumn(columns);
                if (originalAmount.includes('+') || parseFloat(originalAmount) > 0) {
                    type = 'income';
                }
            }
            
            // 提取描述
            let description = '支付宝交易';
            if (fieldMap.description !== undefined) {
                description = columns[fieldMap.description].replace(/"/g, '').trim();
            }
            if (fieldMap.counterparty !== undefined) {
                const counterparty = columns[fieldMap.counterparty].replace(/"/g, '').trim();
                if (counterparty && !description.includes(counterparty)) {
                    description = counterparty + (description ? ' - ' + description : '');
                }
            }
            
            const record = {
                id: Date.now().toString() + '_alipay_' + i + '_' + Math.random().toString(36).substr(2, 9),
                date: dateStr,
                type: type,
                category: '支付宝导入',
                description: description || '支付宝交易',
                amount: amount,
                notes: `从支付宝账单导入`,
                createTime: new Date().toISOString()
            };
            
            importedRecords.push(record);
            console.log(`成功解析第${i}行:`, record);
            
        } catch (error) {
            console.warn(`解析第${i}行失败:`, error, columns);
        }
    }
    
    console.log(`总共解析了${importedRecords.length}条有效记录`);
    return importedRecords;
}

// ===== 微信导入功能（修复版） =====
function handleWechatImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    console.log('开始处理微信文件:', file.name, '大小:', file.size);
    
    if (typeof XLSX === 'undefined') {
        alert('XLSX库未加载，无法解析Excel文件\n请检查网络连接或刷新页面重试');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { 
                type: 'array',
                codepage: 65001, // UTF-8编码
                cellText: true,
                cellDates: true
            });
            
            console.log('Excel工作簿信息:', workbook.SheetNames);
            
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            
            // 获取原始数据，保持中文编码
            const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                header: 1, // 使用数组格式，保持原始数据
                defval: '', // 空单元格默认值
                blankrows: false // 跳过空行
            });
            
            console.log('Excel原始数据:', jsonData.slice(0, 10));
            
            const importedRecords = parseWechatExcel(jsonData);
            
            if (importedRecords.length > 0) {
                console.log(`成功解析${importedRecords.length}条记录`);
                if (confirm(`解析到 ${importedRecords.length} 条微信记录，确定导入吗？`)) {
                    records = records.concat(importedRecords);
                    filteredRecords = [...records];
                    saveRecords();
                    updateDashboard();
                    updateRecordTable();
                    console.log('微信数据导入成功！');
                }
            } else {
                alert('未能解析到有效数据\n\n请确保：\n- 文件是微信官方导出的XLSX格式\n- 包含交易时间、金额、商品等字段');
            }
        } catch (error) {
            console.error('微信文件解析失败:', error);
            alert('微信文件解析失败：' + error.message + '\n\n请确保文件格式正确且未损坏');
        }
    };
    
    reader.onerror = function() {
        alert('文件读取失败，请检查文件是否损坏');
    };
    
    reader.readAsArrayBuffer(file);
}

// 微信Excel解析函数（完全重写）
function parseWechatExcel(jsonData) {
    const importedRecords = [];
    
    if (!jsonData || jsonData.length === 0) {
        console.warn('Excel数据为空');
        return importedRecords;
    }
    
    // 查找表头行
    let headerRowIndex = -1;
    let fieldMap = {};
    
    // 常见的微信表头关键词
    const headerKeywords = ['交易时间', '交易类型', '交易对方', '商品', '收/支', '金额', '支付方式', '当前状态', '交易单号'];
    
    for (let i = 0; i < Math.min(10, jsonData.length); i++) {
        const row = jsonData[i];
        if (!Array.isArray(row)) continue;
        
        const rowStr = row.join('').toLowerCase();
        const matchCount = headerKeywords.filter(keyword => rowStr.includes(keyword.toLowerCase())).length;
        
        if (matchCount >= 3) {
            headerRowIndex = i;
            console.log(`找到微信表头行 ${i}:`, row);
            
            // 建立字段映射
            row.forEach((header, index) => {
                if (!header) return;
                const cleanHeader = header.toString().trim();
                
                if (cleanHeader.includes('时间') || cleanHeader.includes('日期')) {
                    fieldMap.date = index;
                } else if (cleanHeader.includes('商品') || cleanHeader.includes('说明')) {
                    fieldMap.description = index;
                } else if (cleanHeader.includes('对方') || cleanHeader.includes('收款方') || cleanHeader.includes('付款方')) {
                    fieldMap.counterparty = index;
                } else if (cleanHeader.includes('金额') && !cleanHeader.includes('手续费')) {
                    fieldMap.amount = index;
                } else if (cleanHeader.includes('收/支') || cleanHeader.includes('类型')) {
                    fieldMap.type = index;
                } else if (cleanHeader.includes('状态')) {
                    fieldMap.status = index;
                }
            });
            break;
        }
    }
    
    if (headerRowIndex === -1) {
        console.warn('未找到微信表头，尝试使用默认映射');
        headerRowIndex = 0;
        // 使用默认字段映射
        fieldMap = { date: 0, type: 1, counterparty: 2, description: 3, amount: 5 };
    }
    
    console.log('微信字段映射:', fieldMap);
    
    // 解析数据行
    for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!Array.isArray(row) || row.length < 3) continue;
        
        try {
            // 提取数据
            const dateStr = extractDate(row[fieldMap.date] || row[0]);
            const amountStr = extractAmount(row[fieldMap.amount] || findAmountInRow(row));
            const amount = Math.abs(parseFloat(amountStr) || 0);
            
            if (amount <= 0 || !dateStr) {
                console.log(`跳过微信无效行 ${i}:`, row);
                continue;
            }
            
            // 判断收支类型
            let type = 'expense'; // 默认支出
            if (fieldMap.type !== undefined && row[fieldMap.type]) {
                const typeStr = row[fieldMap.type].toString().trim();
                if (typeStr.includes('收入') || typeStr.includes('收') || typeStr === '+') {
                    type = 'income';
                }
            } else {
                // 根据金额符号判断
                const originalAmount = row[fieldMap.amount] || findAmountInRow(row);
                if (originalAmount && (originalAmount.toString().includes('+') || parseFloat(originalAmount) > 0)) {
                    type = 'income';
                }
            }
            
            // 提取描述
            let description = '微信交易';
            if (fieldMap.description !== undefined && row[fieldMap.description]) {
                description = row[fieldMap.description].toString().trim();
            }
            if (fieldMap.counterparty !== undefined && row[fieldMap.counterparty]) {
                const counterparty = row[fieldMap.counterparty].toString().trim();
                if (counterparty && !description.includes(counterparty)) {
                    description = counterparty + (description !== '微信交易' ? ' - ' + description : '');
                }
            }
            
            const record = {
                id: Date.now().toString() + '_wechat_' + i + '_' + Math.random().toString(36).substr(2, 9),
                date: dateStr,
                type: type,
                category: '微信导入',
                description: description || '微信交易',
                amount: amount,
                notes: `从微信账单导入`,
                createTime: new Date().toISOString()
            };
            
            importedRecords.push(record);
            console.log(`成功解析微信第${i}行:`, record);
            
        } catch (error) {
            console.warn(`解析微信第${i}行失败:`, error, row);
        }
    }
    
    console.log(`总共解析了${importedRecords.length}条微信记录`);
    return importedRecords;
}

// ===== 辅助函数 =====

// CSV行解析辅助函数
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current);
    return result;
}

// 辅助函数：提取日期
function extractDate(dateStr) {
    if (!dateStr) return '';
    
    const cleaned = dateStr.toString().replace(/"/g, '').trim();
    
    // 支持多种日期格式
    const dateFormats = [
        /(\d{4})-(\d{1,2})-(\d{1,2})/,  // 2024-01-15
        /(\d{4})\/(\d{1,2})\/(\d{1,2})/, // 2024/01/15
        /(\d{4})年(\d{1,2})月(\d{1,2})日/, // 2024年01月15日
        /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // 01/15/2024
        /(\d{1,2})-(\d{1,2})-(\d{4})/, // 01-15-2024
    ];
    
    for (const format of dateFormats) {
        const match = cleaned.match(format);
        if (match) {
            if (format.source.includes('年')) {
                return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
            } else if (format.source.endsWith('(\\d{4})/') || format.source.endsWith('(\\d{4})/')) {
                return `${match[3]}-${match[1].padStart(2, '0')}-${match[2].padStart(2, '0')}`;
            } else {
                return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
            }
        }
    }
    
    return '';
}

// 辅助函数：提取金额
function extractAmount(amountStr) {
    if (!amountStr) return '0';
    
    const cleaned = amountStr.toString().replace(/"/g, '').replace(/¥/g, '').replace(/,/g, '').replace(/\s/g, '');
    const match = cleaned.match(/-?\d+\.?\d*/);
    return match ? match[0] : '0';
}

// 辅助函数：查找金额列
function findAmountColumn(columns) {
    for (const col of columns) {
        if (!col) continue;
        const cleaned = col.toString().replace(/"/g, '').trim();
        if (cleaned.match(/¥?\d+\.?\d*/) && parseFloat(cleaned.replace(/¥/g, '')) > 0) {
            return col;
        }
    }
    return '0';
}

// 辅助函数：在行中查找金额
function findAmountInRow(row) {
    for (const cell of row) {
        if (!cell) continue;
        const cleaned = cell.toString().replace(/¥/g, '').trim();
        if (cleaned.match(/\d+\.?\d*/) && parseFloat(cleaned) > 0) {
            return cell;
        }
    }
    return '0';
}

// ===== 其他原有功能保持不变 =====

// 数据管理功能
function openDataManagementModal() {
    const modal = document.getElementById('dataManagementModal');
    if (modal) {
        modal.style.display = 'block';
        updateStorageInfo();
    }
}

function closeDataManagementModal() {
    const modal = document.getElementById('dataManagementModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function updateStorageInfo() {
    const storageInfo = document.getElementById('storageInfo');
    if (storageInfo && Array.isArray(records)) {
        const lastSaved = localStorage.getItem(STORAGE_KEY + '_lastSaved');
        const lastSavedText = lastSaved ? new Date(lastSaved).toLocaleString() : '未知';
        storageInfo.innerHTML = `
            <p>📊 当前记录数: ${records.length}</p>
            <p>💾 最后保存: ${lastSavedText}</p>
            <p>📱 存储位置: 浏览器本地存储</p>
        `;
    }
}

// 其他功能函数（保持原有逻辑）
function handleDataImport(event) {
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
    
    console.log('CSV数据导出成功！');
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
    
    console.log('JSON数据导出成功！');
}

// 数据操作功能
function generateSampleData() {
    if (!confirm('确定要生成示例数据吗？这将添加一些测试记录。')) return;
    
    const sampleData = createSampleData();
    records = records.concat(sampleData);
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
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY + '_lastSaved');
    
    updateDashboard();
    updateRecordTable();
    updateStorageInfo();
    
    console.log('所有数据已清空！');
}

// 显示更新功能
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
    
    // 尝试多种方式找到表格tbody
    let tbody = document.querySelector('#recordsTable tbody');
    if (!tbody) {
        tbody = document.querySelector('#recordTable tbody');
    }
    if (!tbody) {
        tbody = document.querySelector('table tbody');
    }
    if (!tbody) {
        console.error('未找到表格tbody元素');
        return;
    }
    
    // 清空现有内容
    tbody.innerHTML = '';
    
    // 分页逻辑
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    const pageRecords = recordsToShow.slice(startIndex, endIndex);
    
    if (pageRecords.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #666;">暂无数据</td></tr>';
        return;
    }
    
    // 生成表格行
    pageRecords.forEach(record => {
        const row = document.createElement('tr');
        const typeText = record.type === 'income' ? '收入' : record.type === 'expense' ? '支出' : '订单';
        const typeClass = record.type === 'income' ? 'income' : 'expense';
        
        row.innerHTML = `
            <td>${record.date}</td>
            <td><span class="type-badge ${typeClass}">${typeText}</span></td>
            <td>${record.category}</td>
            <td>${record.description}</td>
            <td class="${typeClass}">¥${record.amount.toFixed(2)}</td>
            <td>${record.notes || ''}</td>
            <td class="actions">
                <button onclick="viewRecord('${record.id}')" class="btn-icon" title="查看">👁️</button>
                <button onclick="editRecord('${record.id}')" class="btn-icon" title="编辑">✏️</button>
                <button onclick="deleteRecord('${record.id}')" class="btn-icon" title="删除">🗑️</button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // 更新分页信息
    updatePagination(recordsToShow.length);
    console.log('记录表格更新完成');
}

function updateSelectableTable() {
    // 这个函数用于更新可选择的表格，如果需要的话
    console.log('可选择表格更新完成');
}

function updatePagination(totalRecords) {
    const totalPages = Math.ceil(totalRecords / recordsPerPage);
    const paginationElement = document.getElementById('pagination');
    
    if (!paginationElement) return;
    
    let paginationHTML = '';
    
    // 上一页按钮
    if (currentPage > 1) {
        paginationHTML += `<button onclick="changePage(${currentPage - 1})">上一页</button>`;
    }
    
    // 页码按钮
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            paginationHTML += `<button class="active">${i}</button>`;
        } else {
            paginationHTML += `<button onclick="changePage(${i})">${i}</button>`;
        }
    }
    
    // 下一页按钮
    if (currentPage < totalPages) {
        paginationHTML += `<button onclick="changePage(${currentPage + 1})">下一页</button>`;
    }
    
    paginationElement.innerHTML = paginationHTML;
}

function changePage(page) {
    currentPage = page;
    updateRecordTable();
}

// 筛选功能
function filterRecords() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('categoryFilter')?.value || '';
    const typeFilter = document.getElementById('typeFilter')?.value || '';
    const startDate = document.getElementById('startDate')?.value || '';
    const endDate = document.getElementById('endDate')?.value || '';
    
    filteredRecords = records.filter(record => {
        const matchesSearch = !searchTerm || 
            record.description.toLowerCase().includes(searchTerm) ||
            record.category.toLowerCase().includes(searchTerm) ||
            record.notes.toLowerCase().includes(searchTerm);
        
        const matchesCategory = !categoryFilter || record.category === categoryFilter;
        const matchesType = !typeFilter || record.type === typeFilter;
        const matchesStartDate = !startDate || record.date >= startDate;
        const matchesEndDate = !endDate || record.date <= endDate;
        
        return matchesSearch && matchesCategory && matchesType && matchesStartDate && matchesEndDate;
    });
    
    currentPage = 1; // 重置到第一页
    updateRecordTable();
    console.log('筛选完成，找到', filteredRecords.length, '条记录');
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('typeFilter').value = '';
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    
    filteredRecords = [...records];
    currentPage = 1;
    updateRecordTable();
    console.log('筛选已重置');
}

// 记录操作功能
function viewRecord(id) {
    const record = records.find(r => r.id === id);
    if (!record) return;
    
    alert(`记录详情：
日期: ${record.date}
类型: ${record.type === 'income' ? '收入' : record.type === 'expense' ? '支出' : '订单'}
分类: ${record.category}
描述: ${record.description}
金额: ¥${record.amount.toFixed(2)}
备注: ${record.notes || '无'}`);
}

function editRecord(id) {
    const record = records.find(r => r.id === id);
    if (!record) return;
    
    // 这里可以实现编辑功能
    console.log('编辑记录:', record);
}

function deleteRecord(id) {
    if (!confirm('确定要删除这条记录吗？')) return;
    
    records = records.filter(r => r.id !== id);
    filteredRecords = filteredRecords.filter(r => r.id !== id);
    saveRecords();
    updateDashboard();
    updateRecordTable();
    
    console.log('记录删除成功');
}

// 全选功能
function toggleSelectAll() {
    console.log('全选功能触发');
    // 这里可以实现全选逻辑
}

console.log('Script加载完成');