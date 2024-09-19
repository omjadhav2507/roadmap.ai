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
        navigate("/login");
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

    if (error) {
      console.error("Error fetching roadmaps:", error);
    } else {
      setRoadmaps(data);
    }
    setIsLoading(false);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-white py-8">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-5xl font-bold text-gray-800">Your Dashboard</h1>
          <p className="text-m text-gray-600">
            Welcome back, {user.email}! Here are your generated roadmaps.
          </p>
        </header>

        <Link
          to="/generate-roadmap"
          className="block w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-200 text-center"
        >
          Generate New Roadmap
        </Link>

        {isLoading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading your roadmaps...</p>
          </div>
        ) : roadmaps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roadmaps.map((roadmap) => (
              <div
                key={roadmap.id}
                className="bg-white shadow-lg rounded-lg p-6"
              >
                <h2 className="text-2xl font-bold mb-2">{roadmap.title}</h2>
                <p className="text-gray-600 mb-4">{roadmap.description}</p>
                <button
                  onClick={() => navigate(`/roadmap/${roadmap.id}`)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200"
                >
                  View Roadmap
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600">
            You haven't generated any roadmaps yet. Click the button above to
            create your first one!
          </p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
