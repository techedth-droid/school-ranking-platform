'use client';

import { useMemo, useState } from 'react';
import api from '@/lib/api';
import { THAILAND_PROVINCE_OPTIONS } from '@/lib/scope';
import { BackNavLink } from '@/components/ui/NavLinks';
import { toast } from 'sonner';

/** ฟิลด์พื้นขาว — บังคับสีตัวอักษรไม่ให้สืบทอด dark:text จาก body */
const FIELD =
  'w-full rounded-lg border border-muted-300 bg-white px-3 py-2 text-main-950 placeholder:text-muted-500 shadow-sm focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/25 dark:bg-white dark:text-main-950 dark:placeholder:text-muted-500';

export default function SchoolRegisterPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    schoolName: '',
    nameEn: '',
    province: '',
    affiliation: '',
    level: '',
    totalRooms: 0,
    smartClassroomRooms: 0,
    studentCount: 0,
    coordinatorName: '',
    coordinatorEmail: '',
    coordinatorPhone: '',
    message: '',
  });

  const provinceChoices = useMemo(() => [...THAILAND_PROVINCE_OPTIONS], []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/school-applications', form);
      toast.success('ส่งคำขอแล้ว ทีมงานจะตรวจสอบและติดต่อกลับทางอีเมล');
      setForm({
        schoolName: '',
        nameEn: '',
        province: '',
        affiliation: '',
        level: '',
        totalRooms: 0,
        smartClassroomRooms: 0,
        studentCount: 0,
        coordinatorName: '',
        coordinatorEmail: '',
        coordinatorPhone: '',
        message: '',
      });
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.errors?.[0]?.msg ||
        'ส่งคำขอไม่สำเร็จ';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-10">
      <div className="mb-6">
        <BackNavLink href="/" className="px-3.5 dark:border-main-800 dark:bg-main-900/60 dark:text-accent-300 dark:shadow-none dark:hover:border-accent-700 dark:hover:bg-main-900/90 dark:hover:text-contrast">
          กลับหน้าอันดับ
        </BackNavLink>
        <h1 className="text-2xl font-bold mt-4 text-gray-900 dark:text-white">
          ลงทะเบียนโรงเรียน (รอการอนุมัติ)
        </h1>
        <p className="text-sm text-gray-600 mt-2 dark:text-gray-400">
          กรอกข้อมูลโรงเรียนและผู้ประสานงาน แอดมินจะอนุมัติและสร้างบัญชีเข้าใช้งานให้ หรือติดต่อกลับหากต้องการข้อมูลเพิ่ม
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm [color-scheme:light] dark:border-gray-700"
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
            ชื่อโรงเรียน (ภาษาไทย) *
          </label>
          <input
            type="text"
            required
            value={form.schoolName}
            onChange={(e) => setForm((p) => ({ ...p, schoolName: e.target.value }))}
            className={FIELD}
            placeholder="ชื่อเต็มโรงเรียน"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
            ชื่อโรงเรียน (อังกฤษ) *
          </label>
          <input
            type="text"
            required
            value={form.nameEn}
            onChange={(e) => setForm((p) => ({ ...p, nameEn: e.target.value }))}
            className={FIELD}
            placeholder="School name in English"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">จังหวัด *</label>
          <select
            required
            value={form.province}
            onChange={(e) => setForm((p) => ({ ...p, province: e.target.value }))}
            className={FIELD}
          >
            <option value="">เลือกจังหวัด</option>
            {provinceChoices.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">สังกัด *</label>
          <input
            type="text"
            required
            value={form.affiliation}
            onChange={(e) => setForm((p) => ({ ...p, affiliation: e.target.value }))}
            className={FIELD}
            placeholder="เช่น สพฐ. / สช. / อปท. / เอกชน"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">ระดับการศึกษา *</label>
          <select
            required
            value={form.level}
            onChange={(e) => setForm((p) => ({ ...p, level: e.target.value }))}
            className={FIELD}
          >
            <option value="">เลือกระดับ</option>
            <option value="ประถมศึกษา">ประถมศึกษา</option>
            <option value="มัธยมศึกษา">มัธยมศึกษา</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
            จำนวนห้องเรียนทั้งหมด *
          </label>
          <input
            type="number"
            required
            min={0}
            step={1}
            value={form.totalRooms}
            onChange={(e) =>
              setForm((p) => ({ ...p, totalRooms: Number(e.target.value) || 0 }))
            }
            className={FIELD}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
            จำนวนห้อง Smart Classroom *
          </label>
          <input
            type="number"
            required
            min={0}
            step={1}
            value={form.smartClassroomRooms}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                smartClassroomRooms: Number(e.target.value) || 0,
              }))
            }
            className={FIELD}
          />
          <p className="text-xs text-gray-500 mt-1">
            ป้อนจำนวนห้องที่ติดตั้งระบบ Smart Classroom
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
            จำนวนนักเรียนทั้งหมด *
          </label>
          <input
            type="number"
            required
            min={0}
            step={1}
            value={form.studentCount}
            onChange={(e) =>
              setForm((p) => ({ ...p, studentCount: Number(e.target.value) || 0 }))
            }
            className={FIELD}
          />
        </div>

        <div className="mt-2 border-t border-gray-200 pt-4 dark:border-gray-600">
          <h2 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
            ผู้ประสานงานของโรงเรียน
          </h2>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
            ชื่อผู้ประสานงาน *
          </label>
          <input
            type="text"
            required
            value={form.coordinatorName}
            onChange={(e) => setForm((p) => ({ ...p, coordinatorName: e.target.value }))}
            className={FIELD}
            placeholder="ชื่อ–นามสกุล"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
            อีเมล (ใช้เป็นบัญชีล็อกอิน) *
          </label>
          <input
            type="email"
            required
            autoComplete="email"
            value={form.coordinatorEmail}
            onChange={(e) => setForm((p) => ({ ...p, coordinatorEmail: e.target.value }))}
            className={FIELD}
            placeholder="school@example.go.th"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">เบอร์โทรศัพท์</label>
          <input
            type="text"
            inputMode="tel"
            value={form.coordinatorPhone}
            onChange={(e) => setForm((p) => ({ ...p, coordinatorPhone: e.target.value }))}
            className={FIELD}
            placeholder="0xx-xxx-xxxx"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">ข้อความถึงทีมงาน</label>
          <textarea
            value={form.message}
            onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
            rows={3}
            className={`${FIELD} resize-y`}
            placeholder="หมายเหตุหรือคำถามเพิ่มเติม (ถ้ามี)"
            maxLength={2000}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-accent-600 py-2.5 text-contrast hover:bg-accent-700 disabled:opacity-50"
        >
          {loading ? 'กำลังส่ง...' : 'ส่งคำขอ'}
        </button>
      </form>
    </main>
  );
}
