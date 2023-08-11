import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,

  doc,
  runTransaction,

getDoc
} from "firebase/firestore";

import { getAuth, onAuthStateChanged } from "firebase/auth";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import {query,where} from "firebase/firestore";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import './transaction.css'
export default function TransactionPage() {
   // State variables
  const [searD, setsearD] = useState("");

  const [products, SP] = useState([]);
  const [currentUser, SCU] = useState(null);
  const [transactions, ST] = useState([]);
  const [totalslabs, STS] = useState({});

  const [totalcostbymonth, STCBM] = useState([]);
  const [transactionsbymonth, STBM] = useState([]);
  

  const db = firebase.firestore();
// Fetch products from Firestore
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
  // Set the current user
  useEffect(() => {
      const auth = getAuth();

      const DA = onAuthStateChanged(auth, async (user) => {
        if (user) {
          const { uid } = user;

          const userreference = firebase.firestore().collection("users").doc(uid);
          const userdata = await userreference.get();

          if (userdata.exists) {
            const { name, lastName } = userdata.data();
            SCU({ name, lastName });
          } else {
            SCU(null);
          }
        } else {
          SCU(null);
        }
      });

      return () => DA();
    }, []);


  // Calculate total slabs bought using useEffect
  useEffect(() => {
    // Initialize an empty object to store the total slabs bought for each product per month
    const newtotalslabs = {};

    // Loop through each transaction
    transactions.forEach((transaction) => {
      // If the product name doesn't exist in the newtotalslabs object, create a new empty object for that product name
      if (!newtotalslabs[transaction.productname]) {
        newtotalslabs[transaction.productname] = {};
      }

      // Find the corresponding product object from the products array using the product name from the transaction
      const product = products.find((p) => p.name === transaction.productname);

      // If the product is found
      if (product) {
        // Calculate the month and year of the transaction date
        const transactionmonth = new Date(
          transaction.date.seconds * 1000
        ).toLocaleString("en-US", { month: "short", year: "numeric" });

        // Calculate the number of slabs bought in the transaction by multiplying the transaction amount by the product's price per slab
        const slabs = transaction.amount * product.pricePerSlab;

        // If the transactionmonth already exists in the newtotalslabs[transaction.productname] object
        if (newtotalslabs[transaction.productname][transactionmonth]) {
          // Increment the existing value by the number of slabs calculated
          newtotalslabs[transaction.productname][transactionmonth] += slabs;
        } else {
          // Set the value to the number of slabs calculated
          newtotalslabs[transaction.productname][transactionmonth] = slabs;
        }
      }
    });

    // Update the state of totalSlabs with the newtotalslabs object
    STS(newtotalslabs);
  }, [transactions, products]); // Run the useEffect hook whenever transactions or products arrays change
 

  useEffect(() => {
    // Initialize an array to store the total cost per month
    const totalcostbymonth = [];

    // Iterate over each transaction
    transactions.forEach((transaction) => {
      // Find the corresponding product based on the transaction's product name
      const product = products.find((p) => p.name === transaction.productname);

      // Calculate the cost of the transaction, default to 0 if the product is not found
      const cost = product ? transaction.amount * product.pricePerSlab : 0;

      // Get the month and year of the transaction date
      const transactionmonth = new Date(
        transaction.date.seconds * 1000
      ).toLocaleString("en-US", { month: "short", year: "numeric" });

      // Check if the month already exists in the totalcostbymonth array
      const existingmonthindex = totalcostbymonth.findIndex(
        (item) => item.month === transactionmonth
      );

      // If the month exists, update the total cost for that month
      if (existingmonthindex !== -1) {
        totalcostbymonth[existingmonthindex].cost += cost;
      } else {
        // If the month doesn't exist, add a new entry with the month and cost
        totalcostbymonth.push({ month: transactionmonth, cost });
      }
    });

    // Sort the totalcostbyMonth array by month and year in ascending order
    totalcostbymonth.sort((a, b) => {
      const aDate = new Date(a.month);
      const bDate = new Date(b.month);
      return aDate - bDate;
    });

    // Update the state with the calculated total cost per month
    STCBM(totalcostbymonth);
  }, [transactions, products]); // Run the effect when transactions or products data changes


  useEffect(() => {
    // Initialize an array to store the number of transactions per month
    const transactionsbymonth = [];

    // Iterate over each transaction
    transactions.forEach((transaction) => {
      // Get the month and year of the transaction date
      const transactionmonth = new Date(
        transaction.date.seconds * 1000
      ).toLocaleString("en-US", { month: "short", year: "numeric" });

      // Check if the month already exists in the transactionsbymonth array
      const existingmonthindex = transactionsbymonth.findIndex(
        (item) => item.month === transactionmonth
      );

      // If the month exists, increment the count for that month
      if (existingmonthindex !== -1) {
        transactionsbymonth[existingmonthindex].count++;
      } else {
        // If the month doesn't exist, add a new entry with the month and count
        transactionsbymonth.push({ month: transactionmonth, count: 1 });
      }
    });

    // Sort the transactionsbymonth array by month and year in ascending order
    transactionsbymonth.sort((a, b) => {
      const aDate = new Date(a.month);
      const bDate = new Date(b.month);
      return aDate - bDate;
    });

    // Update the state with the calculated number of transactions per month
    STBM(transactionsbymonth);
  }, [transactions]); // Run the effect when transactions data changes


  // Get the current month and year in the format "MMM yyyy"
  const currentmonth = new Date().toLocaleString("en-US", { month: "short", year: "numeric" });

  // Calculate the total number of slabs for the current month
  const currentmonthslabs = Object.values(totalslabs).reduce((acc, curr) => {
    return acc + (curr[currentmonth] || 0);
  }, 0);

  // Define an async function to fetch transactions
  async function fetchtransactions(date) {
    // Reference to the "transactions" collection in the database
    const transactionsRV = collection(db, "transactions");
    let Q;

    // Check if a date is provided
    if (date) {
      // Set begD to the beginning of the given date
      const begD = new Date(date);
      begD.setHours(0, 0, 0, 0);

      // Set endD to the end of the given date
      const endD = new Date(date);
      endD.setHours(23, 59, 59, 999);

      // Fetch transactions that occurred within the specified date range
      Q = await getDocs(
        query(
          transactionsRV,
          where("date", ">=", begD),
          where("date", "<=", endD)
        )
      );
    } else {
      // If no date is provided, fetch all transactions
      Q = await getDocs(transactionsRV);
    }

    // Convert the Q into an array of transaction objects
    const transactionsD = Q.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
      };
    });

    // Update the state with the fetched transactions
    ST(transactionsD);
  }

  // When the searchD value changes, fetch transactions for that date
  useEffect(() => {
    fetchtransactions(searD);
  }, [searD]);

  // Define an async function to delete a transaction by its ID
  async function deletetransaction(transactionId) {
    try {
      // Get a reference to the transaction document in the database
      const transactionreference = doc(db, "transactions", transactionId);
      // Fetch the transaction document
      const transactiondocument = await getDoc(transactionreference);
      // Extract the transaction data from the document
      const transactiondata = transactiondocument.data();
      // Query for a product with a name that matches the transaction's product name
      const productreference = query(collection(db, "products"), where("name", "==", transactiondata.productname));

      // Get the transaction amount
      const transactionamount = transactiondata.amount;

      // Fetch the product data
      const productdocsv = await getDocs(productreference);
      if (productdocsv.empty) {
        throw new Error(`Product ${transactiondata.productname} not found`);
      }

      // Get the product document
      const productdocument = productdocsv.docs[0];
      // Get the current stock available for the product
      const currentstock = productdocument.data().stockAvailable;
      // Calculate the new stock available after deleting the transaction
      const newstock = currentstock - transactionamount;

      // Run a transaction to update the product's stock and delete the transaction
      await runTransaction(db, async (transaction) => {
        transaction.update(productdocument.ref, { stockAvailable: newstock });
        transaction.delete(transactionreference);
      });

      // Update the state of the transactions array by removing the deleted transaction
      ST((prevtransactions) =>
        prevtransactions.filter((transaction) => transaction.id !== transactionId)
      );

    } catch (error) {
      console.error("Error deleting transaction: ", error);
      alert("Error deleting transaction");
    }
  }

  return (
    <div className="transactioncon">
      {/* Display instructions at the top of the page */}
      <h1 className="h1ll">Only add transactions when deposit for product has been paid & product has been ordered</h1>
      <h1 className="h1ll">Transaction</h1>
  
      {/* Loop through the totalSlabs object and display a table for each product's slabs */}
      {Object.keys(totalslabs).map((productName) => (
        <div key={productName}>
          <h3 className="h2ll">Total slabs bought for {productName}:</h3>
          <table className="tablell">
            <thead>
              <tr className="trll">
                <th className="thll">Month</th>
                <th className="thll">Slabs</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(totalslabs[productName]).map((month) => (
                <tr className="trll" key={month}>
                  <td className="tdll">{month}</td>
                  <td className="tdll">£{totalslabs[productName][month]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
  
      {/* Display the total number of slabs bought this month */}
      <h3 className="h2ll">Total slabs bought this month:</h3>
      <span>{currentmonthslabs}</span>
  
      {/* Display a bar chart of the total cost of products ordered */}
      <h3 className="h2ll">Total cost of products ordered:</h3>
      <BarChart
        width={600}
        height={300}
        data={totalcostbymonth}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <XAxis dataKey="month" />
        <YAxis />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        <Legend />
        <Bar dataKey="cost" fill="#8884d8" />
      </BarChart>
  
      {/* Display a table of transactions */}
      <h2 className="h2ll">Transactions</h2>
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
              {/* Button to delete a transaction by calling the deletetransaction function */}
              <td className="tdll"><button className="delete-btn" onClick={() => deletetransaction(transaction.id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="links-container">
        <Link className="custom-link" to="/addtransaction">
          Add Transaction
          </Link>
      <Link className="custom-link" to="/filtertransactions">
        Filter Transactions
      </Link>
    </div>
  </div>
);
          }
       
  