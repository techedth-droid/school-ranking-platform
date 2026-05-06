'use client';

import { useState } from 'react';
import Image from 'next/image';
import { resolveAssetUrl } from '@/lib/assets';

export default function ProfileGallery({ images = [] }) {
  const [active, setActive] = useState(null);

  if (!images.length) {
    return (
      <p className="text-sm text-gray-500">ยังไม่มีภาพกิจกรรม Smart Classroom</p>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {images.slice(0, 5).map((img, idx) => {
          const url = resolveAssetUrl(img.url);
          if (!url) return null;
          return (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive({ ...img, url })}
              className="group relative w-full overflow-hidden rounded-xl border bg-gray-100 hover:ring-2 hover:ring-blue-300"
              aria-label={img.caption || `รูปกิจกรรม ${idx + 1}`}
            >
              <div className="relative w-full aspect-[16/9]">
              <Image
                src={url}
                alt={img.caption || `รูปกิจกรรม ${idx + 1}`}
                fill
                sizes="(max-width: 640px) 50vw, 20vw"
                className="object-cover transition group-hover:scale-105"
                unoptimized
              />
              </div>
              {img.caption ? (
                <span className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent text-white text-xs p-2 line-clamp-2">
                  {img.caption}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {active ? (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setActive(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative max-w-4xl w-full max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setActive(null)}
              className="absolute -top-10 right-0 text-white/90 hover:text-white text-sm"
              aria-label="ปิด"
            >
              ปิด ✕
            </button>
            <div className="relative w-full bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16 / 10' }}>
              <Image
                src={active.url}
                alt={active.caption || 'รูปกิจกรรม'}
                fill
                sizes="100vw"
                className="object-contain"
                unoptimized
              />
            </div>
            {active.caption ? (
              <p className="text-white text-sm mt-3 text-center">{active.caption}</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
