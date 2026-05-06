'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { getLevelStyle } from '@/lib/level';
import { resolveAssetUrl } from '@/lib/assets';
import ProfileBanner from '@/components/school/ProfileBanner';
import ProfileGallery from '@/components/school/ProfileGallery';
import ProfileCertificates from '@/components/school/ProfileCertificates';
import ProfileContact from '@/components/school/ProfileContact';
import CategoryRankYearChart from '@/components/school/CategoryRankYearChart';
import {
  AwardIcon,
  ClipboardIcon,
  CameraIcon,
  TrophyIcon,
  PhoneIcon,
  SchoolIcon,
  AlertTriangleIcon,
  ChartBarIcon,
  StarIcon,
} from '@/components/Icons';
import { BackNavLink } from '@/components/ui/NavLinks';

/** คะแนนรวมต่อหมวด (เต็ม 20) — ตรงกับ Ranking ใน backend */
const RANKING_CATEGORY_ORDER = [
  {
    field: 'scoreA',
    label: 'A',
    title: 'โครงสร้างพื้นฐานและอุปกรณ์',
    boxClass:
      'bg-amber-50 border-amber-200/90 ring-amber-200/70 dark:bg-amber-950/35 dark:border-amber-800/60 dark:ring-amber-800/40',
    labelClass: 'text-amber-900 dark:text-amber-100',
  },
  {
    field: 'scoreB',
    label: 'B',
    title: 'การใช้เทคโนโลยีในการเรียนการสอนแบบโต้ตอบ',
    boxClass:
      'bg-slate-50 border-slate-200/90 ring-slate-200/70 dark:bg-slate-900/40 dark:border-slate-700 dark:ring-slate-700/50',
    labelClass: 'text-slate-900 dark:text-slate-100',
  },
  {
    field: 'scoreC',
    label: 'C',
    title: 'การพัฒนาครูและบุคลากร',
    boxClass:
      'bg-orange-50 border-orange-200/90 ring-orange-200/70 dark:bg-orange-950/35 dark:border-orange-900/50 dark:ring-orange-900/40',
    labelClass: 'text-orange-900 dark:text-orange-100',
  },
  {
    field: 'scoreD',
    label: 'D',
    title: 'การบริหารจัดการและนโยบาย',
    boxClass:
      'bg-gray-50 border-gray-200/90 ring-gray-200/70 dark:bg-main-900/50 dark:border-main-700 dark:ring-main-700/50',
    labelClass: 'text-gray-900 dark:text-gray-100',
  },
  {
    field: 'scoreE',
    label: 'E',
    title: 'ความเสมอภาคของการเข้าถึงและการใช้ห้องเรียนอัจฉริยะ',
    boxClass:
      'bg-blue-50 border-blue-200/90 ring-blue-200/70 dark:bg-blue-950/40 dark:border-blue-900/50 dark:ring-blue-900/40',
    labelClass: 'text-blue-900 dark:text-blue-100',
  },
];

function RankingCategoryScores({ ranking }) {
  if (!ranking) return null;
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
      {RANKING_CATEGORY_ORDER.map(({ field, label, title, boxClass, labelClass }) => {
        const raw = ranking[field];
        const num = typeof raw === 'number' && !Number.isNaN(raw) ? raw : null;
        return (
          <div
            key={field}
            title={title}
            className={`rounded-xl border p-3 text-center shadow-sm ring-1 transition-shadow hover:shadow-md ${boxClass}`}
          >
            <div className={`text-xs font-bold ${labelClass}`}>{label}</div>
            <div className="mt-1 text-lg font-bold tabular-nums text-main-950 dark:text-white">
              {num != null ? num.toFixed(2) : '—'}
            </div>
            <div className="text-[10px] font-medium text-muted-600 dark:text-muted-400 mt-0.5">/ 20</div>
          </div>
        );
      })}
    </div>
  );
}

export default function SchoolProfilePage() {
  const params = useParams();
  const id = params?.id;
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [yearRankSeries, setYearRankSeries] = useState(null);
  const [recommended, setRecommended] = useState([]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const [schRes, yrRes, recRes] = await Promise.all([
          api.get(`/api/schools/${id}`),
          api.get(`/api/schools/${id}/year-category-ranks`).catch(() => ({ data: null })),
          api
            .get('/api/ranking', {
              params: { page: 1, limit: 8, sortBy: 'rank', order: 'asc' },
            })
            .catch(() => ({ data: { data: [] } })),
        ]);
        if (cancelled) return;
        setSchool(schRes.data);
        setYearRankSeries(yrRes?.data ?? null);
        const picks = (recRes?.data?.data || [])
          .filter((row) => row?.school?.id && row.school.id !== id)
          .slice(0, 4);
        setRecommended(picks);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setSchool(null);
        setYearRankSeries(null);
        setRecommended([]);
        setError(err?.response?.status === 404 ? 'not_found' : 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <ProfileSkeleton />;
  if (error === 'not_found' || !school) return <NotFoundView />;
  if (error) return <ErrorView />;

  const level = school.ranking?.level;
  const style = level ? getLevelStyle(level) : null;

  return (
    <main className="min-h-screen bg-muted-50 pb-16 dark:bg-main-950">
      <div className="max-w-5xl mx-auto px-4 pt-4 text-sm">
        <BackNavLink href="/">กลับไปอันดับโรงเรียน</BackNavLink>
      </div>

      <ProfileBanner school={school} />

      <div className="max-w-5xl mx-auto px-4 mt-8 space-y-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Section title="ระดับผลการประเมิน" icon={<AwardIcon className="w-4 h-4" />} minHeightClass="h-full">
            {level && style ? (
              <div className="flex flex-wrap items-center gap-4">
                <div
                  className={`inline-flex w-16 h-16 items-center justify-center rounded-2xl text-2xl font-extrabold shadow ${style.chipBg} ${style.textOnChip}`}
                  title={style.title}
                >
                  {level}
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900">
                    {style.title}
                  </div>
                  <div className="text-sm font-medium text-gray-700 mt-0.5">
                    {style.englishTitle}
                  </div>
                  <div className="text-sm text-gray-600 mt-0.5">
                    คะแนนรวม {school.ranking?.totalScore?.toFixed(2) ?? '—'} ·
                    อันดับที่ {school.ranking?.rank ?? '—'}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                ยังไม่ได้รับการประเมินคะแนน — โปรดรอการประกาศผล
              </p>
            )}
            {level && style ? <LevelRecognition style={style} /> : null}
            <LevelLegend current={level} />
            </Section>
          </div>

          <div className="lg:col-span-1">
            <Section title="ข้อมูลติดต่อ" icon={<PhoneIcon className="w-4 h-4" />} minHeightClass="h-full">
            <ProfileContact school={school} />
            </Section>
          </div>
        </div>

        {school.ranking ? (
          <Section
            title="คะแนนรวมรายหมวด"
            icon={<ChartBarIcon className="w-4 h-4" />}
            hint="ผลรวมจากตัวชี้วัดย่อย · เต็ม 20 คะแนนต่อหมวด"
          >
            <RankingCategoryScores ranking={school.ranking} />
          </Section>
        ) : null}

        <Section
          title="แนวโน้มอันดับหมวดตามปี"
          icon={<StarIcon className="w-4 h-4" />}
          hint="เปรียบเทียบอันดับรายหมวดกับทุกโรงเรียนในแต่ละปี"
        >
          <CategoryRankYearChart
            series={yearRankSeries?.series}
            rankMax={yearRankSeries?.rankMax}
            rankTicks={yearRankSeries?.rankTicks}
          />
        </Section>

        <Section
          title="คำอธิบายโรงเรียน"
          icon={<ClipboardIcon className="w-4 h-4" />}
          minHeightClass="min-h-[240px]"
        >
          {school.description ? (
            <p className="text-gray-800 leading-relaxed whitespace-pre-line dark:text-gray-200">
              {school.description}
            </p>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">ยังไม่มีคำอธิบาย</p>
          )}
        </Section>

        <Section
          title="กิจกรรม Smart Classroom"
          icon={<CameraIcon className="w-4 h-4" />}
          minHeightClass="min-h-[240px]"
        >
          <ProfileGallery images={school.galleryImages || []} />
        </Section>

        <Section
          title="ใบรับรองและโล่รางวัล"
          icon={<TrophyIcon className="w-4 h-4" />}
          minHeightClass="min-h-[240px]"
        >
          <ProfileCertificates certificates={school.certificates || []} />
        </Section>

        <Section
          title="แนะนำโรงเรียนอื่น"
          icon={<SchoolIcon className="w-4 h-4" />}
          hint="โรงเรียนเด่นที่น่าสนใจในระบบ"
          minHeightClass="min-h-[240px]"
        >
          {recommended.length > 0 ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {recommended.map((r) => (
                  <a
                    key={r.school.id}
                    href={`/schools/${r.school.id}`}
                    className="rounded-xl border border-gray-200 bg-white p-3 transition hover:border-accent-300 hover:shadow-sm flex h-full flex-col"
                  >
                    <div className="mb-2 h-14 w-14 overflow-hidden rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center">
                      {resolveAssetUrl(r.school?.logoUrl) ? (
                        <Image
                          src={resolveAssetUrl(r.school.logoUrl)}
                          alt={`โลโก้ ${r.school?.name || 'โรงเรียน'}`}
                          width={56}
                          height={56}
                          className="h-full w-full object-contain"
                          unoptimized
                        />
                      ) : (
                        <SchoolIcon className="h-6 w-6 text-gray-300" />
                      )}
                    </div>
                    <div className="text-xs text-gray-500">อันดับ {r.rank ?? '—'}</div>
                    <div className="mt-1 text-sm font-semibold text-gray-900 line-clamp-2 min-h-[2.5rem]">
                      {r.school?.name || 'ไม่ระบุชื่อโรงเรียน'}
                    </div>
                    <div className="mt-1 text-xs text-gray-600 line-clamp-1">
                      {r.school?.province || 'ไม่ระบุจังหวัด'}
                    </div>
                    <div className="mt-auto pt-3 text-xs font-medium text-accent-700">
                      คะแนนรวม {r.totalScore?.toFixed?.(2) ?? '—'}
                    </div>
                  </a>
                ))}
              </div>
              <div className="mt-4">
                <BackNavLink href="/schools">ดูโรงเรียนทั้งหมด</BackNavLink>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">ยังไม่มีรายการแนะนำในขณะนี้</p>
          )}
        </Section>
      </div>
    </main>
  );
}

function Section({ title, icon, hint, children, minHeightClass }) {
  return (
    <section
      className={`bg-white border border-gray-100 rounded-2xl shadow-card p-5 sm:p-6 flex flex-col ${minHeightClass ?? ''}`}
    >
      <div className="flex items-center gap-2.5 mb-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent-50 text-accent-600 shrink-0">
          {icon}
        </div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {hint ? <span className="text-xs text-gray-500">{hint}</span> : null}
      </div>
      {children}
    </section>
  );
}

function LevelLegend({ current }) {
  const items = ['A', 'B', 'C', 'D', 'E'];
  return (
    <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2 text-xs">
      {items.map((lv) => {
        const s = getLevelStyle(lv);
        const active = lv === current;
        return (
          <span
            key={lv}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${
              active ? `${s.badgeClass} ring-2` : 'bg-gray-50 text-gray-600 border-gray-200'
            }`}
          >
            <span className={`inline-block w-2 h-2 rounded-full ${s.dotClass}`} />
            {lv} · {s.title}
          </span>
        );
      })}
    </div>
  );
}

function LevelRecognition({ style }) {
  return (
    <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50 p-4">
      <div className="text-sm font-semibold text-gray-900">{style.documentTitle}</div>
      <ul className="mt-3 grid sm:grid-cols-2 gap-2 text-sm text-gray-700">
        {style.documents.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent-600 shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 text-xs text-gray-500">
        การรับรองโดย {style.certifier}
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <main className="min-h-screen bg-muted-50 pb-16 animate-pulse dark:bg-main-950">
      <div className="w-full aspect-[16/5] bg-gray-200 rounded-b-2xl" />
      <div className="max-w-5xl mx-auto px-4 -mt-12 relative">
        <div className="bg-white rounded-2xl shadow border h-32" />
      </div>
      <div className="max-w-5xl mx-auto px-4 mt-8 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border rounded-2xl h-40" />
          ))}
        </div>
        <div className="bg-white border rounded-2xl h-72" />
      </div>
    </main>
  );
}

function NotFoundView() {
  return (
    <main className="min-h-screen bg-muted-50 flex items-center justify-center px-4 dark:bg-main-950">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted-100 text-muted-400 mb-4">
          <SchoolIcon className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">ไม่พบหน้าโรงเรียนนี้</h1>
        <p className="text-gray-600 mt-2">
          อาจถูกลบ หรือยังไม่ได้รับการเผยแพร่ในระบบ
        </p>
        <BackNavLink href="/" className="mt-6">
          กลับไปอันดับโรงเรียน
        </BackNavLink>
      </div>
    </main>
  );
}

function ErrorView() {
  return (
    <main className="min-h-screen bg-muted-50 flex items-center justify-center px-4 dark:bg-main-950">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-50 text-red-400 mb-4">
          <AlertTriangleIcon className="w-8 h-8" />
        </div>
        <p className="text-gray-700 font-medium">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
        <p className="text-sm text-gray-500 mt-1">กรุณาลองใหม่อีกครั้ง</p>
      </div>
    </main>
  );
}
