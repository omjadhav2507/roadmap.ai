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
        setProgress(data.progress || {});
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
    return <div className="text-white">Loading...</div>;
  }

  if (!roadmap) {
    return <div className="text-white">Roadmap not found</div>;
  }

  return (
    <div className="min-h-screen bg-black py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[85rem] mx-auto space-y-8 py-20 mt-8">
        <Link
          to="/dashboard"
          className="text-blue-400 hover:underline mb-4 inline-block"
        >
          &larr; Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold mb-6 text-white">{roadmap.title}</h1>
        <p className="text-gray-300 mb-6">{roadmap.description}</p>

        {/* Timeline */}
        <div className="space-y-8">
          {roadmap.content.steps.map((step, index) => (
            <div key={index} className="group relative flex gap-x-5">
              {/* Icon */}
              <div className="relative group-last:after:hidden after:absolute after:top-8 after:bottom-2 after:start-3 after:w-px after:-translate-x-[0.5px] after:bg-gray-700">
                <div className="relative z-10 w-6 h-6 flex justify-center items-center">
                  <input
                    type="checkbox"
                    checked={progress[index] || false}
                    onChange={() => handleStepCompletion(index)}
                    className="form-checkbox h-5 w-5 text-blue-600 rounded-full border-gray-300 focus:ring-blue-500"
                  />
                </div>
              </div>
              {/* End Icon */}

              {/* Right Content */}
              <div className="grow pb-8 group-last:pb-0">
                <h3 className="font-semibold text-lg text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-300 mb-3">{step.description}</p>
                {step.resources && step.resources.length > 0 && (
                  <div className="mt-2">
                    <h4 className="font-semibold text-sm text-gray-200 mb-1">
                      Resources:
                    </h4>
                    <ul className="list-disc list-inside space-y-1">
                      {step.resources.map((resource, resIndex) => (
                        <li key={resIndex} className="text-sm text-blue-400">
                          {resource.startsWith("http") ? (
                            <a
                              href={resource}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              {resource}
                            </a>
                          ) : (
                            resource
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {/* End Right Content */}
            </div>
          ))}
        </div>
        {/* End Timeline */}
      </div>
    </div>
  );
}

export default RoadmapDetail;
