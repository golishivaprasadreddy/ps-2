import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Quiz from "./components/Quiz";
import Forum from "./components/Forum";
import Navbar from "./components/Navbar";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import { ToastContainer } from "react-toastify";
import TopicPage from "./pages/TopicPage";

export default function App() {
  return (
    <Router>
      <Navbar />
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/quiz" element={<Quiz userId={localStorage.getItem('userId')} token={localStorage.getItem('token')} />} />
        <Route path="/forum" element={<Forum userId={localStorage.getItem('userId')} token={localStorage.getItem('token')} />} />
  <Route path="/courses" element={<Courses userId={localStorage.getItem('userId')} token={localStorage.getItem('token')} />} />
  <Route path="/courses/:id" element={<CourseDetail userId={localStorage.getItem('userId')} token={localStorage.getItem('token')} />} />
  <Route path="/courses/:id/topics/:topicIndex" element={<TopicPage />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}
