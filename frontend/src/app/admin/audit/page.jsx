'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { BackNavLink } from '@/components/ui/NavLinks';
import { toast } from 'sonner';

export default function AdminAuditPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/api/admin/audit-logs', { params: { limit: 200 } });
        if (!cancelled) setLogs(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) toast.error('โหลดบันทึกกิจกรรมไม่สำเร็จ');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">บันทึกกิจกรรม (Audit)</h1>
          <p className="text-sm text-gray-600 mt-1">ล่าสุด 200 รายการ</p>
        </div>
        <BackNavLink href="/admin/dashboard">กลับแดชบอร์ด</BackNavLink>
      </div>

      {loading ? (
        <p className="text-gray-500">กำลังโหลด...</p>
      ) : (
        <div className="overflow-x-auto border rounded-xl bg-white">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="p-3 font-medium">เวลา</th>
                <th className="p-3 font-medium">การกระทำ</th>
                <th className="p-3 font-medium">เอนทิตี</th>
                <th className="p-3 font-medium">รหัส</th>
                <th className="p-3 font-medium">ผู้กระทำ</th>
                <th className="p-3 font-medium">IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((row) => (
                <tr key={row.id} className="border-t border-gray-100 hover:bg-slate-50/80">
                  <td className="p-3 whitespace-nowrap text-gray-700">
                    {row.createdAt ? new Date(row.createdAt).toLocaleString('th-TH') : '—'}
                  </td>
                  <td className="p-3 font-mono text-xs">{row.action}</td>
                  <td className="p-3">{row.entity || '—'}</td>
                  <td className="p-3 font-mono text-xs max-w-[140px] truncate" title={row.entityId}>
                    {row.entityId || '—'}
                  </td>
                  <td className="p-3 font-mono text-xs max-w-[120px] truncate" title={row.actorId}>
                    {row.actorId || '—'}
                  </td>
                  <td className="p-3 text-xs text-gray-600">{row.ip || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 ? (
            <p className="p-6 text-center text-gray-500">ยังไม่มีบันทึก</p>
          ) : null}
        </div>
      )}
    </div>
  );
}
