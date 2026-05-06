'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BackNavLink } from '@/components/ui/NavLinks';
import api from '@/lib/api';
import { toast } from 'sonner';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';
  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('รหัสผ่านไม่ตรงกัน');
      return;
    }
    setLoading(true);
    try {
      await api.post('/api/auth/reset-password', { token, password });
      toast.success('ตั้งรหัสผ่านใหม่แล้ว — กรุณาเข้าสู่ระบบอีกครั้ง');
      router.push('/admin/login');
    } catch {
      toast.error('ไม่สามารถรีเซ็ตรหัสผ่านได้ ลิงก์อาจหมดอายุ');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-8 rounded-xl shadow w-full max-w-md space-y-4"
    >
      <h1 className="text-xl font-bold text-center">ตั้งรหัสผ่านใหม่</h1>
      <input
        type="text"
        name="token"
        autoComplete="off"
        placeholder="โทเคน (ถ้าไม่ได้มาจากลิงก์)"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        className="w-full border rounded px-3 py-2 text-sm"
      />
      <input
        type="password"
        placeholder="รหัสผ่านใหม่ (อย่างน้อย 6 ตัว)"
        value={password}
        required
        minLength={6}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border rounded px-3 py-2"
      />
      <input
        type="password"
        placeholder="ยืนยันรหัสผ่าน"
        value={confirm}
        required
        minLength={6}
        onChange={(e) => setConfirm(e.target.value)}
        className="w-full border rounded px-3 py-2"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่าน'}
      </button>
      <p className="text-center text-sm">
        <BackNavLink href="/admin/login">กลับไปเข้าสู่ระบบ</BackNavLink>
      </p>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Suspense
        fallback={
          <div className="bg-white p-8 rounded-xl shadow w-full max-w-md text-center text-gray-500">
            กำลังโหลด...
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
