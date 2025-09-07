# 🚗 SCCIPC智能车实验室财务管理系统

<div align="center">

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![PWA](https://img.shields.io/badge/PWA-enabled-orange.svg)
![Responsive](https://img.shields.io/badge/responsive-yes-brightgreen.svg)

**专为SCCIPC智能车实验室设计的现代化财务管理系统**

[🌐 在线体验](https://onemott.github.io/personal-finance-manager/) | [📖 使用指南](#使用指南) | [🛠️ 本地部署](#本地部署) | [🤝 贡献代码](#贡献)

</div>

## ✨ 核心特性

### 💰 智能财务管理
- 🔢 **多类型记录** - 收入、支出、订单三大类型，满足实验室各种财务需求
- 📊 **实时统计** - 动态显示总余额、收支情况、净收入等关键指标
- 🏷️ **智能分类** - 预设实验室常用分类，支持自定义扩展
- 📅 **月度分析** - 自动计算当月收支变化和趋势分析

### 🧾 发票管理系统
- 📋 **发票状态追踪** - 无需发票、可开发票、已开发票、已报销四种状态
- 💵 **发票金额管理** - 独立记录发票金额，便于报账管理
- 📈 **报销统计** - 实时显示未报销和已报销发票金额
- 🔄 **状态联动** - 发票状态与金额输入智能联动

### 🔍 高效数据操作
- 🔎 **全文搜索** - 支持描述、分类、备注等多字段模糊搜索
- 🏷️ **多维筛选** - 按类型、分类、时间范围等多条件组合筛选
- 📋 **批量操作** - 支持全选、批量删除，提升操作效率
- 🔄 **智能排序** - 按日期、金额、类型等字段正序/倒序排列

### 📱 现代化用户体验
- 🎨 **Material Design** - 采用现代化设计语言，界面美观易用
- 📱 **响应式布局** - 完美适配桌面、平板、手机等各种设备
- ⚡ **PWA支持** - 可安装为桌面应用，支持离线使用
- 🌙 **优雅动效** - 流畅的过渡动画和交互反馈

### 🔒 数据安全与备份
- 💾 **本地存储** - 数据存储在浏览器本地，保护隐私安全
- 📤 **多格式导出** - 支持CSV、JSON格式数据导出
- 📥 **数据导入** - 支持JSON格式数据导入，便于数据迁移
- 🔄 **自动备份** - 操作后自动保存，防止数据丢失

## 🚀 快速开始

### 在线使用
直接访问 [https://onemott.github.io/personal-finance-manager/](https://onemott.github.io/personal-finance-manager/) 即可开始使用。

### 本地部署

1. **克隆仓库**
```bash
git clone https://github.com/onemott/personal-finance-manager.git
cd personal-finance-manager
```

2. **启动本地服务器**
```bash
# 使用Python 3
python -m http.server 8080

# 使用Python 2
python -m SimpleHTTPServer 8080

# 使用Node.js
npx serve .

# 使用PHP
php -S localhost:8080
```

3. **访问应用**
打开浏览器访问 `http://localhost:8080`

## 📖 使用指南

### 基础操作

1. **添加记录**
   - 点击右上角"新增记录"按钮
   - 选择记录类型（收入/支出/订单）
   - 填写相关信息并保存

2. **查看和编辑**
   - 点击记录行的"查看"按钮查看详情
   - 点击"编辑"按钮修改记录信息
   - 支持批量选择和删除操作

3. **筛选和搜索**
   - 使用顶部标签页快速筛选记录类型
   - 在搜索框输入关键词进行全文搜索
   - 使用下拉菜单按分类、时间等条件筛选

### 发票管理

1. **设置发票状态**
   - 无需发票：不涉及报销的记录
   - 可开发票：可以开具发票但尚未开具
   - 已开发票：已开具发票但未报销
   - 已报销：已完成报销流程

2. **发票金额管理**
   - 发票金额可以与实际支出金额不同
   - 状态为"无需发票"时，发票金额自动设为0
   - 财务概览会显示各状态发票的统计信息

### 数据管理

1. **导出数据**
   - CSV格式：适合Excel等表格软件打开
   - JSON格式：适合数据备份和程序处理

2. **导入数据**
   - 支持导入JSON格式的数据文件
   - 导入前会提示确认，避免误操作

3. **数据清理**
   - 支持生成示例数据用于测试
   - 支持清空所有数据（谨慎操作）

## 🛠️ 技术架构

### 前端技术栈
- **HTML5** - 语义化标记，支持现代浏览器特性
- **CSS3** - Flexbox/Grid布局，CSS变量，动画效果
- **原生JavaScript** - ES6+语法，模块化设计
- **Font Awesome 6** - 丰富的图标库

### 数据存储
- **LocalStorage API** - 浏览器本地存储
- **JSON格式** - 结构化数据存储
- **自动备份** - 操作后实时保存

### PWA特性
- **Web App Manifest** - 应用元数据配置
- **响应式设计** - 适配各种屏幕尺寸
- **离线支持** - 无网络环境下正常使用

## 📁 项目结构

```
personal-finance-manager/
├── index.html              # 主页面文件
├── style.css              # 样式表文件
├── script_final.js        # 主要功能脚本
├── manifest.json          # PWA配置文件
├── README.md             # 项目说明文档
├── LICENSE               # 开源许可证
├── 开发部署指南.md        # 开发者指南
├── 用户使用指南.md        # 用户使用手册
└── SCCIPC部署工具.bat    # Windows部署脚本
```

## 🎯 功能亮点

### 智能分类系统
- **收入类别**：工资收入、项目资金、奖学金、兼职收入、投资收益等
- **支出类别**：实验器材、维护费用、交通费、餐饮费、学习用品等
- **订单类别**：电子产品、书籍资料、生活用品、服装鞋帽等

### 数据可视化
- 📊 实时财务概览卡片
- 📈 月度收支趋势分析
- 💰 发票状态统计图表
- 📋 分类支出占比分析

### 用户体验优化
- ⚡ 快速响应的交互设计
- 🎨 优雅的视觉效果和动画
- 📱 移动端友好的触控体验
- ♿ 良好的可访问性支持

## 🔄 更新日志

### v2.0.0 (2024-01-07)
- ✨ 新增发票管理系统
- 🎨 全新的UI设计和交互体验
- 📱 优化移动端适配
- 🔧 代码重构和性能优化
- 📖 完善文档和使用指南

### v1.0.0 (2024-01-01)
- 🎉 初始版本发布
- 💰 基础财务记录功能
- 📊 数据统计和分析
- 📤 数据导入导出功能

## 🤝 贡献

我们欢迎所有形式的贡献！无论是报告bug、提出新功能建议，还是提交代码改进。

### 如何贡献

1. **Fork** 本仓库
2. **创建** 特性分支 (`git checkout -b feature/AmazingFeature`)
3. **提交** 更改 (`git commit -m 'Add some AmazingFeature'`)
4. **推送** 到分支 (`git push origin feature/AmazingFeature`)
5. **创建** Pull Request

### 开发指南

- 遵循现有的代码风格和命名规范
- 添加适当的注释和文档
- 确保新功能在各种设备上正常工作
- 提交前进行充分测试

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源许可证。

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者和用户！

特别感谢：
- [Font Awesome](https://fontawesome.com/) 提供的优秀图标库
- [GitHub Pages](https://pages.github.com/) 提供的免费托管服务

## 📞 联系我们

- 🐛 **Bug报告**: [GitHub Issues](https://github.com/onemott/personal-finance-manager/issues)
- 💡 **功能建议**: [GitHub Discussions](https://github.com/onemott/personal-finance-manager/discussions)
- 📧 **邮件联系**: [项目维护者邮箱]

---

<div align="center">

**🚗 SCCIPC智能车实验室 - 让财务管理更简单高效！**

Made with ❤️ by SCCIPC Team

</div>