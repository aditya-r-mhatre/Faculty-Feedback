"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SetupUsers() {
  const [data, setData] = useState({ depts: [], programs: [] });
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [role, setRole] = useState("STUDENT");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    deptId: "",
    programId: "",
    academicYear: "", // Academic Year
    rollNo: "",
    division: "",
    batch: ""
  });

  const router = useRouter();

  // 1. Load Initial Departments
  useEffect(() => {
    fetch("/api/admin/dept")
      .then(res => res.json())
      .then(depts => setData(prev => ({ ...prev, depts })))
      .catch(err => console.error("Failed to fetch departments", err));
  }, []);

  // 2. Cascading: Load Programs when Department changes
  useEffect(() => {
    if (formData.deptId) {
      fetch(`/api/admin/program?deptId=${formData.deptId}`)
        .then(res => res.json())
        .then(programs => setData(prev => ({ ...prev, programs })))
        .catch(err => console.error("Unexpected end of JSON input", err)); // Fixes
    }
  }, [formData.deptId]);

  const handleProgramChange = (progId: string) => {
    const selectedProg: any = data.programs.find((p: any) => p._id === progId);
    // Academic Years FE, SE, etc. come from the Program model
    setAvailableYears(selectedProg?.academicYears || []);
    setFormData({ ...formData, programId: progId, academicYear: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, role }),
    });
    if (res.ok) {
      alert("Account Created Successfully!");
      router.push("/admin/dashboard");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-lg border border-slate-100">
      <h2 className="text-2xl font-bold mb-6 text-slate-800">Account Management</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <select 
            className="p-3 border rounded-xl bg-slate-50"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="STUDENT">Student</option>
            <option value="FACULTY">Faculty</option>
            <option value="HOD">HOD</option>
          </select>
          
          <input 
            type="text" placeholder="Username" required
            className="p-3 border rounded-xl bg-slate-50"
            onChange={(e) => setFormData({...formData, username: e.target.value})}
          />
        </div>

        <input 
          type="password" placeholder="Set Password" required
          className="w-full p-3 border rounded-xl bg-slate-50"
          onChange={(e) => setFormData({...formData, password: e.target.value})}
        />

        {/* CASCADING DROPDOWNS FOR STUDENTS */}
        {role === "STUDENT" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select 
                className="p-3 border rounded-xl bg-white" required
                onChange={(e) => setFormData({...formData, deptId: e.target.value})}
              >
                <option value="">Select Dept</option>
                {data.depts.map((d: any) => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>

              <select 
                className="p-3 border rounded-xl bg-white disabled:opacity-50"
                disabled={!formData.deptId} required
                onChange={(e) => handleProgramChange(e.target.value)}
              >
                <option value="">Select Program</option>
                {data.programs.map((p: any) => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>

              <select 
                className="p-3 border rounded-xl bg-white disabled:opacity-50"
                disabled={availableYears.length === 0} required
                onChange={(e) => setFormData({...formData, academicYear: e.target.value})}
              >
                <option value="">Select Year</option>
                {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <input 
                type="text" placeholder="Roll No" required
                className="p-3 border rounded-xl bg-slate-50"
                onChange={(e) => setFormData({...formData, rollNo: e.target.value})}
              />
              <input 
                type="text" placeholder="Division (A/B)" required
                className="p-3 border rounded-xl bg-slate-50"
                onChange={(e) => setFormData({...formData, division: e.target.value})}
              />
              <input 
                type="text" placeholder="Batch (Optional)"
                className="p-3 border rounded-xl bg-slate-50"
                onChange={(e) => setFormData({...formData, batch: e.target.value})}
              />
            </div>
          </div>
        )}

        <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all">
          Create Account
        </button>
      </form>
    </div>
  );
}