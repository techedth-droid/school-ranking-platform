'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import { resolveAssetUrl } from '@/lib/assets';
import { TrophyIcon, MapPinIconFull, CrownIcon, ArrowRightIcon, SchoolIcon } from '@/components/Icons';

const MEDAL_STYLES = {
  1: {
    border: 'border-gold-400',
    bg: 'bg-gradient-to-br from-gold-50 to-amber-50',
    badge: 'bg-gradient-to-br from-gold-400 to-amber-500 text-white',
    ring: 'ring-gold-200',
    label: '1st',
  },
  2: {
    border: 'border-gray-300',
    bg: 'bg-gradient-to-br from-gray-50 to-slate-50',
    badge: 'bg-gradient-to-br from-gray-400 to-slate-500 text-white',
    ring: 'ring-gray-200',
    label: '2nd',
  },
  3: {
    border: 'border-bronze-400',
    bg: 'bg-gradient-to-br from-bronze-50 to-orange-50',
    badge: 'bg-gradient-to-br from-bronze-400 to-bronze-500 text-white',
    ring: 'ring-bronze-200',
    label: '3rd',
  },
};

function ScoreBar({ score, max = 20 }) {
  const pct = Math.min((score / max) * 100, 100);
  return (
    <div className="w-full bg-gray-200/90 rounded-full h-1.5 mt-1.5">
      <div
        className="h-1.5 rounded-full bg-gradient-to-r from-accent-400 to-accent-600 transition-all duration-700"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function SchoolLogo({ school, className = 'h-12 w-12' }) {
  const logoUrl = resolveAssetUrl(school?.logoUrl);
  return (
    <div className={`shrink-0 overflow-hidden flex items-center justify-center ${className}`}>
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt={`โลโก้ ${school?.name || 'โรงเรียน'}`}
          width={64}
          height={64}
          className="h-full w-full object-contain"
          unoptimized
        />
      ) : (
        <SchoolIcon className="h-6 w-6 text-gray-300" />
      )}
    </div>
  );
}

function TopCard({ rank, school, totalScore }) {
  const style = MEDAL_STYLES[rank];
  const isFirst = rank === 1;

  return (
    <Link
      href={`/schools/${school.id}`}
      className={`group relative flex h-full flex-col rounded-2xl border-2 ${style.border} ${style.bg} p-5 sm:p-6 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 ring-1 ${style.ring}`}
    >
      {/* Rank badge */}
      <div className="flex items-center justify-between mb-4">
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${style.badge} shadow-sm`}
        >
          {isFirst && <CrownIcon className="w-3.5 h-3.5" />}
          {style.label}
        </div>
        {isFirst && (
          <TrophyIcon className="w-6 h-6 text-gold-500 opacity-60" />
        )}
      </div>

      {/* School info — พื้นการ์ดยังเป็นสีอ่อนในโหมดมืด จึงใช้ตัวอักษรโทนเข้มเสมอ */}
      <div className="flex items-start gap-3">
        <SchoolLogo school={school} className={isFirst ? 'h-14 w-14' : 'h-12 w-12'} />
        <div className="min-w-0 flex-1">
          <h3
            className={`font-bold text-gray-900 leading-snug group-hover:text-accent-800 transition-colors line-clamp-2 min-h-[2.75rem] sm:min-h-[3.25rem] ${
              isFirst ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'
            }`}
          >
            {school.name}
          </h3>
          {school.nameEn?.trim() && (
            <p className="text-xs text-gray-600 mt-0.5 truncate">{school.nameEn}</p>
          )}
        </div>
      </div>

      {/* Location */}
      <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-600">
        <MapPinIconFull className="w-3.5 h-3.5 text-gray-500 shrink-0" />
        <span>{school.province}</span>
      </div>

      {/* Score */}
      <div className="mt-4">
        <div className="flex items-baseline gap-1.5">
          <span className={`font-bold text-gray-900 ${isFirst ? 'text-2xl' : 'text-xl'}`}>
            {totalScore?.toFixed(2)}
          </span>
          <span className="text-xs text-gray-600">คะแนน</span>
        </div>
        <ScoreBar score={totalScore} />
      </div>

      {/* CTA */}
      <div className="mt-auto pt-4 border-t border-muted-200/80 flex items-center gap-1.5 text-xs font-medium text-accent-700 group-hover:text-accent-900 transition-colors">
        ดูรายละเอียด
        <ArrowRightIcon className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

function RunnerUpCard({ rank, school, totalScore }) {
  return (
    <Link
      href={`/schools/${school.id}`}
      className="group flex h-full items-center gap-4 rounded-xl bg-white border border-gray-100 p-4 transition-all duration-200 hover:shadow-card-hover hover:border-gray-200 dark:bg-gray-900/70 dark:border-gray-800 dark:hover:border-gray-700"
    >
      <SchoolLogo school={school} className="h-11 w-11" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-accent-50 px-1.5 text-xs font-bold text-accent-700 dark:bg-accent-950/60 dark:text-accent-200">
            {rank}
          </span>
          <h4 className="text-sm font-semibold text-gray-900 truncate group-hover:text-accent-700 transition-colors dark:text-gray-100 dark:group-hover:text-accent-300">
            {school.name}
          </h4>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
          <MapPinIconFull className="w-3 h-3 text-gray-400 shrink-0" />
          <span className="truncate">{school.province}</span>
        </div>
      </div>
      <div className="shrink-0 text-right">
        <span className="text-sm font-bold text-gray-900 dark:text-white">{totalScore?.toFixed(2)}</span>
        <span className="block text-[10px] text-gray-500 dark:text-gray-400">คะแนน</span>
      </div>
    </Link>
  );
}

export default function TopSchoolsPodium() {
  const [top10, setTop10] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/api/ranking/top10')
      .then(({ data }) => setTop10(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`rounded-2xl shimmer-bg ${i === 0 ? 'h-64' : 'h-56'}`} />
          ))}
        </div>
      </div>
    );
  }

  if (!top10.length) return null;

  const top3 = top10.slice(0, 3);
  const rest = top10.slice(3);

  return (
    <section className="mb-10 animate-fade-in">
      {/* Section header */}
      <div className="flex items-center gap-2.5 mb-5">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent-100 text-accent-600 dark:bg-accent-950/50 dark:text-accent-400">
          <TrophyIcon className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Top 10 โรงเรียน</h2>
      </div>

      {/* Top 3 podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {top3.map((r) => (
          <TopCard
            key={r.id}
            rank={r.rank}
            school={r.school}
            totalScore={r.totalScore}
          />
        ))}
      </div>

      {/* Ranks 4-10 */}
      {rest.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {rest.map((r) => (
            <RunnerUpCard
              key={r.id}
              rank={r.rank}
              school={r.school}
              totalScore={r.totalScore}
            />
          ))}
        </div>
      )}
    </section>
  );
}
