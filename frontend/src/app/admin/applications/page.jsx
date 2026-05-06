'use client';

import { useCallback, useEffect, useState } from 'react';
import { BackNavLink, ExternalInlineLink, InlineLink } from '@/components/ui/NavLinks';
import api from '@/lib/api';
import { toast } from 'sonner';

const STATUS_OPTS = [
  { value: 'PENDING', label: 'รอดำเนินการ' },
  { value: 'APPROVED', label: 'อนุมัติแล้ว' },
  { value: 'REJECTED', label: 'ไม่อนุมัติ' },
  { value: 'ALL', label: 'ทั้งหมด' },
];

function ApplicationRow({ row, onChanged }) {
  const [approvePwd, setApprovePwd] = useState('');
  const [rejectNote, setRejectNote] = useState('');
  const [busyApprove, setBusyApprove] = useState(false);
  const [busyReject, setBusyReject] = useState(false);

  async function approve() {
    if (approvePwd.length < 6) {
      toast.error('รหัสผ่านเริ่มต้นอย่างน้อย 6 ตัวอักษร');
      return;
    }
    setBusyApprove(true);
    try {
      await api.post(`/api/admin/school-applications/${row.id}/approve`, {
        initialPassword: approvePwd,
      });
      toast.success('อนุมัติแล้ว — แจ้งผู้ประสานงานให้ล็อกอินที่ /admin/login');
      setApprovePwd('');
      onChanged();
    } catch (err) {
      toast.error(err.response?.data?.error || 'อนุมัติไม่สำเร็จ');
    } finally {
      setBusyApprove(false);
    }
  }

  async function reject() {
    setBusyReject(true);
    try {
      await api.post(`/api/admin/school-applications/${row.id}/reject`, {
        adminNote: rejectNote,
      });
      toast.success('บันทึกการปฏิเสธแล้ว');
      setRejectNote('');
      onChanged();
    } catch (err) {
      toast.error(err.response?.data?.error || 'ดำเนินการไม่สำเร็จ');
    } finally {
      setBusyReject(false);
    }
  }

  return (
    <li className="border rounded-xl p-5 bg-white shadow-sm">
      <div className="flex flex-wrap justify-between gap-2 mb-3">
        <div>
          <h2 className="font-semibold text-lg">{row.schoolName}</h2>
          {row.nameEn ? <p className="text-sm text-gray-500">{row.nameEn}</p> : null}
          <p className="text-sm text-gray-600 mt-1">
            {row.province} · {row.affiliation} · {row.level}
          </p>
        </div>
        <span
          className={`text-xs font-medium px-2 py-1 rounded ${
            row.status === 'PENDING'
              ? 'bg-amber-100 text-amber-900'
              : row.status === 'APPROVED'
                ? 'bg-green-100 text-green-900'
                : 'bg-gray-100 text-gray-700'
          }`}
        >
          {row.status}
        </span>
      </div>
      <div className="text-sm border-t border-gray-100 pt-3 space-y-1">
        <p>
          <span className="text-gray-500">ผู้ประสานงาน:</span> {row.coordinatorName} ·{' '}
          <ExternalInlineLink href={`mailto:${row.coordinatorEmail}`}>
            {row.coordinatorEmail}
          </ExternalInlineLink>
          {row.coordinatorPhone ? ` · ${row.coordinatorPhone}` : ''}
        </p>
        {row.message ? (
          <p>
            <span className="text-gray-500">ข้อความ:</span> {row.message}
          </p>
        ) : null}
        {row.school ? (
          <p className="text-green-800">
            โรงเรียนในระบบ:{' '}
            <InlineLink href={`/admin/schools/${row.school.id}/edit`}>
              {row.school.name}
            </InlineLink>
          </p>
        ) : null}
        {row.adminNote ? (
          <p className="text-red-800">
            <span className="text-gray-500">หมายเหตุแอดมิน:</span> {row.adminNote}
          </p>
        ) : null}
        <p className="text-xs text-gray-400">ส่งเมื่อ {new Date(row.createdAt).toLocaleString('th-TH')}</p>
      </div>

      {row.status === 'PENDING' && (
        <div className="mt-4 flex flex-col lg:flex-row gap-4 lg:items-end border-t border-gray-100 pt-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-gray-600 mb-1">รหัสผ่านเริ่มต้นให้ผู้ประสานงาน</label>
            <input
              type="password"
              minLength={6}
              value={approvePwd}
              onChange={(e) => setApprovePwd(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="อย่างน้อย 6 ตัว — แจ้งทางโทร/อีเมลแยกจากระบบ"
            />
          </div>
          <button
            type="button"
            disabled={busyApprove || busyReject}
            onClick={approve}
            className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-800 disabled:opacity-50"
          >
            {busyApprove ? 'กำลังดำเนินการ...' : 'อนุมัติ'}
          </button>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-gray-600 mb-1">หมายเหตุ (เมื่อปฏิเสธ)</label>
            <input
              type="text"
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="ไม่บังคับ"
            />
          </div>
          <button
            type="button"
            disabled={busyApprove || busyReject}
            onClick={reject}
            className="border border-red-300 text-red-800 px-4 py-2 rounded-lg text-sm hover:bg-red-50 disabled:opacity-50"
          >
            {busyReject ? 'กำลังดำเนินการ...' : 'ปฏิเสธ'}
          </button>
        </div>
      )}
    </li>
  );
}

export default function AdminApplicationsPage() {
  const [status, setStatus] = useState('PENDING');
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/admin/school-applications', {
        params: { status, limit: 50 },
      });
      setRows(data.data);
      setTotal(data.total);
    } catch {
      toast.error('โหลดคำขอไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <BackNavLink href="/admin/dashboard">แดชบอร์ด</BackNavLink>
          <h1 className="text-2xl font-bold mt-2">คำขอลงทะเบียนโรงเรียน</h1>
          <p className="text-sm text-gray-600 mt-1">อนุมัติเพื่อสร้างโรงเรียนและบัญชีผู้ดูแล หรือปฏิเสธพร้อมบันทึกหมายเหตุ</p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">สถานะ</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border rounded px-3 py-2 bg-white"
          >
            {STATUS_OPTS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading ? (
        <p className="text-gray-500">กำลังโหลด...</p>
      ) : rows.length === 0 ? (
        <p className="text-gray-500">ไม่มีรายการ ({total} รายการ)</p>
      ) : (
        <ul className="space-y-6">
          {rows.map((row) => (
            <ApplicationRow key={row.id} row={row} onChanged={load} />
          ))}
        </ul>
      )}
    </div>
  );
}
