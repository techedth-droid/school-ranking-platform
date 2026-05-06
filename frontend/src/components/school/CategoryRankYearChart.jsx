'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const KEYS = ['A', 'B', 'C', 'D', 'E'];
const COLORS = {
  A: '#d97706',
  B: '#64748b',
  C: '#ea580c',
  D: '#71717a',
  E: '#2563eb',
};

const CATEGORY_LABELS = {
  A: 'หมวด A',
  B: 'หมวด B',
  C: 'หมวด C',
  D: 'หมวด D',
  E: 'หมวด E',
};

/** ชื่อเต็มของแต่ละหมวด (ตรงกับเกณฑ์ประเมิน SCEE) — ใช้เป็นหัวข้อให้ผู้ใช้เข้าใจว่า A–E หมายถึงอะไร */
const CATEGORY_HEADINGS = {
  A: 'โครงสร้างพื้นฐานและอุปกรณ์',
  B: 'การใช้เทคโนโลยีในการเรียนการสอนแบบโต้ตอบ',
  C: 'การพัฒนาครูและบุคลากร',
  D: 'การบริหารจัดการและนโยบาย',
  E: 'ความเสมอภาคของการเข้าถึงและการใช้ห้องเรียนอัจฉริยะ',
};

function latestRankFor(series, key) {
  const latest = [...(series || [])].reverse().find((item) => item.ranks?.[key] != null);
  return latest?.ranks?.[key] ?? null;
}

function latestScoreFor(series, key) {
  const latest = [...(series || [])].reverse().find((item) => item.scores?.[key] != null);
  return latest?.scores?.[key] ?? null;
}

function formatRank(rank) {
  return rank != null ? `${rank}` : '—';
}

function formatScore(score) {
  return score != null ? Number(score).toFixed(2) : '—';
}

export default function CategoryRankYearChart({ series, rankMax = 5, rankTicks }) {
  const [selected, setSelected] = useState('A');
  const hasAnyData = series?.some((s) => s.ranks);
  const yMax = Math.max(1, Number(rankMax) || 1);
  const ticks = Array.isArray(rankTicks) && rankTicks.length ? rankTicks : [1, 2, 3, 4, 5];
  const scrollerRef = useRef(null);
  const dragRef = useRef({
    pointerId: null,
    startX: 0,
    startScrollLeft: 0,
    moved: false,
    movedPx: 0,
  });
  const chartData = useMemo(
    () =>
      series?.map((s) => ({
        year: s.year,
        rank: s.ranks?.[selected] ?? null,
      })) ?? [],
    [selected, series]
  );
  const latestSchoolCount =
    [...(series || [])].reverse().find((item) => item.schoolCount > 0)?.schoolCount ?? 0;

  useEffect(() => {
    function onPointerMove(e) {
      const el = scrollerRef.current;
      if (!el) return;
      if (dragRef.current.pointerId == null) return;
      if (e.pointerId !== dragRef.current.pointerId) return;

      const dx = e.clientX - dragRef.current.startX;
      if (Math.abs(dx) > 2) dragRef.current.moved = true;
      dragRef.current.movedPx = Math.max(dragRef.current.movedPx, Math.abs(dx));
      el.scrollLeft = dragRef.current.startScrollLeft - dx;
      e.preventDefault?.();
    }

    function endDrag(e) {
      if (dragRef.current.pointerId == null) return;
      if (e?.pointerId != null && e.pointerId !== dragRef.current.pointerId) return;
      dragRef.current.pointerId = null;
      dragRef.current.startX = 0;
      dragRef.current.startScrollLeft = 0;
      // reset moved status shortly after to avoid blocking click
      setTimeout(() => {
        dragRef.current.moved = false;
        dragRef.current.movedPx = 0;
      }, 0);
    }

    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', endDrag, { passive: true });
    window.addEventListener('pointercancel', endDrag, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', endDrag);
      window.removeEventListener('pointercancel', endDrag);
    };
  }, []);

  if (!hasAnyData) {
    return (
      <p className="text-sm text-muted-600 dark:text-muted-400">
        ยังไม่มีข้อมูลสำหรับกราฟ — ต้องมีการคำนวณคะแนนในระบบก่อน (เช่น แอดมินบันทึกคะแนนที่เมนูคะแนนประเมิน) จึงจะมีจุดข้อมูลเปรียบเทียบกับโรงเรียนอื่นได้
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <div
        ref={scrollerRef}
        className="flex gap-2 overflow-x-auto pb-1 select-none cursor-grab active:cursor-grabbing"
        onPointerDown={(e) => {
          const el = scrollerRef.current;
          if (!el) return;
          if (e.button != null && e.button !== 0) return; // left click only
          dragRef.current.pointerId = e.pointerId;
          dragRef.current.startX = e.clientX;
          dragRef.current.startScrollLeft = el.scrollLeft;
          dragRef.current.moved = false;
          dragRef.current.movedPx = 0;
        }}
      >
        {KEYS.map((key) => {
          const active = selected === key;
          return (
            <button
              key={key}
              type="button"
              onClick={(e) => {
                // If user dragged to scroll, don't treat it as a click selection.
                if (dragRef.current.moved && dragRef.current.movedPx > 6) {
                  e.preventDefault();
                  return;
                }
                setSelected(key);
              }}
              title={CATEGORY_HEADINGS[key]}
              className={`min-w-[10.5rem] max-w-[13rem] shrink-0 rounded-xl border px-3.5 py-3 text-left shadow-sm transition ${
                active
                  ? 'border-accent-400 bg-accent-50 ring-2 ring-accent-100'
                  : 'border-muted-200 bg-white hover:border-accent-200 hover:bg-accent-50/50'
              }`}
            >
              <div className="flex items-start gap-2">
                <span
                  className="mt-0.5 inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: COLORS[key] }}
                />
                <span className="min-w-0">
                  <span className="block text-xs font-bold text-main-950">{CATEGORY_LABELS[key]}</span>
                  <span className="mt-0.5 block text-[11px] font-normal leading-snug text-muted-600 line-clamp-3">
                    {CATEGORY_HEADINGS[key]}
                  </span>
                </span>
              </div>
              <div className="mt-2 text-lg font-bold text-main-950">
                <span className="text-xs font-medium text-muted-500">อันดับ</span>
                <span className="ml-1">{formatRank(latestRankFor(series, key))}</span>
              </div>
              <div className="text-[11px] text-muted-500">
                คะแนน {formatScore(latestScoreFor(series, key))} / 20
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(16rem,20rem)_1fr]">
        <div>
          <h3 className="text-sm font-semibold text-main-950">สรุปทุกหมวด (เทียบทุกโรงเรียน)</h3>
          <p className="mt-1 text-[11px] text-muted-500 leading-relaxed">
            แต่ละแถวคือหมวดหนึ่ง · ตัวเลขขวาคืออันดับล่าสุดจากทั้งหมด
            {latestSchoolCount ? ` ${latestSchoolCount} โรง` : ''}
          </p>
          <div className="mt-3 space-y-3">
            {KEYS.map((key) => {
              const rank = latestRankFor(series, key);
              const pct =
                rank != null && latestSchoolCount
                  ? Math.max(4, ((latestSchoolCount - rank + 1) / latestSchoolCount) * 100)
                  : 0;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelected(key)}
                  className={`w-full text-left rounded-lg px-2 py-1.5 transition ${
                    key === selected
                      ? 'opacity-100 ring-1 ring-accent-200 bg-accent-50/40'
                      : 'opacity-70 hover:opacity-100 hover:bg-muted-50'
                  }`}
                >
                  <div className="mb-1 flex items-start justify-between gap-2 text-xs">
                    <span className="min-w-0 font-medium text-muted-700">
                      <span className="block text-[11px] font-bold text-main-950">{CATEGORY_LABELS[key]}</span>
                      <span className="mt-0.5 block text-[10px] font-normal leading-snug text-muted-500 line-clamp-2">
                        {CATEGORY_HEADINGS[key]}
                      </span>
                    </span>
                    <span className="shrink-0 tabular-nums text-muted-600">
                      #{formatRank(rank)}
                      {latestSchoolCount ? ` / ${latestSchoolCount}` : ''}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted-100">
                    <div
                      className="h-2 rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: COLORS[key] }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-w-0">
          <div className="mb-2">
            <h3 className="text-sm font-semibold text-main-950">
              กราฟแนวโน้มอันดับ — {CATEGORY_LABELS[selected]}
            </h3>
            <p className="mt-1 text-xs text-muted-600 dark:text-muted-400 leading-snug">
              {CATEGORY_HEADINGS[selected]}
            </p>
          </div>
          <div className="h-[300px] w-full sm:h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 18, right: 18, left: 4, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted-200 dark:stroke-main-700" />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                <YAxis
                  type="number"
                  domain={[yMax, 1]}
                  ticks={ticks}
                  allowDecimals={false}
                  width={36}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  formatter={(value) =>
                    value != null
                      ? [`อันดับ ${value}`, `${CATEGORY_LABELS[selected]} · ${CATEGORY_HEADINGS[selected]}`]
                      : ['—', `${CATEGORY_LABELS[selected]} · ${CATEGORY_HEADINGS[selected]}`]
                  }
                  labelFormatter={(y) => `พ.ศ. ${Number(y) + 543}`}
                />
                <Line
                  type="monotone"
                  dataKey="rank"
                  stroke={COLORS[selected]}
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  connectNulls={false}
                  name={`${CATEGORY_LABELS[selected]} (${CATEGORY_HEADINGS[selected]})`}
                  isAnimationActive
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <p className="text-[11px] text-muted-500 dark:text-muted-400">
        เส้นกราฟเริ่มตั้งแต่ปี 2025 เป็นต้นไป และอันดับ 1 อยู่ด้านบน
      </p>
    </div>
  );
}
