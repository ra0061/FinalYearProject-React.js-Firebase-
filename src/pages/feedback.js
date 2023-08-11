import React, { useState, useEffect } from "react";
import { collection, addDoc, deleteDoc, doc, getDocs, onSnapshot } from "firebase/firestore";
import firebase from 'firebase/compat/app';
import "firebase/compat/auth";
import 'firebase/compat/firestore';
import './Feedback.css';

export default function Feedback() {
    const db = firebase.firestore();
    const [customers, SC] = useState([]);
    const [users, SU] = useState([]);
    const [feedbackdata, setfeedbackdata] = useState({
        customerId: "",
        feedbackText: "",
        date: "",
        employeeId: "",
    });
    const [selectedcustomer, SSC] = useState('');
    const [feedbacklist, SFL] = useState([]);

    //fetches customers documents
    useEffect(() => {
        const fetchcustomers = async () => {
            const CDocs = await getDocs(collection(db, "customers"));
            const customerlist = [];
            CDocs.forEach((doc) => {
                const customer = doc.data();
                customer.id = doc.id;
                customerlist.push(customer);
            });
            SC(customerlist);
        };
        fetchcustomers();
    }, []);

    //fetches users
    useEffect(() => {
        const fetchusers = async () => {
            const UDocs = await getDocs(collection(db, "users"));
            const userlist = [];
            UDocs.forEach((doc) => {
                const user = doc.data();
                user.id = doc.id;
                userlist.push(user);
            });
            SU(userlist);
        };
        fetchusers();
    }, []);

    //fetches all feedback
    useEffect(() => {
        const DA = onSnapshot(collection(db, "feedback"), (FDocs) => {
            const feedbacklist = [];
            FDocs.forEach((doc) => {
                const feedback = doc.data();
                feedback.id = doc.id;
                feedbacklist.push(feedback);
            });
            SFL(feedbacklist);
        });
        return DA;
    }, []);

    const handlecustomerchange = (event) => {
        SSC(event.target.value);
        setfeedbackdata({ ...feedbackdata, customerId: event.target.value });
    };

    const handleinputchange = (event) => {
        const { name, value } = event.target;
        setfeedbackdata({ ...feedbackdata, [name]: value });
    };

    const handledatechange = (event) => {
        setfeedbackdata({ ...feedbackdata, date: event.target.value });
    };

    const handleemployeechange = (event) => {
        setfeedbackdata({ ...feedbackdata, employeeId: event.target.value });
    };

    // Define an async arrow function called 'handlesubmit' which takes an event parameter
    const handlesubmit = async (event) => {
        // Prevent the default form submission behavior
        event.preventDefault();
        try {
            // Find the employee object in the 'users' array by matching the employee ID with the 'feedbackdata.employeeId'
            const employee = users.find((user) => user.id === feedbackdata.employeeId);

            // Create a new 'feedback' object containing the 'feedbackdata' properties and additional employee information
            const feedback = {
                ...feedbackdata,
                employeeId: employee.employeeId,
                name: employee.name,
                lastName: employee.lastName
            };

            // Add the 'feedback' object to the 'feedback' collection in the Firestore database
            await addDoc(collection(db, "feedback"), feedback);

            // Reset the 'feedbackdata' state to its initial empty values
            setfeedbackdata({ customerId: "", feedbackText: "", date: "", employeeId: "" });
        } catch (error) {
            // Log any error that occurs during the feedback addition process
            console.error("Error adding feedback:", error);
        }
    };

    // Define an async arrow function called 'deletefeedback' which takes a 'feedbackId' parameter
    const deletefeedback = async (feedbackId) => {
        try {
            // Delete the document with the given 'feedbackId' from the 'feedback' collection in the Firestore database  
            await deleteDoc(doc(db, "feedback", feedbackId));
        } catch (error) {
            // Log any error that occurs during the feedback deletion process
            console.error("Error deleting feedback:", error);
        }
    };



    return (
      <div className="feedback-container">
        <label htmlFor="customer-select" className="feedback-label">Select a customer:</label>
        <select id="customer-select" className="feedback-select" value={selectedcustomer} onChange={handlecustomerchange}>
          <option value="">--Select--</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.customerId}>
              {customer.customerName}
            </option>
          ))}
        </select>
        {selectedcustomer && (
          <form onSubmit={handlesubmit} className="feedback-form">
            <label htmlFor="date-input" className="feedback-label">Select a date:</label>
            <input type="date" id="date-input" className="feedback-input" value={feedbackdata.date} onChange={handledatechange} />
            <label htmlFor="employee-select" className="feedback-label">Select an employee:</label>
            <select id="employee-select" className="feedback-select" value={feedbackdata.employeeId} onChange={handleemployeechange}>
              <option value="">--Select--</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} {user.lastName}
                </option>
              ))}
            </select>
            <label htmlFor="feedback-text" className="feedback-label">Enter feedback:</label>
            <textarea
              name="feedbackText"
              id="feedback-text"
              className="feedback-textarea"
              value={feedbackdata.feedbackText}
              placeholder="Enter feedback"
              onChange={handleinputchange}
            ></textarea>
            <button type="submit" className="feedback-submit">Submit Feedback</button>
          </form>
        )}
        <table className="feedback-table">
          <thead>
            <tr>
              <th>Customer ID</th>
              <th>Feedback Text</th>
              <th>Date</th>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Last Name</th>
            </tr>
          </thead>
          <tbody>
            {feedbacklist.map((feedback) => (
              <tr key={feedback.id}>
                <td>{feedback.customerId}</td>
                <td>{feedback.feedbackText}</td>
                <td>{feedback.date}</td>
                <td>{feedback.employeeId}</td>
                <td>{feedback.name}</td>
                <td>{feedback.lastName}</td>
                <td>
                  <button className="feedback-delete" onClick={() => deletefeedback(feedback.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
            }