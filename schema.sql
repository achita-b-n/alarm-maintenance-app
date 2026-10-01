-- 1. Profiles
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT CHECK (role IN ('Admin', 'Technician', 'Operator')) DEFAULT 'Operator',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Machines
CREATE TABLE machines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    machine_code TEXT UNIQUE NOT NULL,
    machine_name TEXT NOT NULL,
    location TEXT,
    status TEXT CHECK (status IN ('Normal', 'Warning', 'Critical', 'Maintenance')) DEFAULT 'Normal',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Alarms
CREATE TABLE alarms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    machine_code TEXT REFERENCES machines(machine_code) ON DELETE CASCADE,
    alarm_type TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')) DEFAULT 'Medium',
    description TEXT,
    status TEXT CHECK (status IN ('Active', 'Acknowledged', 'Resolved')) DEFAULT 'Active',
    triggered_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Maintenance Records
CREATE TABLE maintenance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    machine_code TEXT REFERENCES machines(machine_code) ON DELETE CASCADE,
    technician_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action_details TEXT NOT NULL,
    status TEXT CHECK (status IN ('Pending', 'In Progress', 'Completed')) DEFAULT 'Pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);
