"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
export default function ManageForms() {
  const [data, setData] = useState({ depts: [], programs: [], subjects: [] });
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  
  // Selection States updated with division and batch
  const [selections, setSelections] = useState({ 
    deptId: "", 
    programId: "", 
    academicYear: "", 
    subjectId: "",
    division: "", // Added for targeted targeting
    batch: "",     // Added for optional batch targeting
    facultyId: ""
  });

  const [facultyList, setFacultyList] = useState<any[]>([]);

  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([{ questionText: "", type: "rating" }]);
  const router = useRouter();
  useEffect(() => {
    fetch("/api/admin/dept")
      .then(res => res.json())
      .then(depts => setData(prev => ({ ...prev, depts })))
      .catch(() => console.error("Failed to load departments"));
    // load faculty list for selector
    fetch('/api/admin/users?role=FACULTY')
      .then(res => res.json())
      .then(list => setFacultyList(list || []))
      .catch(() => console.error('Failed to load faculty list'));
  }, []);

  useEffect(() => {
    if (selections.deptId) {
      fetch(`/api/admin/program?deptId=${selections.deptId}`)
        .then(res => res.json())
        .then(programs => setData(prev => ({ ...prev, programs, subjects: [] })));
    }
  }, [selections.deptId]);

  const handleProgramChange = (progId: string) => {
    const selectedProg: any = data.programs.find((p: any) => p._id === progId);
    setAvailableYears(selectedProg?.academicYears || []);
    setSelections({ ...selections, programId: progId, academicYear: "", subjectId: "" });
  };

  useEffect(() => {
    if (selections.programId && selections.academicYear) {
      fetch(`/api/admin/subject?programId=${selections.programId}&academicYear=${selections.academicYear}`)
        .then(res => res.json())
        .then(subjects => setData(prev => ({ ...prev, subjects })));
    }
  }, [selections.programId, selections.academicYear]);

  const addQuestion = () => setQuestions([...questions, { questionText: "", type: "rating" }]);
  
  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const handleQuestionChange = (index: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].questionText = value;
    setQuestions(updatedQuestions);
  };

  const handleSaveForm = async () => {
    // Basic validation: Division and Faculty are now mandatory for targeting
    if (!title || !selections.subjectId || !selections.division || !selections.facultyId || questions.some(q => !q.questionText)) {
      alert("Please complete all selections, including Division and Faculty, and fill all questions.");
      return;
    }

    const res = await fetch("/api/admin/forms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        title, 
        ...selections, 
        questions 
      }),
    });

    if (res.ok) {
      alert("Feedback Form Published Successfully!");
      setTitle("");
      setQuestions([{ questionText: "", type: "rating" }]);
      setSelections({...selections, division: "", batch: "", facultyId: ""});
      router.push("/admin/dashboard");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
      <h2 className="text-2xl font-bold mb-6 text-slate-800">Create Targeted Feedback Form</h2>
      
      {/* Target Audience Dropdowns & Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8 bg-slate-50 p-4 rounded-xl">
        <select 
          className="p-3 border rounded-lg bg-white text-sm"
          value={selections.deptId}
          onChange={(e) => setSelections({...selections, deptId: e.target.value, programId: "", academicYear: "", subjectId: ""})}
        >
          <option value="">Select Dept</option>
          {data.depts.map((d: any) => <option key={d._id} value={d._id}>{d.name}</option>)}
        </select>

        <select 
          className="p-3 border rounded-lg bg-white text-sm disabled:opacity-50"
          disabled={!selections.deptId}
          value={selections.programId}
          onChange={(e) => handleProgramChange(e.target.value)}
        >
          <option value="">Select Program</option>
          {data.programs.map((p: any) => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>

        <select 
          className="p-3 border rounded-lg bg-white text-sm disabled:opacity-50"
          disabled={availableYears.length === 0}
          value={selections.academicYear}
          onChange={(e) => setSelections({...selections, academicYear: e.target.value, subjectId: ""})}
        >
          <option value="">Select Year</option>
          {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
        </select>

        <select 
          className="p-3 border rounded-lg bg-white text-sm disabled:opacity-50"
          disabled={!selections.academicYear}
          value={selections.subjectId}
          onChange={(e) => setSelections({...selections, subjectId: e.target.value})}
        >
          <option value="">Select Subject</option>
          {data.subjects.map((s: any) => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>

        {/* Faculty Selector */}
        <select
          className="p-3 border rounded-lg bg-white text-sm disabled:opacity-50"
          value={selections.facultyId}
          onChange={(e) => setSelections({...selections, facultyId: e.target.value})}
        >
          <option value="">Select Faculty</option>
          {facultyList.map((f: any) => (
            <option key={f._id} value={f._id}>{f.username}</option>
          ))}
        </select>

        {/* Division Input */}
        <input 
          className="p-3 border rounded-lg bg-white text-sm"
          placeholder="Division (A/B)"
          value={selections.division}
          onChange={(e) => setSelections({...selections, division: e.target.value.toUpperCase()})}
        />

        {/* Batch Input (Optional) */}
        <input 
          className="p-3 border rounded-lg bg-white text-sm"
          placeholder="Batch (Opt)"
          value={selections.batch}
          onChange={(e) => setSelections({...selections, batch: e.target.value.toUpperCase()})}
        />
      </div>

      <div className="mt-8 border-t pt-6">
        <input 
          className="w-full p-4 border-b text-xl font-bold mb-6 focus:border-rose-500 outline-none" 
          placeholder="Form Title (e.g., End Sem Feedback)" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
        />
        
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-slate-500 uppercase tracking-wider">
            Questionnaire
          </label>
          
          {questions.map((q, idx) => (
            <div key={idx} className="flex gap-4 items-start group">
              <span className="mt-3 font-bold text-slate-300">{idx + 1}.</span>
              <div className="flex-1">
                <input 
                  className="w-full p-3 bg-slate-50 border border-transparent focus:border-rose-200 focus:bg-white rounded-xl transition-all outline-none"
                  placeholder="Enter your question..."
                  value={q.questionText}
                  onChange={(e) => handleQuestionChange(idx, e.target.value)}
                />
              </div>
              <button 
                type="button"
                onClick={() => removeQuestion(idx)}
                className="mt-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col md:flex-row gap-4">
          <button 
            type="button"
            onClick={addQuestion}
            className="px-6 py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 font-medium hover:bg-slate-50 transition-colors"
          >
            + Add Another Question
          </button>
          
          <button 
            type="button"
            onClick={handleSaveForm}
            className="flex-1 bg-rose-600 text-white font-bold py-3 rounded-xl hover:bg-rose-700 shadow-lg transition-all active:scale-[0.98]"
          >
            Publish Targeted Form
          </button>
        </div>
      </div>
    </div>
  );
}