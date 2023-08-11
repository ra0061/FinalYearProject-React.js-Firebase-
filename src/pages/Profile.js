import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import './Profile.css'

export default function UserProfile() {
  // Declare state variables for user profile data
  const [user, SU] = useState(null);
  const [loading, SL] = useState(true);
  const [name, SN] = useState("");
  const [lastName, SLN] = useState("");
  const [employeeId, SEI] = useState("");
  const [editmode, seteditmode] = useState(false);
  const [role, SR] = useState("");


  // Check for authenticated user and retrieve user profile data
  useEffect(() => {
    const auth = getAuth();

    const DA = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const { uid } = user;

        const uR = firebase.firestore().collection("users").doc(uid);
        const uD = await uR.get();

        if (uD.exists) {
          SU({ ...uD.data(), uid }); // Added uid to the user object
          SR(uD.data().role);
        } else {
          SU(null);
        }

        SL(false);
      } else {
        SU(null);
        SL(false);
      }
    });

    return () => DA();
  }, []);

  // Set user profile data in state when user changes
  useEffect(() => {
    if (user) {
      SN(user.name);
      SLN(user.lastName);
      SEI(user.employeeId);
    }
  }, [user]);

  // Handle form submission to update user profile data
  const handlesubmit = async (event) => {
    event.preventDefault();

    const auth = getAuth();
    const user = auth.currentUser;

    const { uid } = user;

    const uR = firebase.firestore().collection("users").doc(uid);

    const uD = await uR.get();

    if (uD.exists) {
      await uR.update({
        name,
        lastName,
        role
      });

      SU({ ...uD.data(), name, lastName, role });

    } else {

    }

    seteditmode(false);
  };

  // Delete user from Firestore and Firebase Authentication
  const handledeleteuser = async () => {
    if (user) {
      const userId = user.uid;
      const db = firebase.firestore();
      const auth = firebase.auth();

      try {
        // Delete user from Firestore and Firebase Authentication
        await db.collection('users').doc(userId).delete();
        await auth.currentUser.delete();
      } catch (error) {
        console.log('Error deleting user:', error);
      }
    }
  };

  return (
    <div className="up-container">
      <h1 className="up-title">User Profile:</h1>

      {user ? (
        <>
          {editmode ? (
            <form onSubmit={handlesubmit} className="up-form">
              <div className="up-form-group">
                <label>
                  Name:
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => SN(event.target.value)}
                    className="up-form-input"
                  />
                </label>
              </div>
              <div className="up-form-group">
                <label>
                  Last Name:
                  <input
                    type="text"
                    value={lastName}
                    onChange={(event) => SLN(event.target.value)}
                    className="up-form-input"
                  />
                </label>
              </div>
              <div className="up-form-group">
                <label>
                  Role: 
                  <input
                    type="text"
                    value={role}
                    onChange={(event) => SR(event.target.value)}
                    className="up-form-input"
                  />
                </label>
              </div>
              
              <button type="submit" className="up-btn up-save-btn">Save</button>
              <button onClick={() => seteditmode(false)} className="up-btn up-cancel-btn">Cancel</button>
            </form>
          ) : (
            <div className="up-user-info">
              <p>Name: {user.name} <button onClick={() => seteditmode(true)} className="up-btn up-edit-btn">Edit</button></p>
              <p>Last Name: {user.lastName} <button onClick={() => seteditmode(true)} className="up-btn up-edit-btn">Edit</button></p>
              <p>Role: {user.role} <button onClick={() => seteditmode(true)} className="up-btn up-edit-btn">Edit</button></p>
              <p>Employee ID: {user.employeeId}</p>
              <button
                className="up-btn up-delete-btn"
                onClick={handledeleteuser}
              >
                Delete this user
              </button>
            </div>
          )}
        </>
      ) : (
        <form onSubmit={handlesubmit} className="up-form">
          <div className="up-form-group">
            <label>
              Name:
              <input
                type="text"
                value={name}
                onChange={(event) => SN(event.target.value)}
                className="up-form-input"
              />
            </label>
          </div>
          <div className="up-form-group">
            <label>
              Last Name
              <input
                type="text"
                value={lastName}
                onChange={(event) => SLN(event.target.value)}
                className="up-form-input"
              />
            </label>
          </div>

          <button type="submit" className="up-btn up-save-btn">Save</button>
        </form>
      )}
    </div>
  );
}
