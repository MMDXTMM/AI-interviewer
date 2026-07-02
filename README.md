# AI-interviewer

一个本地可运行的 AI 简历面试官系统，用于深度解析简历、判断进面概率、模拟大厂面试官追问，并对候选人的回答进行评分和改进建议生成。

## 功能

- 支持 PDF、DOCX、TXT、Markdown 简历导入
- 自动提取教育经历、项目经历、技术栈、量化成果和风险表达
- 根据目标岗位、候选人级别和面试风格生成评估结果
- 输出进面判断、简历风险点和改进路径
- 生成大厂面试官风格的项目深挖题、技术题和压力追问题
- 支持候选人填写答案并自动评分
- 提供可复制到大模型中的 Agent 提示词
- 深色未来主义 AI SaaS 风格界面

## 启动

需要使用带 PDF / DOCX 解析依赖的 Python 环境运行：

```powershell
python server.py --host 0.0.0.0 --port 8768
```

然后访问：

```text
http://你的本机IP:8768/index.html
```

如果只使用 TXT / Markdown 或直接粘贴简历文本，也可以直接打开 `index.html`，但 PDF / DOCX 导入需要启动 `server.py`。

## 文件说明

- `index.html`：页面结构
- `styles.css`：未来感 SaaS UI 样式
- `app.js`：简历解析、评分、面试题生成、答案评分逻辑
- `server.py`：PDF / DOCX / TXT 文件文本提取服务
- `agent-prompt.md`：可复用的 Agent 角色提示词

## 说明

当前版本主要使用本地规则引擎做初筛和模拟评分，适合求职训练、简历打磨、面试辅导和内推前评估。后续可以继续接入真实大模型、岗位 JD、企业题库和候选人数据库。
