'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { TrophyIcon } from '@/components/Icons';
import { BackNavLink } from '@/components/ui/NavLinks';

/* ─── benefit data ─── */
const BENEFITS = [
  {
    id: 1,
    title: 'ใบรับรองเกียรติคุณ',
    subtitle: 'Certificate of Merit',
    image: '/images/Certificate/4.png',
    description:
      'เอกสารรับรองอย่างเป็นทางการสำหรับเผยแพร่ผลงานโรงเรียน ใช้แนบแฟ้มประเมินและนำเสนอความสำเร็จต่อผู้ปกครอง ชุมชน และหน่วยงานที่เกี่ยวข้อง',
    highlights: [
      'แนบในแฟ้มประเมินคุณภาพสถานศึกษา',
      'เผยแพร่ผลสำเร็จต่อชุมชนและผู้ปกครอง',
      'เสริมความน่าเชื่อถือในรายงานประจำปี',
    ],
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    ),
  },
  {
    id: 2,
    title: 'โล่ประกาศเกียรติคุณ',
    subtitle: 'Shield of Honor',
    image: '/images/Certificate/5.png',
    description:
      'โล่เชิดชูเกียรติสะท้อนความภาคภูมิใจของสถานศึกษา เหมาะจัดแสดงในอาคารเรียน ห้องรับรอง หรือกิจกรรมสำคัญ เพื่อสร้างแรงบันดาลใจแก่ครูและนักเรียน',
    highlights: [
      'จัดแสดงในห้องรับรองและอาคารเรียน',
      'ใช้ในพิธีมอบรางวัลและกิจกรรมสำคัญ',
      'สร้างแรงบันดาลใจแก่ครูและนักเรียน',
    ],
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0 1 16.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.997 6.997 0 0 1-2.272 1.272m0 0a6.97 6.97 0 0 1-3.997 0" />
      </svg>
    ),
  },
  {
    id: 3,
    title: 'ป้ายรับรองโรงเรียน',
    subtitle: 'Certification Badge',
    image: '/images/Certificate/6.png',
    description:
      'ป้ายรับรองสำหรับสื่อสารภาพลักษณ์คุณภาพของโรงเรียนต่อสาธารณะ เพิ่มความเชื่อมั่นต่อผู้ปกครอง และต่อยอดการประชาสัมพันธ์ของโรงเรียน',
    highlights: [
      'ติดตั้งที่หน้าโรงเรียนเพื่อสร้างภาพลักษณ์',
      'ใช้ประกอบสื่อประชาสัมพันธ์ออนไลน์',
      'เพิ่มความเชื่อมั่นแก่ผู้ปกครองและชุมชน',
    ],
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
  },
];

/* ─── Lightbox component ─── */
function Lightbox({ image, title, onClose, onPrev, onNext }) {
  const handleKey = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    },
    [onClose, onPrev, onNext],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [handleKey]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      {/* close button */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 transition hover:bg-white/20 hover:text-white"
        aria-label="ปิด"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>

      {/* prev */}
      <button
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white/80 transition hover:bg-white/20 hover:text-white"
        aria-label="ก่อนหน้า"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
      </button>

      {/* next */}
      <button
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white/80 transition hover:bg-white/20 hover:text-white"
        aria-label="ถัดไป"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      {/* image */}
      <div
        className="relative mx-4 h-[85vh] w-full max-w-4xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={image}
          alt={title}
          fill
          className="object-contain drop-shadow-2xl"
          sizes="100vw"
          priority
        />
      </div>

      {/* title */}
      <p className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-5 py-2 text-sm font-semibold text-white/90 backdrop-blur-sm">
        {title}
      </p>
    </div>
  );
}

export default function BenefitsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const active = BENEFITS[activeTab];

  const openLightbox = (idx) => setLightboxIdx(idx);
  const closeLightbox = () => setLightboxIdx(null);
  const prevLightbox = () =>
    setLightboxIdx((i) => (i === 0 ? BENEFITS.length - 1 : i - 1));
  const nextLightbox = () =>
    setLightboxIdx((i) => (i === BENEFITS.length - 1 ? 0 : i + 1));

  return (
    <main className="min-h-screen">
      {/* ═══════════════ LIGHTBOX ═══════════════ */}
      {lightboxIdx !== null && (
        <Lightbox
          image={BENEFITS[lightboxIdx].image}
          title={BENEFITS[lightboxIdx].title}
          onClose={closeLightbox}
          onPrev={prevLightbox}
          onNext={nextLightbox}
        />
      )}
      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-main-700 via-main-800 to-main-950">
        {/* pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="pointer-events-none absolute -left-28 top-0 h-72 w-72 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-accent-400/10 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <BackNavLink href="/" variant="hero">
            กลับหน้าอันดับ
          </BackNavLink>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-400 to-accent-600 shadow-lg shadow-accent-500/25">
              <TrophyIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-accent-300/80">
                SCEE Recognition Program
              </p>
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                สิ่งที่โรงเรียนจะได้รับ
              </h1>
            </div>
          </div>

          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg">
            ยกระดับภาพลักษณ์โรงเรียนด้วยสื่อรับรองคุณภาพจากโครงการ{' '}
            <strong className="text-white">SCEE</strong>{' '}
            ทั้งเอกสาร โล่เกียรติคุณ และป้ายรับรอง
          </p>
        </div>

        {/* wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 48" fill="none" className="h-8 w-full sm:h-12">
            <path
              d="M0 48h1440V24c-240-32-480-32-720 0S240-8 0 24v24z"
              className="fill-muted-50 dark:fill-main-950"
            />
          </svg>
        </div>
      </section>

      {/* ═══════════════ TAB SHOWCASE ═══════════════ */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        {/* Tab buttons */}
        <div className="flex flex-col items-center">
          <div className="inline-flex flex-wrap justify-center gap-2 rounded-2xl border border-main-100 bg-white p-2 shadow-card dark:border-main-800 dark:bg-main-900/80">
            {BENEFITS.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(idx)}
                className={`flex items-center gap-2.5 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-300 ${
                  activeTab === idx
                    ? 'bg-main-950 text-white shadow-lg dark:bg-accent-600'
                    : 'text-muted-600 hover:bg-main-50 hover:text-main-950 dark:text-muted-400 dark:hover:bg-main-800 dark:hover:text-muted-100'
                }`}
              >
                <span className={`transition-colors duration-300 ${activeTab === idx ? 'text-accent-300' : 'text-muted-400 dark:text-muted-500'}`}>
                  {item.icon}
                </span>
                <span className="hidden sm:inline">{item.title}</span>
                <span className="sm:hidden">{item.subtitle}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Active benefit showcase */}
        <div className="mt-12 overflow-hidden rounded-3xl border border-main-100 bg-white shadow-elevated dark:border-main-800 dark:bg-main-900/70">
          <div className="grid lg:grid-cols-2">
            {/* Image side */}
            <div className="relative flex items-center justify-center bg-gradient-to-br from-main-50 via-white to-accent-50/30 p-8 sm:p-12 dark:from-main-800/50 dark:via-main-900 dark:to-main-800/30">
              {/* decorative ring */}
              <div className="absolute inset-8 rounded-3xl border border-main-200/40 dark:border-main-700/30" />
              <div className="absolute inset-12 rounded-2xl border border-dashed border-main-200/30 dark:border-main-700/20" />

              <div className="relative z-10 w-full">
                <div
                  className="relative mx-auto aspect-[4/3] w-full max-w-md cursor-zoom-in"
                  onClick={() => openLightbox(activeTab)}
                  title="คลิกเพื่อขยายภาพ"
                >
                  {BENEFITS.map((item, idx) => (
                    <div
                      key={item.id}
                      className={`absolute inset-0 transition-all duration-500 ${
                        activeTab === idx
                          ? 'scale-100 opacity-100'
                          : 'scale-95 opacity-0 pointer-events-none'
                      }`}
                    >
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-contain drop-shadow-2xl"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        priority={idx === 0}
                      />
                    </div>
                  ))}
                  {/* zoom hint */}
                  <div className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-lg bg-black/40 px-2.5 py-1.5 text-xs text-white/80 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 sm:opacity-60 sm:hover:opacity-100">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6" />
                    </svg>
                    ขยายภาพ
                  </div>
                </div>
              </div>

              {/* step indicator */}
              <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
                {BENEFITS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveTab(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      activeTab === idx
                        ? 'w-8 bg-accent-500'
                        : 'w-2 bg-main-300 hover:bg-main-400 dark:bg-main-600 dark:hover:bg-main-500'
                    }`}
                    aria-label={`ดูรายการที่ ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Text side */}
            <div className="flex flex-col justify-center p-8 sm:p-12">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-accent-200 bg-accent-50 px-3.5 py-1.5 dark:border-accent-800 dark:bg-accent-950/40">
                <span className="text-accent-600 dark:text-accent-400">
                  {active.icon}
                </span>
                <span className="text-xs font-semibold tracking-wide text-accent-700 dark:text-accent-300">
                  {active.subtitle}
                </span>
              </div>

              <h2 className="mt-5 text-2xl font-extrabold tracking-tight text-main-950 sm:text-3xl dark:text-muted-50">
                {active.title}
              </h2>

              <p className="mt-4 text-sm leading-relaxed text-muted-600 sm:text-base dark:text-muted-400">
                {active.description}
              </p>

              {/* highlights */}
              <ul className="mt-6 space-y-3">
                {active.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-100 dark:bg-accent-900/50">
                      <svg className="h-3 w-3 text-accent-600 dark:text-accent-400" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    </span>
                    <span className="text-sm text-muted-700 dark:text-muted-300">{h}</span>
                  </li>
                ))}
              </ul>

              {/* nav arrows */}
              <div className="mt-8 flex items-center gap-3">
                <button
                  onClick={() => setActiveTab(activeTab === 0 ? BENEFITS.length - 1 : activeTab - 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-main-200 text-main-500 transition hover:border-main-300 hover:bg-main-50 hover:text-main-700 dark:border-main-700 dark:text-muted-400 dark:hover:border-main-600 dark:hover:bg-main-800 dark:hover:text-muted-200"
                  aria-label="ก่อนหน้า"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <span className="text-sm font-medium text-muted-400 dark:text-muted-500">
                  {activeTab + 1} / {BENEFITS.length}
                </span>
                <button
                  onClick={() => setActiveTab(activeTab === BENEFITS.length - 1 ? 0 : activeTab + 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-main-200 text-main-500 transition hover:border-main-300 hover:bg-main-50 hover:text-main-700 dark:border-main-700 dark:text-muted-400 dark:hover:border-main-600 dark:hover:bg-main-800 dark:hover:text-muted-200"
                  aria-label="ถัดไป"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ ALL BENEFITS GRID ═══════════════ */}
      <section className="border-t border-main-100 bg-gradient-to-b from-white to-muted-50 dark:border-main-800 dark:from-main-900/50 dark:to-main-950">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent-600 dark:text-accent-400">
              Overview
            </p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-main-950 sm:text-3xl dark:text-muted-50">
              ภาพรวมสิทธิประโยชน์ทั้งหมด
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-500 dark:text-muted-400">
              โรงเรียนที่ผ่านเกณฑ์การประเมิน SCEE จะได้รับสื่อรับรองคุณภาพครบทั้ง 3 รายการ
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {BENEFITS.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => {
                  setActiveTab(idx);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="group cursor-pointer"
              >
                <div className="overflow-hidden rounded-2xl border border-main-100 bg-white shadow-card transition-all duration-300 hover:-translate-y-2 hover:shadow-elevated dark:border-main-800 dark:bg-main-900/80">
                  {/* image */}
                  <div
                    className="relative aspect-[4/3] cursor-zoom-in overflow-hidden bg-gradient-to-br from-main-50 to-accent-50/20 dark:from-main-800/60 dark:to-main-800/30"
                    onClick={(e) => { e.stopPropagation(); openLightbox(idx); }}
                    title="คลิกเพื่อขยายภาพ"
                  >
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, 33vw"
                    />
                    {/* number badge */}
                    <div className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-sm font-bold text-main-950 shadow-sm backdrop-blur-sm dark:bg-main-800/90 dark:text-muted-100">
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                    {/* zoom hint */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-black/40 px-2.5 py-1.5 text-xs text-white/80 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6" />
                      </svg>
                      ขยายภาพ
                    </div>
                  </div>

                  {/* content */}
                  <div className="p-5">
                    <div className="flex items-center gap-2">
                      <span className="text-accent-500 dark:text-accent-400">{item.icon}</span>
                      <h3 className="text-lg font-bold text-main-950 dark:text-muted-50">
                        {item.title}
                      </h3>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-500 dark:text-muted-400">
                      {item.description}
                    </p>
                    <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-accent-600 transition-colors group-hover:text-accent-700 dark:text-accent-400 dark:group-hover:text-accent-300">
                      ดูรายละเอียด
                      <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ CTA ═══════════════ */}
      <section className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-main-800 via-main-900 to-main-950 px-8 py-10 text-center sm:py-14">
          {/* glow */}
          <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-accent-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-accent-400/10 blur-3xl" />

          <div className="relative z-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-400 to-accent-600 shadow-lg shadow-accent-500/25">
              <TrophyIcon className="h-7 w-7 text-white" />
            </div>
            <h2 className="mt-5 text-xl font-extrabold text-white sm:text-2xl">
              พร้อมยกระดับโรงเรียนของคุณ?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/60">
              สมัครเข้าร่วมโครงการ SCEE วันนี้ เพื่อรับสิทธิประโยชน์ทั้งหมดหลังผ่านเกณฑ์การประเมิน
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/school/register"
                className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-bold text-main-900 shadow-lg transition hover:bg-accent-50 hover:shadow-xl"
              >
                สมัครเข้าร่วมโครงการ
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-xl border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                ดูอันดับโรงเรียน
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-400 dark:text-muted-500">
          * ตัวอย่างภาพสิทธิประโยชน์สำหรับโรงเรียนที่ผ่านเกณฑ์การประเมิน SCEE
        </p>
      </section>
    </main>
  );
}
