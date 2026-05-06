'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useSchoolPortal } from '@/contexts/SchoolPortalContext';
import { toast } from 'sonner';
import BannerUpload from '@/components/admin/BannerUpload';
import GalleryManager from '@/components/admin/GalleryManager';
import CertificateManager from '@/components/admin/CertificateManager';
import { ForwardNavLink, InlineLink } from '@/components/ui/NavLinks';

export default function SchoolProfileManagePage() {
  const { schoolId } = useSchoolPortal();
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!schoolId) return;
    let c = false;
    (async () => {
      try {
        const { data } = await api.get(`/api/schools/${schoolId}`);
        if (!c) {
          setSchool(data);
          setDescription(data.description || '');
        }
      } catch {
        toast.error('โหลดข้อมูลไม่สำเร็จ');
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [schoolId]);

  async function saveDescription() {
    setSaving(true);
    try {
      await api.patch(`/api/schools/${schoolId}`, { description });
      toast.success('บันทึกคำอธิบายแล้ว');
    } catch {
      toast.error('บันทึกไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  }

  if (loading || !school) {
    return <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">หน้าโปรไฟล์โรงเรียน</h1>
          <p className="text-sm text-gray-600 mt-1">
            จัดการเนื้อหาที่จะแสดงในหน้าสาธารณะของโรงเรียน
          </p>
        </div>
        <ForwardNavLink href={`/schools/${school.id}`} external className="px-4 py-2 text-sm">
          ดูหน้าสาธารณะ
        </ForwardNavLink>
      </div>

      <Section title="ภาพแบนเนอร์" hint="ภาพหัวเพจของหน้าโรงเรียน">
        <BannerUpload
          schoolId={school.id}
          currentUrl={school.bannerUrl}
          onChange={(bannerUrl) => setSchool((s) => ({ ...s, bannerUrl }))}
        />
      </Section>

      <Section title="คำอธิบายโรงเรียน" hint="แสดงในหน้าโปรไฟล์สาธารณะ">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          maxLength={2000}
          className="w-full border rounded-lg px-3 py-2 text-sm resize-y min-h-[8rem]"
          placeholder="แนะนำโรงเรียน วิสัยทัศน์ จุดเด่น..."
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-500">{description.length}/2000</span>
          <button
            type="button"
            onClick={saveDescription}
            disabled={saving}
            className="bg-blue-600 text-white text-sm rounded-lg px-4 py-2 hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'กำลังบันทึก...' : 'บันทึกคำอธิบาย'}
          </button>
        </div>
      </Section>

      <Section title="ภาพกิจกรรม Smart Classroom" hint="สูงสุด 5 ภาพ">
        <GalleryManager schoolId={school.id} />
      </Section>

      <Section title="ใบรับรองและโล่รางวัล" hint="ดูและดาวน์โหลดได้เท่านั้น (จัดการไฟล์ผ่านผู้ดูแลระบบ)">
        <CertificateManager schoolId={school.id} readOnly />
      </Section>

      <Section title="ข้อมูลติดต่อและรายละเอียดอื่น">
        <p className="text-sm text-gray-600">
          แก้ไขจังหวัด สังกัด ที่อยู่ เบอร์โทรและช่องทางติดต่อได้จากหน้า{' '}
          <InlineLink href="/school/edit">
            ข้อมูลโรงเรียน
          </InlineLink>
        </p>
      </Section>
    </div>
  );
}

function Section({ title, hint, children }) {
  return (
    <section className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 sm:p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {hint ? <p className="text-xs text-gray-500 mt-0.5">{hint}</p> : null}
      </div>
      {children}
    </section>
  );
}
