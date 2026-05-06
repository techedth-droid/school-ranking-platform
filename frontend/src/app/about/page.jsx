import Link from 'next/link';
import Image from 'next/image';
import { ChartBarIcon, SchoolIcon } from '@/components/Icons';
import { BackNavLink } from '@/components/ui/NavLinks';

const GALLERY_FILES = [
  'IMG_2386.png',
  'IMG_2163.png',
  'IMG_2374.png',
  'IMG_2194.png',
  'IMG_2397.png',
  'IMG_2197.png',
];

export const metadata = {
  title: 'เกี่ยวกับโครงการ — SCEE Rankings',
  description:
    'Smart Classroom Equity Evaluation (SCEE) — เกณฑ์ประเมินความพร้อมและความเสมอภาคของห้องเรียนอัจฉริยะในทุกจังหวัดทั่วประเทศ',
};

const CRITERIA = [
  { letter: 'A', title: 'โครงสร้างพื้นฐานและอุปกรณ์', note: 'ความพร้อมของห้องเรียนอัจฉริยะและอุปกรณ์' },
  { letter: 'B', title: 'การใช้เทคโนโลยีในการเรียนการสอนแบบโต้ตอบ', note: 'การนำ IFP / Smart Classroom ไปใช้ในชั้นเรียน' },
  { letter: 'C', title: 'การพัฒนาครูและบุคลากร', note: 'การอบรม ความรู้ และการสนับสนุน' },
  { letter: 'D', title: 'การบริหารจัดการและนโยบาย', note: 'แผนงาน ระเบียบ และการดำเนินงานในโรงเรียน' },
  { letter: 'E', title: 'ความเสมอภาคของการเข้าถึงและการใช้ห้องเรียนอัจฉริยะ', note: 'การกระจายโอกาสให้ผู้เรียนอย่างเป็นธรรม' },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-main-700 via-main-800 to-main-950">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <BackNavLink href="/" variant="hero">
            กลับหน้าอันดับ
          </BackNavLink>
          <div className="mt-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
              <ChartBarIcon className="h-7 w-7 text-accent-300" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-white/60">SCEE Rankings</p>
              <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                เกี่ยวกับโครงการ
              </h1>
            </div>
          </div>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/70">
            <strong className="text-white">Smart Classroom Equity Evaluation (SCEE)</strong> เป็นกรอบการประเมินที่ใช้ดูความพร้อมและความเป็นธรรมในการเข้าถึงห้องเรียนอัจฉริยะ (Smart
            Classroom) ของโรงเรียน เพื่อให้ข้อมูลสำหรับผู้บริหารและผู้สนใจนโยบายการศึกษาในระดับประเทศ
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 w-full sm:h-12">
            <path
              d="M0 48h1440V24c-240-32-480-32-720 0S240-8 0 24v24z"
              className="fill-muted-50 dark:fill-main-950"
            />
          </svg>
        </div>
      </section>

      <div className="mx-auto max-w-4xl space-y-14 px-4 py-12 sm:px-6 lg:px-8">
        {/* วัตถุประสงค์ */}
        <section className="animate-fade-in">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-100 text-accent-800 dark:bg-accent-950/50 dark:text-accent-200">
              <SchoolIcon className="h-5 w-5" />
            </span>
            วัตถุประสงค์
          </h2>
          <ul className="mt-5 space-y-3 text-gray-700 dark:text-gray-300">
            <li className="flex gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
              <span>
                สะท้อนความพร้อมของโรงเรียนในการจัดการเรียนการสอนด้วยห้องเรียนอัจฉริยะ และการใช้เทคโนโลยีแบบโต้ตอบอย่างเป็นระบบ
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
              <span>
                วัดความเสมอภาคในการเข้าถึงการเรียนรู้ของผู้เรียน ไม่ให้เกิดช่องว่างระหว่างโรงเรียนหรือกลุ่มผู้เรียน
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
              <span>
                จัดทำอันดับและข้อมูลเปรียบเทียบที่โปร่งใส เพื่อใช้เป็นข้อมูลประกอบการพัฒนานโยบายและการสนับสนุนโรงเรียน
              </span>
            </li>
          </ul>
        </section>

        {/* ขอบเขต */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-card dark:border-gray-800 dark:bg-gray-900/60">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">ขอบเขตและกลุ่มเป้าหมาย</h2>
          <div className="mt-4 space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <p>
              <strong className="text-gray-900 dark:text-white">พื้นที่:</strong> ครอบคลุมทุกจังหวัดทั่วราชอาณาจักรไทย
            </p>
            <p>
              <strong className="text-gray-900 dark:text-white">ระดับการศึกษา:</strong> โรงเรียนประถมศึกษาและมัธยมศึกษา
            </p>
            <p>
              <strong className="text-gray-900 dark:text-white">สังกัด:</strong> ทั้งภาครัฐ (เช่น สพฐ., อปท.) และภาคเอกชน (เอกชน, สช.)
            </p>
          </div>
        </section>

        {/* เกณฑ์หลัก */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">เกณฑ์การประเมิน (หมวด A–E)</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            คะแนนรวมถูกนำไปจัดระดับสรุปเป็น A–E เพื่อให้เห็นภาพรวมของแต่ละโรงเรียน
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {CRITERIA.map((c) => (
              <div
                key={c.letter}
                className="rounded-xl border border-gray-100 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-gray-900/40"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-main text-sm font-bold text-contrast">
                    {c.letter}
                  </span>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{c.title}</h3>
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{c.note}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ภาพประกอบโครงการ */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">ภาพประกอบโครงการ</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            ภาพจากกิจกรรมและบริบทโรงเรียนที่เกี่ยวข้องกับการประเมินห้องเรียนอัจฉริยะ (SCEE)
          </p>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {GALLERY_FILES.map((file) => (
              <div
                key={file}
                className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900/50"
              >
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src={`/images/scee/${file}`}
                    alt=""
                    fill
                    className="object-cover transition-transform duration-300 ease-out will-change-transform group-hover:scale-[1.04]"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-2xl bg-gradient-to-br from-main-700 to-main-950 px-6 py-8 text-center text-contrast">
          <p className="text-lg font-semibold">พร้อมดูอันดับหรือลงทะเบียนโรงเรียน?</p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl bg-contrast px-5 py-2.5 text-sm font-semibold text-main-900 shadow-md transition hover:bg-accent-50"
            >
              ดูอันดับโรงเรียน
            </Link>
            <Link
              href="/school/register"
              className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold backdrop-blur-sm transition hover:bg-white/20"
            >
              ลงทะเบียนโรงเรียน
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
