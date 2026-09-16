import type { Project } from './types';

export interface CalcField {
  id: string;
  name: string;
  formula: string;
}

// Fields a calculated field's formula is allowed to reference. Kept to numeric fields only.
export const CALC_FIELD_VARIABLES: { key: string; label: string }[] = [
  { key: 'projectValueCr', label: 'Project value (₹ Cr)' },
  { key: 'steelRequirementTonnes', label: 'Steel requirement (MT)' },
  { key: 'cementRequirementTonnes', label: 'Cement requirement (MT)' },
  { key: 'durationMonths', label: 'Duration (months)' },
  { key: 'completionPercent', label: 'Completion %' },
];

const VARIABLE_KEYS = new Set(CALC_FIELD_VARIABLES.map((v) => v.key));

const STORAGE_KEY = 'infrapulse_calc_fields';

export function loadCalcFields(): CalcField[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCalcFields(fields: CalcField[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fields));
  } catch {
    // localStorage unavailable (private mode, quota) - calculated fields just won't persist.
  }
}

// --- Minimal, safe arithmetic expression parser (+ - * / parentheses, numeric literals,
// and whitelisted field-name identifiers only). No eval(), no arbitrary JS execution. ---

type Token = { type: 'num'; value: number } | { type: 'id'; value: string } | { type: 'op'; value: string };

function tokenize(formula: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < formula.length) {
    const ch = formula[i];
    if (/\s/.test(ch)) {
      i++;
    } else if (/[0-9.]/.test(ch)) {
      let j = i;
      while (j < formula.length && /[0-9.]/.test(formula[j])) j++;
      const value = Number(formula.slice(i, j));
      if (isNaN(value)) throw new Error(`Invalid number at position ${i}`);
      tokens.push({ type: 'num', value });
      i = j;
    } else if (/[a-zA-Z_]/.test(ch)) {
      let j = i;
      while (j < formula.length && /[a-zA-Z0-9_]/.test(formula[j])) j++;
      tokens.push({ type: 'id', value: formula.slice(i, j) });
      i = j;
    } else if ('+-*/()'.includes(ch)) {
      tokens.push({ type: 'op', value: ch });
      i++;
    } else {
      throw new Error(`Unsupported character "${ch}" in formula`);
    }
  }
  return tokens;
}

class Parser {
  tokens: Token[];
  pos = 0;
  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }
  peek(): Token | undefined {
    return this.tokens[this.pos];
  }
  next(): Token | undefined {
    return this.tokens[this.pos++];
  }
  parseExpression(): (vars: Record<string, number | null>) => number | null {
    let left = this.parseTerm();
    for (;;) {
      const t = this.peek();
      if (t && t.type === 'op' && (t.value === '+' || t.value === '-')) {
        this.next();
        const right = this.parseTerm();
        const op = t.value;
        const prevLeft = left;
        left = (vars) => {
          const a = prevLeft(vars);
          const b = right(vars);
          if (a === null || b === null) return null;
          return op === '+' ? a + b : a - b;
        };
      } else {
        break;
      }
    }
    return left;
  }
  parseTerm(): (vars: Record<string, number | null>) => number | null {
    let left = this.parseFactor();
    for (;;) {
      const t = this.peek();
      if (t && t.type === 'op' && (t.value === '*' || t.value === '/')) {
        this.next();
        const right = this.parseFactor();
        const op = t.value;
        const prevLeft = left;
        left = (vars) => {
          const a = prevLeft(vars);
          const b = right(vars);
          if (a === null || b === null) return null;
          if (op === '/' && b === 0) return null;
          return op === '*' ? a * b : a / b;
        };
      } else {
        break;
      }
    }
    return left;
  }
  parseFactor(): (vars: Record<string, number | null>) => number | null {
    const t = this.next();
    if (!t) throw new Error('Unexpected end of formula');
    if (t.type === 'op' && t.value === '-') {
      const inner = this.parseFactor();
      return (vars) => {
        const v = inner(vars);
        return v === null ? null : -v;
      };
    }
    if (t.type === 'op' && t.value === '(') {
      const inner = this.parseExpression();
      const close = this.next();
      if (!close || close.type !== 'op' || close.value !== ')') throw new Error('Missing closing parenthesis');
      return inner;
    }
    if (t.type === 'num') {
      const value = t.value;
      return () => value;
    }
    if (t.type === 'id') {
      if (!VARIABLE_KEYS.has(t.value)) {
        throw new Error(`Unknown field "${t.value}". Allowed: ${Array.from(VARIABLE_KEYS).join(', ')}`);
      }
      const key = t.value;
      return (vars) => (key in vars ? vars[key] : null);
    }
    throw new Error('Unexpected token in formula');
  }
}

// Validates and compiles a formula. Throws with a human-readable message on invalid input.
export function compileFormula(formula: string): (project: Project) => number | null {
  const tokens = tokenize(formula);
  if (tokens.length === 0) throw new Error('Formula is empty');
  const parser = new Parser(tokens);
  const fn = parser.parseExpression();
  if (parser.pos !== tokens.length) throw new Error('Unexpected trailing characters in formula');
  return (project: Project) => {
    const vars: Record<string, number | null> = {
      projectValueCr: project.projectValueCr,
      steelRequirementTonnes: project.steelRequirementTonnes,
      cementRequirementTonnes: project.cementRequirementTonnes,
      durationMonths: project.durationMonths,
      completionPercent: project.completionPercent,
    };
    try {
      return fn(vars);
    } catch {
      return null;
    }
  };
}

export function evaluateCalcField(field: CalcField, project: Project): number | null {
  try {
    const fn = compileFormula(field.formula);
    return fn(project);
  } catch {
    return null;
  }
}
