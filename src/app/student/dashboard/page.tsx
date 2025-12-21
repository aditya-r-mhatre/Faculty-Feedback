"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const [forms, setForms] = useState<any[]>([]);
  const [selectedForm, setSelectedForm] = useState<any>(null);
  const [ratings, setRatings] = useState<any>({});
  const [comment, setComment] = useState(""); // State for optional comments

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      fetch("/api/student/get-forms")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setForms(data);
        })
        .catch(err => console.error("Fetch error:", err)); 
    }
  }, [status, session]);

  // NEW: Initialize ratings whenever a form is opened
  useEffect(() => {
    if (selectedForm?.questions) {
      const initialRatings: any = {};
      selectedForm.questions.forEach((_: any, index: number) => {
        initialRatings[index] = 3; // Default middle value out of 5
      });
      setRatings(initialRatings);
      setComment(""); // Reset comment for new form
    }
  }, [selectedForm]);

  const handleSubmit = async () => {
    if (!selectedForm?._id) return;

    // Safety Check: Ensure ratings are not empty
    if (Object.keys(ratings).length === 0) {
      alert("Please provide ratings before submitting.");
      return;
    }

    const res = await fetch("/api/student/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mappingId: selectedForm._id,
        ratings,
        comments: comment
      })
    });

    if (res.ok) {
      alert("Feedback submitted successfully!");
      setForms(prev => prev.filter((f: any) => f._id !== selectedForm._id));
      setSelectedForm(null);
      setRatings({});
    } else {
      const errData = await res.json();
      alert(`Error: ${errData.error || "Submission failed"}`);
    }
  };

  if (status === "loading") return <div className="p-10 text-center">Loading Profile...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-emerald-800">Available Feedbacks</h2>
      
      {session?.user && (
        <div className="mb-4 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
          <p className="text-sm text-emerald-700">
            <strong>Active Profile:</strong> Div {(session.user as any).division} | 
            Batch {(session.user as any).batch || "All"}
          </p>
        </div>
      )}

      <div className="grid gap-4">
        {forms.length === 0 ? (
          <div className="p-8 border-2 border-dashed border-gray-200 rounded-xl text-center">
            <p className="text-gray-500 italic">No pending feedbacks for your division.</p>
          </div>
        ) : (
          forms.map((form: any) => (
            <div key={form._id} className="bg-white p-4 rounded-xl shadow-sm border flex justify-between items-center">
              <div>
                <p className="font-bold text-lg">{form.title}</p>
                <p className="text-sm text-gray-600">Subject: {form.subjectId?.name || "N/A"}</p>
              </div>
              <button 
                onClick={() => setSelectedForm(form)}
                className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Fill Feedback
              </button>
            </div>
          ))
        )}
      </div>

      {selectedForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-xl">{selectedForm.title}</h3>
              <button onClick={() => setSelectedForm(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <p className="text-gray-500 mb-6 text-sm">Rating Scale: 1 (Poor) to 5 (Excellent)</p>
            
            <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2">
              {selectedForm.questions?.map((q: any, index: number) => (
                <div key={index} className="space-y-3 p-3 bg-slate-50 rounded-lg">
                  <label className="block text-sm font-semibold text-gray-800">
                    {index + 1}. {q.questionText}
                  </label>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-400">1</span>
                    <input 
                      type="range" min="1" max="5" step="1"
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                      value={ratings[index] || 3}
                      onChange={(e) => setRatings({...ratings, [index]: parseInt(e.target.value)})}
                    />
                    <span className="text-xs text-gray-400">5</span>
                    <div className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-md font-bold text-sm min-w-8 text-center">
                      {ratings[index] || 3}
                    </div>
                  </div>
                </div>
              ))}

              {/* Added Comment Field */}
              <div className="space-y-2 mt-4">
                <label className="block text-sm font-medium text-gray-700">Additional Comments (Optional)</label>
                <textarea 
                  className="w-full p-3 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  rows={3}
                  placeholder="Share your thoughts..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button 
                onClick={handleSubmit} 
                className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md active:scale-95"
              >
                Submit Feedback
              </button>
              <button 
                onClick={() => { setSelectedForm(null); setRatings({}); }} 
                className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}