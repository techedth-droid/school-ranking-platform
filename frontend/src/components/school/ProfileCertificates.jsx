'use client';

import Image from 'next/image';
import { resolveAssetUrl } from '@/lib/assets';

function PdfIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="w-12 h-12 text-rose-500"
      fill="currentColor"
      aria-hidden
    >
      <path d="M6 2a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6H6zm7 1.5L18.5 9H14a1 1 0 01-1-1V3.5z" />
      <text x="6" y="18" fontSize="6" fill="white" fontWeight="bold">PDF</text>
    </svg>
  );
}

export default function ProfileCertificates({ certificates = [] }) {
  if (!certificates.length) {
    return <p className="text-sm text-gray-500">ยังไม่มีใบรับรองหรือโล่รางวัล</p>;
  }

  return (
    <div className="space-y-3">
      {certificates.map((cert) => {
        const url = resolveAssetUrl(cert.fileUrl);
        const isPdf = cert.fileType === 'pdf';
        return (
          <a
            key={cert.id}
            href={url}
            target="_blank"
            rel="noreferrer"
            className="group block w-full border rounded-xl overflow-hidden bg-white hover:shadow-md transition"
            title={cert.title || 'เปิดเอกสาร'}
          >
            <div className="relative aspect-[16/9] bg-gray-50 flex items-center justify-center">
              {isPdf || !url ? (
                <PdfIcon />
              ) : (
                <Image
                  src={url}
                  alt={cert.title || 'ใบรับรอง'}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover transition group-hover:scale-105"
                  unoptimized
                />
              )}
            </div>
          </a>
        );
      })}
    </div>
  );
}
