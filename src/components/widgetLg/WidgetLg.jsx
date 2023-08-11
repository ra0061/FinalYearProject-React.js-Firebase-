import "./widgetLg.css";
import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,

} from "firebase/firestore";

import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";



export default function WidgetLg() {
  const [transactions, ST] = useState([]);
  const [totalslabs, STS] = useState({});

  const db = firebase.firestore();

  useEffect(() => {
    async function fetchtransactions() {
      const TDocs = await getDocs(collection(db, "transactions"));
      const transactionsdata = TDocs.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        };
      });
      const sortedtransactionsdata = transactionsdata.sort((a, b) => b.date.seconds - a.date.seconds).slice(0, 5);
      ST(sortedtransactionsdata);
    }

    fetchtransactions();
  }, []);

  // Only show the 5 most recent transactions
  const recenttransactions = transactions
    .sort((a, b) => b.date.seconds - a.date.seconds)
    .slice(0, 5);

  const currentmonth = new Date().toLocaleString("en-US", { month: "short", year: "numeric" });
  const currentmonthslabs = Object.values(totalslabs).reduce((acc, curr) => {
    return acc + (curr[currentmonth] || 0);
  }, 0);

  const Button = ({ type }) => {
    return <button className={"widgetLgButton " + type}>{type}</button>;
  };

  return (
    <div className="widtlg">
      <h3 className="widglgtitle">Latest transactions</h3>
      <table className="widlgtable">
        <thead>
          <tr className="widlgtr">
            <th className="widlgth">Employee</th>
            <th className="widlgth">Product</th>
            <th className="widlgth">Amount</th>
            <th className="widlgth">Date</th>
          </tr>
        </thead>
        <tbody>
          {recenttransactions.map((transaction) => (
            <tr key={transaction.id} className="widlgtr">
              <td className="widlguser">
 
                <span className="widlgname">{transaction.fullname}</span>
              </td>
              <td className="widlgproduct">{transaction.productname}</td>
              <td className="widlgamount">{transaction.amount}</td>
              <td className="widlgdate">
                {transaction.date && transaction.date.toDate().toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
