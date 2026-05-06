'use client';

import { useMemo, useState } from 'react';
import api from '@/lib/api';
import { BackNavLink } from '@/components/ui/NavLinks';
import { toast } from 'sonner';

function SummaryCard({ label, value, tone = 'slate' }) {
  const tones = {
    slate: 'bg-white border-slate-200 text-slate-900',
    green: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    red: 'bg-red-50 border-red-200 text-red-900',
  };
  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${tones[tone]}`}>
      <div className="text-xs font-medium uppercase tracking-wide opacity-70">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}

export default function AdminImportPage() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const [importing, setImporting] = useState(false);

  const canImport = Boolean(file && result?.ok && !importing);
  const errorRows = useMemo(
    () => (result?.rows || []).filter((r) => r.errors?.length),
    [result]
  );

  function onFileChange(e) {
    const next = e.target.files?.[0] || null;
    setFile(next);
    setResult(null);
  }

  async function upload(endpoint, setBusy) {
    if (!file) {
      toast.error('เลือกไฟล์ CSV ก่อน');
      return null;
    }
    const fd = new FormData();
    fd.append('file', file);
    setBusy(true);
    try {
      const { data } = await api.post(endpoint, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(data);
      return data;
    } catch (err) {
      const data = err?.response?.data;
      if (data?.rows || data?.headerErrors) setResult(data);
      toast.error(err?.response?.data?.error || 'ดำเนินการไม่สำเร็จ');
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function dryRun() {
    const data = await upload('/api/import/schools/dry-run', setChecking);
    if (data?.ok) toast.success('ไฟล์ผ่านการตรวจสอบ พร้อมนำเข้า');
    else if (data) toast.error('พบข้อผิดพลาดในไฟล์ กรุณาแก้ก่อนนำเข้า');
  }

  async function importFile() {
    if (!window.confirm('ยืนยันนำเข้า CSV นี้? ข้อมูลโรงเรียน/คะแนนจะถูกสร้างหรืออัปเดตตามไฟล์')) {
      return;
    }
    const data = await upload('/api/import/schools', setImporting);
    if (data?.imported) toast.success('นำเข้าข้อมูลและคำนวณอันดับแล้ว');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/40">
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <BackNavLink href="/admin/dashboard">กลับแดชบอร์ด</BackNavLink>
            <h1 className="text-3xl font-bold text-slate-900 mt-3">นำเข้าโรงเรียนและคะแนน</h1>
            <p className="text-slate-600 mt-2 max-w-2xl">
              อัปโหลด CSV หนึ่งชีตตามไฟล์ตัวอย่าง ระบบจะตรวจหัวคอลัมน์ ข้อมูลบังคับ และคะแนน 0–4
              ก่อนนำเข้าจริง
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href="/doc/bulk-import-schools-example.csv"
              download
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm hover:bg-slate-50"
            >
              ดาวน์โหลด CSV ตัวอย่าง
            </a>
            <a
              href="/doc/bulk-import-columns.txt"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm hover:bg-slate-50"
            >
              ดูคำอธิบายคอลัมน์
            </a>
          </div>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
          <div className="grid lg:grid-cols-[1fr_auto] gap-4 lg:items-end">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">ไฟล์ CSV</span>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={onFileChange}
                className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-blue-700"
              />
              {file ? (
                <p className="text-xs text-slate-500 mt-2">
                  เลือกไฟล์: {file.name} ({Math.ceil(file.size / 1024)} KB)
                </p>
              ) : null}
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={dryRun}
                disabled={!file || checking || importing}
                className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50"
              >
                {checking ? 'กำลังตรวจ...' : 'ตรวจสอบไฟล์'}
              </button>
              <button
                type="button"
                onClick={importFile}
                disabled={!canImport}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 hover:bg-blue-700 disabled:opacity-50 disabled:shadow-none"
              >
                {importing ? 'กำลังนำเข้า...' : 'ยืนยันนำเข้า'}
              </button>
            </div>
          </div>
        </section>

        {result ? (
          <section className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              <SummaryCard label="ทั้งหมด" value={result.totalRows ?? 0} />
              <SummaryCard label="ใช้ได้" value={result.validRows ?? 0} tone="green" />
              <SummaryCard label="สร้างใหม่" value={result.createCount ?? 0} tone="blue" />
              <SummaryCard label="อัปเดต" value={result.updateCount ?? 0} tone="blue" />
              <SummaryCard label="ผิดพลาด" value={result.errorCount ?? 0} tone={result.errorCount ? 'red' : 'green'} />
            </div>

            {result.imported ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                นำเข้าสำเร็จ และคำนวณอันดับใหม่แล้ว ({result.ranking?.recalculated ?? 0} โรงเรียน)
              </div>
            ) : null}

            {result.headerErrors?.length ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                <h2 className="font-semibold text-red-900">หัวคอลัมน์ไม่ถูกต้อง</h2>
                <ul className="mt-2 list-disc pl-5 text-sm text-red-800 space-y-1">
                  {result.headerErrors.map((err) => (
                    <li key={err}>{err}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {errorRows.length ? (
              <div className="rounded-2xl border border-red-200 bg-white overflow-hidden">
                <div className="bg-red-50 px-4 py-3 border-b border-red-100">
                  <h2 className="font-semibold text-red-900">รายการที่ต้องแก้ไข</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-600">
                      <tr>
                        <th className="text-left p-3">แถว</th>
                        <th className="text-left p-3">โรงเรียน</th>
                        <th className="text-left p-3">ปัญหา</th>
                      </tr>
                    </thead>
                    <tbody>
                      {errorRows.map((row) => (
                        <tr key={row.rowNumber} className="border-t">
                          <td className="p-3 font-mono">{row.rowNumber}</td>
                          <td className="p-3">{row.name || '-'}</td>
                          <td className="p-3 text-red-700">{row.errors.join(', ')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : result.ok ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                ไฟล์ผ่านการตรวจสอบแล้ว สามารถกด “ยืนยันนำเข้า” ได้
              </div>
            ) : null}

            {result.rows?.length ? (
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                <div className="px-4 py-3 border-b bg-slate-50">
                  <h2 className="font-semibold text-slate-900">ตัวอย่างผลตรวจรายแถว</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-white text-slate-500">
                      <tr>
                        <th className="text-left p-3">แถว</th>
                        <th className="text-left p-3">ทำรายการ</th>
                        <th className="text-left p-3">โรงเรียน</th>
                        <th className="text-left p-3">สถานะ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.rows.slice(0, 20).map((row) => (
                        <tr key={row.rowNumber} className="border-t">
                          <td className="p-3 font-mono">{row.rowNumber}</td>
                          <td className="p-3">{row.action === 'update' ? 'อัปเดต' : 'สร้างใหม่'}</td>
                          <td className="p-3">{row.name || '-'}</td>
                          <td className="p-3">
                            {row.errors?.length ? (
                              <span className="text-red-600">ผิดพลาด</span>
                            ) : (
                              <span className="text-emerald-700">ผ่าน</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {result.rows.length > 20 ? (
                  <div className="border-t bg-slate-50 px-4 py-2 text-xs text-slate-500">
                    แสดง 20 แถวแรกจากทั้งหมด {result.rows.length} แถว
                  </div>
                ) : null}
              </div>
            ) : null}
          </section>
        ) : null}
      </div>
    </div>
  );
}
