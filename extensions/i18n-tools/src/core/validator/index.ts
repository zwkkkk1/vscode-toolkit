import { REASON_LABEL } from "./constants";

type ruleLevel = 'warning' | 'failed';

type ruleType = {
  validator: () => boolean,
  key: keyof typeof REASON_LABEL,
  level: ruleLevel
};

function getRules(level: ruleLevel, rules: ruleType[]) {
  const reasons: {[key in keyof typeof REASON_LABEL]?: any} = {};
  rules.filter((rule) => {
    if (rule.level === level && rule.validator()) {
      reasons[rule.key] = rule;
    }
  });
  return reasons;
}

class Validator {
  constructor(private rules: ruleType[]) {}

  get warnings() {
    return getRules('warning', this.rules);
  }

  get fails() {
    return getRules('failed', this.rules);
  }

  get isSuccess() {
    return !Object.keys(this.warnings).length && !Object.keys(this.fails).length;
  }
}

export default Validator;