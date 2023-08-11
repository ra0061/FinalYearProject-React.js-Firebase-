import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import { query, where } from "firebase/firestore";

export default function Filtertransactions() {
  const [searD, setsearD] = useState("");
  const [transactions, setT] = useState([]);

  const db = firebase.firestore();

  // Define an asynchronous function called 'fetchtransactions' that takes an optional 'date' parameter
  async function fetchtransactions(date) {
    const transactionsRV = collection(db, "transactions");

    // Declare a variable 'Q' to store the results of the Firestore query
    let Q;

    // Check if the 'date' parameter is provided
    if (date) {
      // Create a 'begd' object from the provided 'date', setting the time to 00:00:00:000
      const begD = new Date(date);
      begD.setHours(0, 0, 0, 0);

      // Create an 'endD' object from the provided 'date', setting the time to 23:59:59:999
      const endD = new Date(date);
      endD.setHours(23, 59, 59, 999);

      // Perform a Firestore query to get documents from the 'transactions' collection
      // where the 'date' field is between 'begd' and 'endD', and store the result in 'Q'
      Q = await getDocs(
        query(
          transactionsRV,
          where("date", ">=", begD),
          where("date", "<=", endD)
        )
      );
    } else {
      // If the 'date' parameter is not provided, fetch all documents from the 'transactions' collection
      Q = await getDocs(transactionsRV);
    }

    // Map the documents in 'Q' to an array of 'transactionsData' objects
    // Each object will have an 'id' property containing the document ID, and all other properties from the document's data
    const transactionsD = Q.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
      };
    });

    // Call the 'setT' function with the 'transactionsData' array as an argument
    // This function should be defined outside of 'fetchtransactions' and is responsible for updating the state or UI with the fetched transactions
    setT(transactionsD);
  }

  //useEffect hook: It triggers the fetchtransactions function whenever the searD state 
  //variable changes. This allows the transactions data to be updated based on the selected date.
  useEffect(() => {
    fetchtransactions(searD);
  }, [searD]);

  return (
    <div className="container12">
      <h1 className="h1ll">Filter transactions by date</h1>
      <input
        className="inputll"
        type="date"
        value={searD}
        onChange={(event) => setsearD(event.target.value)}
      />
      <table className="tablell">
        <thead>
          <tr className="trll">
            <th className="thll">Product</th>
            <th className="thll">Amount</th>
            <th className="thll">Date</th>
            <th className="thll">User</th>
            <th className="thll">Employee ID</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr className="trll" key={transaction.id}>
              <td className="tdll">{transaction.productname}</td>
              <td className="tdll">{transaction.amount}</td>
              <td className="tdll">
                {transaction.date && transaction.date.toDate().toLocaleString()}
              </td>
              <td className="tdll">{transaction.fullname}</td>
              <td className="tdll">{transaction.employeeId}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
