import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

function RoadmapDetail() {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({});
  const { id } = useParams();

  useEffect(() => {
    const fetchRoadmap = async () => {
      const { data, error } = await supabase
        .from("roadmaps")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching roadmap:", error);
      } else {
        setRoadmap(data);
      }
      setLoading(false);
    };

    fetchRoadmap();
  }, [id]);

  useEffect(() => {
    const fetchProgress = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data, error } = await supabase
        .from("roadmap_progress")
        .select("*")
        .eq("roadmap_id", id)
        .eq("user_id", userData.user.id)
        .single();

      if (data) {
        setProgress(data.progress);
      }
    };

    fetchProgress();
  }, [id]);

  const handleStepCompletion = async (stepIndex) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const newProgress = { ...progress, [stepIndex]: !progress[stepIndex] };
    setProgress(newProgress);

    await supabase.from("roadmap_progress").upsert({
      roadmap_id: id,
      user_id: userData.user.id,
      progress: newProgress,
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!roadmap) {
    return <div>Roadmap not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        to="/dashboard"
        className="text-blue-600 hover:underline mb-4 inline-block"
      >
        &larr; Back to Dashboard
      </Link>
      <h1 className="text-3xl font-bold mb-6">{roadmap.title}</h1>
      <p className="text-gray-600 mb-6">{roadmap.description}</p>
      <div className="space-y-6">
        {roadmap.content.steps.map((step, index) => (
          <div key={index} className="border-l-4 border-blue-500 pl-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={progress[index] || false}
                onChange={() => handleStepCompletion(index)}
                className="mr-2"
              />
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
            </div>
            <p className="text-gray-700 mb-2">{step.description}</p>
            {step.resources && step.resources.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-600 mb-1">Resources:</h4>
                <ul className="list-disc list-inside text-blue-600">
                  {step.resources.map((resource, resIndex) => (
                    <li key={resIndex}>{resource}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default RoadmapDetail;
