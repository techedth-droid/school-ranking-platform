'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { InlineLink } from '@/components/ui/NavLinks';
import api from '@/lib/api';
import ScoreInput from '@/components/admin/ScoreInput';
import { toast } from 'sonner';
import {
  Info,
  CalendarDays,
  Star,
  Save,
  ChevronDown,
  ExternalLink,
  Pencil,
  Loader2,
} from 'lucide-react';

const CAT_KEYS = ['a', 'b', 'c', 'd', 'e'];
const CAT_STYLE = {
  a: { label: 'A', accent: 'text-amber-700', bg: 'bg-amber-50', ring: 'ring-amber-200', badge: 'bg-amber-100 text-amber-800', bar: 'bg-amber-400' },
  b: { label: 'B', accent: 'text-slate-700', bg: 'bg-slate-50', ring: 'ring-slate-200', badge: 'bg-slate-100 text-slate-700', bar: 'bg-slate-400' },
  c: { label: 'C', accent: 'text-orange-700', bg: 'bg-orange-50', ring: 'ring-orange-200', badge: 'bg-orange-100 text-orange-800', bar: 'bg-orange-400' },
  d: { label: 'D', accent: 'text-violet-700', bg: 'bg-violet-50', ring: 'ring-violet-200', badge: 'bg-violet-100 text-violet-800', bar: 'bg-violet-400' },
  e: { label: 'E', accent: 'text-blue-700', bg: 'bg-blue-50', ring: 'ring-blue-200', badge: 'bg-blue-100 text-blue-800', bar: 'bg-blue-400' },
};
const DETAIL_NUMBERS = [1, 2, 3, 4, 5];
const YEAR_CATEGORY_FIELDS = { a: 'scoreA', b: 'scoreB', c: 'scoreC', d: 'scoreD', e: 'scoreE' };

function sumCategory(payload, letter) {
  let t = 0;
  for (let n = 1; n <= 5; n += 1) t += Number(payload[`${letter}${n}`]) || 0;
  return Math.round(t * 100) / 100;
}

function emptyYearForm() {
  const next = { scoreA: 0, scoreB: 0, scoreC: 0, scoreD: 0, scoreE: 0 };
  CAT_KEYS.forEach((letter) => DETAIL_NUMBERS.forEach((n) => { next[`${letter}${n}`] = 0; }));
  return next;
}

function clampIndicatorScore(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.min(4, Math.max(0, Math.round(n * 100) / 100));
}

function sumYearCategory(form, letter) {
  let total = 0;
  DETAIL_NUMBERS.forEach((n) => { total += Number(form[`${letter}${n}`]) || 0; });
  return Math.round(total * 100) / 100;
}

function withYearCategoryTotals(form) {
  const next = { ...form };
  CAT_KEYS.forEach((letter) => { next[YEAR_CATEGORY_FIELDS[letter]] = sumYearCategory(next, letter); });
  return next;
}

/* ─── Loading skeleton ─── */
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-indigo-50/30 pb-28">
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <div className="h-5 w-52 bg-slate-200/70 rounded-full animate-pulse" />
        <div className="h-44 bg-white/80 rounded-2xl animate-pulse border border-slate-100" />
        <div className="h-12 bg-white/60 rounded-2xl animate-pulse border border-slate-100" />
        <div className="h-80 bg-white/60 rounded-2xl animate-pulse border border-slate-100" />
      </div>
    </div>
  );
}

export default function AdminScoresPage() {
  const params = useParams();
  const schoolId = params.schoolId;

  const [school, setSchool] = useState(null);
  const [initialScores, setInitialScores] = useState({});
  const [payload, setPayload] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [yearSnap, setYearSnap] = useState({ yearRange: null, snapshots: [] });
  const [yearSnapLoading, setYearSnapLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(null);
  const [yearForm, setYearForm] = useState(() => emptyYearForm());
  const [savingYear, setSavingYear] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const scoreInputRef = useRef(null);

  const loadYearSnapshots = useCallback(async (preferredYear = null) => {
    if (!schoolId) return;
    setYearSnapLoading(true);
    try {
      const { data } = await api.get(`/api/scores/${schoolId}/year-snapshots`);
      setYearSnap({ yearRange: data.yearRange, snapshots: data.snapshots ?? [] });
      const { startYear, endYear } = data.yearRange || {};
      const cy = new Date().getFullYear();
      const defaultY = startYear != null && endYear != null && cy >= startYear && cy <= endYear ? cy : startYear ?? 2025;
      setSelectedYear((prev) => {
        if (preferredYear != null && startYear != null && endYear != null && preferredYear >= startYear && preferredYear <= endYear) return preferredYear;
        if (prev != null && startYear != null && endYear != null && prev >= startYear && prev <= endYear) return prev;
        return defaultY;
      });
    } catch {
      toast.error('โหลดคะแนนรายปีไม่สำเร็จ');
      setYearSnap({ yearRange: null, snapshots: [] });
    } finally {
      setYearSnapLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [{ data: sch }, { data: scores }] = await Promise.all([
          api.get(`/api/schools/${schoolId}`),
          api.get(`/api/scores/${schoolId}`),
        ]);
        if (cancelled) return;
        setSchool(sch);
        const s = scores && scores.id ? scores : {};
        setInitialScores(s);
        const pick = {};
        CAT_KEYS.forEach((L) => [1, 2, 3, 4, 5].forEach((n) => { pick[`${L}${n}`] = s[`${L}${n}`] ?? 0; }));
        setPayload(pick);
      } catch {
        toast.error('โหลดข้อมูลไม่สำเร็จ');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [schoolId]);

  useEffect(() => {
    if (!schoolId || loading) return;
    loadYearSnapshots();
  }, [schoolId, loading, loadYearSnapshots]);

  useEffect(() => {
    if (selectedYear == null || !yearSnap.snapshots) return;
    const row = yearSnap.snapshots.find((r) => r.year === selectedYear);
    const next = emptyYearForm();
    if (row) Object.keys(next).forEach((key) => { next[key] = Number(row[key] ?? 0); });
    setYearForm(next);
  }, [selectedYear, yearSnap.snapshots]);

  const grandTotal = useMemo(() => {
    const raw = Object.values(payload).reduce((acc, v) => acc + (Number(v) || 0), 0);
    return Math.round(raw * 100) / 100;
  }, [payload]);

  const yearOptions = useMemo(() => {
    const { startYear, endYear } = yearSnap.yearRange || {};
    if (startYear == null || endYear == null) return [];
    const out = [];
    for (let y = startYear; y <= endYear; y += 1) out.push(y);
    return out;
  }, [yearSnap.yearRange]);

  async function handleSave() {
    const merged = scoreInputRef.current?.flushPending?.();
    const toSave = merged ?? payload;
    setSaving(true);
    try {
      await api.put(`/api/scores/${schoolId}`, toSave);
      const [{ data: sch }, { data: scores }] = await Promise.all([
        api.get(`/api/schools/${schoolId}`),
        api.get(`/api/scores/${schoolId}`),
      ]);
      setSchool(sch);
      const s = scores && scores.id ? scores : {};
      setInitialScores(s);
      const pick = {};
      CAT_KEYS.forEach((L) => [1, 2, 3, 4, 5].forEach((n) => { pick[`${L}${n}`] = s[`${L}${n}`] ?? 0; }));
      setPayload(pick);
      await loadYearSnapshots(new Date().getFullYear());
      toast.success('บันทึกคะแนนและคำนวณอันดับเรียบร้อยแล้ว');
    } catch {
      toast.error('บันทึกไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveYearSnapshot() {
    if (selectedYear == null) return;
    setSavingYear(true);
    try {
      await api.put(`/api/scores/${schoolId}/year-snapshots/${selectedYear}`, withYearCategoryTotals(yearForm));
      toast.success(`บันทึกข้อมูลประวัติปี ${selectedYear} แล้ว`);
      await loadYearSnapshots();
    } catch {
      toast.error('บันทึกประวัติคะแนนไม่สำเร็จ');
    } finally {
      setSavingYear(false);
    }
  }

  const title = school?.nameEn?.trim() ? `${school.name} (${school.nameEn})` : school?.name ?? '';
  const grandPct = Math.min(100, (grandTotal / 100) * 100);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50/35 pb-32">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-10 space-y-6">

        {/* ─── Breadcrumb ─── */}
        <nav className="text-sm text-slate-500 flex flex-wrap gap-x-2 gap-y-1 items-center">
          <InlineLink href="/admin/schools" variant="muted">โรงเรียน</InlineLink>
          <span aria-hidden className="text-slate-300">/</span>
          <InlineLink href="/admin/scores" variant="muted">บันทึกคะแนน</InlineLink>
          <span aria-hidden className="text-slate-300">/</span>
          <span className="text-slate-800 font-medium truncate max-w-[12rem] sm:max-w-none">
            {school?.name ?? 'โรงเรียน'}
          </span>
        </nav>

        {/* ─── Hero header ─── */}
        <header className="relative overflow-hidden rounded-2xl border border-indigo-100/80 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 text-white shadow-xl shadow-indigo-900/15">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.10]"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}
          />
          <div className="relative p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="min-w-0 flex-1">
                <p className="text-indigo-200 text-xs font-semibold tracking-widest uppercase">แบบประเมินคะแนน SCEE</p>
                <h1 className="text-2xl sm:text-3xl font-bold mt-2 leading-tight break-words">{title}</h1>
                {school && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                      {school.province}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                      สังกัด {school.affiliation}
                    </span>
                    {school.ranking?.level ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/25 px-3 py-1 text-xs font-semibold ring-1 ring-emerald-300/40">
                        <Star className="w-3 h-3" /> ระดับ {school.ranking.level} · อันดับที่ {school.ranking.rank ?? '—'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs text-indigo-200">
                        ยังไม่มีการจัดระดับ — กรอกคะแนนแล้วกดบันทึก
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex flex-row lg:flex-col gap-2 shrink-0">
                <Link
                  href={`/admin/schools/${schoolId}/edit`}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium px-4 py-2.5 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" /> แก้ไขโรงเรียน
                </Link>
                <Link
                  href={`/schools/${schoolId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white text-indigo-700 text-sm font-semibold px-4 py-2.5 shadow-md hover:bg-indigo-50 transition-colors"
                >
                  โปรไฟล์สาธารณะ <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* ─── Info banner ─── */}
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/60 px-5 py-3.5 text-sm text-amber-900/90 flex gap-3 items-start">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
          <p>
            <strong className="font-semibold">เกณฑ์การให้คะแนน:</strong>{' '}
            แต่ละข้อให้ <span className="font-mono font-semibold">0–4</span> คะแนน (ทศนิยมได้สูงสุด 2 ตำแหน่ง) ·
            คะแนนรวมสูงสุดต่อหมวด <span className="font-mono font-semibold">20</span> ·
            รวมทุกหมวด <span className="font-mono font-semibold">100</span>
          </p>
        </div>

        {/* ─── Category summary cards ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {CAT_KEYS.map((L) => {
            const st = CAT_STYLE[L];
            const sub = sumCategory(payload, L);
            const pct = Math.min(100, (sub / 20) * 100);
            return (
              <div key={L} className={`rounded-2xl ring-1 ${st.ring} ${st.bg} px-4 py-3.5 text-center`}>
                <div className={`text-xs font-bold uppercase tracking-wide ${st.accent}`}>หมวด {st.label}</div>
                <div className={`text-xl font-bold tabular-nums mt-1 ${st.accent}`}>
                  {sub.toFixed(2)}
                  <span className="text-slate-400 font-normal text-xs">/20</span>
                </div>
                <div className="mt-2 h-1 rounded-full bg-white/60 overflow-hidden">
                  <div className={`h-full rounded-full ${st.bar} transition-all duration-500`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* ─── Score input form ─── */}
        <section className="rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-slate-900">กรอกคะแนนตัวชี้วัด</h2>
              <p className="text-xs text-slate-500 mt-0.5">คะแนน A1–E5 รวม 25 ข้อ — กรอกแล้วกดบันทึกด้านล่าง</p>
            </div>
            <div className="text-sm text-slate-600 flex items-center gap-2">
              <span>คะแนนรวม</span>
              <span className="font-bold tabular-nums text-indigo-700 text-lg">{grandTotal.toFixed(2)}</span>
              <span className="text-slate-400">/100</span>
            </div>
          </div>
          {/* Grand total progress */}
          <div className="h-1 bg-slate-100">
            <div
              className="h-full bg-indigo-500 transition-all duration-500"
              style={{ width: `${grandPct}%` }}
            />
          </div>
          <div className="p-5">
            <ScoreInput
              ref={scoreInputRef}
              key={JSON.stringify(initialScores)}
              initial={initialScores}
              onChange={(next) => setPayload(next)}
            />
          </div>
        </section>

        {/* ─── Historical year snapshots (collapsible) ─── */}
        <section className="rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setHistoryOpen((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50/60 transition-colors"
          >
            <div className="text-left">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-slate-500" /> ประวัติคะแนนย้อนหลังรายปี
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                สำหรับแก้ไขคะแนนหมวดย่อยในปีก่อนหน้า — ใช้แสดงกราฟแนวโน้มบนโปรไฟล์โรงเรียน
              </p>
            </div>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${historyOpen ? 'rotate-180' : ''}`} />
          </button>

          {historyOpen && (
            <div className="border-t border-slate-100 p-5 space-y-5">
              {yearSnapLoading ? (
                <div className="h-24 rounded-xl bg-slate-100 animate-pulse" />
              ) : yearOptions.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">ยังไม่มีข้อมูลรายปี</p>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-3">
                    <label htmlFor="year-snapshot-select" className="text-sm font-semibold text-slate-700">
                      แก้ไขปี:
                    </label>
                    <select
                      id="year-snapshot-select"
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                      value={selectedYear ?? ''}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                    >
                      {yearOptions.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                    {selectedYear === new Date().getFullYear() && (
                      <span className="text-xs bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full font-medium">
                        ปีปัจจุบัน — อัปเดตอัตโนมัติเมื่อกดบันทึกหลัก
                      </span>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {CAT_KEYS.map((L) => {
                      const st = CAT_STYLE[L];
                      const total = sumYearCategory(yearForm, L);
                      return (
                        <div key={L} className={`rounded-2xl ring-1 ${st.ring} ${st.bg} p-4`}>
                          <div className="flex items-center justify-between mb-3">
                            <span className={`text-xs font-bold uppercase tracking-wide ${st.accent}`}>หมวด {st.label}</span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${st.badge}`}>
                              {total.toFixed(2)}/20
                            </span>
                          </div>
                          <div className="grid grid-cols-5 gap-1.5">
                            {DETAIL_NUMBERS.map((n) => {
                              const key = `${L}${n}`;
                              return (
                                <label key={key} className="block">
                                  <span className={`mb-1 block text-[11px] font-bold text-center ${st.accent}`}>
                                    {st.label}{n}
                                  </span>
                                  <input
                                    type="number"
                                    min={0} max={4} step={0.01}
                                    value={yearForm[key]}
                                    onChange={(e) =>
                                      setYearForm((prev) => ({ ...prev, [key]: clampIndicatorScore(e.target.value) }))
                                    }
                                    className="w-full rounded-lg border border-white/80 bg-white/90 px-1 py-1.5 text-center text-sm font-bold tabular-nums text-slate-900 shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                                  />
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleSaveYearSnapshot}
                      disabled={savingYear || selectedYear == null}
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-800 text-white text-sm font-semibold px-6 py-2.5 hover:bg-slate-700 disabled:opacity-50 transition-colors shadow-sm"
                    >
                      {savingYear ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {savingYear ? 'กำลังบันทึก...' : `บันทึกประวัติปี ${selectedYear ?? ''}`}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </section>
      </div>

      {/* ─── Fixed bottom save bar ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200/90 bg-white/95 backdrop-blur-md shadow-[0_-8px_30px_-12px_rgba(15,23,42,0.15)]">
        <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-500 hidden sm:block">คะแนนรวมทั้งหมด</div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold tabular-nums text-slate-900">{grandTotal.toFixed(2)}</span>
              <span className="text-sm text-slate-400">/100</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 text-white font-semibold px-8 py-3 shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 disabled:shadow-none transition-all"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                กำลังบันทึก...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                บันทึกคะแนนและคำนวณอันดับ
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
