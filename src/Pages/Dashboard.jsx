import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, Link } from "react-router-dom";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [roadmaps, setRoadmaps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndRoadmaps = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        fetchRoadmaps(user.id);
      } else {
        navigate("/");
      }
    };
    fetchUserAndRoadmaps();
  }, [navigate]);

  const fetchRoadmaps = async (userId) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("roadmaps")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    console.log("Fetched roadmaps:", data);
    console.log("Fetch error:", error);

    if (error) {
      console.error("Error fetching roadmaps:", error);
    } else {
      setRoadmaps(data || []);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-black py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[85rem] mx-auto space-y-8 py-20 mt-8">
        <header className="text-center space-y-2">
          <p className="text-m text-gray-200">
            Welcome back, {user?.email}! Here are your generated roadmaps.
          </p>
        </header>

        {roadmaps.length > 0 ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {roadmaps.map((roadmap) => (
              <Link
                key={roadmap.id}
                to={`/roadmap/${roadmap.id}`}
                className="group flex flex-col bg-white border shadow-sm rounded-xl hover:shadow-md transition dark:bg-neutral-900 dark:border-neutral-800 h-48"
              >
                <div className="p-4 md:p-5 flex flex-col h-full">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-neutral-200 mb-2 line-clamp-2">
                    {roadmap.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-neutral-400 flex-grow overflow-hidden">
                    <span className="line-clamp-3">{roadmap.description}</span>
                  </p>
                  <div className="mt-auto pt-2">
                    <span className="text-xs text-blue-600 dark:text-blue-400">
                      View Roadmap →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400">
            You haven't generated any roadmaps yet.
            <Link
              to="/generate-roadmap"
              className="text-blue-400 hover:underline ml-1"
            >
              Click here to create your first one!
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
