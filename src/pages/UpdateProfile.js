// Import necessary dependencies
import React, { useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link, useHistory } from "react-router-dom";
import './Updateprofile.css';

export default function UpdateProfile() {
  // Initialize input refs and state variables
  const emailref = useRef();
  const passwordref = useRef();
  const passwordconfirmref = useRef();

  // Get the current user and the UPass function from the AuthContext
  const { currentUser, UPass } = useAuth();

  // Initialize error and loading states
  const [error, SE] = useState("");
  const [loading, SL] = useState(false);
  const history = useHistory();

  // Function to handle the form submission
  function handlesubmit(e) {
    e.preventDefault();

    // Check if the passwords match, if not, set error state
    if (passwordref.current.value !== passwordconfirmref.current.value) {
      return SE("Passwords do not match");
    }

    // Initialize an array to store promises
    const promises = [];

    // Set the loading state to true and reset the error state
    SL(true);
    SE("");

    // If there's a new password value, push the UPass function to the promises array
    if (passwordref.current.value) {
      promises.push(UPass(passwordref.current.value));
    }

    // Wait for all promises to resolve
    Promise.all(promises)
      .then(() => {
        // If successful, navigate to the homepage and show an alert
        history.push("/");
        window.alert("Password changed");
      })
      .catch(() => {
        // If an error occurs, set the error state
        SE("Failed to update password");
      })
      .finally(() => {
        // Set the loading state back to false
        SL(false);
      });
  }

  // Render the UpdateProfile component

  return (
    <div className="update-profile-container">
      <h2 className="update-profile-title">Update password</h2>
      {error && <div className="update-profile-error">{error}</div>}
      <form className="update-profile-form" onSubmit={handlesubmit}>
        <div className="update-profile-form-group">
          <label className="update-profile-label" htmlFor="email">Email</label>
          <input
            id="email"
            className="update-profile-input"
            type="email"
            ref={emailref}
            required
            defaultValue={currentUser.email}
            disabled
          />
        </div>
        <div className="update-profile-form-group">
          <label className="update-profile-label" htmlFor="password">Password</label>
          <input
            id="password"
            className="update-profile-input"
            type="password"
            ref={passwordref}
            placeholder="Leave blank to keep the same"
          />
        </div>
        <div className="update-profile-form-group">
          <label className="update-profile-label" htmlFor="password-confirm">Password Confirmation</label>
          <input
            id="password-confirm"
            className="update-profile-input"
            type="password"
            ref={passwordconfirmref}
            placeholder="Leave blank to keep the same"
          />
        </div>
        <button disabled={loading} className="update-profile-submit" type="submit">
          Update
        </button>
      </form>
      <div className="update-profile-cancel">
        <Link to="/">Cancel</Link>
      </div>
    </div>
  );
}
