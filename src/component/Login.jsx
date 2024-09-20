import React, { useState, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

function LoginModal({ isOpen, onClose, onSignupClick }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      onClose();
      navigate("/generate-roadmap");
    } catch (error) {
      setError(error.message);
    }
  };

  const handleOutsideClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  if (!isOpen) return null;

  return (
    <div
      className="hs-overlay fixed top-0 start-0 z-[80] w-full h-full overflow-x-hidden overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center"
      onClick={handleOutsideClick}
    >
      <div className="hs-overlay-open:mt-7 hs-overlay-open:opacity-100 hs-overlay-open:duration-500 mt-0 opacity-100 ease-out transition-all sm:max-w-lg sm:w-full m-3 sm:mx-auto">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm dark:bg-neutral-900 dark:border-neutral-800">
          <div className="p-4 sm:p-7">
            <div className="text-center">
              <h3 className="block text-2xl font-bold text-gray-800 dark:text-neutral-200">
                Sign in to your account
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-neutral-400">
                Don't have an account?
                <button
                  onClick={onSignupClick}
                  className="text-blue-600 decoration-2 hover:underline focus:outline-none focus:underline font-medium dark:text-blue-500 ml-1"
                >
                  Sign up here
                </button>
              </p>
            </div>

            <div className="mt-5">
              <form onSubmit={handleLogin}>
                <div className="grid gap-y-4">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm mb-2 dark:text-white"
                    >
                      Email address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="py-3 px-4 block w-full border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:focus:border-blue-500"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm mb-2 dark:text-white"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        id="password"
                        name="password"
                        className="py-3 px-4 block w-full border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:focus:border-blue-500"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="text-xs text-red-600 mt-2">{error}</div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800"
                  >
                    Sign in
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-500"
      >
        <span className="sr-only">Close</span>
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}

export default LoginModal;
