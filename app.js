const resumeText = document.querySelector("#resumeText");
const targetRole = document.querySelector("#targetRole");
const level = document.querySelector("#level");
const style = document.querySelector("#style");
const decision = document.querySelector("#decision");
const scoreRing = document.querySelector("#scoreRing");
const panels = {
  summary: document.querySelector("#summary"),
  questions: document.querySelector("#questions"),
  advice: document.querySelector("#advice"),
  prompt: document.querySelector("#prompt")
};
let currentInterviewQuestions = [];

const skillMap = {
  backend: ["Java", "Spring", "Spring Boot", "MySQL", "Redis", "Kafka", "RocketMQ", "Dubbo", "微服务", "Linux", "JVM", "Go", "Python"],
  frontend: ["React", "Vue", "TypeScript", "JavaScript", "Webpack", "Vite", "Node", "性能优化", "组件", "前端工程化"],
  algorithm: ["算法", "LeetCode", "ACM", "数据结构", "机器学习", "深度学习", "PyTorch", "TensorFlow", "模型", "推荐"],
  product: ["需求分析", "用户增长", "竞品", "数据分析", "A/B", "PRD", "原型", "转化率"]
};

const indicators = {
  metrics: /(\d+(\.\d+)?%|\d+(\.\d+)?倍|\d+(\.\d+)?万|\d+(\.\d+)?k|QPS|TPS|PV|UV|DAU|MAU|延迟|吞吐|成本|转化|留存|准确率|召回率|提升|降低|减少|增长)/ig,
  action: /(负责|主导|设计|落地|优化|重构|搭建|推进|协同|排查|治理|上线|实现|维护)/g,
  links: /(github\.com|gitee\.com|论文|专利|开源|博客|竞赛|奖学金|实习|字节|阿里|腾讯|百度|美团|京东|快手|小米)/ig,
  vague: /(熟悉|了解|参与|良好|一定|部分|相关|若干|多个|一些)/g
};

const sampleResume = `张明｜后端开发工程师｜2年经验
教育经历：某 211 大学 软件工程 本科，GPA 3.6/4.0，校一等奖学金。
工作经历：某电商公司 后端开发。负责订单履约链路的库存扣减、订单状态机和消息补偿模块。
项目一：订单履约一致性治理
- 基于 Spring Boot、MySQL、Redis、Kafka 设计订单状态机，解决超卖、重复扣减和消息丢失问题。
- 通过幂等表、唯一索引、延迟队列和补偿任务，将异常订单率从 0.38% 降到 0.06%。
- 排查一次 Redis 热 key 导致的接口超时，将 P99 从 900ms 优化到 180ms。
项目二：商家结算平台
- 负责结算规则配置、账单生成和对账任务，支持日均 120 万订单结算。
- 使用分片任务和批量写入将账单生成耗时从 70 分钟降到 18 分钟。
技术栈：Java、Spring Boot、MySQL、Redis、Kafka、Linux、Docker。`;

function normalize(text) {
  return text.replace(/\r\n/g, "\n").trim();
}

function countMatches(text, regex) {
  return (text.match(regex) || []).length;
}

function detectRoleBucket(roleText) {
  const role = roleText.toLowerCase();
  if (/前端|frontend|web/.test(role)) return "frontend";
  if (/算法|ai|机器学习|推荐|nlp|cv/.test(role)) return "algorithm";
  if (/产品|pm|增长/.test(role)) return "product";
  return "backend";
}

function extractSections(text) {
  const lines = text.split("\n").map(line => line.trim()).filter(Boolean);
  const projects = lines.filter(line => /(项目|系统|平台|模块|服务|链路|治理|优化)/.test(line)).slice(0, 8);
  const education = lines.find(line => /(教育|本科|硕士|博士|大学|学院|GPA|奖学金)/i.test(line)) || "未识别到明确教育信息";
  const experience = lines.find(line => /(工作|实习|公司|经验|开发|工程师|负责人)/i.test(line)) || "未识别到明确工作/实习信息";
  return { lines, projects, education, experience };
}

function extractSkills(text, bucket) {
  const allSkills = [...new Set(Object.values(skillMap).flat())];
  const found = allSkills.filter(skill => new RegExp(skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(text));
  const targetSkills = skillMap[bucket].filter(skill => found.includes(skill));
  return { found, targetSkills };
}

function scoreResume(text, roleText, levelText) {
  const bucket = detectRoleBucket(roleText);
  const sections = extractSections(text);
  const skills = extractSkills(text, bucket);
  const metricCount = countMatches(text, indicators.metrics);
  const actionCount = countMatches(text, indicators.action);
  const linkCount = countMatches(text, indicators.links);
  const vagueCount = countMatches(text, indicators.vague);
  const projectCount = sections.projects.length;
  const lengthScore = Math.min(15, Math.floor(text.length / 120));
  const projectScore = Math.min(25, projectCount * 5);
  const metricScore = Math.min(20, metricCount * 4);
  const skillScore = Math.min(20, skills.targetSkills.length * 4 + Math.max(0, skills.found.length - skills.targetSkills.length));
  const evidenceScore = Math.min(15, actionCount * 2 + linkCount * 3);
  const penalty = Math.min(18, vagueCount * 2 + (text.length < 500 ? 8 : 0));
  const seniorBoost = /3-5|5年以上/.test(levelText) && metricCount < 3 ? -8 : 0;
  const score = Math.max(0, Math.min(100, lengthScore + projectScore + metricScore + skillScore + evidenceScore - penalty + seniorBoost));
  return { score, bucket, sections, skills, metricCount, actionCount, linkCount, vagueCount, projectCount };
}

function getDecision(score) {
  if (score >= 78) return { text: "较大概率进面", cls: "ok" };
  if (score >= 60) return { text: "有机会但需补强", cls: "warn" };
  return { text: "当前简历不建议直接投递", cls: "risk" };
}

function listWeaknesses(result) {
  const weak = [];
  if (result.projectCount < 3) weak.push("项目经历偏少，缺少可供面试官连续追问的业务场景。");
  if (result.metricCount < 3) weak.push("量化结果不足，无法证明影响范围、复杂度和个人贡献。");
  if (result.skills.targetSkills.length < 4) weak.push("目标岗位关键技术栈覆盖不足，容易被简历筛选阶段淘汰。");
  if (result.vagueCount >= 4) weak.push("“熟悉/了解/参与”等弱表达过多，责任边界不清。");
  if (result.linkCount === 0) weak.push("缺少奖项、开源、论文、博客或可验证链接，可信度支撑较弱。");
  return weak.length ? weak : ["简历基础信息完整，下一步重点是准备项目深挖和技术细节闭环。"];
}

function buildSummary(result) {
  const decisionInfo = getDecision(result.score);
  return `
    <div class="metric-grid">
      <div class="metric"><span>岗位匹配技术</span><strong>${result.skills.targetSkills.length}</strong></div>
      <div class="metric"><span>可深挖项目线索</span><strong>${result.projectCount}</strong></div>
      <div class="metric"><span>量化证据</span><strong>${result.metricCount}</strong></div>
      <div class="metric"><span>弱表达风险</span><strong>${result.vagueCount}</strong></div>
    </div>
    <div class="block">
      <h3>核心判断</h3>
      <p class="${decisionInfo.cls}">${decisionInfo.text}，综合评分 ${result.score}/100。</p>
    </div>
    <div class="block">
      <h3>识别到的候选人画像</h3>
      <ul>
        <li>教育/背景：${escapeHtml(result.sections.education)}</li>
        <li>经历线索：${escapeHtml(result.sections.experience)}</li>
        <li>目标方向：${escapeHtml(targetRole.value)}，当前按 ${roleName(result.bucket)} 模型评估。</li>
      </ul>
    </div>
    <div class="block">
      <h3>技术栈证据</h3>
      <div class="tag-row">${result.skills.found.length ? result.skills.found.map(skill => `<span class="tag">${escapeHtml(skill)}</span>`).join("") : "<span class='empty'>未识别到明确技术关键词</span>"}</div>
    </div>
    <div class="block">
      <h3>主要风险</h3>
      <ul>${listWeaknesses(result).map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    </div>`;
}

function roleName(bucket) {
  return { backend: "后端开发", frontend: "前端开发", algorithm: "算法/AI", product: "产品经理" }[bucket];
}

function questionBank(result) {
  const role = roleName(result.bucket);
  const projects = result.sections.projects.slice(0, 3);
  const base = [
    `请用 3 分钟讲清楚你最有含金量的项目：业务目标、技术方案、你负责的部分、上线结果分别是什么？`,
    `这个项目里最难的问题是什么？为什么不能用更简单的方案？你怎么证明当前方案是正确的？`,
    `如果把流量或数据量放大 10 倍，你的方案第一个瓶颈会在哪里？你会如何压测和改造？`,
    `你简历中提到的优化结果是如何统计的？有没有对照组、时间窗口和异常样本处理？`,
    `如果线上出现用户投诉但监控没有报警，你会按什么顺序排查？`
  ];
  const backend = [
    `讲一下你对 MySQL 索引、事务隔离和锁的理解。你项目里遇到过哪些锁冲突或慢查询？`,
    `Redis 缓存一致性、穿透、击穿、雪崩分别怎么处理？你的方案有什么副作用？`,
    `消息队列如何保证不丢、不重、最终一致？如果消费者重复消费会怎样？`,
    `接口 P99 延迟升高时，你会从应用、数据库、缓存、网络哪几层定位？`
  ];
  const frontend = [
    `请解释一次从输入 URL 到页面可交互的完整过程，并说明你能优化哪些环节。`,
    `组件状态变复杂后如何拆分？你如何避免重复渲染和状态不一致？`,
    `前端监控里白屏、资源错误、接口错误和性能指标分别怎么采集？`,
    `TypeScript 在你的项目里解决了什么具体问题？有没有带来成本？`
  ];
  const algorithm = [
    `你的模型或算法指标是如何定义的？为什么选择这个指标而不是另一个？`,
    `训练集、验证集、测试集怎么划分？如何避免数据泄漏？`,
    `线上效果下降时，你如何判断是数据漂移、特征问题还是模型问题？`,
    `请手写或口述一个与你项目相关的核心算法，并分析复杂度。`
  ];
  const product = [
    `你如何判断一个需求是真需求？会看哪些数据和用户证据？`,
    `如果研发资源只有一半，你如何砍需求并保证核心目标？`,
    `你做过的增长或转化优化，有哪些假设被证伪？`,
    `竞品分析之后，你如何把结论转成可落地的产品方案？`
  ];
  const targeted = { backend, frontend, algorithm, product }[result.bucket];
  const projectQuestions = projects.map(project => `针对「${project.replace(/^[-*]\s*/, "")}」：请画出核心流程，并解释异常场景、数据一致性和你个人贡献。`);
  const pressure = [
    `我现在没有看到你比同级候选人更强的证据。请你用一个项目证明你具备 ${role} 的核心竞争力。`,
    `这段经历如果删掉，对你的竞争力有什么影响？如果影响不大，为什么还放在简历上？`,
    `请指出你简历里最容易被质疑的一句话，并现场把它改成更可信的表达。`
  ];
  return [...projectQuestions, ...base, ...targeted, ...pressure].slice(0, 14);
}

function buildQuestions(result) {
  const questions = questionBank(result);
  currentInterviewQuestions = questions;
  return questions.map((question, index) => `
    <div class="block question">
      <div class="question-head">
        <h3>Q${index + 1}</h3>
        <span class="answer-score" id="answerScore${index}">未评分</span>
      </div>
      <p>${escapeHtml(question)}</p>
      <small>追问方向：背景约束、个人贡献、技术取舍、失败案例、量化证明、复盘改进。</small>
      <label class="answer-label" for="answer${index}">你的回答</label>
      <textarea class="answer-input" id="answer${index}" data-question-index="${index}" placeholder="按真实面试口述来写。建议包含：背景、个人贡献、方案细节、指标结果、取舍和复盘。"></textarea>
      <div class="answer-feedback" id="answerFeedback${index}"></div>
    </div>`).join("") + `
    <div class="interview-actions">
      <button id="scoreInterviewBtn" type="button">提交答案并评分</button>
      <button id="clearAnswersBtn" class="secondary" type="button">清空答案</button>
    </div>
    <div id="interviewReport"></div>`;
}

function buildAdvice(result) {
  const weaknesses = listWeaknesses(result);
  const actions = [
    "每个核心项目按 STAR+技术闭环重写：场景、任务、行动、结果、难点、取舍、复盘。",
    "补齐量化指标：规模、性能、成本、稳定性、转化、准确率，至少写清前后对比和统计口径。",
    "把弱表达替换为强责任表达：将“参与/了解/熟悉”改成“负责/设计/落地/优化”，并配证据。",
    "为目标岗位补一个强相关项目或开源 Demo，覆盖岗位 JD 中最高频的 3-5 个关键词。",
    "准备一页项目深挖材料：架构图、核心表结构、接口链路、异常场景、压测数据、线上问题复盘。"
  ];
  return `
    <div class="block">
      <h3>不够资格进面时的主要原因</h3>
      <ul>${weaknesses.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    </div>
    <div class="block">
      <h3>改进方法</h3>
      <ol>${actions.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ol>
    </div>
    <div class="block">
      <h3>简历改写模板</h3>
      <pre>原句：参与 XX 系统开发，熟悉 XX 技术。
改写：负责 XX 系统的 YY 模块，基于 [技术方案] 解决 [具体问题]，支撑 [业务规模]，将 [核心指标] 从 A 优化到 B，并沉淀 [工具/规范/复盘]。</pre>
    </div>`;
}

function buildPrompt(result) {
  const prompt = `你是“大厂技术面试官 + 简历评审官”Agent。请基于候选人的简历和目标岗位执行以下任务：

1. 深度解析简历，提取教育背景、工作/实习、项目、技术栈、量化成果、风险表述和可信证据。
2. 按目标岗位「${targetRole.value}」和级别「${level.value}」评估是否值得进入面试，给出 0-100 分和明确结论。
3. 如果不建议进面，必须说明筛选失败原因，并给出可执行改进方法。
4. 模拟大厂面试官，生成分层问题：
   - 项目深挖：背景、方案、难点、个人贡献、结果、失败复盘
   - 技术基础：目标岗位核心知识
   - 系统设计或方案设计：容量、扩展性、稳定性、成本
   - 行为面：协作、冲突、抗压、学习能力
   - 压力追问：验证简历真实性和能力边界
5. 所有问题都要基于简历证据，避免空泛题。

当前自动评估摘要：
- 综合分：${result.score}/100
- 识别方向：${roleName(result.bucket)}
- 主要技术：${result.skills.found.join("、") || "未识别"}
- 风险点：${listWeaknesses(result).join("；")}`;
  return `<div class="block"><pre>${escapeHtml(prompt)}</pre></div>`;
}

function analyze() {
  const text = normalize(resumeText.value);
  if (!text) {
    decision.textContent = "请先粘贴简历";
    scoreRing.textContent = "--";
    Object.values(panels).forEach(panel => {
      panel.innerHTML = `<p class="empty">粘贴简历后，Agent 会生成解析、面试题和改进建议。</p>`;
    });
    return;
  }
  const result = scoreResume(text, targetRole.value, level.value);
  const decisionInfo = getDecision(result.score);
  decision.textContent = decisionInfo.text;
  decision.className = decisionInfo.cls;
  scoreRing.textContent = result.score;
  scoreRing.style.borderColor = result.score >= 78 ? "#bbf7d0" : result.score >= 60 ? "#fde68a" : "#fecaca";
  panels.summary.innerHTML = buildSummary(result);
  panels.questions.innerHTML = buildQuestions(result);
  panels.advice.innerHTML = buildAdvice(result);
  panels.prompt.innerHTML = buildPrompt(result);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

document.querySelector("#analyzeBtn").addEventListener("click", analyze);
document.querySelector("#clearBtn").addEventListener("click", () => {
  resumeText.value = "";
  analyze();
});
document.querySelector("#sampleBtn").addEventListener("click", () => {
  resumeText.value = sampleResume;
  analyze();
});
document.querySelector("#fileInput").addEventListener("change", async event => {
  const [file] = event.target.files;
  if (!file) return;
  await importResumeFile(file);
});

document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(item => item.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(item => item.classList.remove("active"));
    tab.classList.add("active");
    document.querySelector(`#${tab.dataset.tab}`).classList.add("active");
  });
});

panels.questions.addEventListener("click", event => {
  if (event.target.id === "scoreInterviewBtn") {
    scoreInterviewAnswers();
  }
  if (event.target.id === "clearAnswersBtn") {
    panels.questions.querySelectorAll(".answer-input").forEach(input => {
      input.value = "";
    });
    panels.questions.querySelectorAll(".answer-feedback").forEach(item => {
      item.innerHTML = "";
    });
    panels.questions.querySelectorAll(".answer-score").forEach(item => {
      item.textContent = "未评分";
      item.className = "answer-score";
    });
    const report = document.querySelector("#interviewReport");
    if (report) report.innerHTML = "";
  }
});

analyze();

async function importResumeFile(file) {
  const name = file.name.toLowerCase();
  const isPlainText = /\.(txt|md|text)$/.test(name) || /^text\//.test(file.type);
  if (isPlainText) {
    resumeText.value = await file.text();
    analyze();
    return;
  }

  decision.textContent = "正在解析文件";
  scoreRing.textContent = "--";
  Object.values(panels).forEach(panel => {
    panel.innerHTML = `<p class="empty">正在提取 ${escapeHtml(file.name)} 的简历文本...</p>`;
  });

  try {
    const form = new FormData();
    form.append("resume", file);
    const response = await fetch("/api/parse-resume", {
      method: "POST",
      body: form
    });
    const payload = await response.json();
    if (!response.ok || !payload.ok) {
      throw new Error(payload.error || "文件解析失败");
    }
    resumeText.value = payload.text.trim();
    analyze();
  } catch (error) {
    decision.textContent = "文件解析失败";
    Object.values(panels).forEach(panel => {
      panel.innerHTML = `<div class="block"><h3>导入失败</h3><p class="risk">${escapeHtml(error.message)}</p><p class="empty">PDF/Word 导入需要通过本地解析服务访问页面。如果直接打开 index.html，只能解析 TXT/Markdown。</p></div>`;
    });
  } finally {
    document.querySelector("#fileInput").value = "";
  }
}

function scoreInterviewAnswers() {
  const answerNodes = [...panels.questions.querySelectorAll(".answer-input")];
  if (!answerNodes.length) return;

  const evaluations = answerNodes.map(node => {
    const index = Number(node.dataset.questionIndex);
    return evaluateAnswer(currentInterviewQuestions[index], node.value);
  });

  evaluations.forEach((evaluation, index) => {
    const scoreNode = document.querySelector(`#answerScore${index}`);
    const feedbackNode = document.querySelector(`#answerFeedback${index}`);
    scoreNode.textContent = `${evaluation.score}/100`;
    scoreNode.className = `answer-score ${scoreClass(evaluation.score)}`;
    feedbackNode.innerHTML = `
      <div class="feedback-grid">
        ${evaluation.dimensions.map(item => `<div><span>${escapeHtml(item.name)}</span><strong>${item.score}</strong></div>`).join("")}
      </div>
      <ul>${evaluation.feedback.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  });

  const answered = evaluations.filter(item => item.answered);
  const average = answered.length
    ? Math.round(answered.reduce((sum, item) => sum + item.score, 0) / answered.length)
    : 0;
  const report = document.querySelector("#interviewReport");
  report.innerHTML = buildInterviewReport(evaluations, average);
}

function evaluateAnswer(question, rawAnswer) {
  const answer = normalize(rawAnswer || "");
  if (!answer) {
    return {
      answered: false,
      score: 0,
      dimensions: [
        { name: "完整度", score: 0 },
        { name: "结构", score: 0 },
        { name: "证据", score: 0 },
        { name: "深度", score: 0 },
        { name: "复盘", score: 0 }
      ],
      feedback: ["未填写答案。建议先用 2-4 分钟完整作答，再提交评分。"]
    };
  }

  const lengthScore = answer.length >= 420 ? 22 : answer.length >= 260 ? 18 : answer.length >= 140 ? 12 : answer.length >= 60 ? 7 : 3;
  const structureHits = countByWords(answer, ["背景", "目标", "问题", "方案", "结果", "首先", "其次", "最后", "第一", "第二", "第三"]);
  const structureScore = Math.min(18, structureHits * 4 + (/因为.*所以|如果.*那么|从.*到/.test(answer) ? 4 : 0));
  const evidenceScore = Math.min(22, countMatches(answer, indicators.metrics) * 5 + countByWords(answer, ["上线", "压测", "监控", "日志", "数据", "对比", "成本", "P99", "QPS"]) * 2);
  const depthScore = Math.min(24, countByWords(answer, [
    "取舍", "瓶颈", "一致性", "幂等", "事务", "索引", "缓存", "队列", "锁", "降级", "限流", "熔断",
    "复杂度", "架构", "模型", "特征", "实验", "渲染", "性能", "边界", "异常"
  ]) * 3);
  const reflectionScore = Math.min(14, countByWords(answer, ["复盘", "不足", "改进", "风险", "失败", "下次", "权衡", "坑", "教训"]) * 3 + (/不知道|不确定|需要验证/.test(answer) ? 2 : 0));
  const questionKeywordScore = Math.min(8, overlapScore(question, answer));
  const vaguePenalty = Math.min(15, countMatches(answer, indicators.vague) * 3);
  const score = Math.max(0, Math.min(100, lengthScore + structureScore + evidenceScore + depthScore + reflectionScore + questionKeywordScore - vaguePenalty));

  return {
    answered: true,
    score,
    dimensions: [
      { name: "完整度", score: lengthScore },
      { name: "结构", score: structureScore },
      { name: "证据", score: evidenceScore },
      { name: "深度", score: depthScore },
      { name: "复盘", score: reflectionScore }
    ],
    feedback: answerFeedback(score, { lengthScore, structureScore, evidenceScore, depthScore, reflectionScore, vaguePenalty })
  };
}

function countByWords(text, words) {
  return words.reduce((count, word) => count + (text.includes(word) ? 1 : 0), 0);
}

function overlapScore(question, answer) {
  const keywords = [...new Set((question.match(/[\u4e00-\u9fa5A-Za-z0-9]{2,}/g) || []).filter(word => word.length >= 2))];
  return keywords.filter(word => answer.includes(word)).length * 2;
}

function answerFeedback(score, details) {
  const feedback = [];
  if (score >= 80) feedback.push("回答具备较强面试竞争力，继续准备反向追问和异常场景即可。");
  else if (score >= 60) feedback.push("回答能覆盖主线，但还需要补强证据、技术细节或复盘。");
  else feedback.push("回答目前偏泛，面试中容易被连续追问打穿，需要重写为具体项目叙事。");
  if (details.lengthScore < 12) feedback.push("回答过短，建议按“背景-任务-方案-结果-复盘”展开到至少 2 分钟口述量。");
  if (details.structureScore < 10) feedback.push("结构不够清晰，先给结论，再分层说明方案、取舍和结果。");
  if (details.evidenceScore < 12) feedback.push("缺少量化证据，补充 QPS、P99、耗时、成本、转化率、准确率或前后对比。");
  if (details.depthScore < 12) feedback.push("技术深度不足，补充核心原理、边界条件、异常处理和为什么不用其他方案。");
  if (details.reflectionScore < 6) feedback.push("复盘意识不足，补充失败点、风险、后续改进或你学到的判断方法。");
  if (details.vaguePenalty >= 6) feedback.push("弱表达较多，减少“熟悉/了解/参与”，改成明确动作和可验证结果。");
  return feedback;
}

function scoreClass(score) {
  if (score >= 80) return "ok";
  if (score >= 60) return "warn";
  return "risk";
}

function buildInterviewReport(evaluations, average) {
  const answeredCount = evaluations.filter(item => item.answered).length;
  const weakest = [...evaluations]
    .map((item, index) => ({ ...item, index }))
    .filter(item => item.answered)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);
  const advice = interviewAdvice(evaluations);
  return `
    <div class="block report-block">
      <h3>面试作答总评</h3>
      <div class="metric-grid">
        <div class="metric"><span>已作答</span><strong>${answeredCount}/${evaluations.length}</strong></div>
        <div class="metric"><span>平均分</span><strong class="${scoreClass(average)}">${average}/100</strong></div>
      </div>
      <p class="${scoreClass(average)}">${interviewVerdict(average, answeredCount)}</p>
    </div>
    <div class="block">
      <h3>优先改进题目</h3>
      ${weakest.length ? `<ol>${weakest.map(item => `<li>Q${item.index + 1}：${item.score}/100。${escapeHtml(item.feedback[0])}</li>`).join("")}</ol>` : `<p class="empty">还没有可评估的答案。</p>`}
    </div>
    <div class="block">
      <h3>整体改进建议</h3>
      <ol>${advice.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ol>
    </div>`;
}

function interviewVerdict(average, answeredCount) {
  if (!answeredCount) return "尚未作答，无法评估面试表现。";
  if (average >= 80) return "当前作答接近强候选人水平，重点准备更尖锐的反事实和异常追问。";
  if (average >= 60) return "当前作答有通过一面的基础，但部分问题缺少证据链或技术深度。";
  return "当前作答风险较高，需要先把项目叙事和技术细节补齐，再进行模拟面试。";
}

function interviewAdvice(evaluations) {
  const answered = evaluations.filter(item => item.answered);
  if (!answered.length) {
    return ["先至少完成 5 道题的作答，再根据评分结果做针对性改进。"];
  }
  const totals = { 完整度: 0, 结构: 0, 证据: 0, 深度: 0, 复盘: 0 };
  answered.forEach(item => item.dimensions.forEach(dimension => {
    totals[dimension.name] += dimension.score;
  }));
  const weakestDimension = Object.entries(totals).sort((a, b) => a[1] - b[1])[0][0];
  const map = {
    完整度: "把每道题扩展成完整口述稿，至少包含背景、个人任务、关键动作、结果和复盘。",
    结构: "先给一句结论，再按 2-3 个层次展开，避免想到哪里说到哪里。",
    证据: "为每个项目准备 3 个硬指标，并说清统计口径、优化前后对比和你的贡献边界。",
    深度: "补充技术原理、替代方案、边界条件和线上异常处理，否则容易停留在业务描述。",
    复盘: "每个项目准备一个失败或不足案例，说明你如何发现、修复和沉淀经验。"
  };
  return [
    map[weakestDimension],
    "把低于 60 分的题重写一版，再提交评分，直到核心项目题稳定高于 75 分。",
    "对每个答案增加一个“如果规模扩大 10 倍”的追问准备，覆盖瓶颈、压测、降级和成本。",
    "减少抽象形容词，多使用具体动作：我设计了什么、改了什么、验证了什么、结果是什么。"
  ];
}
