import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import './App.css';

function Login() {
  const [studentUsername, setStudentUsername] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [studentShowPassword, setStudentShowPassword] = useState(false);

  const [facultyUsername, setFacultyUsername] = useState('');
  const [facultyPassword, setFacultyPassword] = useState('');
  const [facultyShowPassword, setFacultyShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleStudentSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    axios.post('http://localhost:5000/login', { username: studentUsername, password: studentPassword })
      .then((response) => {
        console.log('Student login response:', response.data);
        const { message, user } = response.data;
        if (message === "Login Successful" && user && user.role === 'student') {
          navigate(`/dashboard/${studentUsername}`);
        } else {
          alert('Login failed. Please check your username and password.');
        }
      })
      .catch((err) => {
        console.error('Login error:', err);
        alert('Login failed due to a server error. Please try again later.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleFacultySubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    axios.post('http://localhost:5000/login', { username: facultyUsername, password: facultyPassword })
      .then((response) => {
        console.log('Faculty/HOD login response:', response.data);
        const { message, user } = response.data;
        if (message === "Login Successful" && user && (user.role === 'faculty' || user.role === 'hod')) {
          if (user.role === 'hod') {
            navigate(`/hod-dashboard/${facultyUsername}`);
          } else {
            navigate(`/faculty-dashboard/${user.year}/${facultyUsername}`);
          }
        } else {
          alert('Login failed. Please check your username and password.');
        }
      })
      .catch((err) => {
        console.error('Login error:', err);
        alert('Login failed due to a server error. Please try again later.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div>
      <h1 className='title'>STUDENT PERMISSION CONNECT</h1>
   {loading && (
  <div className={`loader-container ${loading ? 'loading' : ''}`}>
    <div className="dot-spinner">
      <div className="dot-spinner__dot"></div>
      <div className="dot-spinner__dot"></div>
      <div className="dot-spinner__dot"></div>
      <div className="dot-spinner__dot"></div>
      <div className="dot-spinner__dot"></div>
      <div className="dot-spinner__dot"></div>
      <div className="dot-spinner__dot"></div>
      <div className="dot-spinner__dot"></div>
    </div>
  </div>
)}
      
      <div className="container">
        <div className='design'>
          <h2>Student Login</h2>
          <br />
          <form onSubmit={handleStudentSubmit}>
            <input
              type="text"
              placeholder="Username"
              required
              onChange={(e) => setStudentUsername(e.target.value)}
            />
            <div className="password-container">
              <input
                type={studentShowPassword ? "text" : "password"}
                placeholder="Password"
                required
                onChange={(e) => setStudentPassword(e.target.value)}
              />
              <span
                className="password-icon"
                onClick={() => setStudentShowPassword(!studentShowPassword)}
              >
                {studentShowPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
              </span>
            </div>
            <button type="submit">Login</button>
          </form>
        </div>
        <div className='design'>
          <h2>Faculty/HOD Login</h2>
          <br />
          <form onSubmit={handleFacultySubmit}>
            <input
              type="text"
              placeholder="Username"
              required
              onChange={(e) => setFacultyUsername(e.target.value)}
            />
            <div className="password-container">
              <input
                type={facultyShowPassword ? "text" : "password"}
                placeholder="Password"
                required
                onChange={(e) => setFacultyPassword(e.target.value)}
              />
              <span
                className="password-icon"
                onClick={() => setFacultyShowPassword(!facultyShowPassword)}
              >
                {facultyShowPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
              </span>
            </div>
            <button type="submit">Login</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
