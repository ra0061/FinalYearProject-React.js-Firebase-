import './featuredInfo.css'


import React, { useState, useEffect } from "react";
import {
    collection,
    getDocs,

    onSnapshot,

} from "firebase/firestore";
import { Link } from "react-router-dom";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";


export default function FeaturedInfo() {
    const [products, SP] = useState([]);
    const [sales, SS] = useState([]);
    const [monthlysales, SMS] = useState([]);
    const [currentmonthtotalsales, SCMTS] = useState(0);
    const [currentmonthsales, SCMS] = useState(0);

    const [transactions, ST] = useState([]);
    const [totalslabs, STS] = useState({});

    const db = firebase.firestore();
// Whenever the sales state changes, this effect will be executed
useEffect(() => {
    // Get the current date, month, and year
    const currentdate = new Date();
    const currentmonth = currentdate.getMonth() + 1;
    const currentyear = currentdate.getFullYear();

    // Calculate the number of sales in the current month and year using the sales array
    const monthlysalesdata = sales.reduce((acc, sale) => {
        // Get the sale date, or null if not present
        const saledate = sale.date ? sale.date.toDate() : null;
        // Get the month of the sale, or null if not present
        const month = saledate ? saledate.getMonth() + 1 : null;
        // Get the year of the sale, or null if not present
        const year = saledate ? saledate.getFullYear() : null;

        // If the sale month and year match the current month and year, increment the accumulator
        if (month === currentmonth && year === currentyear) {
            acc++;
        }

        // Return the updated accumulator for the next iteration
        return acc;
    }, 0);

    // Set the calculated monthly sales data for the current month and year to the currentmonthsales state
    SCMS(monthlysalesdata);
}, [sales]);


    useEffect(() => {
        const salessnapshot = onSnapshot(collection(db, "sales"), (snapshot) => {
            const salesdata = snapshot.docs.map((doc) => {
                return {
                    id: doc.id,
                    ...doc.data(),
                };
            });
            SS(salesdata);
        });

        return () => salessnapshot();
    }, []);

    
    // This useEffect will run whenever the 'sales' state changes
    useEffect(() => {
        // Reduce the 'sales' array to create an object with monthly sales data
        const monthlysalesdata = sales.reduce((acc, sale) => {
            // Get the date of the sale or null if not present
            const saledate = sale.date ? sale.date.toDate() : null;
            // Get the month of the sale or null if not present
            const month = saledate ? saledate.getMonth() + 1 : null;
            // Get the year of the sale or null if not present
            const year = saledate ? saledate.getFullYear() : null;
            // Generate a string in the format 'month-year' or null if month and year are not present
            const monthyear = month && year ? `${month}-${year}` : null;

            // If month-year is valid, increment or initialize the totalAmount for that month-year
            if (monthyear) {
                if (acc[monthyear]) {
                    acc[monthyear].totalAmount += sale.amountGenerated;
                } else {
                    acc[monthyear] = {
                        month: month,
                        year: year,
                        totalAmount: sale.amountGenerated
                    };
                }
            }

            // Return the updated accumulator object
            return acc;
        }, {});

        // Sort the monthly sales data by date
        const sortedmonthlysalesdata = Object.values(monthlysalesdata).sort((a, b) => {
            const dateA = new Date(a.year, a.month - 1);
            const dateB = new Date(b.year, b.month - 1);
            return dateA - dateB;
        });

        // Set the sorted monthly sales data to the 'monthlysales' state
        SMS(sortedmonthlysalesdata);

        // Calculate current month total sales
        const currentdate = new Date();
        const currentmonthyear = `${currentdate.getMonth() + 1}-${currentdate.getFullYear()}`;
        const currentmonthsales = monthlysalesdata[currentmonthyear];
        const totalcurrentmonthsales = currentmonthsales ? currentmonthsales.totalAmount : 0;

        // Set the current month total sales to the 'currentmonthtotalsales' state
        SCMTS(totalcurrentmonthsales);
    }, [sales]);


   
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

// This useEffect will run whenever the 'transactions' or 'products' states change
useEffect(() => {
    // Initialize an object to store the total slabs for each product per month
    const newtotalslabs = {};
  
    // Iterate over each transaction
    transactions.forEach((transaction) => {
      // If the product name is not already in newtotalslabs, create an empty object for it
      if (!newtotalslabs[transaction.productname]) {
        newtotalslabs[transaction.productname] = {};
      }
  
      // Find the corresponding product in the 'products' array
      const product = products.find((p) => p.name === transaction.productname);
  
      // If the product is found
      if (product) {
        // Get the month and year of the transaction date in the format "MMM YYYY"
        const transactionmonth = new Date(
          transaction.date.seconds * 1000
        ).toLocaleString("en-US", { month: "short", year: "numeric" });
  
        // Calculate the slabs for the transaction
        const slabs = transaction.amount * product.pricePerSlab;
  
        // Increment the total slabs for the product in the corresponding month or initialize it
        if (newtotalslabs[transaction.productname][transactionmonth]) {
          newtotalslabs[transaction.productname][transactionmonth] += slabs;
        } else {
          newtotalslabs[transaction.productname][transactionmonth] = slabs;
        }
      }
    });
  
    // Set the newtotalslabs object to the 'totalslabs' state
    STS(newtotalslabs);
  }, [transactions, products]);
  
  // Get the current month and year in the format "MMM YYYY"
  const currentmonth = new Date().toLocaleString("en-US", { month: "short", year: "numeric" });
  
  // Calculate the total slabs for the current month
  const currentmonthslabs = Object.values(totalslabs).reduce((acc, curr) => {
    return acc + (curr[currentmonth] || 0);
  }, 0);
  
  return (
    <div className='f_container'>
        <div className="f_item">
            <span className="f_title">Revenue from sales</span>
            <div className="f_money_container">
                <Link to='/sales'>
                    <span className="f_money">£{currentmonthtotalsales}</span>
                </Link>
            </div>
            <span className="f_sub">This month</span>
        </div>
        <div className="f_item">
            <span className="f_title">Amount of sales this month</span>
            <div className="f_money_container">
                <Link to='/sales'>
                    <span className="f_money">{currentmonthsales}</span>
                </Link>
            </div>
            <span className="f_sub">This month</span>
        </div>
        <div className="f_item">
            <span className="f_title">Product costs this month</span>
            <div className="f_money_container">
                <Link to='/transactions'>
                    <span className="f_money">£{currentmonthslabs}</span>
                </Link>
            </div>
            <span className="f_sub">This month</span>
        </div>
    </div>
  )
  }  