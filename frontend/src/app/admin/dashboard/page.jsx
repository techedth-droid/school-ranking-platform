'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { clearTokens } from '@/lib/auth';
import { toast } from 'sonner';

const PROD_API_URL = 'https://school-ranking-platform-production.up.railway.app';
const DEFAULT_API_URL = process.env.NODE_ENV === 'production' ? PROD_API_URL : 'http://localhost:3005';

export default function AdminDashboardPage() {
  const router = useRouter();

  async function handleLogout() {
    try {
      await api.post('/api/auth/logout');
    } catch {
      /* ignore */
    }
    clearTokens();
    toast.success('ออกจากระบบแล้ว');
    router.push('/admin/login');
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold">แดชบอร์ดผู้ดูแล</h1>
        <button
          type="button"
          onClick={handleLogout}
          className="text-sm border rounded px-4 py-2 hover:bg-gray-50"
        >
          ออกจากระบบ
        </button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          href="/admin/applications"
          className="block border rounded-xl p-6 hover:border-teal-400 hover:bg-teal-50/50 transition"
        >
          <h2 className="font-semibold text-lg mb-1">คำขอลงทะเบียนโรงเรียน</h2>
          <p className="text-sm text-gray-600">อนุมัติหรือปฏิเสธการสมัครจากโรงเรียน</p>
        </Link>
        <Link
          href="/admin/users"
          className="block border rounded-xl p-6 hover:border-violet-400 hover:bg-violet-50/50 transition"
        >
          <h2 className="font-semibold text-lg mb-1">ผู้ใช้ในระบบ</h2>
          <p className="text-sm text-gray-600">ดูบัญชีแอดมินและผู้ดูแลโรงเรียน</p>
        </Link>
        <Link
          href="/admin/schools"
          className="block border rounded-xl p-6 hover:border-blue-400 hover:bg-blue-50/50 transition"
        >
          <h2 className="font-semibold text-lg mb-1">จัดการโรงเรียน</h2>
          <p className="text-sm text-gray-600">เพิ่ม แก้ไข เผยแพร่ และลบข้อมูลโรงเรียน</p>
        </Link>
        <Link
          href="/admin/scores"
          className="block border rounded-xl p-6 hover:border-indigo-400 hover:bg-indigo-50/50 transition"
        >
          <h2 className="font-semibold text-lg mb-1">คะแนนโรงเรียน</h2>
          <p className="text-sm text-gray-600">ดูรายการและกรอกคะแนนตามโรงเรียน</p>
        </Link>
        <Link
          href="/admin/import"
          className="block border rounded-xl p-6 hover:border-blue-400 hover:bg-blue-50/50 transition"
        >
          <h2 className="font-semibold text-lg mb-1">นำเข้า CSV</h2>
          <p className="text-sm text-gray-600">อัปโหลดโรงเรียนและคะแนนจำนวนมากจากไฟล์เดียว</p>
        </Link>
        <Link
          href="/admin/duplicates"
          className="block border rounded-xl p-6 hover:border-amber-400 hover:bg-amber-50/50 transition"
        >
          <h2 className="font-semibold text-lg mb-1">ชื่อซ้ำ</h2>
          <p className="text-sm text-gray-600">ตรวจโรงเรียนที่มีคีย์ชื่อซ้ำในฐานข้อมูล</p>
        </Link>
        <Link
          href="/admin/audit"
          className="block border rounded-xl p-6 hover:border-slate-400 hover:bg-slate-50 transition"
        >
          <h2 className="font-semibold text-lg mb-1">บันทึกกิจกรรม</h2>
          <p className="text-sm text-gray-600">Audit log การสำคัญของแอดมิน</p>
        </Link>
        <a
          href={`${process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL}/api/docs`}
          target="_blank"
          rel="noreferrer"
          className="block border rounded-xl p-6 hover:border-gray-400 hover:bg-gray-50 transition"
        >
          <h2 className="font-semibold text-lg mb-1">เอกสาร API (Swagger)</h2>
          <p className="text-sm text-gray-600">เปิดในแท็บใหม่</p>
        </a>
      </div>
    </div>
  );
}
