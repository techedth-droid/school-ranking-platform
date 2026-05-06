'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { BackNavLink } from '@/components/ui/NavLinks';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setDevResetUrl(null);
    try {
      const { data } = await api.post('/api/auth/forgot-password', { email });
      toast.success('ถ้ามีบัญชีนี้ ระบบจะส่งลิงก์รีเซ็ตให้ (ในโหมดพัฒนาอาจแสดงลิงก์ด้านล่าง)');
      if (data?.devResetUrl) setDevResetUrl(data.devResetUrl);
    } catch {
      toast.error('ส่งคำขอไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow w-full max-w-md space-y-4"
      >
        <h1 className="text-xl font-bold text-center">ลืมรหัสผ่าน</h1>
        <p className="text-sm text-gray-600 text-center">
          กรอกอีเมลที่ใช้เข้าระบบ ระบบจะเตรียมลิงก์รีเซ็ต (ในการใช้งานจริงควรส่งอีเมลจากเซิร์ฟเวอร์)
        </p>
        <input
          type="email"
          placeholder="อีเมล"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'กำลังส่ง...' : 'ส่งคำขอ'}
        </button>
        {devResetUrl ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs break-all">
            <p className="font-medium text-amber-900 mb-1">โหมดพัฒนา — ลิงก์รีเซ็ต:</p>
            <a href={devResetUrl} className="text-blue-700 underline">
              {devResetUrl}
            </a>
          </div>
        ) : null}
        <p className="text-center text-sm">
          <BackNavLink href="/admin/login">กลับไปเข้าสู่ระบบ</BackNavLink>
        </p>
      </form>
    </div>
  );
}
