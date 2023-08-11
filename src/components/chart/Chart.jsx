// Import necessary dependencies
import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
} from "firebase/firestore";

import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";


import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";


export default function CostByMonthChart() {
  // Declare state variables for products, transactions, and total cost by month
  const [products, SP] = useState([]);
  const [transactions, ST] = useState([]);
  const [totalcostbymonth, STCBM] = useState([]);

  // Initialize the Firestore database
  const db = firebase.firestore();

  // Fetch the products data from Firestore
  useEffect(() => {
    async function fetchproducts() {
      const PDocs = await getDocs(collection(db, "products"));
      const productsdata = PDocs.docs.map((doc) => {

        return {
          id: doc.id,
          ...doc.data(),
        };
      });
      SP(productsdata);
      
    }

    fetchproducts();
  }, []);

  // Fetch the transactions data from Firestore
  useEffect(() => {
    async function fetchtransactions() {
      const TDocs = await getDocs(collection(db, "transactions"));
      const transactionsdata = TDocs.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        };
      });
      ST(transactionsdata);
    }

    fetchtransactions();
  }, []);

  // This effect will run whenever the transactions or products data changes
  useEffect(() => {
    // Initialize an array to hold the total cost per month
    const totalcostbymonth = [];

    // Loop over each transaction
    transactions.forEach((transaction) => {
      // Find the corresponding product for the current transaction
      const product = products.find((p) => p.name === transaction.productname);
      
      // Calculate the cost of the transaction
      // If product is found, it's the transaction amount times the product's price per slab
      // If product isn't found, the cost is 0
      const cost = product ? transaction.amount * product.pricePerSlab : 0;

      // Get the month and year of the transaction
      const transactionmonth = new Date(
        transaction.date.seconds * 1000
      ).toLocaleString("en-US", { month: "short", year: "numeric" });

      // Check if there's already an entry for this month in the total cost by month array
      const existingmonthindex = totalcostbymonth.findIndex(
        (item) => item.month === transactionmonth
      );

      // If there's an existing entry for this month
      if (existingmonthindex !== -1) {
        // Add the cost of the current transaction to the total cost for this month
        totalcostbymonth[existingmonthindex].cost += cost;
      } else {
        // If there isn't an existing entry for this month, create a new one
        totalcostbymonth.push({ month: transactionmonth, cost });
      }
    });

    // After processing all the transactions, sort the total cost by month array by month
    totalcostbymonth.sort((a, b) => {
      const aDate = new Date(a.month);
      const bDate = new Date(b.month);
      return aDate - bDate;
    });

    // Update the total cost by month state variable with the newly calculated data
    STCBM(totalcostbymonth);
  }, [transactions, products]); // This effect depends on the transactions and products data

  return (
    <div className="chart">
      <h3 className="chartTitle">Total Cost of Products Ordered by Month</h3>
      <div className="costByMonthList">
        <BarChart width={1500} height={300} data={totalcostbymonth} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <XAxis dataKey="month" />
          <YAxis />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Legend />
          <Bar dataKey="cost" fill="lightblue" />
        </BarChart>
      </div>
    </div>
  );
}
