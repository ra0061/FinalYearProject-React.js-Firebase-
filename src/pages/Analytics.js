import React, { useEffect, useState } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";
import {
  collection,
  getDocs,
  onSnapshot
} from "firebase/firestore";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import './Analytics.css';

export default function Analytics() {
  const [membersbymonth, SMBM] = useState([]);
  const [salesbymonth, SSBM] = useState([]);
  const [products, SP] = useState([]);

  const [sales, SS] = useState([]);
  const [monthlysales, SMS] = useState([]);
  const [currentmonthsales, SCMS] = useState(0); //for home page
  const [transactionsbymonth, STBM] = useState([]);
  const [transactions, ST] = useState([]);
  const [totalcost, STC] = useState(0); //total cost across all years
  const [totalcostbyyear, STCBY] = useState([]);
  const [totaltransactions, STT] = useState(0); // get total transactions

  const db = firebase.firestore();

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  //fetch product documents from product collection
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

  //fetch sales
  useEffect(() => {
    const DA = onSnapshot(collection(db, "sales"), (snapshot) => {
      const salesdata = snapshot.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        };
      });
      SS(salesdata);
    });

    return () => DA();
  }, [db]);

  useEffect(() => {
      // Reduce the sales array to an object with monthYear as keys and sales data as values
      const monthlysalesdata = sales.reduce((acc, sale) => {
      // Get the date of the sale, if available
      const saledate = sale.date ? sale.date.toDate() : null;

      // Get the month and year from the saledate, if available
      const month = saledate ? saledate.getMonth() + 1 : null;
      const year = saledate ? saledate.getFullYear() : null;

      // Combine the month and year into a formatted string (e.g., "January 2023")
      const monthYear = month && year ? `${new Date(year, month - 1).toLocaleString('default', { month: 'long' })} ${year}` : null;

      // If monthYear is available, continue processing
      if (monthYear) {
        // If the monthYear already exists in the accumulator object, increment the totalSales by the sale amount
        if (acc[monthYear]) {
          acc[monthYear].totalSales += sale.amount;
        } else {
          // Otherwise, create a new entry for the monthYear with the initial sale amount
          acc[monthYear] = {
            monthYear: monthYear,
            totalSales: sale.amount
          };
        }


        // Check if the sale is for the current month and year
        const currentdate = new Date();
        const currentmonth = currentdate.getMonth() + 1;
        const currentyear = currentdate.getFullYear();
        if (month === currentmonth && year === currentyear) {
          // Update the state for the current month's sales
          SCMS(acc[monthYear]?.totalSales || 0);
        }
      }

      // Return the accumulator object for the next iteration
      return acc;
    }, {});

      // Sort the monthly sales data by date
      const sortedmonthlysalesdata = Object.values(monthlysalesdata).sort((a, b) => {
      const dateA = new Date(a.monthYear.split(' ')[1], months.indexOf(a.monthYear.split(' ')[0]));
      const dateB = new Date(b.monthYear.split(' ')[1], months.indexOf(b.monthYear.split(' ')[0]));
      return dateA - dateB;
    });

    // Set the state for the sorted monthly sales data
    SMS(sortedmonthlysalesdata);

    // Convert the sorted monthly sales data into an array of objects with 'monthYear' and 'sales' properties
    const salesbymonthdata = sortedmonthlysalesdata.map((data) => {
      return {
        monthYear: data.monthYear,
        sales: data.totalSales
      }
    });

    // Set the state for the sales by month data
    SSBM(salesbymonthdata);

  }, [sales]);
  
  
  // The effect will run whenever the 'sales' dependency changes
// Define the useEffect hook
useEffect(() => {
  // Define an async function to fetch members by month
  const fetchmembers = async () => {
    // Initialize the Firestore instance
    const db = firebase.firestore();

    // Get the current year
    const currentdate = new Date();
    const currentyear = currentdate.getFullYear();

    // Map over the months array to create an array of promises that fetch the user count for each month
    const QP = months.map(async (month, index) => {
      // Calculate the start and end dates for each month
      const monthstart = new Date(currentyear, index, 1);
      const monthend = new Date(currentyear, index + 1, 0);

      // Query the 'users' collection for users who signed up between monthstart and monthend
      const snapshot = await db
        .collection("users")
        .where("signupDate", ">=", monthstart)
        .where("signupDate", "<=", monthend)
        .get();

      // Get the count of users from the snapshot
      const count = snapshot.size;

      // Format the month string (e.g., "January 2023")
      const formattedmonth = `${month} ${currentyear}`;

      // Return an object with the formatted month and the count of users
      return { month: formattedmonth, count };
    });

    // Resolve all the promises and store the results in an array
    const results = await Promise.all(QP);

    // Set the state for members by month with the results
    SMBM(results);
  };

  // Invoke the fetchmembers function
  fetchmembers();
}, []); // The effect will run only once when the component mounts



// Using useEffect to perform an operation whenever the transactions data changes
useEffect(() => {
  // Define an empty array to store the transactions by month
  const transactionsbymonth = [];

  // Loop through each transaction
  transactions.forEach((transaction) => {
    // Convert the transaction date to a human-readable string with the format "Month Year" (e.g., "Jan 2023")
    const transactionmonth = new Date(
      transaction.date.seconds * 1000
    ).toLocaleString("en-US", { month: "short", year: "numeric" });

    // Find the index of the existing month entry in transactionsbymonth array, if it exists
    const curmonthindex = transactionsbymonth.findIndex(
      (item) => item.month === transactionmonth
    );

    // If the month entry is found, increment the count for that month
    if (curmonthindex !== -1) {
      transactionsbymonth[curmonthindex].count++;
    } else {
      // If the month entry is not found, add a new entry for that month with a count of 1
      transactionsbymonth.push({ month: transactionmonth, count: 1 });
    }
  });

  // Sort the transactionsbymonth array by date
  transactionsbymonth.sort((a, b) => {
    const aDate = new Date(a.month);
    const bDate = new Date(b.month);
    return aDate - bDate;
  });

  // Update the state with the new transactionsbymonth array
  STBM(transactionsbymonth);
}, [transactions]);




//fetch all transactions
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

//
useEffect(() => {
  // This code runs whenever the `sales` dependency changes
  const monthlysalesdata = sales.reduce((acc, sale) => {
    // For each sale, extract the month and year
    const saledate = sale.date ? sale.date.toDate() : null;
    const month = saledate ? saledate.getMonth() : null;
    const year = saledate ? saledate.getFullYear() : null;

    // Combine month and year into a single string, e.g. "March 2022"
    const monthYear = month !== null && year !== null
      ? new Date(year, month, 1).toLocaleString('en-us', { month: 'long', year: 'numeric' })
      : null;

    if (monthYear) {
      // If we have a month/year string, add the sale's revenue to the correct object in the accumulator
      if (acc[monthYear]) {
        acc[monthYear].totalAmount += sale.amountGenerated;
      } else {
        acc[monthYear] = {
          month: month,
          year: year,
          monthYear: monthYear,
          totalAmount: sale.amountGenerated
        };
      }

      // If this sale was in the current month, update the current month's sales state
      const currentdate = new Date();
      const currentmonth = currentdate.getMonth();
      const currentyear = currentdate.getFullYear();
      if (month === currentmonth && year === currentyear) {
        SCMS(acc[monthYear]?.totalAmount || 0);
      }
    }

    return acc;
  }, {});

  // Convert the monthly sales data object into an array, sorted by date
  const sortedmonthlysalesdata = Object.values(monthlysalesdata).sort((a, b) => {
    const dateA = new Date(a.year, a.month);
    const dateB = new Date(b.year, b.month);
    return dateA - dateB;
  });

  // Update the component's state with the monthly sales data
  SMS(sortedmonthlysalesdata);
}, [sales]);

useEffect(() => {
  // Calculate the total cost of all transactions grouped by year
  const totalcostbyyear = {};
  let totaltransactions = 0;
  transactions.forEach((transaction) => {
    // Find the product associated with this transaction
    const product = products.find((p) => p.name === transaction.productname);

    // Calculate the cost of this transaction (if a valid product was found)
    const cost = product ? transaction.amount * product.pricePerSlab : 0;

    // Extract the year from the transaction date and add the cost to the correct year's total
    const transactionyear = new Date(transaction.date.seconds * 1000).getFullYear();
    if (totalcostbyyear[transactionyear]) {
      totalcostbyyear[transactionyear].cost += cost;
    } else {
      totalcostbyyear[transactionyear] = { year: transactionyear, cost };
    }

    // Keep track of the total number of transactions
    totaltransactions++;
  });

  // Convert the total cost by year object into an array and update the component's state
  const totalcostbyyeararray = Object.values(totalcostbyyear);
  STCBY(totalcostbyyeararray);

  // Calculate the total cost across all years and update the component's state
  STC(totalcostbyyeararray.reduce((acc, item) => acc + item.cost, 0));

  // Update the component's state with the total number of transactions
  STT(totaltransactions);
}, [transactions, products]);

return (
  <div className="memberStatistics">
    <h2>Members Joined</h2>
    <BarChart width={600} height={300} data={membersbymonth}>
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="count" fill="#8884d8" />
    </BarChart>

    <h2>Amount of sales by Month</h2>
    <BarChart
      width={600}
      height={300}
      data={salesbymonth}
      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="monthYear" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="sales" fill="#8884d8" />
    </BarChart>

    <h3>Number of transactions per month:</h3>
    <BarChart
      width={600}
      height={300}
      data={transactionsbymonth}
      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
    >
      <XAxis dataKey="month" />
      <YAxis />
      <CartesianGrid strokeDasharray="3 3" />
      <Tooltip />
      <Legend />
      <Bar dataKey="count" fill="#82ca9d" />
    </BarChart>
    <h3>Amount of sales per month:</h3>
    <BarChart
      width={600}
      height={300}
      data={monthlysales}
      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="monthYear" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="totalAmount" fill="#8884d8" />
    </BarChart>
    <p>
    {/* // Conditionally render the revenue in 2023 if the monthlysales array has data */}
{monthlysales.length > 0 && (
  // Use a fragment (empty tag) to wrap the text since it's just a single text node
  <>
    Revenue in 2023: £{
      // Calculate the revenue by summing up the totalAmount of each item in the monthlysales array
      monthlysales.reduce((acc, val) => acc + val.totalAmount, 0)
    }
  </>
)}
</p>
<p>
  {/* // Conditionally render the total costs per year and for all years if the totalcostbyyear array has data */}
  {totalcostbyyear.length > 0 && (
    // Use a fragment (empty tag) to wrap the elements, as multiple elements are being rendered
    <>
      {
        // Map over the totalcostbyyear array and render a div for each item, showing the year and its associated cost
        totalcostbyyear.map((item) => (
          <div key={item.year}>
            Total Costs in {item.year}: £{item.cost}
          </div>
        ))
      }
      {/* // Calculate and display the total costs for all years by summing up the cost of each item in the totalcostbyyear array */}
      Total Costs for all years: £{totalcostbyyear.reduce((acc, item) => acc + item.cost, 0)}
    </>
  )}

    </p>
  </div>
);
          }