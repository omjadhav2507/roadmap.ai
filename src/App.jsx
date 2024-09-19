import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./component/Navbar";
import Home from "./Pages/Home";
import Login from "./component/Login";
import Signup from "./component/Signup";
import Dashboard from "./Pages/Dashboard";
import RoadmapGen from "./Pages/RoadmapGen";
import ConfirmEmail from "./component/ConfirmEmail";
import RoadmapDetail from "./component/RoadmapDetail";

function App() {
  return (
    <Router>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/generate-roadmap" element={<RoadmapGen />} />
        <Route path="/confirm-email" element={<ConfirmEmail />} />
        <Route path="/roadmap/:id" element={<RoadmapDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
