import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  runTransaction,

  increment,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";



export default function TransactionPage() {
  // State variables
  const [products, SP] = useState([]);
  const [productdropdown, SPD] = useState("");
  const [amount, SA] = useState("");
  const [currentUser, SCU] = useState(null);
  const [transactions, ST] = useState([]);
  const [totalslabs, STS] = useState([]);
  const [totalcost, STC] = useState(0);

  // Initialize Firestore
  const db = firebase.firestore();

  // Fetch products from Firestore and update products state
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

  // Handle user authentication state changes and update currentUser state
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

  // Fetch transactions from Firestore and update transactions state
  useEffect(() => {
    async function fetchtransactions() {
      const PDocs = await getDocs(collection(db, "transactions"));
      const transactionsdata = PDocs.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        };
      });
      ST(transactionsdata);
    }

    fetchtransactions();
  }, []);

  // Handle sale form submission
  async function handlesale(e) {
    e.preventDefault();

    // Find the selected product from the products state
    const product = products.find((p) => p.name === productdropdown);

    // Validate product
    if (!product) {
      alert("Invalid product selected");
      return;
    }

    // Get current user
    const auth = getAuth();
    const currentUser = auth.currentUser;

    // Validate user
    if (!currentUser) {
      alert("User not logged in");
      return;
    }

    // Get user data
    const userreference = firebase.firestore().collection("users").doc(currentUser.uid);
    const userdata = await userreference.get();

    // Validate user data
    if (!userdata.exists) {
      alert("User not found");
      return;
    }

    // Get employeeId from user data
    const employeeId = userdata.data().employeeId;

    // Create a new sale object
    const transactionsreference = collection(db, "transactions");
    const newsale = {
      productname: product.name,
      amount: Number(amount),
      date: firebase.firestore.Timestamp.now(),
      fullname: `${userdata.data().name} ${userdata.data().lastName}`,
     
      employeeId: employeeId,
    };

    // Update product stock in Firestore
    const productreference = doc(db, "products", product.id);

    await runTransaction(db, async (transaction) => {
      const productdocument = await transaction.get(productreference);

      if (!productdocument.exists()) {
        throw new Error("Product not found");
      }

      const stockAvailable = productdocument.data().stockAvailable || 0;
      const newstockavailable = stockAvailable + Number(amount);

      if (newstockavailable < 0) {
        window.alert("Not enough stock available");
        throw new Error("Not enough stock available");
      }

      transaction.update(productreference, {
        stockAvailable: increment(+Number(amount)),
      });
    });

    // Add new sale to Firestore and update transactions state
    const docreference = await addDoc(transactionsreference, newsale);

    ST((prevtransactions) => [
      ...prevtransactions,
      { id: docreference.id, ...newsale },
    ]);

    // Reset form fields
    SPD("");
    SA("");
  }

 // Calculate total slabs bought for selected product and update totalslabs state
async function handletotalslabs(e) {
  e.preventDefault();

  // Find the selected product from the products array based on the productdropdown value
  const product = products.find((p) => p.name === productdropdown);

  // Check if a valid product is found
  if (!product) {
    alert("Invalid product selected");
    return;
  }

  // Query the "transactions" collection to get all transactions with the same product name
  const TQ = await db
    .collection("transactions")
    .where("productname", "==", product.name)
    .get();

  // Create an object to store the total slabs for each month
  const totalslabsbymonth = [];

  // Create an object to store the monthly totals, initialized with 0 for each month
  const monthtotal = {
    Jan: 0,
    Feb: 0,
    Mar: 0,
    Apr: 0,
    May: 0,
    Jun: 0,
    Jul: 0,
    Aug: 0,
    Sep: 0,
    Oct: 0,
    Nov: 0,
    Dec: 0,
  };

  // Iterate over each transaction document from the query result
  TQ.forEach((doc) => {
    const transactiondata = doc.data();
    // Get the month of the transaction date in the short format (e.g., "Jan", "Feb")
    const transactionmonth = new Date(transactiondata.date.seconds * 1000).toLocaleString("en-US", { month: "short" });

    // Increment the monthly total for the corresponding month based on the transaction amount
    monthtotal[transactionmonth] += transactiondata.amount;
  });

  // Convert the monthtotal object to an array of objects with month and slabs properties
  for (let [key, value] of Object.entries(monthtotal)) {
    totalslabsbymonth.push({
      month: key,
      slabs: value * product.pricePerSlab,
    });
  }

  // Update the totalslabs state with the array of total slabs by month
  STS(totalslabsbymonth);
}


// Calculate total cost of products ordered and update totalcost state
useEffect(() => {
  // Calculate the total cost by reducing the transactions array
  const total = transactions.reduce((acc, transaction) => {
    // Find the corresponding product in the products array based on the transaction's productname
    const product = products.find((p) => p.name === transaction.productname);
    
    // Calculate the cost for the transaction (amount multiplied by pricePerSlab) or 0 if product is not found
    const cost = product ? transaction.amount * product.pricePerSlab : 0;
    
    // Accumulate the cost to the accumulator (acc)
    return acc + cost;
  }, 0);

  // Set the total cost to the totalcost state
  STC(total);
}, [transactions, products]);

  return (
    <div className="container12">
      <h1 className="sub-heading">Transaction</h1>
      <h2>To calculate the costs months select a product from the drop down list and press the calculate button</h2>
      <form onSubmit={handlesale} className="form">
        <label className="form-label">
          Product:
          <select
            value={productdropdown}
            onChange={(e) => SPD(e.target.value)}
            className="form-input"
          >
            <option value="">-- Select a product --</option>
            {products.map((product) => (
              <option key={product.id}
              value={product.name}>
                {product.name}
              </option>
            ))}
          </select>
        </label>
        <label className="form-label">
          Amount:
          <input
            type="number"
            value={amount}
            onChange={(e) => SA(e.target.value)}
            className="form-input"
          />
        </label>

        <button type="submit" className="submit-btn">Add transactions</button>
      </form>

      <form onSubmit={handletotalslabs} className="form">
        <label className="form-label">
          Calculate total slabs bought for {productdropdown}:
          <button type="submit" className="submit-btn">Calculate</button>
        </label>
      </form>

      {totalslabs.length > 0 && (
        <>
          <h3>Total slabs bought for {productdropdown}:</h3>
          <table className="tablell">
            <thead>
              <tr className="trll">
                <th className="thll">Month</th>
                <th className="thll">Slabs</th>
              </tr>
            </thead>
            <tbody>
              {totalslabs.map((item) => (
                <tr className="trll" key={item.month}>
                  <td className="tdll">{item.month}</td>
                  <td className="tdll">{item.slabs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <h3 className="h2ll">Total cost of products ordered: ${totalcost}</h3>

      <h2 className="sub-heading">Transactions</h2>
      <table className="tablell">
        <thead>
          <tr className="trll">
            <th className="thll">Product</th>
            <th className="thll">Amount</th>
            <th className="thll">Date</th>
            <th className="thll">User</th>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
