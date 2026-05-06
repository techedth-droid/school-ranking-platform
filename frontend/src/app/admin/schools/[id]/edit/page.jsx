'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BackNavLink, ForwardNavLink } from '@/components/ui/NavLinks';
import api from '@/lib/api';
import SchoolForm from '@/components/admin/SchoolForm';
import LogoUpload from '@/components/admin/LogoUpload';
import BannerUpload from '@/components/admin/BannerUpload';
import GalleryManager from '@/components/admin/GalleryManager';
import CertificateManager from '@/components/admin/CertificateManager';
import OfficialCertificateUpload from '@/components/admin/OfficialCertificateUpload';
import SchoolAdminInvite from '@/components/admin/SchoolAdminInvite';
import { toast } from 'sonner';

export default function EditSchoolPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get(`/api/schools/${id}`);
        if (!cancelled) setSchool(data);
      } catch {
        toast.error('โหลดข้อมูลไม่สำเร็จ');
        router.push('/admin/schools');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, router]);

  async function handleSubmit(form) {
    setSaving(true);
    try {
      await api.patch(`/api/schools/${id}`, form);
      toast.success('บันทึกแล้ว');
      router.push('/admin/schools');
    } catch {
      toast.error('บันทึกไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  }

  if (loading || !school) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="h-40 bg-gray-100 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
        <div className="flex items-center gap-4">
          <BackNavLink href="/admin/schools">กลับ</BackNavLink>
          <h1 className="text-2xl font-bold">แก้ไขโรงเรียน</h1>
        </div>
        <ForwardNavLink href={`/schools/${school.id}`} external className="px-3 py-1.5 text-sm">
          ดูหน้าโปรไฟล์
        </ForwardNavLink>
      </div>
      <section>
        <h2 className="font-semibold mb-3">โลโก้</h2>
        <LogoUpload schoolId={school.id} currentUrl={school.logoUrl} />
      </section>
      <section>
        <h2 className="font-semibold mb-3">ภาพแบนเนอร์</h2>
        <BannerUpload
          schoolId={school.id}
          currentUrl={school.bannerUrl}
          onChange={(bannerUrl) => setSchool((s) => ({ ...s, bannerUrl }))}
        />
      </section>
      <section>
        <h2 className="font-semibold mb-3">ใบรับรอง PDF (ฉบับจริงสำหรับแอดมินโรงเรียน)</h2>
        <OfficialCertificateUpload
          schoolId={school.id}
          hasPdf={Boolean(school.certificatePdfUrl)}
          onUploaded={async () => {
            try {
              const { data } = await api.get(`/api/schools/${school.id}`);
              setSchool(data);
            } catch {
              /* ignore */
            }
          }}
        />
      </section>
      <SchoolForm initial={school} onSubmit={handleSubmit} loading={saving} submitLabel="บันทึกการแก้ไข" />
      <section>
        <h2 className="font-semibold mb-3">ภาพกิจกรรม Smart Classroom (สูงสุด 5 ภาพ)</h2>
        <GalleryManager schoolId={school.id} />
      </section>
      <section>
        <h2 className="font-semibold mb-3">ใบรับรองและโล่รางวัล</h2>
        <CertificateManager schoolId={school.id} />
      </section>
      <SchoolAdminInvite schoolId={school.id} />
      <div>
        <ForwardNavLink href={`/admin/scores/${school.id}`} className="text-sm">
          ไปกรอกคะแนน (ผู้ดูแลระบบ)
        </ForwardNavLink>
      </div>
    </div>
  );
}
