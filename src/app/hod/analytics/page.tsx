"use client";
import { useState, useEffect } from "react";

export default function HODAnalytics() {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCommentsFor, setShowCommentsFor] = useState<string | null>(null);
  const [selectedComments, setSelectedComments] = useState<any[]>([]);

  useEffect(() => {
    // Calls the API route we will define in Step 2
    fetch("/api/hod/analytics")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setStats(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-10 text-center font-medium">Loading Departmental Analytics...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Faculty Performance Overview</h2>
      </div>

      <div className="grid gap-6">
        {stats.length > 0 ? (
          stats.map((item: any) => (
            <div key={item.formId || item._id} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-indigo-900 capitalize">
                    {item.title || item.details?.subjectName || "Unnamed Subject"}
                  </h3>
                  <p className="text-gray-600 font-medium">Faculty: {item.facultyName}</p>
                  <div className="flex gap-4 mt-1">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">
                      Submissions: {item.totalSubmissions}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-4xl font-black text-indigo-600">
                    {Number(item.overallAverage ?? item.averageRating ?? 0).toFixed(2)}
                  </span>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Avg Rating</p>
                </div>
              </div>
              
              {/* Performance Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-gray-500">
                  <span>Progress</span>
                  <span>{Math.round(((item.overallAverage ?? item.averageRating ?? 0) / 5) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div 
                    className="bg-indigo-500 h-3 rounded-full transition-all duration-700 ease-out" 
                    style={{ width: `${((item.overallAverage ?? item.averageRating ?? 0) / 5) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Per-question averages */}
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-gray-600 mb-2">Question-wise Averages</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {(item.perQuestionAverages || []).map((q: any, idx: number) => {
                    const questionIndex = parseInt(String(q.key), 10);
                    const questionText = item.questions?.[questionIndex]?.questionText || `Question ${questionIndex + 1}`;
                    return (
                      <div key={q.key || idx} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                        <div className="text-sm text-gray-700">{questionText}</div>
                        <div className="text-sm font-bold text-indigo-600">{Number(q.avg).toFixed(2)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Comments action */}
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-500">Comments: {((item.comments) || []).length}</div>
                <div>
                  <button
                    className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100 hover:bg-indigo-100"
                    onClick={() => { setSelectedComments(item.comments || []); setShowCommentsFor(item.formId || item._id); }}
                  >
                    View Comments
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-20 border-2 border-dashed border-gray-200 rounded-2xl text-center">
            <p className="text-gray-400 text-lg">No feedback responses found for your department yet.</p>
          </div>
        )}
      </div>

      {/* Comments Modal */}
      {showCommentsFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCommentsFor(null)}></div>
          <div className="relative bg-white rounded-lg shadow-lg w-11/12 max-w-2xl p-6 z-10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Comments</h3>
              <button className="text-gray-500" onClick={() => setShowCommentsFor(null)}>✕</button>
            </div>
            <div className="max-h-72 overflow-auto space-y-3">
              {selectedComments.length === 0 ? (
                <p className="text-sm text-gray-500">No comments available.</p>
              ) : (
                selectedComments.map((c: any, i: number) => (
                  <div key={i} className="p-3 bg-gray-50 rounded">
                    <div className="text-sm text-gray-700">{c.comment}</div>
                    <div className="text-xs text-gray-400 mt-1">Student: {String(c.studentId || '—')}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}