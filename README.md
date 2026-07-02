<div align="center">

# AI Interviewer

### AI 简历深度解析 · 大厂面试官模拟 · 作答评分与改进建议

一个本地可运行的 AI 面试评估工具，帮助候选人和招聘团队从简历出发，快速完成进面判断、项目深挖、面试训练和回答质量评估。

![Status](https://img.shields.io/badge/status-active-22d3ee?style=for-the-badge)
![Frontend](https://img.shields.io/badge/frontend-HTML%20%2B%20CSS%20%2B%20JS-8b5cf6?style=for-the-badge)
![Runtime](https://img.shields.io/badge/runtime-Python-3b82f6?style=for-the-badge)

</div>

---

## 预览

项目采用深色未来主义 AI SaaS 风格，包含玻璃拟态卡片、蓝紫渐变、科技网格背景、霓虹高光和可交互评估面板。

> 如果你部署了在线预览，可以把截图或访问地址放在这里。

---

## 核心能力

| 模块 | 能力 |
| --- | --- |
| 简历导入 | 支持 PDF、DOCX、TXT、Markdown |
| 深度解析 | 提取教育经历、项目经历、技术栈、量化成果、风险表达 |
| 进面判断 | 根据岗位、级别、项目含金量和证据密度生成评分 |
| 面试题生成 | 模拟大厂面试官，生成项目深挖、技术基础、系统设计、压力追问 |
| 答案评分 | 支持候选人填写答案，并按完整度、结构、证据、深度、复盘评分 |
| 改进建议 | 输出简历改写、项目补强、技术准备和面试表达建议 |
| Agent 提示词 | 内置可复用提示词，便于后续接入大模型 |

---

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/MMDXTMM/AI-interviewer.git
cd AI-interviewer
```

### 2. 启动本地解析服务

PDF / DOCX 导入需要启动 `server.py`：

```bash
python server.py --host 0.0.0.0 --port 8768
```

### 3. 打开页面

访问：

```text
http://你的本机IP:8768/index.html
```

如果只是粘贴文本或导入 TXT / Markdown，也可以直接打开 `index.html`。

---

## 使用流程

1. 选择目标岗位、候选人级别和面试风格。
2. 粘贴简历文本，或导入 PDF / DOCX 简历。
3. 点击「开始解析并模拟面试」。
4. 查看进面判断、简历风险和技术栈匹配情况。
5. 进入「面试题」页填写答案。
6. 提交答案后查看分数、反馈和改进建议。

---

## 项目结构

```text
AI-interviewer/
├── index.html        # 页面结构与产品落地页
├── styles.css        # 深色未来主义 SaaS UI 样式
├── app.js            # 简历解析、评分、面试题和答案评分逻辑
├── server.py         # PDF / DOCX / TXT 文件解析服务
├── agent-prompt.md   # 可复用的 AI 面试官 Agent 提示词
└── README.md
```

---

## 技术栈

- Frontend: HTML, CSS, JavaScript
- Backend: Python `http.server`
- Document parsing:
  - `pdfplumber` 用于 PDF 文本提取
  - `python-docx` 用于 DOCX 文本提取
- UI Design:
  - Glassmorphism
  - Dark futuristic theme
  - Neon cyan / electric blue / violet accents
  - Responsive dashboard layout

---

## 当前限制

- `.doc` 旧版 Word 二进制格式暂不支持，建议转换为 `.docx` 或 PDF。
- 扫描版 PDF 需要先 OCR，否则无法提取文本。
- 当前评分主要基于本地规则引擎，后续可接入真实大模型提升语义评估质量。

---

## 后续规划

- 接入 OpenAI / Claude / Gemini 等大模型
- 支持上传岗位 JD 并做岗位匹配分析
- 增加候选人历史记录和评估报告导出
- 增加多岗位题库和企业自定义面试标准
- 支持在线部署和账号体系

---

## License

当前项目用于学习、求职训练和内部评估场景。正式商用前建议补充 License、隐私策略和文件处理说明。
