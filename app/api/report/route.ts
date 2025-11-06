import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { generateNumerologyReport } from '@/lib/numerology';
import { buildEmailHtml, createDocxReport, createPdfReport } from '@/lib/report-export';
import { sendReportEmail } from '@/lib/email';
import { upsertProfile } from '@/lib/profiles';

const schema = z.object({
  fullName: z.string().min(3).max(100),
  birthDate: z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
    message: 'Ngày sinh không hợp lệ'
  }),
  email: z.string().email()
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const json = await req.json();
  const parsed = schema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const { fullName, birthDate, email } = parsed.data;

  if (email.toLowerCase() !== session.user.email.toLowerCase()) {
    return NextResponse.json({ error: 'Email không khớp với tài khoản đang đăng nhập' }, { status: 400 });
  }

  const birthDateInstance = new Date(birthDate);
  const report = generateNumerologyReport(fullName, birthDateInstance);

  const [docxBuffer, pdfBuffer] = await Promise.all([
    createDocxReport({
      fullName,
      birthDate,
      report
    }),
    createPdfReport({
      fullName,
      birthDate,
      report
    })
  ]);

  await Promise.all([
    sendReportEmail({
      to: email,
      subject: 'Báo cáo Thần số học của bạn',
      html: buildEmailHtml({ fullName, report }),
      pdfBuffer
    }),
    upsertProfile({
      userId: session.user.id,
      email,
      fullName,
      birthDate,
      report
    })
  ]);

  return NextResponse.json({
    ok: true,
    report,
    files: {
      pdf: pdfBuffer.toString('base64'),
      docx: docxBuffer.toString('base64')
    }
  });
}
