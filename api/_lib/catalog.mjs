const source = (id, label, url) => Object.freeze({ id, label, url });

// A deliberately narrow exception to the general-news boundary. Anchoring the
// whole question prevents mixed requests from borrowing this exception.
export const PUBLIC_NEWS_QUERY = String.raw`^(?:(?:(?:what(?:['’]s| is| are)|tell me(?: about)?) )?(?:your|chen(?: xi)?['’]s) (?:latest |recent )?(?:news|updates?)|(?:(?:what(?:['’]s| is) )?(?:the )?(?:latest |recent )?(?:news|updates?) (?:about|from) chen(?: xi)?)|what(?:['’]s| is) new with (?:you|chen(?: xi)?)|(?:请(?:介绍|说说)|介绍|说说)?(?:你|陈曦)(?:的)?(?:最新|最近|近期)(?:的)?(?:动态|消息|新闻|更新)(?:是什么|有哪些|有什么)?)[.?!。？！]*$`;

export const CATALOG = Object.freeze({
  'profile.summary': Object.freeze({
    answer: Object.freeze({
      zh: '陈曦是西北工业大学软件工程专业本科生，最初学习数学与统计，后来转向计算机。主要关注视觉语言模型、视觉语言动作模型与自主智能体，预计 2027 年前往北京大学计算机学院攻读博士学位。',
      en: 'Chen Xi is an undergraduate in Software Engineering at Northwestern Polytechnical University, originally from Mathematics and Statistics. He works on VLMs, VLAs, and autonomous agents, and expects to begin a PhD at Peking University’s School of Computer Science in 2027.'
    }),
    sources: Object.freeze([source('about', 'About Me', '/#-about-me')])
  }),

  'profile.interests': Object.freeze({
    answer: Object.freeze({
      zh: '陈曦目前公开的研究兴趣包括多模态异常检测、具身智能，以及面向数据分析的智能体框架。他尤其关注 VLM、VLA 与能长期规划、执行和复盘的自主智能体。',
      en: 'Chen currently publishes three main research interests: multimodal anomaly detection, embodied AI, and agent frameworks for data analysis. His broader focus is on VLMs, VLAs, and autonomous agents that can plan, execute, and review longer-running work.'
    }),
    sources: Object.freeze([source('exploring', 'About Me · What I’m Exploring', '/#-about-me')])
  }),

  'education.summary': Object.freeze({
    answer: Object.freeze({
      zh: '陈曦在西北工业大学学习软件工程，最初的专业方向是数学与统计。2026 年 9 月推免结束，预计 2027 年进入北京大学计算机学院攻读博士学位。比起证明定理，他更喜欢把想法做成能运行的东西。',
      en: 'Chen studies Software Engineering at Northwestern Polytechnical University after starting in Mathematics and Statistics. His graduate admissions process wrapped up in September 2026, and he expects to start a PhD at Peking University’s School of Computer Science in 2027. Building things turned out to be more his thing than proving theorems.'
    }),
    sources: Object.freeze([source('education', 'About Me · Education', '/#-about-me')])
  }),

  'experience.summary': Object.freeze({
    answer: Object.freeze({
      zh: '公开经历按开始时间排列：2025—2026 年，在西北工业大学空天地海一体化系统实验室随吴鹏教授开展研究；2026 年 1—6 月，在浙江大学 ZJUNLP 随张宁豫老师担任 RA；2026 年 3—4 月，在清华大学某非计算机学院担任 RA；预计 2027 年进入北京大学计算机学院攻读博士学位。',
      en: 'In chronological order: research at NPU’s Air-Space-Ground-Sea Integrated Systems Laboratory with Prof. Peng Wu in 2025–2026; an RA at ZJUNLP, Zhejiang University, with Prof. Ningyu Zhang from January to June 2026; an RA at a non-CS school at Tsinghua University from March to April 2026; and an expected PhD start at Peking University’s School of Computer Science in 2027.'
    }),
    sources: Object.freeze([source('experience', 'Experience', '/#-experience')])
  }),

  'opportunity.internship': Object.freeze({
    answer: Object.freeze({
      zh: '陈曦目前公开表示正在寻找科研或工程方向的实习，尤其关注能够把有用想法落地为工作系统的岗位。',
      en: 'Chen is currently looking for research or engineering internships, especially roles where useful ideas can become working systems.'
    }),
    sources: Object.freeze([source('lately', 'Life Lately · Internships', '/#more-to-come')])
  }),

  'opportunity.graduate': Object.freeze({
    answer: Object.freeze({
      zh: '2026 年 9 月推免结束啦！陈曦预计 2027 年前往北京大学计算机学院攻读博士学位。关于未来导师，他想公开说的就是：我超爱我的导师！！！',
      en: 'Graduate admissions wrapped up in September 2026! Chen expects to start a PhD at Peking University’s School of Computer Science in 2027. His public message about his future advisor: “I absolutely love my advisor!”'
    }),
    sources: Object.freeze([source('graduate-goal', 'Experience · What’s Next', '/#-experience')])
  }),

  'education.advisor': Object.freeze({
    answer: Object.freeze({
      zh: '北京大学的导师姓名暂不公开，但有一句话必须说：我超爱我的导师！！！',
      en: 'Chen is keeping his Peking University advisor’s name private for now. But this part is very public: “I absolutely love my advisor!”'
    }),
    sources: Object.freeze([source('advisor', 'Experience · Peking University', '/#-experience')])
  }),

  'profile.now': Object.freeze({
    answer: Object.freeze({
      zh: '最近在尝试做自媒体，幻想成为 vlogger，也在找实习、折腾各种有意思的东西。简历还在迭代优化，欢迎来找我玩！',
      en: 'Lately: making content, daydreaming about becoming a vlogger, looking for internships, and trying all sorts of fun things. The résumé is still a work in progress. Come say hi — I’m always up for something interesting!'
    }),
    sources: Object.freeze([source('lately', 'Life Lately', '/#more-to-come')])
  }),

  'news.summary': Object.freeze({
    answer: Object.freeze({
      zh: '最近两条动态：2026 年 9 月，推免结束，预计 2027 年前往北京大学计算机学院攻读博士学位；2026 年 10 月，获得国家奖学金。',
      en: 'Two recent updates: graduate admissions wrapped up in September 2026, with an expected PhD start at Peking University’s School of Computer Science in 2027; in October 2026, Chen received the National Scholarship.'
    }),
    sources: Object.freeze([source('news', 'News', '/#-news')])
  }),

  'portfolio.list': Object.freeze({
    answer: Object.freeze({
      zh: '公开 Portfolio 目前包含五个项目：Argus、LabVLA、MiniMax-H3 Desktop Edition、IronRock Desktop Pet，以及风电预测性维护项目“风调预顺”。',
      en: 'The public portfolio currently contains five projects: Argus, LabVLA, MiniMax-H3 Desktop Edition, IronRock Desktop Pet, and Feng (Wind-Turbine Predictive Maintenance).'
    }),
    sources: Object.freeze([source('portfolio', 'Portfolio', '/#-portfolio')])
  }),

  'project.argus': Object.freeze({
    answer: Object.freeze({
      zh: 'Argus 是陈曦参与的自主智能体项目，关注长任务中的规划、执行、审查与恢复。他在公开介绍中将自己的工作概括为同时参与研究与工程。',
      en: 'Argus is an autonomous-agent project Chen contributes to, focused on planning, execution, review, and resumption across long-running tasks. His public description says he works across both research and engineering.'
    }),
    sources: Object.freeze([source('argus', 'Portfolio · Argus', 'https://github.com/lbx154/Argus')])
  }),

  'project.labvla': Object.freeze({
    answer: Object.freeze({
      zh: 'LabVLA 是陈曦参与的科学实验室 VLA 项目。它以 Qwen3-VL 为视觉语言骨干，并结合 DiT flow-matching 动作专家，把实验协议、视觉观测与机器人状态连接到连续动作。',
      en: 'LabVLA is a scientific-laboratory VLA project Chen worked on. It pairs a Qwen3-VL vision-language backbone with a DiT flow-matching action expert to connect lab protocols, visual observations, and robot state to continuous actions.'
    }),
    sources: Object.freeze([source('labvla', 'Portfolio · LabVLA', 'https://github.com/zjunlp/LabVLA')])
  }),

  'project.minimax': Object.freeze({
    answer: Object.freeze({
      zh: 'MiniMax-H3 Desktop Edition 是一个单 GPU 推理优化项目，目标是在一张 48 GB RTX A6000 上运行完整的音视频生成，并持续优化速度与显存占用。',
      en: 'MiniMax-H3 Desktop Edition is a single-GPU inference-optimization project. Its public goal is to run full audio-video generation on one 48 GB RTX A6000 while improving speed and memory use.'
    }),
    sources: Object.freeze([source('minimax', 'Portfolio · MiniMax-H3', 'https://github.com/Argus-AiTeam/minimax-h3-desktop')])
  }),

  'project.ironrock': Object.freeze({
    answer: Object.freeze({
      zh: 'IronRock Desktop Pet 是一个 PyQt6 桌面助手项目，可接收 PDF、笔记或日志，整理本地实验室知识库并进行问答。它最初来自一次黑客松。',
      en: 'IronRock Desktop Pet is a PyQt6 desktop assistant that accepts PDFs, notes, or logs, organizes a local lab knowledge base, and chats over it. It began as a hackathon project.'
    }),
    sources: Object.freeze([source('ironrock', 'Portfolio · IronRock', 'https://github.com/bclz19/IronRock')])
  }),

  'project.feng': Object.freeze({
    answer: Object.freeze({
      zh: '“风调预顺”是一个风力发电机预测性维护课程项目，把监控、故障诊断、剩余寿命预测与工单流程整合在一个全栈系统中。',
      en: 'Feng (Wind-Turbine Predictive Maintenance) is a course project combining monitoring, fault diagnosis, remaining-useful-life prediction, and work-order flows in one full-stack system.'
    }),
    sources: Object.freeze([source('feng', 'Portfolio · Feng · Wind-Turbine Predictive Maintenance', 'https://github.com/Chenxxxxxx06/feng')])
  }),

  'honors.summary': Object.freeze({
    answer: Object.freeze({
      zh: '陈曦在 2025 年、2026 年 10 月获得国家奖学金。',
      en: 'Chen received the National Scholarship in 2025 and again in October 2026.'
    }),
    sources: Object.freeze([source('honors', 'Honors', '/#-honors')])
  }),

  'publications.status': Object.freeze({
    answer: Object.freeze({
      zh: '主页列出四项工作：Weakly Supervised Video Anomaly Detection via Ambiguous Region Awareness and Retrieval-Augmented Generation；LabVLA: Grounding Vision-Language-Action Models in Scientific Laboratories；Argus: A General-Purpose Agentic Reasoning Runtime for Long-Horizon Tasks；What Should a Data Agent Remember About Its Own Results? LongInterSQL: Benchmarking Inter-Session Artifact Reuse in Interactive Text-to-SQL。',
      en: 'Four works are listed: Weakly Supervised Video Anomaly Detection via Ambiguous Region Awareness and Retrieval-Augmented Generation; LabVLA: Grounding Vision-Language-Action Models in Scientific Laboratories; Argus: A General-Purpose Agentic Reasoning Runtime for Long-Horizon Tasks; and What Should a Data Agent Remember About Its Own Results? LongInterSQL: Benchmarking Inter-Session Artifact Reuse in Interactive Text-to-SQL.'
    }),
    sources: Object.freeze([source('publications', 'Publications', '/#-publications')])
  }),

  'contact.summary': Object.freeze({
    answer: Object.freeze({
      zh: '欢迎来找陈曦聊聊！可以使用主页侧栏的公开邮箱或 GitHub 链接。',
      en: 'Come say hi! You can reach Chen through the public email or GitHub links in the profile sidebar.'
    }),
    sources: Object.freeze([source('contact', 'Profile · Contact Links', '/')])
  })
});

export const ALLOWED_INTENTS = Object.freeze(Object.keys(CATALOG));

// These topic hints only select an approved answer; they never generate facts.
// Exported with the catalog so the static site and API share the same public copy.
export const PUBLIC_TOPIC_RULES = Object.freeze([
  ['news.summary', PUBLIC_NEWS_QUERY],
  ['experience.summary', '^(?=.*(?:advisor|supervisor|导师))(?=.*(?:zjunlp|zhejiang|tsinghua|npu|northwestern polytechnical|浙江|清华|西工大|西北工业|张宁豫|吴鹏))(?!.*(?:peking|pku|北京大学|北大|future|未来)).*$'],
  ['education.advisor', 'advisor|supervisor|导师'],
  ['opportunity.graduate', 'graduate|ph\\.?d|博士|推免|保研|北大|北京大学|peking|pku'],
  ['profile.now', 'lately|these days|up to|content creat|vlog|résumé|resume|自媒体|近况|最近|简历'],
  ['opportunity.internship', 'internship|实习'],
  ['project.argus', '\\bargus\\b'],
  ['project.labvla', '\\blabvla\\b'],
  ['project.minimax', 'minimax|\\bh3\\b'],
  ['project.ironrock', 'ironrock|desktop pet|桌宠'],
  ['project.feng', '风调预顺|wind.turbine|\\bfeng\\b'],
  ['publications.status', 'publication|paper|论文|发表|longintersql|data agent|歧义区域|ambiguous region|weakly supervised'],
  ['honors.summary', 'honou?r|award|scholarship|奖|荣誉'],
  ['experience.summary', 'experience|\\bra\\b|zjunlp|zhejiang|tsinghua|经历|浙江|清华|张宁豫|研究助理'],
  ['education.summary', 'education|university|school|major|undergrad|npu|mathematics|statistics|大学|学校|专业|西工大|西北工业|本科|数学|统计'],
  ['portfolio.list', 'project|portfolio|building|built|worked on|highlight|项目|作品|做过|亮点'],
  ['profile.interests', 'research|interest|focus|explor|研究|兴趣|方向|擅长|会什么'],
  ['contact.summary', 'contact|email|e-mail|github|say hi|联系|邮箱|找你|找他'],
  ['profile.summary', 'who (?:is|are)|about (?:chen|you)|introduc|hello|^hi[!.? ]*$|你是谁|介绍|了解你|了解陈|你好|身份']
]);

export const POLICY_RESPONSES = Object.freeze({
  sensitive: Object.freeze({
    zh: '这部分是私人信息。可以聊聊我的公开研究、项目或经历。',
    en: 'That part stays private. Happy to share my public research, projects, or experience.'
  }),
  out_of_scope: Object.freeze({
    zh: '这里只聊陈曦的公开资料。试试问研究、项目或最近在忙什么？',
    en: 'I only cover Chen’s public notes here. Try research, projects, or life lately?'
  }),
  injection: Object.freeze({
    zh: '这里只分享陈曦选择公开的内容。',
    en: 'I only share what Chen has chosen to make public.'
  }),
  insufficient: Object.freeze({
    zh: '这条还没写进公开笔记。试试上面的小问题，或者直接来找我聊聊。',
    en: 'That’s not in my public notes yet. Try a question above, or come ask me directly.'
  }),
  unavailable: Object.freeze({
    zh: '暂时没能连接。问题已经保留，可以再试一次。',
    en: 'Couldn’t connect just now. Your question is saved — please try again.'
  }),
  rate_limited: Object.freeze({
    zh: '请求有些密集。请稍等片刻，再继续询问陈曦的公开资料。',
    en: 'Requests are arriving too quickly. Wait a moment, then continue with Chen’s public profile.'
  })
});

export function localize(copy, locale) {
  return copy[locale === 'zh' ? 'zh' : 'en'];
}

export function answerForIntent(intent, locale) {
  const entry = CATALOG[intent];
  if (!entry) return null;
  return Object.freeze({
    status: 'answered',
    answer: localize(entry.answer, locale),
    sources: entry.sources
  });
}

export function policyAnswer(reason, locale, status = 'refused') {
  const copy = POLICY_RESPONSES[reason] || POLICY_RESPONSES.insufficient;
  return Object.freeze({
    status,
    reason,
    answer: localize(copy, locale),
    sources: Object.freeze([])
  });
}
