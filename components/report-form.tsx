'use client';

import { useState } from 'react';
import { Loader2, Download } from 'lucide-react';
import { NumerologyReport } from '@/lib/numerology';
import clsx from 'clsx';

type Props = {
  email: string;
  initialFullName?: string | null;
  initialBirthDate?: string | null;
  initialReport?: NumerologyReport | null;
};

type State =
  | { status: 'idle'; report?: NumerologyReport }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; report: NumerologyReport };

export function ReportForm({ email, initialFullName, initialBirthDate, initialReport }: Props) {
  const [fullName, setFullName] = useState(initialFullName ?? '');
  const [birthDate, setBirthDate] = useState(initialBirthDate ?? '');
  const [state, setState] = useState<State>(
    initialReport ? { status: 'idle', report: initialReport } : { status: 'idle' }
  );
  const [downloads, setDownloads] = useState<{ pdf?: string; docx?: string }>({});

  const hasReport = state.status === 'success' || state.status === 'idle';
  const report =
    state.status === 'success'
      ? state.report
      : state.status === 'idle'
        ? (state as { report?: NumerologyReport }).report
        : undefined;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState({ status: 'loading' });
    setDownloads({});

    try {
      const resp = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, birthDate, email })
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.error ?? 'Không thể tạo báo cáo, vui lòng thử lại.');
      }

      const data: {
        report: NumerologyReport;
        files: { pdf: string; docx: string };
      } = await resp.json();

      const pdfUrl = makeDownloadUrl(data.files.pdf, 'application/pdf');
      const docxUrl = makeDownloadUrl(
        data.files.docx,
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      );

      setDownloads({ pdf: pdfUrl, docx: docxUrl });
      setState({ status: 'success', report: data.report });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định.';
      setState({ status: 'error', message });
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
      <form
        onSubmit={handleSubmit}
        className="gradient relative overflow-hidden rounded-3xl border border-white/20 bg-white/80 p-8 shadow-xl backdrop-blur"
      >
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Thông tin cá nhân</h2>
          <p className="mt-2 text-sm text-gray-500">
            Chúng tôi sử dụng dữ liệu này để tạo báo cáo thần số học chuyên sâu và gửi về email của bạn.
          </p>
        </div>

        <label className="mb-5 block text-sm font-medium text-gray-700">
          Họ tên đầy đủ
          <input
            type="text"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            required
            placeholder="Ví dụ: Nguyễn Văn A"
            className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </label>

        <label className="mb-5 block text-sm font-medium text-gray-700">
          Ngày sinh
          <input
            type="date"
            value={birthDate ?? ''}
            onChange={(event) => setBirthDate(event.target.value)}
            required
            className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </label>

        <label className="mb-5 block text-sm font-medium text-gray-700">
          Email nhận báo cáo
          <input
            type="email"
            value={email}
            readOnly
            className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-500 shadow-sm"
          />
        </label>

        <button
          type="submit"
          className={clsx(
            'mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-base font-semibold text-white shadow-lg transition',
            state.status === 'loading' ? 'bg-indigo-300' : 'bg-indigo-600 hover:bg-indigo-500'
          )}
          disabled={state.status === 'loading'}
        >
          {state.status === 'loading' ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Đang tạo báo cáo...
            </>
          ) : (
            <>
              <Download className="h-5 w-5" />
              Báo cáo Thần số học
            </>
          )}
        </button>

        {state.status === 'error' ? (
          <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-600">{state.message}</p>
        ) : null}

        {state.status === 'success' ? (
          <div className="mt-6 flex flex-col gap-3 text-sm text-gray-600">
            <a
              href={downloads.pdf}
              download="bao-cao-than-so-hoc.pdf"
              className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 font-medium text-indigo-700 transition hover:bg-indigo-100"
            >
              <Download className="h-4 w-4" />
              Tải PDF
            </a>
            <a
              href={downloads.docx}
              download="bao-cao-than-so-hoc.docx"
              className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 font-medium text-indigo-700 transition hover:bg-indigo-100"
            >
              <Download className="h-4 w-4" />
              Tải DOCX
            </a>
            <p className="text-xs text-gray-500">
              Báo cáo chi tiết cũng đã được gửi vào hộp thư của bạn dưới dạng file PDF đính kèm.
            </p>
          </div>
        ) : null}
      </form>

      <section className="flex flex-col gap-6 rounded-3xl border border-black/5 bg-white p-8 shadow-lg">
        <header>
          <h3 className="text-xl font-semibold text-gray-900">Tóm tắt báo cáo</h3>
          <p className="mt-2 text-sm text-gray-500">
            Khám phá các chỉ số cốt lõi ảnh hưởng tới tính cách, năng lực và hành trình cuộc đời của bạn.
          </p>
        </header>

        {hasReport && report ? (
          <div className="grid gap-4 md:grid-cols-2">
            <StatCard
              title="Đường đời"
              value={report.lifePathNumber}
              description={report.lifePathDescription}
            />
            <StatCard
              title="Chỉ số biểu đạt"
              value={report.expressionNumber}
              description={report.expressionDescription}
            />
            <StatCard
              title="Chỉ số linh hồn"
              value={report.soulUrgeNumber}
              description={report.soulUrgeDescription}
            />
            <StatCard
              title="Chỉ số nhân cách"
              value={report.personalityNumber}
              description={report.personalityDescription}
            />
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/40 p-6 text-sm text-indigo-700">
            Điền thông tin bên cạnh và nhấn &quot;Báo cáo Thần số học&quot; để nhận phân tích chi tiết ngay lập tức.
          </div>
        )}

        {report ? (
          <div className="rounded-2xl bg-slate-50 p-6">
            <h4 className="text-sm font-semibold text-slate-900">Gợi ý tiếp theo</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {report.recommendations.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function StatCard({ title, value, description }: { title: string; value: number; description: string }) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-gray-100 bg-gradient-to-br from-white via-white to-indigo-50/60 p-5 shadow-sm">
      <header className="mb-3">
        <p className="text-sm font-medium text-indigo-600">{title}</p>
        <p className="text-3xl font-semibold text-gray-900">{value}</p>
      </header>
      <p className="text-sm leading-6 text-gray-600">{description}</p>
    </article>
  );
}

function makeDownloadUrl(base64: string, mime: string) {
  const binary = typeof window === 'undefined' ? '' : atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  const blob = new Blob([bytes], { type: mime });
  return URL.createObjectURL(blob);
}
