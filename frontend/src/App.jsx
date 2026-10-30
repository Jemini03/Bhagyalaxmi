import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './AdminLogin.jsx';
import AdminDashboard from './AdminDashBoard.jsx';
import PublicWebsite from './PublicWebsite.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicWebsite />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin/dashboard"
        element={<AdminDashboard />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;