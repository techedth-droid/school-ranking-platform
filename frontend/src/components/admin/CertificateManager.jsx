'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import api from '@/lib/api';
import { toast } from 'sonner';
import { resolveAssetUrl } from '@/lib/assets';

/** @param {{ schoolId: string, readOnly?: boolean }} props */
export default function CertificateManager({ schoolId, readOnly = false }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/schools/${schoolId}/certificates`);
      setItems(data);
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
    if (readOnly) return;
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    if (title) fd.append('title', title);
    setUploading(true);
    try {
      await api.post(`/api/upload/certificate/${schoolId}`, fd);
      toast.success('อัปโหลดสำเร็จ');
      setTitle('');
      load();
    } catch (err) {
      toast.error(err?.response?.data?.error || 'อัปโหลดไม่สำเร็จ');
    } finally {
      setUploading(false);
    }
  }

  async function remove(id) {
    if (readOnly) return;
    if (!window.confirm('ลบรายการนี้?')) return;
    try {
      await api.delete(`/api/schools/${schoolId}/certificates/${id}`);
      toast.success('ลบแล้ว');
      load();
    } catch {
      toast.error('ลบไม่สำเร็จ');
    }
  }

  return (
    <div className="space-y-4">
      {readOnly ? (
        <p className="text-sm text-gray-600">
          ดูและดาวน์โหลดได้เท่านั้น — การเพิ่ม/ลบไฟล์ทำได้เฉพาะผู้ดูแลระบบ
        </p>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              ชื่อ/หัวข้อใบรับรองหรือโล่รางวัล (ไม่บังคับ)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น รางวัลโรงเรียนคุณภาพ ปี 2024"
              maxLength={200}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <label className="cursor-pointer inline-flex items-center justify-center border rounded-lg px-4 py-2 text-sm whitespace-nowrap hover:bg-gray-50">
            {uploading ? 'กำลังอัปโหลด...' : '+ เพิ่มไฟล์ (รูปหรือ PDF)'}
            <input
              type="file"
              accept="image/*,.pdf,application/pdf"
              className="hidden"
              disabled={uploading}
              onChange={onFile}
            />
          </label>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-500">ยังไม่มีใบรับรองหรือโล่รางวัล</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {items.map((c) => {
            const url = resolveAssetUrl(c.fileUrl);
            const isPdf = c.fileType === 'pdf';
            return (
              <div key={c.id} className="relative group border rounded-lg bg-white overflow-hidden flex flex-col">
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="block aspect-square bg-gray-50 flex items-center justify-center shrink-0"
                >
                  {isPdf || !url ? (
                    <div className="text-center">
                      <div className="text-3xl">📄</div>
                      <div className="text-xs font-semibold text-rose-600 mt-1">PDF</div>
                    </div>
                  ) : (
                    <div className="relative w-full h-full">
                      <Image
                        src={url}
                        alt={c.title || 'certificate'}
                        fill
                        sizes="(max-width: 640px) 50vw, 25vw"
                        className="object-contain p-2"
                        unoptimized
                      />
                    </div>
                  )}
                </a>
                {c.title ? (
                  <div className="p-1.5 text-xs text-gray-700 truncate border-t" title={c.title}>
                    {c.title}
                  </div>
                ) : null}
                {readOnly ? (
                  <div className="flex border-t text-xs divide-x divide-gray-100">
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 text-center py-2 text-xs font-semibold text-accent-700 transition-colors hover:bg-accent-50"
                    >
                      เปิดดู
                    </a>
                    <a
                      href={url}
                      download
                      className="flex-1 text-center py-2 text-xs font-semibold text-muted-700 transition-colors hover:bg-muted-50"
                    >
                      ดาวน์โหลด
                    </a>
                  </div>
                ) : null}
                {!readOnly ? (
                  <button
                    type="button"
                    onClick={() => remove(c.id)}
                    className="absolute top-1.5 right-1.5 bg-white/90 text-red-600 text-xs px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 hover:bg-white"
                    aria-label="ลบ"
                  >
                    ลบ
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
