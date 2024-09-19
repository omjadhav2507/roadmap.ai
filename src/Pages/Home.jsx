import React, { useEffect } from "react";
import Navbar from "../component/Navbar";
import Logo from "../assets/Logo.svg";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        navigate("/generate-roadmap");
      }
    };
    checkUser();
  }, [navigate]);

  const handleGenerateRoadmap = async (e) => {
    e.preventDefault();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
    } else {
      navigate("/generate-roadmap");
    }
  };

  return (
    <>
      <div className="bg-black text-white min-h-screen">
        <main className="container text-center max-w-4xl mx-auto px-4 py-14">
          <h2 className="text-5xl font-bold mb-6">
            Transform Your Goals with AI-Powered Roadmaps
          </h2>
          <p className="text-xl mb-8">
            Free to use. Easy to try. Just describe your goal and RoadmapAI can
            help with planning, strategizing, and achieving your objectives.
          </p>

          <form
            onSubmit={handleGenerateRoadmap}
            className="max-w-2xl mx-auto mb-6"
          >
            <div className="flex">
              <input
                type="text"
                placeholder="Describe your goal or project..."
                className="flex-grow px-6 py-4 border border-white text-white bg-black rounded-l-full"
              />
              <button
                type="submit"
                className="bg-white hover:from-gray-100 hover:to-indigo-700 text-black px-8 py-4 rounded-r-full"
              >
                Generate Roadmap
              </button>
            </div>
          </form>
        </main>

        <section className="container mx-auto max-w-6xl px-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              "Plan a startup launch strategy →",
              "Create a personal development roadmap →",
              "Design a product roadmap for my app →",
              "Outline a career transition plan →",
              "Develop a marketing campaign timeline →",
              "Structure a research project plan →",
            ].map((prompt, index) => (
              <div
                key={index}
                className="bg-custom-gray text-white p-4 rounded-lg cursor-pointer h-24 flex justify-center items-center text-center group"
              >
                <span className="group-hover:underline">{prompt}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <footer className="bg-black mt-auto w-full max-w py-10 px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="flex justify-center items-center">
          <a
            className="flex items-center space-x-2 rounded-xl text-xl font-semibold focus:outline-none focus:opacity-80 text-black dark:text-white"
            aria-label="Preline"
          >
            <img src={Logo} alt="Logo" className="h-8 w-auto" />
            <span>
              Roadmap.AI by{" "}
              <a
                href="https://x.com/_om_jadhav?t=0e7CSa-PkTc_BfW8Vf8AIw&s=09"
                className="text-indigo-600 hover:underline"
              >
                Omm
              </a>
            </span>
          </a>
        </div>
      </footer>
    </>
  );
}

export default Home;
