const ZERO_WIDTH = /[\u200B-\u200D\u2060\uFEFF]/g;
const CONTROL_CHAR = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;
const URL_LIKE = /(?:https?:\/\/|www\.)/i;
const LONG_ENCODED_BLOCK = /[A-Za-z0-9+/=_-]{96,}/;

const SENSITIVE_PATTERNS = Object.freeze([
  /排名|名次|第\s*几(?:名)?|百分位|保研位次|年级前\s*\d+/i,
  /绩点|成绩|分数|考分|每门课|逐门|考试结果|高考|四六级/i,
  /\b(?:rank(?:ing)?|percentile|g\s*[._-]?\s*p\s*[._-]?\s*a|grade|score|transcript)\b/i,
  /身份证|护照号|手机号|电话号码|私人邮箱|住址|家庭住址|宿舍|生日|出生日期|年龄|(?:他|陈曦|你)(?:今年)?多大|(?:他|陈曦|你)(?:住哪|住在)|(?:他|陈曦|你)(?:的)?微信/i,
  /身高|体重|鞋码|衣服尺码|血型|星座|籍贯|家乡/i,
  /收入|工资|银行卡|账户|密码|密钥|api\s*key|实时位置|当前位置|行程|日程/i,
  /父母|家人|恋爱|女朋友|男朋友|私生活|健康状况|医疗/i,
  /未公开|保密|内部资料|私人资料|完整简历|简历原文|所有细节|全部细节|全部数字/i,
  /具体(?:做了|负责|贡献|实现).*(?:模块|代码|部分)|哪(?:些|一)行代码/i,
  /private\s+(?:code|document|resume|detail)|specific(?:ally)?\s+(?:implemented|contribution|module|code)/i,
  /phone\s*(?:number)?|mobile\s*(?:number)?|private\s+email|home\s+address|birthday|date\s+of\s+birth|shoe\s+size|blood\s+type|height|weight|hometown|(?:his|chen'?s|your)\s+(?:wechat|weixin)/i,
  /推断|猜测|反推|估算.*(?:排名|成绩|绩点)|infer.*(?:rank|grade|score)/i
]);

const COMPACT_SENSITIVE = Object.freeze([
  'ranking', 'rank', 'percentile', 'gpa', 'grade', 'score', 'transcript',
  'phonenumber', 'mobilenumber', 'privateemail', 'homeaddress', 'shoesize', 'bloodtype',
  '排名', '名次', '绩点', '成绩', '分数', '电话号码', '手机号', '私人邮箱', '住址', '身份证',
  '身高', '体重', '鞋码', '衣服尺码', '血型', '籍贯', '家乡'
]);

const INJECTION_PATTERNS = Object.freeze([
  /ignore\s+(?:all\s+)?(?:previous|prior|above)\s+(?:instructions?|rules?)/i,
  /forget\s+(?:the\s+)?(?:previous|prior|above)\s+(?:instructions?|rules?)/i,
  /system\s+prompt|developer\s+message|hidden\s+prompt|reveal\s+.*instructions?/i,
  /jailbreak|\bDAN\b|role\s*play.*(?:unrestricted|no\s+rules)|act\s+as\s+.*administrator/i,
  /忽略.*(?:规则|指令|限制)|忘记.*(?:规则|指令)|输出.*(?:系统提示词|隐藏提示词)/i,
  /(?:显示|发给我|复述|透露).*(?:系统提示词|隐藏提示词|提示词|开发者消息|内部指令)|(?:系统提示词|隐藏提示词|提示词|开发者消息|内部指令).*(?:显示|发给我|复述|透露)|扮演.*(?:管理员|无限制|无规则)|假装.*(?:没有|不存在).*(?:限制|规则)|越狱/i,
  /base\s*64|rot\s*13|编码.*(?:隐藏|规则|提示词)|translate.*(?:system prompt|hidden prompt)/i
]);

const OUT_OF_SCOPE_PATTERNS = Object.freeze([
  /天气|气温|新闻|热搜|股价|股票|基金|比特币|加密货币|汇率|彩票/i,
  /写(?:一段|一个|份)?(?:代码|程序|作文|邮件)|编程题|数学题|计算.*(?:等于|结果)|证明(?:题|一下)|解方程/i,
  /翻译(?:这|以下|成)|做饭|菜谱|旅游攻略|订票|路线规划|政治|选举|总统/i,
  /写(?:一首|首|个|段)?诗|作诗|讲(?:个|一个)?笑话|编(?:个|一个)?故事|续写|改写/i,
  /weather|forecast|latest\s+news|stock\s+price|bitcoin|exchange\s+rate|lottery/i,
  /write\s+(?:me\s+)?(?:code|a\s+program|an\s+essay|an\s+email)|solve\s+(?:this\s+)?(?:math|equation)|translate\s+(?:this|the)/i,
  /write\s+(?:me\s+)?(?:a\s+)?(?:poem|story|joke)|tell\s+(?:me\s+)?(?:a\s+)?joke/i,
  /capital\s+of\b|首都/i,
  /compare.*(?:qwen|deepseek|gpt|model)|模型.*(?:对比|比较)|通用知识|百科/i
]);

export function normalizeQuery(value) {
  if (typeof value !== 'string') return '';
  return value
    .normalize('NFKC')
    .replace(ZERO_WIDTH, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function selectLocale(query, requestedLocale) {
  if (/\p{Script=Han}/u.test(query)) return 'zh';
  return typeof requestedLocale === 'string' && requestedLocale.toLowerCase().startsWith('zh') ? 'zh' : 'en';
}

export function validatePayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { ok: false, error: 'invalid_payload' };
  }
  const keys = Object.keys(payload);
  if (keys.some((key) => key !== 'query' && key !== 'locale')) {
    return { ok: false, error: 'unexpected_field' };
  }
  if (typeof payload.query !== 'string') {
    return { ok: false, error: 'invalid_query' };
  }
  const query = normalizeQuery(payload.query);
  const length = Array.from(query).length;
  if (length < 1 || length > 240 || CONTROL_CHAR.test(query)) {
    return { ok: false, error: 'invalid_query' };
  }
  if (payload.locale !== undefined && typeof payload.locale !== 'string') {
    return { ok: false, error: 'invalid_locale' };
  }
  return { ok: true, query, locale: selectLocale(query, payload.locale) };
}

function matchesAny(value, patterns) {
  return patterns.some((pattern) => pattern.test(value));
}

export function evaluatePolicy(query) {
  const normalized = normalizeQuery(query);
  const compact = normalized.toLowerCase().replace(/[\s._:/\\-]+/g, '');

  if (URL_LIKE.test(normalized) || LONG_ENCODED_BLOCK.test(normalized)) {
    return Object.freeze({ decision: 'out_of_scope', query: normalized });
  }
  if (matchesAny(normalized, SENSITIVE_PATTERNS) || COMPACT_SENSITIVE.some((term) => compact.includes(term))) {
    return Object.freeze({ decision: 'sensitive', query: normalized });
  }
  if (matchesAny(normalized, INJECTION_PATTERNS)) {
    return Object.freeze({ decision: 'injection', query: normalized });
  }

  const external = matchesAny(normalized, OUT_OF_SCOPE_PATTERNS);
  if (external) {
    return Object.freeze({ decision: 'out_of_scope', query: normalized });
  }
  return Object.freeze({ decision: 'allowed', query: normalized });
}

export const POLICY_TERMS = Object.freeze({
  sensitive: SENSITIVE_PATTERNS,
  injection: INJECTION_PATTERNS,
  outOfScope: OUT_OF_SCOPE_PATTERNS
});
