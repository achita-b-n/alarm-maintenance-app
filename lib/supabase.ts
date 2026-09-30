import { createClient } from '@supabase/supabase-js';

// =====================================================
// SUPABASE CONNECTION
// =====================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'ไม่พบ NEXT_PUBLIC_SUPABASE_URL หรือ NEXT_PUBLIC_SUPABASE_ANON_KEY ใน .env.local'
  );
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);


// =====================================================
// ALARM
// =====================================================

// ปิด Alarm และเปลี่ยนสถานะเครื่องจักรกลับเป็น Running
export async function closeAlarmAction(alarmId: number) {

  // 1. หาเครื่องจักรที่เกี่ยวข้องกับ Alarm
  const { data: alarmData, error: findAlarmError } =
    await supabase
      .from('alarms')
      .select('machine_id')
      .eq('id', alarmId)
      .single();

  if (findAlarmError) {
    console.error('Error finding alarm:', findAlarmError);
    return { success: false };
  }

  // 2. ปิด Alarm
  const { error: alarmError } = await supabase
    .from('alarms')
    .update({
      status: 'Closed',
      closed_at: new Date().toISOString(),
    })
    .eq('id', alarmId);

  if (alarmError) {
    console.error('Error closing alarm:', alarmError);
    return { success: false };
  }

  // 3. เปลี่ยนสถานะเครื่องจักรกลับเป็น Running
  if (alarmData?.machine_id) {

    const { error: machineError } = await supabase
      .from('machines')
      .update({
        status: 'Running',
      })
      .eq('machine_id', alarmData.machine_id);

    if (machineError) {
      console.error(
        'Error updating machine status:',
        machineError
      );
    }
  }

  return { success: true };
}


// =====================================================
// AUTHENTICATION
// =====================================================

// สมัครสมาชิก
export async function signUpAction(formData: FormData) {

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error('Sign up error:', error);
    return {
      error: error.message,
    };
  }

  return {
    success: true,
    user: data.user,
  };
}


// เข้าสู่ระบบ
export async function signInAction(formData: FormData) {

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { data, error } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (error) {
    console.error('Sign in error:', error);

    return {
      error: error.message,
    };
  }

  return {
    success: true,
    user: data.user,
  };
}


// ดึง User ปัจจุบัน
export async function getCurrentUser() {

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error('Get current user error:', error);
    return null;
  }

  return user;
}


// Logout
export async function signOutAction() {

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Sign out error:', error);

    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
  };
}


// =====================================================
// LOGIN / REGISTER FORM
// =====================================================

export async function handleFormAction(
  formData: FormData
) {

  'use server';

  const actionType =
    formData.get('actionType') as string;

  // Login
  if (actionType === 'login') {

    const res = await signInAction(formData);

    if (res?.error) {
      return {
        error: res.error,
      };
    }

    return {
      success: true,
      redirectTo: '/',
    };
  }

  // Register
  if (actionType === 'register') {

    const res = await signUpAction(formData);

    if (res?.error) {
      return {
        error: res.error,
      };
    }

    return {
      success: true,
      redirectTo:
        '/login?success=' +
        encodeURIComponent(
          'สมัครสมาชิกสำเร็จ! ลองเข้าสู่ระบบได้เลย'
        ),
    };
  }

  return {
    error: 'Invalid Action',
  };
}


// =====================================================
// MAINTENANCE
// =====================================================

// สร้างใบงานซ่อมใหม่
export async function createMaintenanceAction(
  formData: FormData
) {

  const machineId =
    formData.get('machine_id') as string;

  const technicianName =
    formData.get('technician_name') as string;

  const description =
    formData.get('description') as string;

  // ตรวจสอบข้อมูล
  if (
    !machineId ||
    !technicianName ||
    !description
  ) {
    return {
      success: false,
      error: 'กรุณากรอกข้อมูลให้ครบถ้วน',
    };
  }

  // เพิ่มใบงานซ่อม
  const { data, error } = await supabase
    .from('maintenance_records')
    .insert({
      machine_id: machineId,
      technician_name: technicianName,
      description: description,
      status: 'Open',
      start_date: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {

    console.error(
      'Error creating maintenance record:',
      error
    );

    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    data,
  };
}


// อัปเดตสถานะงานซ่อม
export async function updateMaintenanceStatusAction(
  recordId: number,
  machineId: string
) {

  // 1. ตรวจสอบสถานะปัจจุบัน
  const { data: record, error: findError } =
    await supabase
      .from('maintenance_records')
      .select('status')
      .eq('id', recordId)
      .single();

  if (findError) {

    console.error(
      'Error finding maintenance record:',
      findError
    );

    return {
      success: false,
    };
  }

  // 2. ถ้ายัง Open → เปลี่ยนเป็น In Progress
  if (record.status === 'Open') {

    const { error } = await supabase
      .from('maintenance_records')
      .update({
        status: 'In Progress',
      })
      .eq('id', recordId);

    if (error) {

      console.error(
        'Error starting maintenance:',
        error
      );

      return {
        success: false,
      };
    }

    return {
      success: true,
    };
  }

  // 3. ถ้า In Progress → เปลี่ยนเป็น Completed
  if (record.status === 'In Progress') {

    const { error: recordError } =
      await supabase
        .from('maintenance_records')
        .update({
          status: 'Completed',
          end_date: new Date().toISOString(),
        })
        .eq('id', recordId);

    if (recordError) {

      console.error(
        'Error completing maintenance:',
        recordError
      );

      return {
        success: false,
      };
    }

    // 4. เปลี่ยนเครื่องจักรกลับเป็น Running
    const { error: machineError } =
      await supabase
        .from('machines')
        .update({
          status: 'Running',
        })
        .eq('machine_id', machineId);

    if (machineError) {

      console.error(
        'Error updating machine status:',
        machineError
      );
    }

    return {
      success: true,
    };
  }

  return {
    success: false,
    error: 'ไม่สามารถเปลี่ยนสถานะงานซ่อมได้',
  };
}