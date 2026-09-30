import { handleFormAction } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const params = await searchParams;

  async function onSubmit(formData: FormData) {
    'use server';
    // บังคับให้ส่งค่าเป็น register เสมอ
    formData.set('actionType', 'register');
    const result = await handleFormAction(formData);
    
    if (result?.error) {
      redirect(`/register?message=${encodeURIComponent(result.error)}`);
    }
    if (result?.redirectTo) {
      redirect(result.redirectTo);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 text-white">
      <div className="bg-gray-900 border border-gray-800 p-8 rounded-xl w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-bold text-center text-emerald-400 mb-2">Create Account</h2>
        <p className="text-gray-400 text-sm text-center mb-6">ลงทะเบียนบัญชีใหม่สำหรับช่างเทคนิคโรงงาน</p>

        {params.message && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 text-sm p-3 rounded mb-4">
            ⚠️ {params.message}
          </div>
        )}

        <form action={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">อีเมลผู้ใช้งาน (Email)</label>
            <input name="email" type="email" required placeholder="name@company.com" className="w-full bg-gray-800 border border-gray-700 rounded p-2.5 text-white focus:outline-none focus:border-emerald-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">รหัสผ่าน (Password)</label>
            <input name="password" type="password" required placeholder="ตั้งรหัสผ่าน 6 ตัวขึ้นไป" className="w-full bg-gray-800 border border-gray-700 rounded p-2.5 text-white focus:outline-none focus:border-emerald-500" />
          </div>

          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded transition-colors pt-2">
            ยืนยันการสมัครสมาชิก
          </button>

          <div className="text-center pt-2">
            <Link href="/login" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">
              มีบัญชีอยู่แล้ว? ← กลับไปหน้าล็อกอิน
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
