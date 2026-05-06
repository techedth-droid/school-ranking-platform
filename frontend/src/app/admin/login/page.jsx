'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BackNavLink } from '@/components/ui/NavLinks';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { setTokens } from '@/lib/auth';
import { toast } from 'sonner';
import { MailIcon, EyeIcon } from '@/components/Icons';

const LOGO_SRC = '/images/logo/SCEE%20%20Smart%20Classroom%20%20Equity%20Excellence.png';

function LockIcon({ className = 'w-5 h-5' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/login', form);
      setTokens(data.accessToken, data.refreshToken);
      toast.success('เข้าสู่ระบบสำเร็จ');
      if (data.user?.role === 'SCHOOL_ADMIN') {
        router.push('/school/dashboard');
      } else {
        router.push('/admin/dashboard');
      }
    } catch (err) {
      const status = err.response?.status;
      const body = err.response?.data;
      const serverMsg =
        typeof body?.error === 'string'
          ? body.error
          : Array.isArray(body?.errors) && body.errors[0]?.msg
            ? body.errors[0].msg
            : null;
      if (status === 401) {
        toast.error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      } else if (serverMsg) {
        toast.error(serverMsg);
      } else {
        toast.error('เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่หรือตรวจการตั้งค่า API');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center py-10 px-4 overflow-hidden">
      {/* Background */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-main-900 via-main-800 to-main-950"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-accent-400/12 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-accent-500/10 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 w-full max-w-[420px] animate-slide-up">
        <div className="rounded-2xl border border-white/10 bg-white/[0.97] shadow-elevated backdrop-blur-xl dark:border-main-700/80 dark:bg-main-900/95">
          <div className="border-b border-muted-100/80 px-8 pt-8 pb-6 text-center dark:border-main-800">
            <div className="mx-auto mb-4 h-14 w-44">
              <Image src={LOGO_SRC} alt="SCEE logo" width={320} height={120} className="h-full w-full object-contain" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl dark:text-white">เข้าสู่ระบบ</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 px-8 pb-8 pt-2">
            <div>
              <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                อีเมล
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <MailIcon className="h-5 w-5" />
                </span>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@school.ac.th"
                  value={form.email}
                  required
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  className="w-full rounded-xl border border-muted-200 bg-muted-50/80 py-2.5 pl-10 pr-3 text-main-950 placeholder:text-muted-400 transition-colors focus:border-accent-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent-500/20 dark:border-main-800 dark:bg-main-950/80 dark:text-muted-100 dark:placeholder:text-muted-500 dark:focus:border-accent-400 dark:focus:bg-main-950 dark:focus:ring-accent-500/30"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                รหัสผ่าน
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <LockIcon className="h-5 w-5" />
                </span>
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={form.password}
                  required
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  className="w-full rounded-xl border border-muted-200 bg-muted-50/80 py-2.5 pl-10 pr-11 text-main-950 placeholder:text-muted-400 transition-colors focus:border-accent-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent-500/20 dark:border-main-800 dark:bg-main-950/80 dark:text-muted-100 dark:placeholder:text-muted-500 dark:focus:border-accent-400 dark:focus:bg-main-950 dark:focus:ring-accent-500/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                  aria-label={showPw ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                >
                  <EyeIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full overflow-hidden rounded-xl bg-accent-600 py-3 text-sm font-semibold text-contrast shadow-md shadow-accent-950/20 transition-all hover:bg-accent-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="relative z-10">
                {loading ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}
              </span>
              <span
                className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 transition-opacity group-hover:opacity-100"
                aria-hidden
              />
            </button>

            <div className="flex flex-col gap-3 border-t border-muted-100 pt-5 sm:flex-row sm:items-center sm:justify-between dark:border-main-800">
              <BackNavLink
                href="/"
                className="w-full justify-center border-muted-100 bg-muted-50/90 py-2 text-xs font-medium text-muted-600 shadow-none hover:border-muted-200 hover:bg-white hover:text-main-800 sm:w-auto sm:justify-start dark:border-main-700 dark:bg-main-900/50 dark:text-muted-400 dark:hover:bg-main-800 dark:hover:text-white"
              >
                กลับหน้าหลัก
              </BackNavLink>
              <Link
                href="/admin/forgot-password"
                className="text-center text-sm font-medium text-accent-600 transition-colors hover:text-accent-800 sm:text-right dark:text-accent-400 dark:hover:text-accent-300"
              >
                ลืมรหัสผ่าน
              </Link>
            </div>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-white/45">
          Smart Classroom Equity Evaluation — ข้อมูลของคุณถูกเข้ารหัสระหว่างส่ง
        </p>
      </div>
    </div>
  );
}
