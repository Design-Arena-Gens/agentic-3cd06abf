import { auth } from '@/lib/auth';
import { SignInButton, SignOutButton } from '@/components/auth-buttons';
import { getProfile } from '@/lib/profiles';
import { ReportForm } from '@/components/report-form';

export default async function HomePage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <main className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 gradient" />
        <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-24 text-center">
          <p className="rounded-full border border-white/30 bg-white/10 px-4 py-1 text-sm text-white/80 shadow-sm backdrop-blur">
            Trải nghiệm phân tích thần số học chuyên sâu
          </p>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Khai mở tiềm năng thông qua thần số học cá nhân hóa
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/80">
            Đăng nhập bằng Google, hoàn tất hồ sơ với ngày sinh và họ tên đầy đủ, sau đó nhận báo cáo chuyên sâu dưới
            dạng PDF, DOCX và email gửi thẳng đến hộp thư của bạn trong vài giây.
          </p>
          <div className="mt-8">
            <SignInButton />
          </div>
        </div>
      </main>
    );
  }

  const profile = await getProfile(session.user.id);

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 pb-24 pt-16">
      <header className="mb-12 flex flex-col gap-4 rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-500 p-8 text-white shadow-xl sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-white/70">Chào mừng trở lại</p>
          <h1 className="mt-2 text-3xl font-semibold">
            {session.user.name ?? 'Nhà khám phá thần số học'}, hãy khám phá sâu hơn hành trình của bạn
          </h1>
          <p className="mt-2 max-w-xl text-sm text-white/80">
            Điền thông tin chính xác để hệ thống tạo báo cáo thần số học chi tiết nhất, tải về ngay và nhận email xác
            nhận tức thì.
          </p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <span className="rounded-full bg-white/20 px-4 py-2 text-xs font-medium tracking-wide text-white/80">
            {session.user.email}
          </span>
          <SignOutButton />
        </div>
      </header>

      <ReportForm
        email={session.user.email ?? ''}
        initialFullName={profile?.full_name}
        initialBirthDate={profile?.birth_date}
        initialReport={profile?.report_json ?? undefined}
      />
    </main>
  );
}
