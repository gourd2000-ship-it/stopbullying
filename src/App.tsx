import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StudentLanding from './pages/student/StudentLanding';
import ChatPage from './pages/student/ChatPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminDetail from './pages/admin/AdminDetail';

function App() {
  return (
    <Router>
      <Routes>
        {/* Student Routes */}
        <Route path="/" element={<StudentLanding />} />
        <Route path="/chat" element={<ChatPage />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/consultation/:id" element={<AdminDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
