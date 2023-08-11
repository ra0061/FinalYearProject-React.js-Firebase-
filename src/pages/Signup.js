import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useHistory } from 'react-router-dom';
import './signup.css';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

export default function Signup() {
  // Define state variables for form fields, error, and loading
  const [name, SFN] = useState('');
  const [lastName, SLN] = useState('');
  const [employeeId, SEI] = useState('');
  const [email, SE] = useState('');
  const [password, SP] = useState('');
  const [confirmPassword, SCP] = useState('');
  const [error, SER] = useState('');
  const [loading, SL] = useState(false);
  const { signup } = useAuth();
  const history = useHistory();
  const db = firebase.firestore();

  useEffect(() => {
    // Fetch employee IDs from Firestore and generate a new unique employee ID
    const fetchemployeeids = async () => {
      try {
        const UDocs = await db.collection('users').get();
        const employeeIds = UDocs.docs.map((doc) => doc.data().employeeId);
        generateemployeeid(employeeIds);
      } catch (error) {
        console.error('Error fetching employee IDs:', error);
      }
    };
    fetchemployeeids();
  }, []);

  const generateemployeeid = (employeeIds) => {
    // Generate a unique employee ID not present in the provided employeeIds array
    let id;
    do {
      id = Math.floor(100000 + Math.random() * 900000).toString();
    } while (employeeIds.includes(id));
    SEI(id);
  };

  async function handlesubmit(e) {
    e.preventDefault();
    // Check if the password and confirmPassword fields match
    if (password !== confirmPassword) {
      return SER('Passwords do not match');
    }
    try {
      SER('');
      SL(true);
      // Sign up the user using email and password
      await signup(email, password);
      const user = firebase.auth().currentUser;
      const now = new Date(); // get current date and time
      await db.collection('users').doc(user.uid).set({
        name: name,
        lastName: lastName,
        employeeId: employeeId,
        email: email,
        signupDate: now, 
        role: e.target.elements.role.value 
      });
      // Redirect to the login page
      history.push('/login');
    } catch {
      SER('Failed to create an account');
    }
    SL(false);
  }
  
  return (
    // Render the sign-up form
    <div className='test'>
      <div className="signup-form-container">
        <h2 className="form-title">Sign Up</h2>
        {error && <div className="form-error">{error}</div>}
        <form onSubmit={handlesubmit} className="signup-form">
          {/* Form fields for first name, last name, employee ID, role, email, password, and confirm password */}
          <div className="form-group">
            <label htmlFor="name">First Name:</label>
            <input
              className='input1'
              type="text"
              id="name"
              value={name}
              onChange={(e) => SFN(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Last Name:</label>
            <input
              className='input1'
              type="text"
              id="          lastName"
              value={lastName}
              onChange={(e) => SLN(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="employeeId">Employee ID:</label>
            <input
              type="text"
              className='input1'
              id="employeeId"
              value={employeeId}
              onChange={(e) => SEI(e.target.value)}
              required
              disabled
            />
          </div>
          <div className="form-group">
            <label htmlFor="role">Role:</label>
            <input
              className='input1'
              type="text"
              id="role"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              className='input1'
              type="email"
              id="email"
              value={email}
              onChange={(e) => SE(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              className='input1'
              type="password"
              id="password"
              value={password}
              onChange={(e) => SP(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirm-password">Confirm Password:</label>
            <input
              className='input1'
              type="password"
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => SCP(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="form-submit" disabled={loading}>
            Sign Up
          </button>
        </form>
        <div className="form-text">
          Already have an account? <Link to="/login">Log In</Link>
        </div>
      </div>
    </div>
  );
}

