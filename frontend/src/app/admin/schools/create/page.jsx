'use client';

import { useState } from 'react';
import { BackNavLink } from '@/components/ui/NavLinks';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import SchoolForm from '@/components/admin/SchoolForm';
import { toast } from 'sonner';

export default function CreateSchoolPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(form) {
    setLoading(true);
    try {
      await api.post('/api/schools', form);
      toast.success('สร้างโรงเรียนสำเร็จ');
      router.push('/admin/schools');
    } catch {
      toast.error('สร้างไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center gap-4 mb-4">
        <BackNavLink href="/admin/schools">กลับ</BackNavLink>
        <h1 className="text-2xl font-bold">เพิ่มโรงเรียน</h1>
      </div>
      <SchoolForm onSubmit={handleSubmit} loading={loading} submitLabel="สร้างโรงเรียน" />
    </div>
  );
}
