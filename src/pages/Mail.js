import React, { useState, useEffect } from "react";
import { collection, getDoc, doc, query, where, getDocs, addDoc, deleteDoc } from "firebase/firestore";

import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import './Mail.css'

function Mail() {
    const [users, SU] = useState([]);
    const [message, SM] = useState("");
    const [messages, SMS] = useState([]);
    const [usermessages, SUM] = useState([]);
    const { currentUser } = useAuth();
    const [updateflag, SUF] = useState(false);

    const db = firebase.firestore();

    // Fetches the list of users from the Firestore database and updates the 'users' state with the retrieved data
    useEffect(() => {
        const fetchUsers = async () => {
            // Create a query to retrieve all the documents from the 'users' collection
            const usersquery = query(collection(db, "users"));

            // Get a snapshot of the documents that match the query
            const usersDocs = await getDocs(usersquery);

            // Map over the documents in the snapshot and extract the data from each document
            const usersdata = usersDocs.docs.map((doc) => doc.data());

            // Update the 'users' state with the retrieved data
            SU(usersdata);
        };

        // Call the fetchUsers function when the component mounts
        fetchUsers();
    }, []);

    const handlemessagesubmit = async (event) => {
        event.preventDefault(); // Prevents the form from being submitted and the page from reloading
        const employeeId = event.target.elements.employeeId.value; // Retrieves the employee ID selected from the dropdown menu

        const usersreference = collection(db, "users"); // References the users collection in Firestore
        const userdocument = await getDoc(doc(usersreference, currentUser.uid)); // Retrieves the user document based on the current user ID
        const { name, lastName, employeeId: senderEmployeeId } = userdocument.data(); // Extracts the name, last name, and employee ID of the sender from the user document

        await addDoc(collection(db, "messages"), { // Adds a new document to the messages collection in Firestore
            employeeId: employeeId, // Sets the employee ID of the receiver
            content: message, // Sets the message content
            name: name, // Sets the name of the sender
            lastName: lastName, // Sets the last name of the sender
            senderEmployeeId: senderEmployeeId, // Sets the employee ID of the sender
        });

        SM(""); // Clears the message state

        // Define the fetchusermessages function inside the handlemessagesubmit function
        const fetchusermessages = async () => {
            // create a reference to the "users" collection in the database
            const usersreference = collection(db, "users");

            // get the document corresponding to the current user's ID from the "users" collection
            const userdocument = await getDoc(doc(usersreference, currentUser.uid));

            // get the employee ID field from the user document
            const employeeId = userdocument.data().employeeId;

            // create a query to retrieve all messages where the senderEmployeeId field matches the current user's employee ID
            const messagesquery = query(collection(db, "messages"), where("senderEmployeeId", "==", employeeId));

            // execute the query and get the resulting snapshot of documents
            const messagesobj = await getDocs(messagesquery);
            // map the documents in the snapshot to an array of objects that include both the document ID and the document data
            const messagesdata = messagesobj.docs.map((doc) => {
                return { id: doc.id, ...doc.data() };
            });

            // set the user messages state to the array of mapped documents
            SUM(messagesdata);
        };

        // Fetch the updated list of messages sent by the current user
        await fetchusermessages();
    };

    const handledeletemessage = async (messageId) => {
        // Deletes the document with the specified messageId in the "messages" collection in Firestore
        await deleteDoc(doc(db, "messages", messageId));

        // Updates the "messages" state by filtering out the deleted message
        SMS(messages.filter((message) => message.id !== messageId));

        // Toggle the updateflag state to force the useEffect to re-run fetchMessages and fetchusermessages functions
        SUF((prevstate) => !prevstate);
    };

    useEffect(() => { // Starts a new effect that runs after every render of the component
        const fetchMessages = async () => { // Declares an async function that fetches messages from Firestore
            const usersreference = collection(db, "users"); // Creates a reference to the "users" collection in Firestore
            const userdocument = await getDoc(doc(usersreference, currentUser.uid)); // Retrieves the document of the current user
            const employeeId = userdocument.data().employeeId; // Extracts the employee ID of the current user

            if (!employeeId) { // Checks if the current user has an employee ID
                return; // If not, exits the function and does nothing
            }

            const messagesquery = query(collection(db, "messages"), where("employeeId", "==", employeeId)); // Creates a query that retrieves messages where the employee ID matches that of the current user
            const messagesobj = await getDocs(messagesquery); // Retrieves the messages that match the query
            const messagesdata = messagesobj.docs.map((doc) => { // Extracts the data of each message document and maps it into an array of message objects
                return { id: doc.id, ...doc.data() };
            });
            SMS(messagesdata); // Updates the state variable "messages" with the new data
        };

        const fetchusermessages = async () => {
            // create a reference to the "users" collection in the database
            const usersreference = collection(db, "users");

            // get the document corresponding to the current user's ID from the "users" collection
            const userdocument = await getDoc(doc(usersreference, currentUser.uid));

            // get the employee ID field from the user document
            const employeeId = userdocument.data().employeeId;

            // create a query to retrieve all messages where the senderEmployeeId field matches the current user's employee ID
            const messagesquery = query(collection(db, "messages"), where("senderEmployeeId", "==", employeeId));

            // execute the query and get the resulting snapshot of documents
            const messagesobj = await getDocs(messagesquery);

            // map the documents in the snapshot to an array of objects that include both the document ID and the document data
            const messagesdata = messagesobj.docs.map((doc) => {
                return { id: doc.id, ...doc.data() };
            });

            // set the user messages state to the array of mapped documents
            SUM(messagesdata);
        };
        // if a current user is present
        if (currentUser) {
            // call the fetchMessages and fetchusermessages functions
            fetchMessages();
            fetchusermessages();
        }

        // define a useEffect hook that runs whenever the currentUser or db dependencies change
    }, [currentUser, db, updateflag]);




    return (
      <div className="mailPage-container">
          <p><Link className="mailPage-usersLink" to="/users">Emails of all users</Link> if you don't want to use web app mail page</p>
          <h1 className="mailPage-title">Mail Page</h1>
          <form className="mailPage-form" onSubmit={handlemessagesubmit}>
              <label className="mailPage-messageLabel" htmlFor="message">Message:</label>
              <textarea className="mailPage-messageInput" id="message" value={message} onChange={(event) => SM(event.target.value)} />
  
              <label className="mailPage-employeeIdLabel" htmlFor="employeeId">Employee ID:</label>
              <select className="mailPage-employeeIdSelect" id="employeeId">
                  {users.map((user) => (
                      <option key={user.employeeId} value={user.employeeId}>
                          {user.employeeId}
                      </option>
                  ))}
              </select>
              <button className="mailPage-sendButton" type="submit">Send</button>
          </form>
          <h2 className="mailPage-receivedTitle">Mails received</h2>
          <table className="mailPage-receivedTable">
              <thead>
                  <tr>
                      <th>Employee ID</th>
                      <th>Message</th>
                      <th>Name of sender</th>
                      <th>Last name of sender</th>
                      <th>Employee Id of sender</th>
                      <th>Action</th>
                  </tr>
              </thead>
              <tbody>
                  {messages.map((message, index) => (
                      <tr key={index}>
                          <td>{message.employeeId}</td>
                          <td>{message.content}</td>
                          <td>{message.name}</td>
                          <td>{message.lastName}</td>
                          <td>{message.senderEmployeeId}</td>
                          <td>
                              <button className="mailPage-deleteButton" onClick={() => handledeletemessage(message.id)}>Delete</button>
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
          <h2 className="mailPage-sentTitle">Sent mails</h2>
          <table className="mailPage-sentTable">
              <thead>
                  <tr>
                      <th>Employee ID</th>
                      <th>Message</th>
                      <th>Name of sender</th>
                      <th>Last name of sender</th>
                      <th>Employee Id of sender</th>
                      <th>Action</th>
                  </tr>
              </thead>
              <tbody>
                  {usermessages.map((message, index) => (
                      <tr key={index}>
                          <td>{message.employeeId}</td>
                          <td>{message.content}</td>
                          <td>{message.name}</td>
                          <td>{message.lastName}</td>
                          <td>{message.senderEmployeeId}</td>
                          <td>
                              <button className="mailPage-deleteButton" onClick={() => handledeletemessage(message.id)}>Delete</button>
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>
      );
    }

    export default Mail;
