'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { BackNavLink, InlineLink } from '@/components/ui/NavLinks';
import { toast } from 'sonner';

export default function AdminDuplicatesPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/api/admin/duplicate-schools');
        if (!cancelled) setGroups(data.groups || []);
      } catch {
        if (!cancelled) toast.error('โหลดข้อมูลซ้ำไม่สำเร็จ');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">โรงเรียนชื่อซ้ำ (nameKey)</h1>
          <p className="text-sm text-gray-600 mt-1">
            กลุ่มที่มีคีย์ชื่อเดียวกันหลายแถว — ควรรวมหรือลบซ้ำในระบบจัดการโรงเรียน
          </p>
        </div>
        <BackNavLink href="/admin/dashboard">กลับแดชบอร์ด</BackNavLink>
      </div>

      {loading ? (
        <p className="text-gray-500">กำลังโหลด...</p>
      ) : groups.length === 0 ? (
        <p className="text-green-800 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          ไม่พบชื่อซ้ำในฐานข้อมูล
        </p>
      ) : (
        <div className="space-y-6">
          {groups.map((g) => (
            <div key={g.nameKey} className="border rounded-xl p-4 bg-white shadow-sm">
              <h2 className="font-semibold text-slate-800">
                {g.nameKey} <span className="text-gray-500 font-normal">({g.count} แถว)</span>
              </h2>
              <ul className="mt-3 space-y-2 text-sm">
                {g.schools.map((s) => (
                  <li
                    key={s.id}
                    className="flex flex-wrap items-baseline justify-between gap-2 border-b border-gray-100 pb-2 last:border-0"
                  >
                    <span className="font-medium">{s.name}</span>
                    <span className="text-gray-600">
                      {s.province} · {s.affiliation}
                    </span>
                    <InlineLink href={`/admin/schools/${s.id}/edit`} className="shrink-0">
                      แก้ไข
                    </InlineLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
