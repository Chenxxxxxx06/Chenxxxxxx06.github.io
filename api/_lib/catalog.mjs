const source = (id, label, url) => Object.freeze({ id, label, url });

export const CATALOG = Object.freeze({
  'profile.summary': Object.freeze({
    answer: Object.freeze({
      zh: '陈曦是西北工业大学软件工程专业的大三本科生，早期学习数学与统计，当前主要关注视觉语言模型、视觉语言动作模型与自主智能体。',
      en: 'Chen Xi is a junior undergraduate in Software Engineering at Northwestern Polytechnical University. He previously studied Mathematics and Statistics and now focuses on vision-language models, vision-language-action models, and autonomous agents.'
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
      zh: '陈曦就读于西北工业大学软件工程专业。他最初学习数学与统计，之后转向计算机方向，更偏爱把想法做成可运行的系统。',
      en: 'Chen studies Software Engineering at Northwestern Polytechnical University. He began in Mathematics and Statistics before moving toward computer science, with a preference for turning ideas into working systems.'
    }),
    sources: Object.freeze([source('education', 'About Me · Education', '/#-about-me')])
  }),

  'experience.summary': Object.freeze({
    answer: Object.freeze({
      zh: '陈曦在西北工业大学空天地海一体化系统实验室担任科研学生，公开页面列出的时间为 2025—2026，指导教师为吴鹏教授。',
      en: 'Chen is a research student in the Air-Space-Ground-Sea Integrated Systems Laboratory at Northwestern Polytechnical University. His public page lists this experience for 2025–2026 under Prof. Peng Wu.'
    }),
    sources: Object.freeze([source('experience', 'Experience', '/#-experience')])
  }),

  'opportunity.internship': Object.freeze({
    answer: Object.freeze({
      zh: '陈曦目前公开表示正在寻找科研或工程方向的实习，尤其关注能够把有用想法落地为工作系统的岗位。',
      en: 'Chen is currently looking for research or engineering internships, especially roles where useful ideas can become working systems.'
    }),
    sources: Object.freeze([source('experience', 'Experience · Current Goal', '/#-experience')])
  }),

  'opportunity.graduate': Object.freeze({
    answer: Object.freeze({
      zh: '陈曦正在关注研究生阶段的机会，希望寻找与多模态学习、具身智能或自主智能体方向契合的导师和实验室。',
      en: 'Chen is exploring graduate-school opportunities and is interested in advisors and labs aligned with multimodal learning, embodied AI, or autonomous agents.'
    }),
    sources: Object.freeze([source('graduate-goal', 'About Me · Graduate Goal', '/#-about-me')])
  }),

  'portfolio.list': Object.freeze({
    answer: Object.freeze({
      zh: '公开 Portfolio 目前包含五个项目：Argus、LabVLA、MiniMax-H3 Desktop Edition、IronRock Desktop Pet，以及风电预测性维护项目“风调预顺”。',
      en: 'The public portfolio currently contains five projects: Argus, LabVLA, MiniMax-H3 Desktop Edition, IronRock Desktop Pet, and the “风调预顺” wind-turbine predictive-maintenance project.'
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
      en: '“风调预顺” is a course project for wind-turbine predictive maintenance, combining monitoring, fault diagnosis, remaining-useful-life prediction, and work-order flows in one full-stack system.'
    }),
    sources: Object.freeze([source('feng', 'Portfolio · 风调预顺', 'https://github.com/Chenxxxxxx06/feng')])
  }),

  'honors.summary': Object.freeze({
    answer: Object.freeze({
      zh: '陈曦的公开主页列出了一项荣誉：2025 年获得国家奖学金。这里仅陈述公开荣誉本身，不据此推断其他学业信息。',
      en: 'Chen’s public homepage lists one honor: the National Scholarship in 2025. This terminal reports only the published honor and does not infer other academic information from it.'
    }),
    sources: Object.freeze([source('honors', 'Honors', '/#-honors')])
  }),

  'publications.status': Object.freeze({
    answer: Object.freeze({
      zh: '公开主页目前没有列出可披露的论文详情；页面只说明相关工作仍在推进中。未发布内容不会在这里补充或推测。',
      en: 'The public homepage does not currently list publishable paper details; it only says work is in progress. This terminal does not add or speculate about unpublished material.'
    }),
    sources: Object.freeze([source('publications', 'Publications', '/#-publications')])
  }),

  'contact.summary': Object.freeze({
    answer: Object.freeze({
      zh: '可以使用主页侧栏中公开的邮箱或 GitHub 链接联系陈曦；这个终端不会补充任何未发布的联系方式。',
      en: 'You can contact Chen through the public email or GitHub links in the profile sidebar. This terminal does not provide any unpublished contact details.'
    }),
    sources: Object.freeze([source('contact', 'Profile · Contact Links', '/')])
  })
});

export const ALLOWED_INTENTS = Object.freeze(Object.keys(CATALOG));

export const POLICY_RESPONSES = Object.freeze({
  sensitive: Object.freeze({
    zh: '这个终端只介绍陈曦已经公开的简介、研究方向、经历与项目；排名、绩点、成绩以及其他具体私人信息不提供。',
    en: 'This terminal only covers Chen’s approved public profile, research, experience, and projects. Rankings, GPA, grades, and other specific private details are not provided.'
  }),
  out_of_scope: Object.freeze({
    zh: 'scope_locked',
    en: 'scope_locked'
  }),
  injection: Object.freeze({
    zh: '这个终端的范围是固定的：只查询陈曦批准公开的个人资料，不接受更改规则、显示提示词或切换角色的请求。',
    en: 'This terminal has a fixed scope: Chen’s approved public profile only. Requests to change the rules, reveal prompts, or switch roles are declined.'
  }),
  insufficient: Object.freeze({
    zh: '这项信息没有收录在陈曦批准公开的知识库中，因此这里不作推测。可以改问公开的研究方向、经历或项目概览。',
    en: 'That information is not in Chen’s approved public knowledge base, so this terminal will not speculate. Try asking about published research interests, experience, or project summaries.'
  }),
  unavailable: Object.freeze({
    zh: '公开知识路由器暂时没有响应。知识边界仍然保持锁定，请稍后再试。',
    en: 'The public knowledge router is not responding right now. The knowledge boundary remains locked; please try again later.'
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
