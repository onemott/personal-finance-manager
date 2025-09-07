# 贡献指南

感谢您对SCCIPC智能车实验室财务管理系统的关注！我们欢迎所有形式的贡献。

## 🤝 如何贡献

### 报告问题
如果您发现了bug或有改进建议：

1. 查看 [Issues](https://github.com/onemott/personal-finance-manager/issues) 确认问题未被报告
2. 创建新的Issue，详细描述问题
3. 提供复现步骤和环境信息
4. 如果可能，提供截图或错误日志

### 提交代码
1. **Fork** 本仓库到您的GitHub账户
2. **Clone** 您的fork到本地
   ```bash
   git clone https://github.com/YOUR_USERNAME/personal-finance-manager.git
   cd personal-finance-manager
   ```
3. **创建分支** 用于您的修改
   ```bash
   git checkout -b feature/your-feature-name
   # 或
   git checkout -b fix/your-bug-fix
   ```
4. **进行修改** 并确保代码质量
5. **提交更改**
   ```bash
   git add .
   git commit -m "feat: 添加新功能描述"
   # 或
   git commit -m "fix: 修复问题描述"
   ```
6. **推送到您的fork**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **创建Pull Request** 到主仓库

## 📝 代码规范

### JavaScript规范
- 使用ES6+语法
- 函数和变量使用驼峰命名法
- 常量使用大写字母和下划线
- 添加适当的注释说明复杂逻辑
- 保持代码简洁和可读性

```javascript
// ✅ 好的示例
const STORAGE_KEY = 'sccipc_finance_records';
function calculateTotalAmount(records) {
    return records.reduce((sum, record) => sum + record.amount, 0);
}

// ❌ 避免的写法
var key = 'data';
function calc(r) {
    var s = 0;
    for(var i = 0; i < r.length; i++) s += r[i].amount;
    return s;
}
```

### CSS规范
- 使用BEM命名方法论
- 优先使用Flexbox和Grid布局
- 使用CSS变量定义主题色彩
- 保持样式的模块化和可维护性

```css
/* ✅ 好的示例 */
.financial-overview__card {
    display: flex;
    align-items: center;
    padding: var(--spacing-lg);
}

.financial-overview__card--income {
    background: var(--color-success);
}

/* ❌ 避免的写法 */
.card {
    display: flex;
    align-items: center;
    padding: 25px;
    background: #4facfe;
}
```

### HTML规范
- 使用语义化标签
- 保持良好的可访问性
- 添加适当的ARIA属性
- 确保表单元素有正确的标签

## 🧪 测试

在提交代码前，请确保：

1. **功能测试**
   - 在不同浏览器中测试（Chrome、Firefox、Safari、Edge）
   - 测试响应式布局在各种设备上的表现
   - 验证所有交互功能正常工作

2. **数据测试**
   - 测试数据的增删改查功能
   - 验证数据导入导出功能
   - 确保本地存储正常工作

3. **边界测试**
   - 测试空数据状态
   - 测试大量数据的性能
   - 验证错误处理机制

## 📋 提交信息规范

使用约定式提交格式：

```
<类型>[可选的作用域]: <描述>

[可选的正文]

[可选的脚注]
```

### 类型说明
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式修改
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

### 示例
```
feat(invoice): 添加发票管理功能

- 新增发票状态追踪
- 实现发票金额管理
- 添加发票统计概览

Closes #123
```

## 🎯 开发重点

### 优先级功能
1. **用户体验优化**
   - 提升界面响应速度
   - 改进移动端体验
   - 增强可访问性

2. **功能完善**
   - 数据分析和图表
   - 更多导入导出格式
   - 高级筛选功能

3. **性能优化**
   - 大数据量处理
   - 内存使用优化
   - 加载速度提升

### 技术债务
- 代码模块化重构
- 单元测试覆盖
- 错误处理完善
- 文档补充

## 🔍 代码审查

所有Pull Request都会经过代码审查：

1. **代码质量**
   - 遵循项目编码规范
   - 代码逻辑清晰合理
   - 适当的错误处理

2. **功能验证**
   - 功能按预期工作
   - 不破坏现有功能
   - 良好的用户体验

3. **文档完整**
   - 代码注释充分
   - 更新相关文档
   - 提供使用示例

## 📞 联系方式

如果您有任何问题或建议：

- 📧 通过GitHub Issues联系
- 💬 参与GitHub Discussions讨论
- 🐛 报告bug和安全问题

## 🙏 致谢

感谢所有贡献者的努力！您的贡献让这个项目变得更好。

---

**再次感谢您的贡献！** 🎉