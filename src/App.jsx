import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import { ToastContainer } from "react-toastify";
const Register = lazy(() => import("./pages/Register"));
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Quiz = lazy(() => import("./components/Quiz"));
const Forum = lazy(() => import("./components/Forum"));
const Courses = lazy(() => import("./pages/Courses"));
const CourseDetail = lazy(() => import("./pages/CourseDetail"));
const TopicPage = lazy(() => import("./pages/TopicPage"));

export default function App() {
  return (
    <Router>
      <Navbar />
      <ToastContainer position="top-right" autoClose={3000} />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500">Loading...</div>}>
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
      </Suspense>
    </Router>
  );
}
