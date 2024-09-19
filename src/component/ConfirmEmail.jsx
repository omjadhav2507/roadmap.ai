import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";

function ConfirmEmail() {
  const [error, setError] = useState(null);
  const [confirming, setConfirming] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const confirmEmail = async () => {
      const token = new URLSearchParams(location.hash.slice(1)).get(
        "access_token"
      );
      if (token) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: "signup",
        });
        if (error) {
          setError(error.message);
        } else {
          navigate("/generate-roadmap");
        }
      } else {
        setError("No confirmation token found");
      }
      setConfirming(false);
    };

    confirmEmail();
  }, [location, navigate]);

  if (confirming) {
    return <div>Confirming your email...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return <div>Email confirmed successfully! Redirecting...</div>;
}

export default ConfirmEmail;
