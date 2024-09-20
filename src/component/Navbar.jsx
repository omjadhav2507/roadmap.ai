import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Logo from "../assets/Logo.svg";
import { supabase } from "../supabaseClient";

function Navbar({ setShowLoginModal, setShowSignupModal }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogoClick = (e) => {
    e.preventDefault();
    if (user) {
      navigate("/generate-roadmap");
    } else {
      navigate("/");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const renderNavButtons = () => {
    if (!user) {
      return (
        <>
          <button
            onClick={() => setShowLoginModal(true)}
            className="px-6 py-2 rounded-full text-m font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Sign In
          </button>
          <button
            onClick={() => setShowSignupModal(true)}
            className="px-4 py-2 rounded-full text-m font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Get Started
          </button>
        </>
      );
    }

    if (location.pathname === "/dashboard") {
      return (
        <Link
          to="/generate-roadmap"
          className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Generate Roadmap
        </Link>
      );
    }

    return (
      <Link
        to="/dashboard"
        className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
      >
        Dashboard
      </Link>
    );
  };

  return (
    <header className="dark:bg-black backdrop-blur-lg fixed w-full z-20 top-0 start-0">
      <nav className="max-w-7xl mx-auto px-4 p-3 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0">
            <a href="#" onClick={handleLogoClick} className="flex items-center">
              <img src={Logo} alt="Logo" className="h-8 w-auto" />
              <span className="ml-2 text-xl font-semibold text-black dark:text-white">
                Roadmap.AI
              </span>
            </a>
          </div>

          {/* {user && (
            <div className="flex-grow text-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {user.email}
              </span>
            </div>
          )} */}

          <div className="flex items-center space-x-4">
            {renderNavButtons()}
            {user && (
              <button
                onClick={handleSignOut}
                className="px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
