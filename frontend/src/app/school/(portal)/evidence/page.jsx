'use client';

import { useCallback, useEffect, useState } from 'react';
import api from '@/lib/api';
import { useSchoolPortal } from '@/contexts/SchoolPortalContext';
import { toast } from 'sonner';

function fileUrl(storedName) {
  if (/^https?:\/\//i.test(storedName || '')) return storedName;
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';
  return `${base}/uploads/${storedName.replace(/^\//, '')}`;
}

export default function SchoolEvidencePage() {
  const { schoolId } = useSchoolPortal();
  const [rows, setRows] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/schools/${schoolId}/evidence`);
      setRows(data);
    } catch {
      toast.error('โหลดรายการไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    load();
  }, [load]);

  async function onFile(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    setUploading(true);
    try {
      await api.post(`/api/upload/evidence/${schoolId}`, fd);
      toast.success('อัปโหลดแล้ว');
      load();
    } catch {
      toast.error('อัปโหลดไม่สำเร็จ');
    } finally {
      setUploading(false);
    }
  }

  async function remove(id) {
    if (!window.confirm('ลบไฟล์นี้?')) return;
    try {
      await api.delete(`/api/schools/${schoolId}/evidence/${id}`);
      toast.success('ลบแล้ว');
      load();
    } catch {
      toast.error('ลบไม่สำเร็จ');
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">หลักฐานประกอบ</h1>
      <p className="text-sm text-gray-600">อัปโหลดรูปภาพ PDF หรือเอกสาร Word ขนาดไม่เกินกำหนดของระบบ</p>
      <div>
        <label className="inline-block">
          <span className="sr-only">อัปโหลด</span>
          <input
            type="file"
            className="text-sm"
            accept="image/*,.pdf,.doc,.docx"
            disabled={uploading}
            onChange={onFile}
          />
        </label>
        {uploading && <span className="ml-2 text-sm text-gray-500">กำลังอัปโหลด...</span>}
      </div>
      {loading ? (
        <div className="h-24 bg-gray-100 rounded animate-pulse" />
      ) : rows.length === 0 ? (
        <p className="text-gray-500 text-sm">ยังไม่มีไฟล์</p>
      ) : (
        <ul className="border rounded-lg divide-y bg-white">
          {rows.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
              <div>
                <a
                  href={fileUrl(r.storedName)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {r.originalName}
                </a>
                <div className="text-xs text-gray-500">
                  {new Date(r.createdAt).toLocaleString('th-TH')}
                </div>
              </div>
              <button
                type="button"
                onClick={() => remove(r.id)}
                className="text-red-600 text-sm hover:underline"
              >
                ลบ
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
