"use client";
import { useState, useEffect } from "react";

export default function SetupProgram() {
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({ 
    name: "", 
    type: "UG", // Matches your schema enum
    deptId: "", 
    academicYears: "" // We will split this string into an array before sending
  });

  useEffect(() => {
    fetch("/api/admin/dept").then(res => res.json()).then(setDepartments);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare the data to match your IProgram interface
    const payload = {
      ...formData,
      academicYears: formData.academicYears.split(",").map(y => y.trim()) 
    };

    const res = await fetch("/api/admin/program", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      alert("Program created successfully!");
      setFormData({ name: "", type: "UG", deptId: "", academicYears: "" });
    } else {
      const err = await res.json();
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md border-t-4 border-emerald-500">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Program Setup</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Department Selection */}
        <select 
          required className="w-full border p-2 rounded"
          onChange={(e) => setFormData({...formData, deptId: e.target.value})}
        >
          <option value="">-- Select Dept --</option>
          {departments.map((d: any) => <option key={d._id} value={d._id}>{d.name}</option>)}
        </select>

        {/* Program Name */}
        <input 
          type="text" placeholder="Program Name (e.g. B.Tech)" required
          className="w-full border p-2 rounded"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
        />

        {/* Program Type - REQUIRED BY YOUR SCHEMA */}
        <select 
          className="w-full border p-2 rounded"
          value={formData.type}
          onChange={(e) => setFormData({...formData, type: e.target.value})}
        >
          <option value="UG">UG</option>
          <option value="PG">PG</option>
        </select>

        {/* Academic Years */}
        <input 
          type="text" 
          placeholder="Years (comma separated: FE, SE, TE, BE)" 
          required
          className="w-full border p-2 rounded"
          value={formData.academicYears}
          onChange={(e) => setFormData({...formData, academicYears: e.target.value})}
        />

        <button className="w-full bg-emerald-600 text-white py-2 rounded font-bold hover:bg-emerald-700">
          Create Program
        </button>
      </form>
    </div>
  );
}