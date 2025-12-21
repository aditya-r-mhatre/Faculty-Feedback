"use client";
import { useState } from "react";

export default function SetupDept() {
  const [name, setName] = useState("");
  const [hodUsername, setHodUsername] = useState("");

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/dept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, hodUsername }),
    });
    if (res.ok) alert("Department created and HOD linked!");
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded shadow-lg border-t-4 border-indigo-600">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Department Management</h2>
      <form onSubmit={handleCreateDept} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold mb-1">Department Name</label>
          <input 
            type="text" required className="w-full border p-2 rounded"
            placeholder="e.g. Computer Engineering"
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Assign HOD (By Username)</label>
          <input 
            type="text" required className="w-full border p-2 rounded"
            placeholder="Enter the HOD's username"
            onChange={(e) => setHodUsername(e.target.value)}
          />
          <p className="text-xs text-gray-400 mt-1 italic">Note: The HOD user must already be created.</p>
        </div>

        <button className="w-full bg-indigo-600 text-white py-3 rounded font-bold hover:bg-indigo-700">
          Create Department & Link HOD
        </button>
      </form>
    </div>
  );
}