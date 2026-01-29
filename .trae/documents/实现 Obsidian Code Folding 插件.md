## 实现计划

### 功能需求
根据 README.md，需要实现：
1. 代码块 ≤5 行：仅显示右上角一键复制功能
2. 代码块 >5 行：自动折叠超过5行的部分，支持点击头部展开/收起，同时支持一键复制

### 实现步骤

#### 1. 更新 manifest.json
- 修改插件 ID 和名称（遵循规范：不能以 "obsidian" 开头，不能以 "plugin" 结尾）
- 更新描述信息

#### 2. 重构 main.ts
- 删除所有示例代码（SampleModal、ribbon icon、status bar、示例 commands 等）
- 使用 `registerMarkdownPostProcessor` 处理代码块
- 实现代码块折叠逻辑：
  - 监听代码块渲染完成事件
  - 计算代码块行数
  - 如果 >5 行，添加折叠功能和展开/收起按钮
  - 添加复制按钮（所有代码块都显示）
- 使用 DOM 操作而非 innerHTML，确保安全性
- 使用 `registerDomEvent` 管理事件监听

#### 3. 更新 settings.ts
- 删除示例设置，或保留最小化配置

#### 4. 添加 styles.css
- 使用 Obsidian CSS 变量
- 折叠/展开按钮样式
- 复制按钮样式
- 折叠状态的代码块样式
- 确保与主题兼容

#### 5. 遵循的规范
- 内存安全：使用 registerEvent 自动清理
- 无障碍：键盘可访问、ARIA 标签
- UI：使用 sentence case
- 不使用 innerHTML/outerHTML
- 使用 Obsidian CSS 变量