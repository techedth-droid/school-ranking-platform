'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import { resolveAssetUrl } from '@/lib/assets';
import { EyeIcon, ChevronUpIcon, ChevronDownIcon, ArrowLeftIcon, ArrowRightIcon, MapPinIconFull, SchoolIcon } from '@/components/Icons';

const LEVEL_COLOR = {
  A: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-200 dark:border-amber-800',
  B: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/50 dark:text-slate-200 dark:border-slate-600',
  C: 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-200 dark:border-yellow-800',
  D: 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800/60 dark:text-gray-300 dark:border-gray-600',
  E: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-200 dark:border-blue-800',
};

function SortIndicator({ active, direction }) {
  if (!active)
    return <ChevronDownIcon className="w-3.5 h-3.5 text-gray-300 ml-1 dark:text-gray-600" />;
  return direction === 'asc' ? (
    <ChevronUpIcon className="w-3.5 h-3.5 text-accent-600 ml-1 dark:text-accent-300" />
  ) : (
    <ChevronDownIcon className="w-3.5 h-3.5 text-accent-600 ml-1 dark:text-accent-300" />
  );
}

function ScoreMiniBar({ score, max = 20 }) {
  const pct = Math.min((score / max) * 100, 100);
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-sm font-semibold text-gray-900 tabular-nums w-12 text-right dark:text-gray-100">
        {score?.toFixed(2)}
      </span>
      <div className="hidden sm:block w-16 bg-gray-100 rounded-full h-1.5 dark:bg-gray-700">
        <div
          className="h-1.5 rounded-full bg-gradient-to-r from-accent-300 to-accent-600 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function SchoolLogo({ school }) {
  const logoUrl = resolveAssetUrl(school?.logoUrl);
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden">
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt={`โลโก้ ${school?.name || 'โรงเรียน'}`}
          width={40}
          height={40}
          className="h-full w-full object-contain"
          unoptimized
        />
      ) : (
        <SchoolIcon className="h-5 w-5 text-gray-300 dark:text-gray-600" />
      )}
    </span>
  );
}

export default function RankingTable({ filters = {} }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState('rank');
  const [order, setOrder] = useState('asc');
  const [limit, setLimit] = useState(20);

  const filterKey = JSON.stringify(filters);

  useEffect(() => {
    setPage(1);
  }, [filterKey, limit]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit, sortBy, order, ...filters };
      const { data } = await api.get('/api/ranking', { params });
      setRows(data.data);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }, [page, limit, sortBy, order, filters]);

  useEffect(() => {
    load();
  }, [load]);

  function toggleSort(col) {
    if (sortBy === col) setOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    else {
      setSortBy(col);
      setOrder('asc');
    }
  }

  const totalPages = Math.ceil(total / limit);

  if (loading) {
    return (
      <div className="space-y-3 mt-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl shimmer-bg" />
        ))}
      </div>
    );
  }

  return (
    <div className="mt-2 animate-fade-in">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">ตารางอันดับทั้งหมด</h2>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <label htmlFor="ranking-page-size" className="sr-only">จำนวนรายการต่อหน้า</label>
          <span>แสดง</span>
          <select
            id="ranking-page-size"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="appearance-none border border-muted-200 rounded-lg px-2.5 py-1.5 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-accent-200 cursor-pointer dark:border-main-800 dark:bg-main-900 dark:text-muted-200 dark:focus:ring-accent-800"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span>รายการ</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-muted-100 shadow-card overflow-hidden dark:bg-main-900/80 dark:border-main-800">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted-50/80 border-b border-muted-100 dark:bg-main-900/50 dark:border-main-800">
                <th
                  className="text-left px-4 sm:px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:text-gray-700 transition-colors dark:text-gray-400 dark:hover:text-gray-200"
                  onClick={() => toggleSort('rank')}
                >
                  <span className="inline-flex items-center">
                    อันดับ
                    <SortIndicator active={sortBy === 'rank'} direction={order} />
                  </span>
                </th>
                <th className="text-left px-4 sm:px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  โรงเรียน
                </th>
                <th className="text-left px-4 sm:px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell dark:text-gray-400">
                  จังหวัด
                </th>
                <th className="text-left px-4 sm:px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell dark:text-gray-400">
                  สังกัด
                </th>
                <th
                  className="text-left px-4 sm:px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:text-gray-700 transition-colors dark:text-gray-400 dark:hover:text-gray-200"
                  onClick={() => toggleSort('totalScore')}
                >
                  <span className="inline-flex items-center">
                    คะแนน
                    <SortIndicator active={sortBy === 'totalScore'} direction={order} />
                  </span>
                </th>
                <th
                  className="text-left px-4 sm:px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:text-gray-700 transition-colors dark:text-gray-400 dark:hover:text-gray-200"
                  onClick={() => toggleSort('level')}
                >
                  <span className="inline-flex items-center">
                    ระดับ
                    <SortIndicator active={sortBy === 'level'} direction={order} />
                  </span>
                </th>
                <th className="w-14 px-4 sm:px-5 py-3.5" scope="col">
                  <span className="sr-only">ดูรายละเอียด</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-muted-50 dark:divide-main-800">
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="group hover:bg-accent-50/30 transition-colors dark:hover:bg-accent-950/40"
                >
                  {/* Rank */}
                  <td className="px-4 sm:px-5 py-4">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-accent-50 text-accent-700 text-sm font-bold dark:bg-accent-950/60 dark:text-accent-200">
                      {r.rank}
                    </span>
                  </td>

                  {/* School name */}
                  <td className="px-4 sm:px-5 py-4">
                    <Link
                      href={`/schools/${r.school.id}`}
                      className="group/link inline-flex items-center gap-3 text-left max-w-full"
                    >
                      <SchoolLogo school={r.school} />
                      <span className="min-w-0">
                        <span className="block font-semibold text-gray-900 group-hover/link:text-accent-700 transition-colors dark:text-gray-100 dark:group-hover/link:text-accent-300">
                          {r.school.name}
                        </span>
                        {r.school.nameEn?.trim() && (
                          <span className="block text-xs text-gray-400 font-normal mt-0.5 truncate max-w-xs dark:text-gray-500">
                            {r.school.nameEn}
                          </span>
                        )}
                        {/* Mobile-only location */}
                        <span className="md:hidden flex items-center gap-1 text-xs text-gray-400 mt-1 dark:text-gray-500">
                          <MapPinIconFull className="w-3 h-3 shrink-0" />
                          {r.school.province}
                        </span>
                      </span>
                    </Link>
                  </td>

                  {/* Province (hidden mobile) */}
                  <td className="px-4 sm:px-5 py-4 hidden md:table-cell">
                    <span className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                      <MapPinIconFull className="w-3.5 h-3.5 text-gray-400 shrink-0 dark:text-gray-500" />
                      {r.school.province}
                    </span>
                  </td>

                  {/* Affiliation (hidden mobile/tablet) */}
                  <td className="px-4 sm:px-5 py-4 text-sm text-gray-600 hidden lg:table-cell dark:text-gray-400">
                    {r.school.affiliation}
                  </td>

                  {/* Score */}
                  <td className="px-4 sm:px-5 py-4">
                    <ScoreMiniBar score={r.totalScore} />
                  </td>

                  {/* Level */}
                  <td className="px-4 sm:px-5 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${LEVEL_COLOR[r.level] || 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600'}`}
                    >
                      {r.level}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="px-4 sm:px-5 py-4 text-center">
                    <Link
                      href={`/schools/${r.school.id}`}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-muted-400 hover:text-accent-600 hover:bg-accent-50 transition-all dark:hover:bg-accent-950/50 dark:hover:text-accent-300"
                      aria-label={`ดูรายละเอียด ${r.school.name}`}
                      title="ดูรายละเอียดโรงเรียน"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          ทั้งหมด <span className="font-semibold text-gray-700 dark:text-gray-200">{total}</span> โรงเรียน
          {totalPages > 1 && (
            <> · หน้า <span className="font-semibold text-gray-700 dark:text-gray-200">{page}</span> จาก {totalPages}</>
          )}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            ก่อนหน้า
          </button>
          <button
            type="button"
            disabled={page * limit >= total}
            onClick={() => setPage((p) => p + 1)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            ถัดไป
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
