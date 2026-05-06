'use client';

import { useCallback, useEffect, useState } from 'react';
import { BackNavLink, InlineLink } from '@/components/ui/NavLinks';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/admin/users', {
        params: {
          limit: 80,
          ...(search.trim() ? { search: search.trim() } : {}),
          ...(role ? { role } : {}),
        },
      });
      setRows(data.data);
      setTotal(data.total);
    } catch {
      toast.error('โหลดผู้ใช้ไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }, [search, role]);

  useEffect(() => {
    const t = setTimeout(() => load(), 300);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-6">
        <BackNavLink href="/admin/dashboard">แดชบอร์ด</BackNavLink>
        <h1 className="text-2xl font-bold mt-2">ผู้ใช้ในระบบ</h1>
        <p className="text-sm text-gray-600 mt-1">บัญชีแอดมินและผู้ดูแลโรงเรียน</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="search"
          placeholder="ค้นหาอีเมลหรือชื่อโรงเรียน..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] border rounded px-3 py-2 text-sm"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border rounded px-3 py-2 bg-white text-sm"
        >
          <option value="">ทุกบทบาท</option>
          <option value="ADMIN">ADMIN</option>
          <option value="SCHOOL_ADMIN">SCHOOL_ADMIN</option>
        </select>
      </div>

      {loading ? (
        <p className="text-gray-500">กำลังโหลด...</p>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-2">ทั้งหมด {total} บัญชี</p>
          <div className="border rounded-lg overflow-hidden bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-4 py-2 font-medium">อีเมล</th>
                  <th className="px-4 py-2 font-medium">บทบาท</th>
                  <th className="px-4 py-2 font-medium">โรงเรียน</th>
                  <th className="px-4 py-2 font-medium">สร้างเมื่อ</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/80">
                    <td className="px-4 py-2">{u.email}</td>
                    <td className="px-4 py-2">
                      <span
                        className={
                          u.role === 'ADMIN' ? 'text-purple-800 font-medium' : 'text-slate-700'
                        }
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {u.school ? (
                        <InlineLink href={`/admin/schools/${u.school.id}/edit`}>
                          {u.school.name}
                        </InlineLink>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString('th-TH')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
