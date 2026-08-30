import { answerForIntent, policyAnswer } from './catalog.mjs';
import { evaluatePolicy, validatePayload } from './policy.mjs';
import { routeWithQwen, RouterConfigurationError, RouterUpstreamError } from './router.mjs';

function result(httpStatus, body) {
  return Object.freeze({ httpStatus, body });
}

export async function processAsk(payload, options = {}) {
  const validated = validatePayload(payload);
  if (!validated.ok) {
    return result(400, {
      ...policyAnswer('insufficient', 'en', 'refused'),
      reason: validated.error
    });
  }

  const { query, locale } = validated;
  const policy = evaluatePolicy(query);
  if (policy.decision === 'sensitive') {
    return result(200, policyAnswer('sensitive', locale));
  }
  if (policy.decision === 'injection') {
    return result(200, policyAnswer('injection', locale));
  }
  if (policy.decision === 'out_of_scope') {
    return result(200, policyAnswer('out_of_scope', locale));
  }

  try {
    const intent = await (options.router || routeWithQwen)(query, options.routerOptions || options);
    if (intent === 'REFUSE_SENSITIVE') {
      return result(200, policyAnswer('sensitive', locale));
    }
    if (intent === 'REFUSE_OUT_OF_SCOPE') {
      return result(200, policyAnswer('out_of_scope', locale));
    }
    if (intent === 'INSUFFICIENT') {
      return result(200, policyAnswer('insufficient', locale, 'insufficient'));
    }

    const approved = answerForIntent(intent, locale);
    if (!approved) {
      return result(200, policyAnswer('insufficient', locale, 'insufficient'));
    }
    return result(200, approved);
  } catch (error) {
    const configured = error instanceof RouterConfigurationError;
    const upstream = error instanceof RouterUpstreamError;
    if (!configured && !upstream && options.rethrowUnexpected) throw error;
    return result(configured ? 503 : 502, policyAnswer('unavailable', locale, 'upstream_error'));
  }
}

export function createRateLimiter({ limit = 8, windowMs = 60000 } = {}) {
  const buckets = new Map();
  return Object.freeze({
    check(key, now = Date.now()) {
      const bucketKey = key || 'unknown';
      const active = (buckets.get(bucketKey) || []).filter((stamp) => now - stamp < windowMs);
      if (active.length >= limit) {
        buckets.set(bucketKey, active);
        return Object.freeze({ allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((windowMs - (now - active[0])) / 1000)) });
      }
      active.push(now);
      buckets.set(bucketKey, active);
      return Object.freeze({ allowed: true, remaining: limit - active.length });
    },
    clear() {
      buckets.clear();
    }
  });
}
