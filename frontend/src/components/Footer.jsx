import Image from 'next/image';
import Link from 'next/link';
import { PhoneIcon, MailIcon, MapPinIconFull } from '@/components/Icons';

const NAV_LINKS = [
  { href: '/', label: 'อันดับโรงเรียน' },
  { href: '/about', label: 'เกี่ยวกับโครงการ' },
  { href: '/benefits', label: 'สิ่งที่โรงเรียนจะได้รับ' },
  { href: '/school/register', label: 'ลงทะเบียนโรงเรียน' },
  { href: '/admin/login', label: 'ผู้ดูแลระบบ' },
];

const TIIS_LOGO = '/images/logo/TIIS%20%20Logo.png';

export default function Footer() {
  return (
    <footer className="mt-auto bg-[#151515] text-white">
      <div className="mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-3">
          <div className="px-6 py-8 lg:py-10">
            <div className="flex items-center pb-6">
              <div className="relative h-28 w-[460px] max-w-full">
                <Image
                  src={TIIS_LOGO}
                  alt="TIIS Logo"
                  fill
                  className="object-contain object-left brightness-0 invert"
                  sizes="280px"
                />
              </div>
            </div>

            <div className="pb-4">
              <p className="text-xs font-semibold tracking-wide text-white/65">
                สนับสนุนโดย
              </p>
              <p className="text-sm font-extrabold text-white">
                เทค อินฟินิตี้ อินเตอร์เนชั่นแนล โซลูชั่น
              </p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-white/70">
                Tech Infinity International Solution Co.,Ltd.
              </p>
            </div>

            <div className="pt-4">
              <h4 className="text-sm font-extrabold text-white">เกี่ยวกับเรา</h4>
              <p className="mt-3 text-sm leading-relaxed text-white/80">
                ผู้นำเข้าและจัดจำหน่ายโซลูชั่นเทคโนโลยีขั้นสูง ส่งเสริมการศึกษาและพัฒนาเมืองอัจฉริยะในประเทศไทย
              </p>
              <p className="mt-3 text-xs text-white/70">ทะเบียนนิติบุคคล : 0105567150406</p>
            </div>
          </div>

          <div className="px-6 py-8 lg:py-10">
            <h4 className="text-base font-extrabold text-white">ช่องทางติดต่อ</h4>

            <div className="mt-5 space-y-5">
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.08]">
                  <PhoneIcon className="h-5 w-5 text-accent-300" />
                </span>
                <div>
                  <p className="text-lg font-extrabold leading-tight text-white">02-681-9799</p>
                  <p className="mt-1 text-sm font-medium text-white/75">จันทร์ - ศุกร์ เวลา 08.30 - 16.30 น.</p>
                </div>
              </div>

              <a href="mailto:info@th-tiis.com" className="flex items-center gap-4 transition-opacity hover:opacity-90">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.08]">
                  <MailIcon className="h-5 w-5 text-accent-300" />
                </span>
                <p className="text-lg font-extrabold text-white">info@th-tiis.com</p>
              </a>

              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.08]">
                  <MapPinIconFull className="h-5 w-5 text-accent-300" />
                </span>
                <p className="text-sm font-semibold leading-relaxed text-white/80">
                  25 อาคารวิริยา ลิงค์ ชั้น 17 ห้อง 10<br />
                  ซ.ชิดลม ถ.เพลินจิต แขวงลุมพินี<br />
                  เขตปทุมวัน กรุงเทพฯ 10330
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-8 lg:py-10">
            <h4 className="text-base font-extrabold text-white">ลิงก์ด่วน</h4>

            <ul className="mt-5 space-y-5">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="inline-flex items-center gap-3 text-sm font-semibold text-white/80 transition-colors hover:text-white"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="px-6 py-4 text-center text-xs text-white/50 sm:flex sm:items-center sm:justify-between sm:text-left">
          <p>© {new Date().getFullYear()} SCEE Rankings — ครอบคลุมทุกจังหวัดทั่วราชอาณาจักรไทย</p>
          <p className="mt-2 sm:mt-0">โรงเรียนประถมศึกษาและมัธยมศึกษา ภาครัฐและเอกชน</p>
        </div>
      </div>
    </footer>
  );
}
