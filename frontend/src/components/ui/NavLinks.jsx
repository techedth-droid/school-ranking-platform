'use client';

import Link from 'next/link';
import { ArrowLeftIcon, ArrowRightIcon } from '@/components/Icons';

const backSurface =
  'group inline-flex items-center gap-2 rounded-xl border border-muted-200 bg-white px-4 py-2.5 text-sm font-semibold text-accent-700 shadow-sm transition-all hover:border-accent-300 hover:bg-accent-50 hover:text-accent-800 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 dark:border-main-700 dark:bg-main-900 dark:text-accent-300 dark:hover:border-accent-600 dark:hover:bg-accent-950/40';

const backHero =
  'group inline-flex items-center gap-2.5 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white shadow-sm backdrop-blur-md transition-all hover:border-white/40 hover:bg-white/[0.18] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-main-900';

const iconSurface =
  'h-4 w-4 shrink-0 text-accent-600 transition-transform group-hover:-translate-x-0.5 dark:text-accent-400';
const iconHero =
  'h-5 w-5 shrink-0 text-accent-200/90 transition-transform group-hover:-translate-x-1 group-hover:text-accent-100';

/**
 * Primary “back” control — bordered pill + left arrow.
 * @param {'surface' | 'hero'} variant — hero for dark gradient heroes (about/benefits).
 */
export function BackNavLink({ href, children, variant = 'surface', className = '' }) {
  const base = variant === 'hero' ? backHero : backSurface;
  const ic = variant === 'hero' ? iconHero : iconSurface;
  return (
    <Link href={href} className={`${base} ${className}`.trim()}>
      <ArrowLeftIcon className={ic} />
      {children}
    </Link>
  );
}

const forwardSurface =
  'group inline-flex items-center gap-2 rounded-xl border border-accent-200 bg-accent-50 px-4 py-2.5 text-sm font-semibold text-accent-900 shadow-sm transition-all hover:border-accent-300 hover:bg-accent-100 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 dark:border-accent-800 dark:bg-accent-950/40 dark:text-accent-200 dark:hover:bg-accent-900/50';

const forwardIcon =
  'h-4 w-4 shrink-0 text-accent-600 transition-transform group-hover:translate-x-0.5 dark:text-accent-400';

/** CTA-style link with right arrow (e.g. “ไปกรอกคะแนน”, “ดูหน้าโปรไฟล์”). */
export function ForwardNavLink({ href, children, className = '', external = false, showArrow = true }) {
  const cls = `${forwardSurface} ${className}`.trim();
  const inner = (
    <>
      {children}
      {showArrow ? <ArrowRightIcon className={forwardIcon} /> : null}
    </>
  );
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls}>
        {inner}
      </a>
    );
  }
  return <Link href={href} className={cls}>{inner}</Link>;
}

const inlineAccent =
  'font-medium text-accent-700 underline-offset-2 decoration-accent-300/70 transition-colors rounded-md px-1.5 -mx-1.5 py-0.5 hover:bg-accent-50 hover:text-accent-900 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-1 dark:text-accent-400 dark:hover:bg-accent-950/50';

const inlineMuted =
  'font-medium text-slate-600 rounded-md px-1.5 py-0.5 transition-colors hover:bg-slate-100 hover:text-accent-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-1 dark:text-muted-400 dark:hover:bg-main-800 dark:hover:text-accent-300';

/** Inline text link (tables, sentences). Use variant muted for breadcrumbs. */
export function InlineLink({ href, children, className = '', variant = 'accent' }) {
  const base = variant === 'muted' ? inlineMuted : inlineAccent;
  return (
    <Link href={href} className={`${base} ${className}`.trim()}>
      {children}
    </Link>
  );
}

/** Same look as InlineLink for external / mailto / tel. */
export function ExternalInlineLink({ href, children, className = '', ...rest }) {
  return (
    <a href={href} className={`${inlineAccent} ${className}`.trim()} {...rest}>
      {children}
    </a>
  );
}

/** Destructive text button for row actions (ลบ). */
export function DangerInlineButton({ children, className = '', ...props }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center rounded-lg px-2 py-1 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1 dark:text-red-400 dark:hover:bg-red-950/40 ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
