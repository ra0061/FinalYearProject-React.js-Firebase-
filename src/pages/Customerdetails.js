import React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs, doc, query, where, limit, deleteDoc, onSnapshot } from "firebase/firestore";
import firebase from 'firebase/compat/app';
import "firebase/compat/auth";
import 'firebase/compat/firestore';
import './customerdetails.css';

function Customerdetails() {
    const db = firebase.firestore();
    const [customers, SC] = useState([]);
    const [customerdata, setcustomerdata] = useState({
        customerId: "",
        customerName: "",
        contactNumber: "",
        customerEmail: "",
        customerAddress: "",
        postCode: "",
        servicesProvided: "",
    });

    //fetch customers
    useEffect(() => {
        const DA = onSnapshot(collection(db, "customers"), (snapshot) => {
            const customerlist = [];
            snapshot.forEach((doc) => {
                const customer = doc.data();
                customer.id = doc.id;
                customerlist.push(customer);
                console.log(customerlist)
            });
            SC(customerlist);
        });

        return () => DA();
    }, []);

    // Declare a useEffect hook with 'customers' as a dependency
    useEffect(() => {
        // Define a function called 'generatecustomerid' to create a unique customer ID
        const generatecustomerid = () => {
            let newcustomerId;
            // Use a do-while loop to keep generating a new customer ID until it's unique
            do {
                // Generate a random 6-digit number as a string and assign it to 'newcustomerId'
                newcustomerId = Math.floor(100000 + Math.random() * 900000).toString();
                // Keep looping as long as there is at least one customer with the same ID in the 'customers' array
            } while (customers.some((customer) => customer.customerId === newcustomerId));
            // Update the 'customerdata' state with the new unique 'customerId'
            setcustomerdata({ ...customerdata, customerId: newcustomerId });
        };
        // Call the 'generatecustomerid' function
        generatecustomerid();
        // 'customers' array is added as a dependency, so the useEffect will run whenever 'customers' change
    }, [customers]);

    const handleinputchange = (event) => {
        const { name, checked } = event.target;

        if (name === 'servicesProvided') {
            let selectedvalues = customerdata.servicesProvided.split(',').filter(Boolean);
            if (checked) {
                selectedvalues.push(event.target.value);
            } else {
                const index = selectedvalues.indexOf(event.target.value);
                if (index > -1) {
                    selectedvalues.splice(index, 1);
                }
            }
            setcustomerdata({ ...customerdata, [name]: selectedvalues.join(',') });
        } else {
            setcustomerdata({ ...customerdata, [name]: event.target.value });
        }
    };

    const generatecustomerid = () => {
        let newcustomerId;
        do {
            newcustomerId = Math.floor(100000 + Math.random() * 900000).toString();
        } while (customers.some((customer) => customer.customerId === newcustomerId));
        setcustomerdata({ ...customerdata, customerId: newcustomerId });
    };

    useEffect(() => {
        generatecustomerid();
    }, [customers]);

    const handlesubmit = async (event) => {
        // Prevent the default form submission behavior
        event.preventDefault();
        try {
            // Create a Firestore query to check if a customer with the same 'customerId' as 'customerdata' already exists
            const customerquery = query(
                collection(db, "customers"),
                where("customerId", "==", customerdata.customerId),
                limit(1)
            );
            // Execute the query and store the result in 'CQsnapshot'
            const CQsnapshot = await getDocs(customerquery);
            // If the CQsnapshot is not empty, it means the customer ID already exists
            if (!CQsnapshot.empty) {
                // Show an alert message to the user and return from the function without adding the customer
                alert("Customer ID already exists. Please choose a different ID.");
                return;
            }
            // If the customer ID is unique, add the 'customerdata' to the 'customers' collection in Firestore
            await addDoc(collection(db, "customers"), customerdata);
            // Reset the 'customerdata' state to its initial empty values
            setcustomerdata({
                customerId: "",
                customerName: "",
                contactNumber: "",
                customerEmail: "",
                customerAddress: "",
                postCode: "",
                servicesProvided: "",
            });
            // Generate a new unique customer ID for the next customer
            generatecustomerid();
        } catch (error) {
            // Log any error that occurs during the customer addition process
            console.error("Error adding customer:", error);
        }
    };

    // Define an async arrow function called 'deletecustomer' which takes a 'customerId' parameter
    const deletecustomer = async (customerId) => {
        try {
            // Delete the document with the given 'customerId' from the 'customers' collection in the Firestore database
            await deleteDoc(doc(db, "customers", customerId));
        } catch (error) {
            // Log any error that occurs during the customer deletion process
            console.error("Error deleting customer:", error);
        }
    };

    return (
        <div className="products-container">
            <form onSubmit={handlesubmit}>
                <input
                    required
                    className="input-field"
                    type="text"
                    name="customerId"
                    value={customerdata.customerId}
                    placeholder="Customer ID"
                    readOnly
                    onChange={handleinputchange}
                />
                <input
                    required
                    className="input-field"
                    type="text"
                    name="customerName"
                    value={customerdata.customerName}
                    placeholder="Customer Name"
                    onChange={handleinputchange}
                />
                <input
                    required
                    className="input-field"
                    type="text"
                    name="contactNumber"
                    value={customerdata.contactNumber}
                    placeholder="Contact Number"
                    pattern="^(\+44\s?7\d{3}|\(?07\d{3}\)?|\+44\(\d{4}\)|\(\d{5}\)|\d{5})\s?\d{2,3}\s?\d{2,3}$"
                    title="Please enter a valid UK contact number"
                    onChange={handleinputchange}
                />
                <input
                    required
                    type="email"
                    className="input-field"
                    name="customerEmail"
                    value={customerdata.customerEmail}
                    placeholder="Customer Email"
                    onChange={handleinputchange}
                />
                <input
                    required
                    type="text"
                    className="input-field"
                    name="customerAddress"
                    value={customerdata.customerAddress}
                    placeholder="Customer Address"
                    onChange={handleinputchange}
                />
                <input
                    required
                    className="input-field"
                    type="text"
                    name="postCode"
                    value={customerdata.postCode}
                    placeholder="Post Code"
                    onChange={handleinputchange}
                />
                <div className="servicesProvided">
                    <p>Services provided:</p>
                    <label>
                  <input
                    type="checkbox"
                    name="servicesProvided"
                    value="Manufacturing"
                    onChange={handleinputchange}
                    checked={customerdata.servicesProvided.includes('Manufacturing')}
                  />
                  Manufacturing
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="servicesProvided"
                    value="Template"
                    onChange={handleinputchange}
                    checked={customerdata.servicesProvided.includes('Template')}
                  />
                  Template
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="servicesProvided"
                    value="Fabrication"
                    onChange={handleinputchange}
                    checked={customerdata.servicesProvided.includes('Fabrication')}
                  />
                  Fabrication
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="servicesProvided"
                    value="Fitting"
                    onChange={handleinputchange}
                    checked={customerdata.servicesProvided.includes('Fitting')}
                  />
                  Fitting
                </label>
              </div>
              <button className="submit-button" type="submit">Add Customer</button>
            </form>
            <table className="products-table">
              <thead>
                <tr>
                  <th>Customer ID</th>
                  <th>Customer Name</th>
                  <th>Contact Number</th>
                  <th>Customer Email</th>
                  <th>Customer Address</th>
                  <th>Post Code</th>
                  <th>Services Provided</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>{customer.customerId}</td>
                    <td>{customer.customerName}</td>
                    <td>{customer.contactNumber}</td>
                    <td>{customer.customerEmail}</td>
                    <td>{customer.customerAddress}</td>
                    <td>{customer.postCode}</td>
                    <td>{customer.servicesProvided}</td>
                    <td>
                      <button onClick={() => deletecustomer(customer.id)} key={customer.id}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      export default Customerdetails;


