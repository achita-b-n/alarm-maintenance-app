'use client';

import { useState } from 'react';

const initialMachines = [
  { machine_id: 'MCH-001', machine_name: 'CNC Milling Machine A', machine_type: 'CNC', location: 'Factory Floor 1', status: 'Running' },
  { machine_id: 'MCH-002', machine_name: 'Robotic Arm Welder B', machine_type: 'Robot', location: 'Assembly Line 2', status: 'Alarm' },
  { machine_id: 'MCH-003', machine_name: 'Hydraulic Press C', machine_type: 'Hydraulic', location: 'Stamping Zone 1', status: 'Running' }
];

const initialAlarms = [
  { id: 1, machine_id: 'MCH-002', alarm_code: 'ERR-999', description: 'Main conveyor belt jammed at assembly line', status: 'Open' }
];

export default function DashboardPage() {
  const [machines, setMachines] = useState(initialMachines);
  const [alarms, setAlarms] = useState(initialAlarms);
  const [records, setRecords] = useState<any[]>([]);

  const [selectedMachine, setSelectedMachine] = useState('MCH-001');
  const [techName, setTechName] = useState('');
  const [desc, setDesc] = useState('');

  const handleCloseAlarm = (id: number) => {
    const targetAlarm = alarms.find(a => a.id === id);
    if (targetAlarm) {
      setMachines(machines.map(m => m.machine_id === targetAlarm.machine_id ? { ...m, status: 'Running' } : m));
    }
    setAlarms(alarms.filter(a => a.id !== id));
  };

  const handleCreateMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!techName || !desc) return;

    const newRecord = {
      id: Date.now(),
      machine_id: selectedMachine,
      technician_name: techName,
      description: desc,
      start_date: new Date().toISOString(),
      status: 'In Progress'
    };
    setRecords([newRecord, ...records]);
    setMachines(machines.map(m => m.machine_id === selectedMachine ? { ...m, status: 'Maintenance' } : m));

    setTechName('');
    setDesc('');
  };

  const handleUpdateRecordStatus = (recordId: number, machineId: string, newStatus: string) => {
    setRecords(records.map(r => r.id === recordId ? { ...r, status: newStatus } : r));
    
    if (newStatus === 'Completed') {
      setMachines(machines.map(m => m.machine_id === machineId ? { ...m, status: 'Running' } : m));
    } else {
      setMachines(machines.map(m => m.machine_id === machineId ? { ...m, status: 'Maintenance' } : m));
    }
  };

  const handleExportCSV = () => {
    if (records.length === 0) {
      alert('ไม่มีข้อมูลประวัติการซ่อมสำหรับ Export');
      return;
    }

    const headers = ['Record ID', 'Machine ID', 'Technician', 'Description', 'Start Date', 'Status'];
    const rows = records.map(r => [
      r.id,
      `"${r.machine_id}"`,
      `"${r.technician_name}"`,
      `"${r.description.replace(/"/g, '""')}"`,
      `"${new Date(r.start_date).toLocaleString('th-TH')}"`,
      `"${r.status}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Maintenance_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogout = () => {
    window.location.href = '/login';
  };

  const countInProgress = records.filter(r => r.status === 'In Progress').length;
  const countWaitingPart = records.filter(r => r.status === 'Waiting Part').length;
  const countCompleted = records.filter(r => r.status === 'Completed').length;
  const totalRecords = records.length;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <header className="mb-8 border-b border-gray-800 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-emerald-400">Alarm & Maintenance Management System</h1>
          <p className="text-gray-400 mt-2">ระบบจัดการและแจ้งซ่อมเครื่องจักรอัตโนมัติ (Next.js Mini Lab)</p>
        </div>
        <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 flex items-center gap-4 w-full md:w-auto">
          <div className="text-right">
            <p className="text-xs text-emerald-400 font-mono font-semibold">🟢 ONLINE PROFILE</p>
            <p className="text-sm font-medium text-gray-300 truncate max-w-[200px]">admin@test.com</p>
          </div>
          <button onClick={handleLogout} className="bg-gray-750 hover:bg-red-900/40 hover:text-red-300 border border-gray-600 hover:border-red-700 text-gray-300 text-xs px-3 py-1.5 rounded transition-all">
            ออกจากระบบ
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-gray-400 font-medium">เครื่องจักรทั้งหมด</h3>
          <p className="text-4xl font-bold mt-2 text-white">{machines.length} เครื่อง</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-gray-400 font-medium">Active Alarms ค้างอยู่</h3>
          <p className="text-4xl font-bold mt-2 text-red-400">{alarms.length} เคส</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-gray-400 font-medium">กำลังซ่อมบำรุง</h3>
          <p className="text-4xl font-bold mt-2 text-yellow-400">
            {machines.filter(m => m.status === 'Maintenance').length} เครื่อง
          </p>
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-purple-400 flex items-center gap-2">
          📊 สรุปสถิติสถานะใบงานซ่อม (Maintenance Analytics)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-gray-900/60 p-4 rounded-lg border border-gray-700">
            <p className="text-xs text-gray-400">ใบงานซ่อมทั้งหมด</p>
            <p className="text-2xl font-bold text-white mt-1">{totalRecords}</p>
          </div>
          <div className="bg-amber-950/20 p-4 rounded-lg border border-amber-800/40">
            <p className="text-xs text-amber-400">กำลังซ่อม (In Progress)</p>
            <p className="text-2xl font-bold text-amber-300 mt-1">{countInProgress}</p>
          </div>
          <div className="bg-orange-950/20 p-4 rounded-lg border border-orange-800/40">
            <p className="text-xs text-orange-400">รออะไหล่ (Waiting Part)</p>
            <p className="text-2xl font-bold text-orange-300 mt-1">{countWaitingPart}</p>
          </div>
          <div className="bg-emerald-950/20 p-4 rounded-lg border border-emerald-800/40">
            <p className="text-xs text-emerald-400">ซ่อมเสร็จแล้ว (Completed)</p>
            <p className="text-2xl font-bold text-emerald-300 mt-1">{countCompleted}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 bg-red-950/20 border border-red-900/50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-red-400 flex items-center gap-2">🚨 รายการแจ้งเตือนวิกฤต (Active Alarms)</h2>
          {alarms.length === 0 ? (
            <p className="text-gray-400 text-sm">ไม่มีสัญญานเตือนค้างอยู่ในขณะนี้ ระบบทำงานปกติ</p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {alarms.map((alarm) => (
                <div key={alarm.id} className="bg-gray-800 p-4 rounded border border-gray-700 flex justify-between items-center">
                  <div>
                    <span className="bg-red-900/50 text-red-300 text-xs px-2 py-0.5 rounded font-mono mr-2">{alarm.alarm_code}</span>
                    <strong className="text-white">เครื่องจักร: {alarm.machine_id}</strong>
                    <p className="text-gray-400 text-sm mt-1">{alarm.description}</p>
                  </div>
                  <button onClick={() => handleCloseAlarm(alarm.id)} className="bg-red-600 hover:bg-red-700 text-white font-medium text-sm px-4 py-2 rounded transition-all">
                    Acknowledge & Close
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-yellow-400 flex items-center gap-2">🛠️ บันทึกเปิดเคสซ่อมบำรุง</h2>
          <form onSubmit={handleCreateMaintenance} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">เลือกเครื่องจักร</label>
              <select value={selectedMachine} onChange={(e) => setSelectedMachine(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-white focus:outline-none focus:border-yellow-500">
                {machines.map(m => (
                  <option key={m.machine_id} value={m.machine_id}>{m.machine_id} - {m.machine_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">ชื่อช่างผู้รับผิดชอบ</label>
              <input value={techName} onChange={(e) => setTechName(e.target.value)} type="text" required placeholder="ระบุชื่อช่างหน้างาน" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-white focus:outline-none focus:border-yellow-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">รายละเอียดอาการ/แผนงานซ่อม</label>
              <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} required placeholder="เช่น เปลี่ยนมอเตอร์แกนร่วม, ตรวจเช็กระบบไฮดรอลิก" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-white focus:outline-none focus:border-yellow-500"></textarea>
            </div>
            <button type="submit" className="w-full bg-yellow-600 hover:bg-yellow-700 text-gray-900 font-bold py-2 rounded text-sm transition-colors mt-2">
              ยืนยันเปิดใบงานซ่อม
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-emerald-400">📋 ตารางสถานะเครื่องจักร (Machine Master)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-700 text-gray-400 text-sm">
                  <th className="pb-3">รหัสเครื่องจักร</th>
                  <th className="pb-3">ชื่อเครื่องจักร</th>
                  <th className="pb-3">ประเภท</th>
                  <th className="pb-3">สถานที่ติดตั้ง</th>
                  <th className="pb-3">สถานะระบบ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700 text-sm">
                {machines.map((machine) => (
                  <tr key={machine.machine_id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="py-3 font-mono text-emerald-300">{machine.machine_id}</td>
                    <td className="py-3 font-medium">{machine.machine_name}</td>
                    <td className="py-3 text-gray-300">{machine.machine_type}</td>
                    <td className="py-3 text-gray-300">{machine.location}</td>
                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                        ${machine.status === 'Running' ? 'bg-green-900/40 text-green-300 border border-green-700/50' : ''}
                        ${machine.status === 'Alarm' ? 'bg-red-900/40 text-red-300 border border-red-700/50' : ''}
                        ${machine.status === 'Maintenance' ? 'bg-yellow-900/40 text-yellow-300 border border-yellow-700/50' : ''}
                      `}>
                        {machine.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
            <h2 className="text-xl font-semibold text-amber-400">📜 ประวัติบันทึกงานซ่อมบำรุง (Maintenance Logs)</h2>
            <button 
              onClick={handleExportCSV}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3 py-2 rounded shadow transition-all flex items-center gap-1 cursor-pointer"
            >
              📥 Export CSV
            </button>
          </div>
          {records.length === 0 ? (
            <p className="text-gray-400 text-sm">ยังไม่มีประวัติการบันทึกงานซ่อมในระบบ</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-700 text-gray-400 text-sm">
                    <th className="pb-3">รหัสเครื่อง</th>
                    <th className="pb-3">ช่างผู้ซ่อม</th>
                    <th className="pb-3">รายละเอียดงาน</th>
                    <th className="pb-3">วันที่เริ่มซ่อม</th>
                    <th className="pb-3">สถานะใบงาน</th>
                    <th className="pb-3 text-center">จัดการสถานะงาน</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700 text-sm">
                  {records.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-700/20">
                      <td className="py-3 font-mono text-amber-300">{record.machine_id}</td>
                      <td className="py-3 font-medium">{record.technician_name}</td>
                      <td className="py-3 text-gray-300">{record.description}</td>
                      <td className="py-3 text-gray-400 text-xs">{new Date(record.start_date).toLocaleString('th-TH')}</td>
                      <td className="py-3">
                        <span className={`px-2.5 py-1 rounded text-xs border font-medium
                          ${record.status === 'In Progress' ? 'bg-amber-950 text-amber-300 border-amber-800' : ''}
                          ${record.status === 'Waiting Part' ? 'bg-orange-950 text-orange-300 border-orange-800' : ''}
                          ${record.status === 'Completed' ? 'bg-blue-950 text-blue-300 border-blue-800' : ''}
                        `}>
                          {record.status}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        {record.status !== 'Completed' ? (
                          <div className="flex justify-center gap-2">
                            {record.status !== 'Waiting Part' && (
                              <button 
                                onClick={() => handleUpdateRecordStatus(record.id, record.machine_id, 'Waiting Part')} 
                                className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold px-2.5 py-1 rounded transition-colors"
                              >
                                ⏳ Waiting Part
                              </button>
                            )}
                            <button 
                              onClick={() => handleUpdateRecordStatus(record.id, record.machine_id, 'Completed')} 
                              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-2.5 py-1 rounded transition-colors"
                            >
                              ✓ Mark Completed
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-xs font-mono">Finished ✓</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}