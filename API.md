# API 文档

## 概述

SCCIPC智能车实验室财务管理系统是一个基于浏览器本地存储的前端应用，所有数据操作都通过JavaScript API进行。本文档详细介绍了系统的核心API和数据结构。

## 数据结构

### 记录对象 (Record)

```javascript
{
  id: string,              // 唯一标识符
  date: string,            // 日期 (YYYY-MM-DD)
  type: string,            // 类型: 'income' | 'expense' | 'order'
  category: string,        // 分类
  description: string,     // 描述
  amount: number,          // 金额
  invoiceAmount: number,   // 发票金额
  invoiceStatus: string,   // 发票状态: 'none' | 'available' | 'issued' | 'reimbursed'
  notes: string,           // 备注
  createTime: string       // 创建时间 (ISO 8601)
}
```

### 应用状态 (AppState)

```javascript
{
  records: Array<Record>,           // 所有记录
  filteredRecords: Array<Record>,   // 筛选后的记录
  currentPage: number,              // 当前页码
  currentEditId: string|null,       // 当前编辑的记录ID
  sortColumn: string,               // 排序列
  sortDirection: string,            // 排序方向: 'asc' | 'desc'
  selectedIds: Set<string>,         // 选中的记录ID集合
  isLoading: boolean,               // 加载状态
  lastSaved: string|null            // 最后保存时间
}
```

## 核心API

### 数据管理

#### `loadRecords()`
加载本地存储的记录数据

```javascript
function loadRecords()
```

**功能：**
- 从localStorage读取数据
- 数据验证和迁移
- 初始化应用状态

**异常处理：**
- 数据损坏时自动创建示例数据
- 版本不兼容时执行数据迁移

#### `saveRecords(retryCount = 0)`
保存记录到本地存储

```javascript
function saveRecords(retryCount = 0)
```

**参数：**
- `retryCount`: 重试次数（默认0）

**功能：**
- 数据序列化和存储
- 存储空间检查
- 自动重试机制

#### `generateUniqueId()`
生成唯一标识符

```javascript
function generateUniqueId(): string
```

**返回：**
- 基于时间戳和随机数的唯一ID

### 记录操作

#### `addRecord(recordData)`
添加新记录

```javascript
function addRecord(recordData: Partial<Record>): Record
```

**参数：**
- `recordData`: 记录数据对象

**返回：**
- 完整的记录对象

**示例：**
```javascript
const newRecord = addRecord({
  date: '2024-01-07',
  type: 'expense',
  category: '实验器材',
  description: '购买传感器',
  amount: 299.00,
  invoiceAmount: 299.00,
  invoiceStatus: 'available',
  notes: '用于项目开发'
});
```

#### `updateRecord(id, updateData)`
更新现有记录

```javascript
function updateRecord(id: string, updateData: Partial<Record>): boolean
```

**参数：**
- `id`: 记录ID
- `updateData`: 更新数据

**返回：**
- 更新成功返回true，否则返回false

#### `deleteRecord(id)`
删除记录

```javascript
function deleteRecord(id: string): boolean
```

**参数：**
- `id`: 记录ID

**返回：**
- 删除成功返回true，否则返回false

#### `batchDelete(ids)`
批量删除记录

```javascript
function batchDelete(ids: string[]): number
```

**参数：**
- `ids`: 记录ID数组

**返回：**
- 实际删除的记录数量

### 数据筛选和搜索

#### `filterRecords(options)`
筛选记录

```javascript
function filterRecords(options: FilterOptions)
```

**FilterOptions:**
```javascript
{
  searchTerm?: string,      // 搜索关键词
  type?: string,           // 记录类型
  category?: string,       // 分类
  startDate?: string,      // 开始日期
  endDate?: string,        // 结束日期
  invoiceStatus?: string   // 发票状态
}
```

#### `sortRecords(column, direction)`
排序记录

```javascript
function sortRecords(column: string, direction: 'asc' | 'desc')
```

**参数：**
- `column`: 排序字段
- `direction`: 排序方向

### 数据导入导出

#### `exportToCSV()`
导出CSV格式数据

```javascript
function exportToCSV(): void
```

**功能：**
- 生成CSV格式文件
- 自动下载到本地

#### `exportToJSON()`
导出JSON格式数据

```javascript
function exportToJSON(): void
```

**功能：**
- 生成JSON格式文件
- 包含完整的记录数据

#### `importFromJSON(jsonData)`
从JSON导入数据

```javascript
function importFromJSON(jsonData: string): boolean
```

**参数：**
- `jsonData`: JSON格式的数据字符串

**返回：**
- 导入成功返回true，否则返回false

### 统计分析

#### `calculateFinancialSummary()`
计算财务摘要

```javascript
function calculateFinancialSummary(): FinancialSummary
```

**FinancialSummary:**
```javascript
{
  totalIncome: number,           // 总收入
  totalExpense: number,          // 总支出
  totalOrder: number,            // 总订单金额
  balance: number,               // 余额
  monthlyIncome: number,         // 月收入
  monthlyExpense: number,        // 月支出
  monthlyNet: number,            // 月净收入
  invoiceStats: {
    available: number,           // 可开发票金额
    issued: number,              // 已开发票金额
    reimbursed: number,          // 已报销金额
    total: number                // 总发票金额
  }
}
```

#### `getRecordsByDateRange(startDate, endDate)`
按日期范围获取记录

```javascript
function getRecordsByDateRange(startDate: string, endDate: string): Record[]
```

**参数：**
- `startDate`: 开始日期 (YYYY-MM-DD)
- `endDate`: 结束日期 (YYYY-MM-DD)

**返回：**
- 指定日期范围内的记录数组

### 用户界面

#### `updateDashboard()`
更新仪表板显示

```javascript
function updateDashboard(): void
```

**功能：**
- 计算并显示财务统计
- 更新概览卡片
- 刷新图表数据

#### `updateRecordTable()`
更新记录表格

```javascript
function updateRecordTable(): void
```

**功能：**
- 渲染当前页记录
- 更新分页信息
- 应用排序和筛选

#### `showNotification(message, type, duration)`
显示通知消息

```javascript
function showNotification(message: string, type: 'success' | 'error' | 'warning' | 'info', duration: number): void
```

**参数：**
- `message`: 通知内容
- `type`: 通知类型
- `duration`: 显示时长（毫秒）

## 事件系统

### 自定义事件

#### `recordAdded`
记录添加事件

```javascript
document.addEventListener('recordAdded', function(event) {
  const record = event.detail.record;
  console.log('新记录已添加:', record);
});
```

#### `recordUpdated`
记录更新事件

```javascript
document.addEventListener('recordUpdated', function(event) {
  const { record, oldRecord } = event.detail;
  console.log('记录已更新:', record);
});
```

#### `recordDeleted`
记录删除事件

```javascript
document.addEventListener('recordDeleted', function(event) {
  const recordId = event.detail.recordId;
  console.log('记录已删除:', recordId);
});
```

#### `dataImported`
数据导入事件

```javascript
document.addEventListener('dataImported', function(event) {
  const importedCount = event.detail.count;
  console.log('已导入记录数:', importedCount);
});
```

## 本地存储

### 存储键值

- `sccipc_lab_finance_records`: 主要记录数据
- `sccipc_lab_finance_records_lastSaved`: 最后保存时间
- `sccipc_lab_finance_records_version`: 数据版本
- `sccipc_lab_finance_records_visited`: 首次访问标记

### 存储限制

- 最大存储大小: 5MB
- 自动清理机制: 当存储接近限制时提示用户
- 数据压缩: 大数据量时自动压缩存储

## 错误处理

### 错误类型

```javascript
class FinanceError extends Error {
  constructor(message, code, details) {
    super(message);
    this.name = 'FinanceError';
    this.code = code;
    this.details = details;
  }
}
```

### 错误代码

- `STORAGE_FULL`: 存储空间不足
- `INVALID_DATA`: 数据格式无效
- `RECORD_NOT_FOUND`: 记录不存在
- `IMPORT_FAILED`: 数据导入失败
- `EXPORT_FAILED`: 数据导出失败

### 错误处理示例

```javascript
try {
  addRecord(recordData);
} catch (error) {
  if (error instanceof FinanceError) {
    switch (error.code) {
      case 'STORAGE_FULL':
        showNotification('存储空间不足，请清理数据', 'error');
        break;
      case 'INVALID_DATA':
        showNotification('数据格式无效', 'error');
        break;
      default:
        showNotification('操作失败: ' + error.message, 'error');
    }
  }
}
```

## 性能优化

### 虚拟滚动
大数据量时使用虚拟滚动技术，只渲染可见区域的记录。

### 防抖处理
搜索和筛选操作使用防抖技术，减少不必要的计算。

### 懒加载
图表和统计数据按需加载，提升初始加载速度。

### 内存管理
定期清理不需要的数据引用，防止内存泄漏。

## 扩展开发

### 插件系统
系统支持插件扩展，可以添加自定义功能：

```javascript
// 注册插件
FinanceApp.registerPlugin('customAnalytics', {
  init: function() {
    // 插件初始化
  },
  
  onRecordAdded: function(record) {
    // 记录添加时的处理
  }
});
```

### 主题系统
支持自定义主题：

```javascript
// 应用主题
FinanceApp.applyTheme({
  primaryColor: '#667eea',
  secondaryColor: '#764ba2',
  backgroundColor: '#f5f7fa'
});
```

## 安全考虑

### 数据验证
所有输入数据都经过严格验证，防止XSS攻击。

### 本地存储安全
敏感数据在存储前进行加密处理。

### CSP策略
实施内容安全策略，防止恶意脚本注入。

---

**注意：** 本API文档基于v2.0.0版本，后续版本可能会有变更。请关注更新日志获取最新信息。