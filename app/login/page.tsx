import { handleFormAction } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; success?: string }>;
}) {
  const params = await searchParams;

  async function onSubmit(formData: FormData) {
    'use server';
    // บังคับให้ส่งค่าเป็น login เสมอ
    formData.set('actionType', 'login');
    const result = await handleFormAction(formData);
    
    if (result?.error) {
      redirect(`/login?message=${encodeURIComponent(result.error)}`);
    }
    if (result?.redirectTo) {
      redirect(result.redirectTo);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 text-white">
      <div className="bg-gray-900 border border-gray-800 p-8 rounded-xl w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-bold text-center text-emerald-400 mb-2">Automation Account</h2>
        <p className="text-gray-400 text-sm text-center mb-6">ระบบล็อกอินเข้าใช้งานของช่างเทคนิคและผู้ดูแลระบบ</p>

        {params.message && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 text-sm p-3 rounded mb-4">
            ⚠️ {params.message}
          </div>
        )}

        {params.success && (
          <div className="bg-green-900/30 border border-green-700 text-green-300 text-sm p-3 rounded mb-4">
            ✅ {params.success}
          </div>
        )}

        <form action={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">อีเมลผู้ใช้งาน (Email)</label>
            <input name="email" type="email" required placeholder="name@company.com" className="w-full bg-gray-800 border border-gray-700 rounded p-2.5 text-white focus:outline-none focus:border-emerald-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">รหัสผ่าน (Password)</label>
            <input name="password" type="password" required placeholder="••••••••" className="w-full bg-gray-800 border border-gray-700 rounded p-2.5 text-white focus:outline-none focus:border-emerald-500" />
          </div>

          <div className="grid grid-cols-1 gap-3 pt-2">
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded transition-colors">
              เข้าสู่ระบบ
            </button>
            
            {/* ปุ่มกดเด้งไปอีกหน้าแยกต่างหากตามที่คุณต้องการ */}
            <Link href="/register" className="w-full text-center bg-gray-800 hover:bg-gray-750 text-gray-300 border border-gray-700 font-medium py-2.5 rounded transition-colors block">
              สมัครสมาชิกใหม่
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
