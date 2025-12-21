"use client";
import { useState, useEffect } from "react";

export default function SubjectMapping() {
  const [selection, setSelection] = useState({
    facultyId: "", subjectId: "", deptId: "", division: "", batch: ""
  });
  const [faculties, setFaculties] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    fetch("/api/admin/users?role=FACULTY").then(res => res.json()).then(data => setFaculties(data));
    fetch("/api/admin/subject").then(res => res.json()).then(data => setSubjects(data));
  }, []);

  const handleMapping = async () => {
    await fetch("/api/admin/mapping", {
      method: "POST",
      body: JSON.stringify(selection)
    });
    alert("Mapping Created!");
  };

  return (
    <div className="bg-white p-8 rounded shadow max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">Subject-Faculty Allocation</h2>
      <div className="grid grid-cols-2 gap-4">
        <select onChange={e => setSelection({...selection, facultyId: e.target.value})} className="border p-2 rounded">
          <option value="">Select Faculty</option>
          {faculties.map((f: any) => <option key={f._id} value={f._id}>{f.username}</option>)}
        </select>
        <select onChange={e => setSelection({...selection, subjectId: e.target.value})} className="border p-2 rounded">
          <option value="">Select Subject</option>
          {subjects.map((s: any) => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>
        <input type="text" placeholder="Division (A/B/C)" className="border p-2 rounded"
          onChange={e => setSelection({...selection, division: e.target.value})}/>
        <input type="text" placeholder="Batch (Optional - Leave empty for whole Div)" className="border p-2 rounded"
          onChange={e => setSelection({...selection, batch: e.target.value})}/>
        <button onClick={handleMapping} className="col-span-2 bg-indigo-600 text-white p-2 rounded">Save Allocation</button>
      </div>
    </div>
  );
}