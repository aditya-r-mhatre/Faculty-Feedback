"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
export default function SetupSubject() {
  const [data, setData] = useState({ depts: [], faculty: [], programs: [] });
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    deptId: "",
    programId: "",
    academicYear: "",
    division: "", // Added
    batch: "",    // Added
    facultyId: ""
  });
  const router = useRouter();
  useEffect(() => {
    const loadInitialData = async () => {
      const [deptRes, facRes] = await Promise.all([
        fetch("/api/admin/dept"),
        fetch("/api/admin/users?role=FACULTY")
      ]);
      const depts = await deptRes.json();
      const faculty = await facRes.json();
      setData(prev => ({ ...prev, depts, faculty }));
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    if (formData.deptId) {
      fetch(`/api/admin/program?deptId=${formData.deptId}`)
        .then(res => res.json())
        .then(programs => setData(prev => ({ ...prev, programs })))
        .catch(err => console.error("Error fetching programs:", err));
    }
  }, [formData.deptId]);

  const handleProgramChange = (progId: string) => {
    const selectedProg: any = data.programs.find((p: any) => p._id === progId);
    setAvailableYears(selectedProg?.academicYears || []);
    setFormData({ ...formData, programId: progId, academicYear: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/subject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      alert("Subject and Faculty Assignment Saved!");
      // Optional: Reset small parts of form
      setFormData({ ...formData, name: "", division: "", batch: "" });
      router.push("/admin/dashboard");
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-lg border-t-4 border-orange-500">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Subject Setup</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          type="text" placeholder="Subject Name (e.g. Mathematics)" required
          className="w-full border p-3 rounded-lg"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
        />

        <div className="grid grid-cols-2 gap-4">
            <select className="w-full border p-3 rounded-lg" required 
            onChange={(e) => setFormData({...formData, deptId: e.target.value})}>
            <option value="">Select Department</option>
            {data.depts.map((d: any) => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>

            <select className="w-full border p-3 rounded-lg" disabled={!formData.deptId}
            value={formData.programId}
            onChange={(e) => handleProgramChange(e.target.value)}>
            <option value="">Select Program</option>
            {data.programs.map((p: any) => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
        </div>

        <div className="grid grid-cols-3 gap-4">
            <select className="w-full border p-3 rounded-lg" disabled={availableYears.length === 0} required
                value={formData.academicYear}
                onChange={(e) => setFormData({...formData, academicYear: e.target.value})}>
                <option value="">Year</option>
                {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
            </select>

            <input 
                type="text" placeholder="Div (A/B)" required
                className="w-full border p-3 rounded-lg"
                value={formData.division}
                onChange={(e) => setFormData({...formData, division: e.target.value.toUpperCase()})}
            />

            <input 
                type="text" placeholder="Batch (Opt)"
                className="w-full border p-3 rounded-lg"
                value={formData.batch}
                onChange={(e) => setFormData({...formData, batch: e.target.value.toUpperCase()})}
            />
        </div>

        <select className="w-full border p-3 rounded-lg" required 
          onChange={(e) => setFormData({...formData, facultyId: e.target.value})}>
          <option value="">Assign Faculty</option>
          {data.faculty.map((f: any) => <option key={f._id} value={f._id}>{f.username}</option>)}
        </select>

        <button className="w-full bg-orange-600 text-white py-3 rounded-lg font-bold hover:bg-orange-700 transition-colors">
          Create Subject
        </button>
      </form>
    </div>
  );
}