import React, { useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useHistory } from 'react-router-dom';
import './login.css';

export default function Login() {
  // create refs for the email and password input fields
  const emailref = useRef();
  const passwordref = useRef();

  // get the login function from the AuthContext
  const { login } = useAuth();

  // create state variables for error messages and loading state
  const [error, SE] = useState('');
  const [loading, SL] = useState(false);

  // get the history object from react-router-dom
  const history = useHistory();

  // form submission handler function
  async function handlesubmit(e) {
    e.preventDefault();

    try {
      SE(''); // clear any previous error messages
      SL(true); // set loading state to true
      console.log(await login(emailref.current.value, passwordref.current.value)); // call login function and log the result to the console
      history.push('/home'); // redirect user to home page after successful login
    } catch {
      SE('Failed to sign in'); // display error message if login fails
    }

    SL(false); // set loading state to false
  }

  return (
    <div className="login-container">
      <h1>You must be logged in to use app</h1>
      <form onSubmit={handlesubmit}>
        <div className="card">
          <div className="card-body">
            <h2 className="card-title">Log In</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" ref={emailref} required />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input type="password" id="password" ref={passwordref} required />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              Log In
            </button>
            <div className="text-center mt-2">
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
