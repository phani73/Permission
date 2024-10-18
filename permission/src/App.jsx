import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from './Login';
import Dashboard from './routes/Dashboard'; 
import SearchPage from './routes/SearchPage';
import PermissionPage from './routes/PermissionPage';
import HODDashboard from './routes/HODDashboard.jsx'; 
import FACULTYDashboard from './routes/FACULTYDashboard.jsx'; // Adjust the path to match your actual file structure
import HodPermissionPage from './routes/HodPermissionPage.jsx'; // Import HodPermissionPage component
import StudentPage from './routes/StudentPage.jsx';
import FacultyPage from './routes/FacultyPage.jsx';
import HodPermissionHistory from './routes/HodPermissionHistory'; // Import HodPermissionHistory component

function App() {
  return (
    //all the routes which are defined 
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />
        <Route path="/dashboard/:username" element={<Dashboard />} />
        <Route path="/hod-dashboard/:username" element={<HODDashboard />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/faculty-dashboard/:year/:username" element={<FACULTYDashboard />} />
         
        
        <Route path="/permission/:username" element={<PermissionPage />} />
        <Route path="/hod-permissions" element={<HodPermissionPage />} />
        
        <Route path="/hod/history" element={<HodPermissionHistory />} /> 
         
        
        <Route path="/messages/:username/" element={<StudentPage />} />
        <Route path="/message/:username/:year" element={<FacultyPage  hodId="HOD123" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
