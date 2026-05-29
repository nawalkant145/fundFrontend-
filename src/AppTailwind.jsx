import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CoursesPage from "./pages/CoursesPage";

function App() {
  return (
    <div className="min-h-screen bg-dark-navy text-white overflow-x-hidden">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<CoursesPage />} />
      </Routes>
    </div>
  );
}

export default App;
