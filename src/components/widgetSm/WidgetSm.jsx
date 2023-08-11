import { useEffect, useState } from "react";
import "./widgetSm.css";

import firebase from "firebase/compat/app";
import "firebase/compat/firestore";


export default function WidgetSm() {
  const [users, SU] = useState([]);

  useEffect(() => {
    const fetchusers = async () => {
      const db = firebase.firestore();
      try {
        const snapshot = await db
          .collection("users")
          .orderBy("signupDate", "desc")
          .limit(5)
          .get();
        const data = snapshot.docs.map((doc) => doc.data());
        SU(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchusers();
  }, []);

  return (
    <div className="widsm">
      <span className="widsmtitle">New Join Members (datejoined, employee id, First&lastname)</span>
      <ul className="widsmlist">
        {users.map((user) => (
          <li className="widsmlistitem" key={user.employeeId}>
            <p>{user.signupDate.toDate().toLocaleDateString()}</p>
            <span>{user.employeeId}</span>
            <div className="widsmuser">
              <span className="widsmusername">{user.name} {user.lastName}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
  
}
