import React, { useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import './forgotpassword.css';

export default function ForgotPassword() {
  const emailref = useRef(); // Creating a reference to the email input field using the useRef hook
  const { ResPass } = useAuth(); // Creating a reference to the resetPassword function from the useAuth hook
  const [error, SE] = useState(""); // Initializing a state variable called error to an empty string
  const [message, SM] = useState(""); // Initializing a state variable called message to an empty string
  const [loading, SL] = useState(false); // Initializing a state variable called loading to false

  async function handlesubmit(e) { // Defining an asynchronous handlesubmit function to handle form submission
    e.preventDefault(); // Preventing the default form submission behavior (which would be to refresh the page)

    try {
      SM(""); // Clearing any existing messages
      SE(""); // Clearing any existing errors
      SL(true); // Setting loading state to true to indicate that the form is being submitted
      await ResPass(emailref.current.value); // Calling the ResPass function with the value of the email input field
      SM("Check your inbox for further instructions"); // Setting the message state to indicate that further instructions have been sent to the user's email
    } catch {
      SE("Failed to reset password"); // Setting the error state to indicate that the password reset failed
    }

    SL(false); // Setting loading state to false to indicate that form submission is complete
  }

  return (
    <div className="forgotform">
      <div className="card1">
        <div className="card-title1">Password Reset</div>
        <div className="card-body1">
          {error && <div className="alert alert-danger">{error}</div>} {/* Displaying an error message if the error state is not empty */}
          {message && <div className="alert alert-success">{message}</div>} {/* Displaying a success message if the message state is not empty */}
          <form onSubmit={handlesubmit}>
            <div className="form-group1">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                ref={emailref} // Setting the reference for the email input field
                required
              />
            </div>
            <button disabled={loading} className="btn" type="submit">
              Reset Password
            </button>
          </form>
          <div className="hm senter">
            <Link to="/login">Login</Link>
          </div>
          <div className="hm senter">
            Need an account? <Link to="/signup">Sign Up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
