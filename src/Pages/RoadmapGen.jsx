import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { v4 as uuidv4 } from "uuid";
import DOMPurify from "dompurify";

// Replace the existing apiKey declaration with:
const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
if (!apiKey) {
  console.error(
    "Google API key is not set. Please set VITE_GOOGLE_API_KEY in your .env file."
  );
}
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

function RoadmapGen() {
  const [user, setUser] = useState(null);
  const [mainPrompt, setMainPrompt] = useState("");
  const [skillLevel, setSkillLevel] = useState("");
  const [timeCommitment, setTimeCommitment] = useState("");
  const [learningPreference, setLearningPreference] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
      } else {
        navigate("/login");
      }
    };
    fetchUser();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setRoadmap(null);

    // Input validation
    if (!mainPrompt || !skillLevel || !timeCommitment || !learningPreference) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    const prompt = `Generate a personalized learning roadmap based on the following details:
    Main goal: "${mainPrompt}".
    Current skill level: ${skillLevel}.
    Time available: ${timeCommitment}.
    Preferred learning style: ${learningPreference}.
    
    Format the response as a JSON object with the following structure:
    {
      "title": "Main topic title",
      "description": "Brief overview of the roadmap",
      "steps": [
        {
          "title": "Step 1 title",
          "description": "Step 1 description",
          "resources": ["https://example.com/resource1", "https://example.com/resource2"]
        },
        // ... more steps
      ]
    }
    
    Important: 
    1. Return only the JSON object, without any markdown formatting or code blocks.
    2. For resources, provide full URLs when possible. If a URL is not available, provide a descriptive title of the resource.`;

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const cleanedResponse = response
        .text()
        .replace(/```json\n?|\n?```/g, "")
        .trim();
      const roadmapData = JSON.parse(cleanedResponse);

      // Set the roadmap state to display it
      setRoadmap(roadmapData);

      // Sanitize user input before saving to database
      const sanitizedTitle = DOMPurify.sanitize(roadmapData.title);
      const sanitizedDescription = DOMPurify.sanitize(roadmapData.description);

      console.log("Generated roadmap data:", roadmapData);

      const { data, error } = await supabase.from("roadmaps").insert({
        id: uuidv4(),
        user_id: user.id,
        title: sanitizedTitle,
        description: sanitizedDescription,
        content: roadmapData,
      });

      if (error) {
        console.error("Error saving roadmap:", error);
        setError("Failed to save roadmap. Please try again.");
      } else {
        console.log("Roadmap saved successfully:", data);
      }
    } catch (error) {
      console.error("Error:", error);
      setError(
        "An error occurred while generating or saving the roadmap. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-black py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-xl w-full space-y-8">
        <header className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            Your Personalized Learning Path
          </h1>
          <p className="text-m text-gray-400">
            Unlock your potential with a clear and concise plan.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <input
            type="text"
            className="w-full p-3 text-sm border border-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-black text-white"
            placeholder="Enter your primary learning goal"
            value={mainPrompt}
            onChange={(e) => setMainPrompt(e.target.value)}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              className="w-full p-3 text-sm border border-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-black text-white"
              value={skillLevel}
              onChange={(e) => setSkillLevel(e.target.value)}
            >
              <option value="">Select your current skill level</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>

            <select
              className="w-full p-3 text-sm border border-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-black text-white"
              value={timeCommitment}
              onChange={(e) => setTimeCommitment(e.target.value)}
            >
              <option value="">Select your available study time</option>
              <option value="Less than 5 hours per week">
                Less than 5 hours per week
              </option>
              <option value="5 to 10 hours per week">
                5 to 10 hours per week
              </option>
              <option value="10 to 15 hours per week">
                10 to 15 hours per week
              </option>
              <option value="More than 15 hours per week">
                More than 15 hours per week
              </option>
            </select>

            <select
              className="w-full p-3 text-sm border border-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-black text-white"
              value={learningPreference}
              onChange={(e) => setLearningPreference(e.target.value)}
            >
              <option value="">Select your preferred learning style</option>
              <option value="Hands-on projects">Hands-on projects</option>
              <option value="Video tutorials">Video tutorials</option>
              <option value="Reading materials">Reading materials</option>
              <option value="Interactive exercises">
                Interactive exercises
              </option>
              <option value="Quizzes and assessments">
                Quizzes and assessments
              </option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-white text-black p-3 rounded-md hover:bg-grey-200 transition duration-200 text-sm"
          >
            Generate Roadmap
          </button>
        </form>

        {isLoading && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Generating your roadmap...</p>
          </div>
        )}

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {roadmap && !isLoading && (
          <div className="mt-10 p-6 bg-gray-900 shadow-lg rounded-lg text-white">
            <h2 className="text-2xl font-bold mb-4 text-white">
              {roadmap.title}
            </h2>
            <p className="text-gray-300 mb-6">{roadmap.description}</p>

            {/* Timeline */}
            <div className="space-y-8">
              {roadmap.steps.map((step, index) => (
                <div key={index} className="group relative flex gap-x-5">
                  {/* Icon */}
                  <div className="relative group-last:after:hidden after:absolute after:top-8 after:bottom-2 after:start-3 after:w-px after:-translate-x-[0.5px] after:bg-gray-700">
                    <div className="relative z-10 w-6 h-6 flex justify-center items-center">
                      <svg
                        className="w-6 h-6 text-blue-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                  {/* End Icon */}

                  {/* Right Content */}
                  <div className="grow pb-8 group-last:pb-0">
                    <h3 className="font-semibold text-sm text-white">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-300">
                      {step.description}
                    </p>
                    {step.resources && step.resources.length > 0 && (
                      <div className="mt-3">
                        <h4 className="font-semibold text-xs text-gray-200 mb-1">
                          Resources:
                        </h4>
                        <ul className="list-disc ms-6 space-y-1">
                          {step.resources.map((resource, resIndex) => (
                            <li
                              key={resIndex}
                              className="text-sm text-blue-300"
                            >
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

            <div className="mt-6">
              <button
                onClick={() => navigate("/dashboard")}
                className="border border-white text-white px-4 py-2 rounded hover:bg-black transition duration-200"
              >
                Save and Go to Dashboard
              </button>
            </div>
          </div>
        )}

        <div className="fixed bottom-4 right-4">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="bg-white bg-opacity-80 p-2 rounded-full hover:bg-gray-200 transition duration-200 shadow-md"
            aria-label="Scroll to top"
          >
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default RoadmapGen;
