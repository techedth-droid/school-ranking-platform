'use client';

import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { CATEGORY_A_HEADER, RUBRIC_A_ITEMS } from '@/lib/rubricCategoryA';
import { CATEGORY_B_HEADER, RUBRIC_B_ITEMS } from '@/lib/rubricCategoryB';
import { CATEGORY_C_HEADER, RUBRIC_C_ITEMS } from '@/lib/rubricCategoryC';
import { CATEGORY_D_HEADER, RUBRIC_D_ITEMS } from '@/lib/rubricCategoryD';
import { CATEGORY_E_HEADER, RUBRIC_E_ITEMS } from '@/lib/rubricCategoryE';

const CATEGORIES = ['A', 'B', 'C', 'D', 'E'];

const CAT_STYLE = {
  A: { accent: 'text-amber-700', bg: 'bg-amber-50', ring: 'ring-amber-200', badge: 'bg-amber-100 text-amber-800', bar: 'bg-amber-400' },
  B: { accent: 'text-slate-700', bg: 'bg-slate-50', ring: 'ring-slate-200', badge: 'bg-slate-100 text-slate-700', bar: 'bg-slate-400' },
  C: { accent: 'text-orange-700', bg: 'bg-orange-50', ring: 'ring-orange-200', badge: 'bg-orange-100 text-orange-800', bar: 'bg-orange-400' },
  D: { accent: 'text-violet-700', bg: 'bg-violet-50', ring: 'ring-violet-200', badge: 'bg-violet-100 text-violet-800', bar: 'bg-violet-400' },
  E: { accent: 'text-blue-700', bg: 'bg-blue-50', ring: 'ring-blue-200', badge: 'bg-blue-100 text-blue-800', bar: 'bg-blue-400' },
};

const DETAILED_RUBRICS = {
  A: { header: CATEGORY_A_HEADER, items: RUBRIC_A_ITEMS },
  B: { header: CATEGORY_B_HEADER, items: RUBRIC_B_ITEMS },
  C: { header: CATEGORY_C_HEADER, items: RUBRIC_C_ITEMS },
  D: { header: CATEGORY_D_HEADER, items: RUBRIC_D_ITEMS },
  E: { header: CATEGORY_E_HEADER, items: RUBRIC_E_ITEMS },
};

function rubricTypeLabel(t) {
  if (t === 'Q') return 'เชิงปริมาณ';
  if (t === 'Qual') return 'เชิงคุณภาพ';
  return 'ปริมาณ/คุณภาพ';
}

function clampScore(n) {
  const x = Number(n);
  if (Number.isNaN(x)) return 0;
  return Math.round(Math.min(4, Math.max(0, x)) * 100) / 100;
}

function formatScoreForDisplay(n) {
  const v = clampScore(n);
  if (v === 0) return '0';
  return String(v);
}

function sanitizePartialScore(raw) {
  let s = String(raw ?? '').replace(/[^\d.]/g, '');
  const dot = s.indexOf('.');
  if (dot !== -1) {
    s = s.slice(0, dot + 1) + s.slice(dot + 1).replace(/\./g, '');
    const [ip, fp = ''] = s.split('.');
    s = `${ip}.${fp.slice(0, 2)}`;
  }
  return s;
}

function commitRawToValue(raw) {
  const trimmed = String(raw ?? '').trim();
  if (trimmed === '' || trimmed === '.') return 0;
  return clampScore(parseFloat(trimmed));
}

const ScoreInput = forwardRef(function ScoreInput({ initial = {}, onChange, readOnly = false }, ref) {
  const [scores, setScores] = useState(() => {
    const s = {};
    CATEGORIES.forEach((cat) =>
      [1, 2, 3, 4, 5].forEach((n) => {
        const key = `${cat.toLowerCase()}${n}`;
        s[key] = clampScore(initial[key] ?? 0);
      })
    );
    return s;
  });

  const [editBuffer, setEditBuffer] = useState({});
  const [openRubric, setOpenRubric] = useState(null);

  const scoresRef = useRef(scores);
  scoresRef.current = scores;
  const editBufferRef = useRef(editBuffer);
  editBufferRef.current = editBuffer;

  useImperativeHandle(ref, () => ({
    flushPending() {
      const buf = editBufferRef.current;
      let next = { ...scoresRef.current };
      Object.keys(buf).forEach((key) => {
        next[key] = commitRawToValue(buf[key]);
      });
      if (Object.keys(buf).length > 0) {
        setScores(next);
        setEditBuffer({});
        onChange?.(next);
      }
      return next;
    },
  }));

  function inputDisplayValue(key) {
    if (Object.prototype.hasOwnProperty.call(editBuffer, key)) return editBuffer[key];
    return formatScoreForDisplay(scores[key]);
  }

  function handleFocus(key) {
    if (readOnly) return;
    setEditBuffer((b) => ({ ...b, [key]: formatScoreForDisplay(scores[key]) }));
  }

  function handleChange(key, val) {
    if (readOnly) return;
    setEditBuffer((b) => ({ ...b, [key]: sanitizePartialScore(val) }));
  }

  function handleBlur(key) {
    if (readOnly) return;
    if (!Object.prototype.hasOwnProperty.call(editBuffer, key)) return;
    const raw = editBuffer[key];
    const v = commitRawToValue(raw);
    const next = { ...scores, [key]: v };
    setScores(next);
    setEditBuffer(({ [key]: _removed, ...rest }) => rest);
    onChange?.(next);
  }

  function scoreForTotal(key) {
    if (Object.prototype.hasOwnProperty.call(editBuffer, key)) return commitRawToValue(editBuffer[key]);
    return scores[key] ?? 0;
  }

  function catTotal(cat) {
    return [1, 2, 3, 4, 5].reduce((s, n) => s + scoreForTotal(`${cat.toLowerCase()}${n}`), 0);
  }

  return (
    <div className="space-y-5">
      {CATEGORIES.map((cat) => {
        const detail = DETAILED_RUBRICS[cat];
        const st = CAT_STYLE[cat];
        const total = catTotal(cat);
        const pct = Math.min(100, (total / 20) * 100);

        return (
          <div key={cat} className={`rounded-2xl ring-1 ${st.ring} ${st.bg} overflow-hidden`}>
            {/* ─── Category header ─── */}
            <div className="px-5 pt-5 pb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5">
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold text-white ${st.bar} shrink-0`}>
                      {cat}
                    </span>
                    <h3 className={`font-bold text-base ${st.accent}`}>
                      {detail?.header.titleTh ?? `หมวด ${cat}`}
                    </h3>
                    {detail?.header.titleEn && (
                      <span className="text-xs text-slate-400 font-normal hidden sm:inline truncate">
                        {detail.header.titleEn}
                      </span>
                    )}
                  </div>
                  {detail?.header.purpose && (
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed pl-9">
                      {detail.header.purpose}
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <div className={`text-xl font-bold tabular-nums ${st.accent}`}>
                    {total.toFixed(2)}
                    <span className="text-slate-400 font-normal text-sm">/20</span>
                  </div>
                  {detail?.header.weight && (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${st.badge}`}>
                      น้ำหนัก {detail.header.weight}
                    </span>
                  )}
                </div>
              </div>
              {/* Progress bar */}
              <div className="mt-3 h-1.5 rounded-full bg-white/70 overflow-hidden">
                <div
                  className={`h-full rounded-full ${st.bar} transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            {/* ─── Indicators ─── */}
            {detail ? (
              <div className="divide-y divide-white/60">
                {detail.items.map((item, idx) => {
                  const key = item.key;
                  const isOpen = openRubric === key;
                  const score = scoreForTotal(key);
                  const scorePct = Math.min(100, (score / 4) * 100);

                  return (
                    <div key={key} className="px-5 py-4 bg-white/50">
                      <div className="flex items-start gap-3">
                        {/* Index badge */}
                        <span className={`mt-0.5 inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold shrink-0 ${st.badge}`}>
                          {idx + 1}
                        </span>

                        {/* Content + input */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-slate-900 text-sm leading-snug">
                                <span className={`${st.accent} mr-1`}>{item.code}</span>
                                {item.title}
                                <span className="ml-1.5 text-[11px] font-normal text-slate-400">
                                  ({rubricTypeLabel(item.type)})
                                </span>
                              </p>
                              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.focus}</p>
                            </div>

                            {/* Score input */}
                            <div className="shrink-0 flex flex-col items-end gap-1">
                              <label htmlFor={`score-${key}`} className="text-[10px] text-slate-400 whitespace-nowrap">
                                คะแนน (0–4)
                              </label>
                              <input
                                id={`score-${key}`}
                                type="text"
                                inputMode="decimal"
                                autoComplete="off"
                                value={readOnly ? formatScoreForDisplay(scores[key]) : inputDisplayValue(key)}
                                readOnly={readOnly}
                                onFocus={() => handleFocus(key)}
                                onChange={(e) => handleChange(key, e.target.value)}
                                onBlur={() => handleBlur(key)}
                                className={`w-16 rounded-xl border text-center py-2 text-sm font-bold tabular-nums shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/40 focus:border-indigo-300 transition-all ${
                                  readOnly
                                    ? 'bg-slate-100 text-slate-500 cursor-default border-slate-200'
                                    : 'bg-white border-slate-200 text-slate-900 hover:border-slate-300'
                                }`}
                              />
                              <div className="w-16 h-1 rounded-full bg-slate-100 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${st.bar}`}
                                  style={{ width: `${scorePct}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-slate-400">/ 4</span>
                            </div>
                          </div>

                          {/* Rubric toggle */}
                          <button
                            type="button"
                            onClick={() => setOpenRubric(isOpen ? null : key)}
                            className={`mt-2.5 text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                              isOpen
                                ? `${st.badge} ring-1 ${st.ring}`
                                : 'text-slate-500 hover:text-slate-700 bg-white/80 hover:bg-white ring-1 ring-slate-200'
                            }`}
                          >
                            {isOpen ? '▲ ซ่อนเกณฑ์' : '▼ ดูเกณฑ์การให้คะแนน'}
                          </button>

                          {isOpen && (
                            <div className={`mt-3 rounded-xl p-3.5 ${st.bg} ring-1 ${st.ring} space-y-2`}>
                              <p className="text-xs text-slate-500 font-medium mb-2">
                                วิธีวัด / หลักฐาน: {item.evidence}
                              </p>
                              {item.steps.map((step) => (
                                <div key={step.score} className="flex items-start gap-2.5">
                                  <span className={`inline-flex items-center justify-center w-5 h-5 rounded text-[11px] font-bold shrink-0 ${st.badge}`}>
                                    {step.score}
                                  </span>
                                  <span className="text-xs text-slate-700 leading-relaxed">{step.label}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="px-5 pb-5 grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((n) => {
                  const key = `${cat.toLowerCase()}${n}`;
                  return (
                    <div key={n} className="text-center">
                      <div className={`text-xs font-semibold mb-1 ${st.accent}`}>{cat}{n}</div>
                      <input
                        type="text"
                        inputMode="decimal"
                        autoComplete="off"
                        value={readOnly ? formatScoreForDisplay(scores[key]) : inputDisplayValue(key)}
                        readOnly={readOnly}
                        onFocus={() => handleFocus(key)}
                        onChange={(e) => handleChange(key, e.target.value)}
                        onBlur={() => handleBlur(key)}
                        className="w-full rounded-xl border border-white/80 bg-white/90 text-center py-2 text-sm font-bold shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});

ScoreInput.displayName = 'ScoreInput';
export default ScoreInput;
