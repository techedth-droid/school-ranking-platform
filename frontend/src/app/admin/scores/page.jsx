'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { BackNavLink } from '@/components/ui/NavLinks';
import { toast } from 'sonner';
import ScoreCard from '@/components/admin/ScoreCard';

export default function AdminScoresIndexPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [sortBy, setSortBy] = useState('name'); // name, province, published, rank
  const [sortDir, setSortDir] = useState('asc'); // asc or desc
  const [statusFilter, setStatusFilter] = useState('all'); // all, published, unpublished

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        const { data } = await api.get('/api/schools/all', { params: { limit: 100 } });
        if (!c) setRows(data.data || []);
      } catch {
        toast.error('โหลดข้อมูลไม่สำเร็จ');
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    let result = rows;
    if (s) {
      result = result.filter(
        (r) =>
          r.name?.toLowerCase().includes(s) ||
          r.nameEn?.toLowerCase().includes(s) ||
          r.province?.toLowerCase().includes(s)
      );
    }
    // status filter
    if (statusFilter === 'published') {
      result = result.filter((r) => r.isPublished);
    } else if (statusFilter === 'unpublished') {
      result = result.filter((r) => !r.isPublished);
    }
    // sorting
    result = result.slice().sort((a, b) => {
      let valA, valB;
      switch (sortBy) {
        case 'province':
          valA = a.province?.toLowerCase() ?? '';
          valB = b.province?.toLowerCase() ?? '';
          break;
        case 'published':
          valA = a.isPublished ? 1 : 0;
          valB = b.isPublished ? 1 : 0;
          break;
        case 'rank':
          valA = a.ranking?.level ?? '';
          valB = b.ranking?.level ?? '';
          break;
        default:
          // name
          valA = a.name?.toLowerCase() ?? '';
          valB = b.name?.toLowerCase() ?? '';
      }
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [rows, q, sortBy, sortDir, statusFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-indigo-50/30">
        <div className="max-w-5xl mx-auto px-4 py-10 sm:py-14">
          <div className="h-8 w-48 bg-white/60 rounded-lg animate-pulse mb-6" />
          <div className="h-32 bg-white/70 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50/40">
      <div className="max-w-5xl mx-auto px-4 py-10 sm:py-12 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <BackNavLink href="/admin/schools" className="text-sm">
              รายการโรงเรียน
            </BackNavLink>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mt-3">
              บันทึกคะแนนประเมิน
            </h1>
            <p className="text-slate-600 mt-2 max-w-xl text-sm sm:text-base">
              เลือกโรงเรียนเพื่อกรอกคะแนน 0–4 ตามหมวด A–E ระบบจะคำนวณอันดับหลังบันทึก
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link
              href="/admin/dashboard"
              className="text-sm border border-slate-200 bg-white/80 text-slate-700 rounded-xl px-4 py-2.5 shadow-sm hover:bg-slate-50 transition"
            >
              แดชบอร์ด
            </Link>
            <Link
              href="/admin/schools/create"
              className="text-sm bg-indigo-600 text-white rounded-xl px-4 py-2.5 shadow-md shadow-indigo-200 hover:bg-indigo-700 transition"
            >
              + โรงเรียน
            </Link>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          <div className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-sm p-4 shadow-sm">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">ทั้งหมด</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{rows.length}</div>
            <div className="text-xs text-slate-500 mt-1">โรงเรียนในระบบ</div>
          </div>
          <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-4 shadow-sm">
            <div className="text-xs font-medium text-emerald-700 uppercase tracking-wide">เผยแพร่</div>
            <div className="text-2xl font-bold text-emerald-900 mt-1">
              {rows.filter((r) => r.isPublished).length}
            </div>
            <div className="text-xs text-emerald-700/80 mt-1">แสดงในอันดับสาธารณะ</div>
          </div>
          <div className="rounded-2xl border border-indigo-200/80 bg-indigo-50/50 p-4 shadow-sm sm:col-span-1">
            <div className="text-xs font-medium text-indigo-700 uppercase tracking-wide">ค้นหา</div>
            <label className="mt-2 block">
              <span className="sr-only">ค้นหาโรงเรียน</span>
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="ชื่อโรงเรียน จังหวัด..."
                className="w-full rounded-xl border border-indigo-100 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300"
              />
            </label>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-12 text-center">
            <div className="text-4xl mb-3" aria-hidden>
              📋
            </div>
            <p className="text-slate-600 font-medium">ไม่พบโรงเรียนที่ตรงกับการค้นหา</p>
            <p className="text-sm text-slate-500 mt-1">ลองเปลี่ยนคำค้นหา หรือเพิ่มโรงเรียนใหม่</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((s) => (
              <ScoreCard key={s.id} school={s} />
            ))}
          </div>        )}
      </div>
    </div>
  );
}
