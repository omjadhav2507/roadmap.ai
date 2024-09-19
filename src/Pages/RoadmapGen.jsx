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
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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

      // Sanitize user input before saving to database
      const sanitizedTitle = DOMPurify.sanitize(roadmapData.title);
      const sanitizedDescription = DOMPurify.sanitize(roadmapData.description);

      const { data, error } = await supabase.from("roadmaps").insert({
        id: uuidv4(),
        user_id: user.id,
        title: sanitizedTitle,
        description: sanitizedDescription,
        content: roadmapData,
      });

      if (error) throw error;
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
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-white py-8">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-5xl font-bold text-gray-800">
            Your Personalized Learning Path
          </h1>
          <p className="text-m text-gray-600">
            Unlock your potential with a clear and concise plan, designed to fit
            your schedule and learning goals.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white bg-opacity-80"
              placeholder="Enter your primary learning goal"
              value={mainPrompt}
              onChange={(e) => setMainPrompt(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white bg-opacity-80"
              value={skillLevel}
              onChange={(e) => setSkillLevel(e.target.value)}
            >
              <option value="">Select your current skill level</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>

            <select
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white bg-opacity-80"
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
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white bg-opacity-80"
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
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Submit
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

        {response && !isLoading && (
          <div className="mt-6 p-6 bg-white shadow-lg rounded-lg">
            <h2 className="text-2xl font-bold mb-4">{response.title}</h2>
            <p className="text-gray-600 mb-6">{response.description}</p>
            <div className="space-y-6">
              {response.steps.map((step, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4">
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-700 mb-2">{step.description}</p>
                  {step.resources && step.resources.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-600 mb-1">
                        Resources:
                      </h4>
                      <ul className="list-disc list-inside text-blue-600">
                        {step.resources.map((resource, resIndex) => (
                          <li key={resIndex}>
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
              ))}
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
