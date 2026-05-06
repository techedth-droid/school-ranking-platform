'use client';

import { useMemo, useState } from 'react';
import {
  THAILAND_PROVINCE_OPTIONS,
} from '@/lib/scope';

export default function SchoolForm({
  initial = {},
  onSubmit,
  submitLabel = 'บันทึก',
  loading = false,
  forSchoolAdmin = false,
}) {
  const provinceChoices = useMemo(() => {
    const opts = [...THAILAND_PROVINCE_OPTIONS];
    const p = initial.province;
    if (p && !opts.some((o) => o.value === p)) {
      opts.push({ value: p, label: `${p} (ข้อมูลเดิม — ไม่อยู่ในรายการมาตรฐาน)` });
    }
    return opts;
  }, [initial.province]);

  const [form, setForm] = useState({
    name: initial.name ?? '',
    nameEn: initial.nameEn ?? '',
    province: initial.province ?? '',
    affiliation: initial.affiliation ?? '',
    level: initial.level ?? '',
    totalRooms: Number.isFinite(Number(initial.totalRooms)) ? Number(initial.totalRooms) : 0,
    smartClassroomRooms: Number.isFinite(Number(initial.smartClassroomRooms))
      ? Number(initial.smartClassroomRooms)
      : 0,
    studentCount: Number.isFinite(Number(initial.studentCount)) ? Number(initial.studentCount) : 0,
    website: initial.website ?? '',
    contact: initial.contact ?? '',
    description: initial.description ?? '',
    address: initial.address ?? '',
    phone: initial.phone ?? '',
    facebookUrl: initial.facebookUrl ?? '',
    lineId: initial.lineId ?? '',
    isPublished: Boolean(initial.isPublished),
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (forSchoolAdmin) {
      const { isPublished: _p, ...rest } = form;
      onSubmit?.(rest);
    } else {
      onSubmit?.(form);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-xl bg-white p-6 rounded-xl border shadow-sm">
      <div className="border-b border-gray-100 pb-4 mb-2">
        <h2 className="text-lg font-semibold text-gray-900">ข้อมูลทั่วไปของสถานศึกษา</h2>
        <p className="text-sm text-gray-500 mt-1">
          ชื่อโรงเรียน (ไทย/อังกฤษ), สังกัด, จังหวัด, ระดับการศึกษา, เว็บไซต์/ช่องทางติดต่อ
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อโรงเรียน (ภาษาไทย)</label>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          className="w-full border rounded px-3 py-2"
          placeholder="ระบุชื่อภาษาไทย"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อโรงเรียน (ภาษาอังกฤษ)</label>
        <input
          type="text"
          required
          value={form.nameEn}
          onChange={(e) => setForm((p) => ({ ...p, nameEn: e.target.value }))}
          className="w-full border rounded px-3 py-2"
          placeholder="School name in English"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">จังหวัด</label>
        <select
          required
          value={form.province}
          onChange={(e) => setForm((p) => ({ ...p, province: e.target.value }))}
          className="w-full border rounded px-3 py-2 bg-white"
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
        <label className="block text-sm font-medium text-gray-700 mb-1">สังกัด</label>
        <input
          type="text"
          required
          value={form.affiliation}
          onChange={(e) => setForm((p) => ({ ...p, affiliation: e.target.value }))}
          className="w-full border rounded px-3 py-2"
          placeholder="เช่น สพฐ. / สช. / อปท. / เอกชน"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">ระดับการศึกษา</label>
        <select
          value={form.level}
          onChange={(e) => setForm((p) => ({ ...p, level: e.target.value }))}
          className="w-full border rounded px-3 py-2 bg-white"
          required
        >
          <option value="">เลือกระดับ</option>
          <option value="ประถมศึกษา">ประถมศึกษา</option>
          <option value="มัธยมศึกษา">มัธยมศึกษา</option>
        </select>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">จำนวนห้องเรียนทั้งหมด</label>
          <input
            type="number"
            min={0}
            step={1}
            value={form.totalRooms}
            onChange={(e) => setForm((p) => ({ ...p, totalRooms: Number(e.target.value) || 0 }))}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">จำนวนห้อง Smart Classroom</label>
          <input
            type="number"
            min={0}
            step={1}
            value={form.smartClassroomRooms}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                smartClassroomRooms: Number(e.target.value) || 0,
              }))
            }
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">จำนวนนักเรียนทั้งหมด</label>
          <input
            type="number"
            min={0}
            step={1}
            value={form.studentCount}
            onChange={(e) => setForm((p) => ({ ...p, studentCount: Number(e.target.value) || 0 }))}
            className="w-full border rounded px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">คำอธิบายโรงเรียน</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          rows={4}
          className="w-full border rounded px-3 py-2 resize-y min-h-[6rem]"
          placeholder="แนะนำโรงเรียน วิสัยทัศน์ จุดเด่น สำหรับแสดงในหน้าโปรไฟล์สาธารณะ"
          maxLength={2000}
        />
      </div>

      <div className="border-t border-gray-100 pt-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">ข้อมูลติดต่อ</h3>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">ที่อยู่</label>
        <textarea
          value={form.address}
          onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
          rows={2}
          className="w-full border rounded px-3 py-2 resize-y min-h-[3rem]"
          placeholder="เลขที่ ถนน ตำบล/แขวง อำเภอ/เขต จังหวัด รหัสไปรษณีย์"
          maxLength={500}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์</label>
          <input
            type="text"
            inputMode="tel"
            value={form.phone}
            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
            className="w-full border rounded px-3 py-2"
            placeholder="02-xxx-xxxx"
            maxLength={50}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">เว็บไซต์</label>
          <input
            type="text"
            inputMode="url"
            autoComplete="url"
            value={form.website}
            onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))}
            className="w-full border rounded px-3 py-2"
            placeholder="https://..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
          <input
            type="text"
            inputMode="url"
            value={form.facebookUrl}
            onChange={(e) => setForm((p) => ({ ...p, facebookUrl: e.target.value }))}
            className="w-full border rounded px-3 py-2"
            placeholder="https://facebook.com/..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">LINE ID</label>
          <input
            type="text"
            value={form.lineId}
            onChange={(e) => setForm((p) => ({ ...p, lineId: e.target.value }))}
            className="w-full border rounded px-3 py-2"
            placeholder="@school หรือ ID"
            maxLength={100}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">ช่องทางติดต่ออื่น</label>
        <textarea
          value={form.contact}
          onChange={(e) => setForm((p) => ({ ...p, contact: e.target.value }))}
          rows={2}
          className="w-full border rounded px-3 py-2 resize-y min-h-[3rem]"
          placeholder="อีเมล Instagram TikTok ฯลฯ"
        />
      </div>

      {!forSchoolAdmin && (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) => setForm((p) => ({ ...p, isPublished: e.target.checked }))}
          />
          <span className="text-sm">เผยแพร่ในอันดับสาธารณะ</span>
        </label>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'กำลังบันทึก...' : submitLabel}
      </button>
    </form>
  );
}
