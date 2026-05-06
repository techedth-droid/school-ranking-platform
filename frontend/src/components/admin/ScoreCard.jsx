import Link from 'next/link';

/**
 * Card representing a school in the admin scores list.
 * Props:
 *   - school: object containing id, name, nameEn, province, affiliation, isPublished, ranking
 */
export default function ScoreCard({ school }) {
  return (
    <Link
      href={`/admin/scores/${school.id}`}
      className="group flex flex-col h-full rounded-2xl border border-slate-200/90 bg-white/90 backdrop-blur-sm p-4 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
    >
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-slate-900 group-hover:text-indigo-900 transition-colors truncate">
          {school.name}
        </h3>
        {school.nameEn?.trim() && (
          <p className="text-xs text-slate-500 truncate mt-0.5">{school.nameEn}</p>
        )}
        <div className="flex flex-wrap gap-2 mt-2">
          <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {school.province}
          </span>
          <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {school.affiliation}
          </span>
          <span
            className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full ${
              school.isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-50 text-amber-800'
            }`}
          >
            {school.isPublished ? 'เผยแพร่' : 'ยังไม่เผยแพร่'}
          </span>
          {school.ranking?.level && (
            <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-medium">
              ระดับ {school.ranking.level}
            </span>
          )}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-end">
        <span className="inline-flex items-center justify-center rounded-xl bg-indigo-600 text-white text-sm font-medium px-5 py-2.5 shadow-sm group-hover:bg-indigo-700 transition-colors">
          บันทึกคะแนน
        </span>
      </div>
    </Link>
  );
}
