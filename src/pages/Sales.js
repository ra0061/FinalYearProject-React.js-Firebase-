import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  runTransaction,
  increment,
  onSnapshot,
  query
} from "firebase/firestore";
import { where, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from 'recharts';
import './sales.css'

export default function Sales() {
  const [products, SP] = useState([]);
  const [productdropdown, SPD] = useState("");
  const [amount, SA] = useState("");
  const [currentUser, SCU] = useState(null);
  const [sales, SS] = useState([]);
  const [monthlysales, SMS] = useState([]);
  const [currentMonthSales, setcurrentmonthsales] = useState(0);
  const [yearlysales, SYS] = useState([]);
  const [employeesales, SES] = useState([]);
  const [customernames, SCN] = useState([]);
  const [selectedCustomerName, SSCN] = useState("");

  // Effect hook for fetching customer names
  useEffect(() => {
    const fetchcustomernames = async () => {
      const CDocs = await getDocs(collection(db, "customers"));
      const customernamelist = [];
      CDocs.forEach((doc) => {
        const customer = doc.data();
        customernamelist.push(customer.customerName);
      });
      SCN(customernamelist);
    };
    fetchcustomernames();
  }, []);

  // Firestore instance
  const db = firebase.firestore();

  // Effect hook for fetching products
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

  // Effect hook for getting the current user
  useEffect(() => {
    const auth = getAuth();

    const DA = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const { uid } = user;

        const userreference = firebase.firestore().collection("users").doc(uid);
        const userdata = await userreference.get();

        if (userdata.exists) {
          const { name, lastName, employeeId } = userdata.data();
          SCU({ name, lastName, employeeId });
        } else {
          SCU(null);
        }
      } else {
        SCU(null);
      }
    });

    return () => DA();
  }, []);

  // Effect hook for fetching sales data
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

  
  // Function to handle a new sale
async function handlesale(e) {
  e.preventDefault(); // Prevent the default form submission behavior

  // Find the product based on the productdropdown value
  const product = products.find((p) => p.name === productdropdown);

  // Validate product selection
  if (!product) {
    alert("Invalid product selected");
    return;
  }

  // Validate user login
  if (!currentUser) {
    alert("User not logged in");
    return;
  }

  // Reference to the sales collection in Firestore
  const salesreference = collection(db, "sales");

  // Create a new sale object
  const newsale = {
    productName: product.name,
    amount: Number(amount),
    date: firebase.firestore.FieldValue.serverTimestamp(),
    fullName: `${currentUser.name} ${currentUser.lastName}`,
    employeeId: currentUser.employeeId,
    customerName: selectedCustomerName,
    amountGenerated: product.pricetobesold * Number(amount), // calculate amount generated
  };

  // Reference to the product document in Firestore
  const productreference = doc(db, "products", product.id);

  // Run a transaction to update the product stock
  await runTransaction(db, async (transaction) => {
    const productdocument = await transaction.get(productreference);

    // Validate product document existence
    if (!productdocument.exists()) {
      throw new Error("Product not found");
    }

    // Calculate the new stock available
    const stockAvailable = productdocument.data().stockAvailable || 0;
    const newstockavailable = stockAvailable - Number(amount);

    // Validate stock availability
    if (newstockavailable < 0) {
      window.alert("Not enough stock available");
      throw new Error("Not enough stock available");
    }

    // Update the stock available in the product document
    transaction.update(productreference, {
      stockAvailable: increment(-Number(amount)),
    });
  });

  // Add the new sale to the sales collection in Firestore
  await addDoc(salesreference, newsale);

  // Reset form inputs
  SPD("");
  SA("");
  SSCN("");
}


// This useEffect hook runs whenever the monthlysales array changes
useEffect(() => {
  // Reduce the monthlysales array to an object where keys are years and values are total sales for each year
  const yearlysalesdata = monthlysales.reduce((acc, monthlysale) => {
    const year = monthlysale.year;

    // If the year exists in the accumulator, add the totalAmount to the existing value, otherwise set the value for the year
    if (acc[year]) {
      acc[year] += monthlysale.totalAmount;
    } else {
      acc[year] = monthlysale.totalAmount;
    }

    // Return the updated accumulator
    return acc;
  }, {});

  // Convert the yearlysalesdata object to an array with a year and totalAmount properties
  const yearlysalesarray = Object.entries(yearlysalesdata).map(([year, totalAmount]) => ({
    year: Number(year),
    totalAmount,
  }));

  // Set the yearlysales state with the newly computed yearlysalesarray
  SYS(yearlysalesarray);
}, [monthlysales]);

// This useEffect hook runs whenever the sales array changes
useEffect(() => {
  // Reduce the sales array to an object where keys are monthYear strings and values are sales data for each month
  const monthlysalesdata = sales.reduce((acc, sale) => {
    // Extract month and year from the sale date
    const saledate = sale.date ? sale.date.toDate() : null;
    const month = saledate ? saledate.getMonth() : null;
    const year = saledate ? saledate.getFullYear() : null;
    const monthYear = month !== null && year !== null ? new Date(year, month, 1).toLocaleString('en-us', { month: 'long', year: 'numeric' }) : null;

    if (monthYear) {
      // If the monthYear exists in the accumulator, update the totalAmount, otherwise set the values for the monthYear
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

      // Calculate sales generated in the current month
      const currentdate = new Date();
      const currentmonth = currentdate.getMonth();
      const currentyear = currentdate.getFullYear();
      if (month === currentmonth && year === currentyear) {
        setcurrentmonthsales(acc[monthYear]?.totalAmount || 0);
      }

// Calculate total amount generated by employee

// Extract the employeeId and amountGenerated from the current sale object
const employeeId = sale.employeeId;
const amountGenerated = sale.amountGenerated;

// Check if both employeeId and amountGenerated are present and valid
if (employeeId && amountGenerated) {

  // Check if an entry for the current employeeId already exists in the accumulator object under the current monthYear
  if (acc[monthYear][employeeId]) {

    // If the entry exists, add the amountGenerated to the existing value
    acc[monthYear][employeeId] += amountGenerated;

  } else {

    // If the entry doesn't exist, create a new entry with the employeeId and set the value to amountGenerated
    acc[monthYear][employeeId] = amountGenerated;

  }
}}

// End of the block that calculates total amount generated by employee

// Return the updated accumulator object to be used in the next iteration of the reduce function
return acc;

// End of the reduce function, initialized with an empty object as the initial accumulator value
}, {});

// Convert employee sales data to an object where keys are employee IDs and values are total sales for each employee
const employeesales = Object.values(monthlysalesdata).reduce((acc, monthlysale) => {
  // Iterate over key-value pairs in the current monthlysale object
  Object.entries(monthlysale).forEach(([key, value]) => {
    // Filter out non-employee keys like 'month', 'year', 'monthYear', and 'totalAmount'
    if (key !== 'month' && key !== 'year' && key !== 'monthYear' && key !== 'totalAmount') {
      // If the employee ID (key) exists in the accumulator, add the value (sales amount) to the existing value
      if (acc[key]) {
        acc[key] += value;
      } else {
        // If the employee ID (key) doesn't exist in the accumulator, create a new entry with the value (sales amount)
        acc[key] = value;
      }
    }
  });
  // Return the updated accumulator for the next iteration
  return acc;
}, {});

// Update the monthlysales state with the newly computed sorted monthly sales data
SMS(Object.values(monthlysalesdata).sort((a, b) => {
  // Create Date objects for each month and year of the monthly sales data
  const dateA = new Date(a.year, a.month);
  const dateB = new Date(b.year, b.month);
  // Sort the monthly sales data in ascending order based on the Date objects
  return dateA - dateB;
}));

  // Update the employeesales state with the newly computed employee sales data
  SES(employeesales);
}, [sales]);


// This function is responsible for deleting a sale, provided the user is authorized
async function deletesale(sale) {
  // Retrieve the employee ID of the current user
  const employeeId = currentUser ? currentUser.employeeId : null;
  console.log("employeeId:", employeeId);

  // Check if the employee ID of the user matches the employee ID associated with the sale
  if (sale.employeeId !== employeeId) {
    // If not authorized, display an alert and return
    alert("You are not authorized to delete this sale");
    return;
  }

  // Define a query to fetch the product associated with the sale
  const queryproduct = query(collection(db, "products"), where("name", "==", sale.productName));
  // Get a reference to the sale document
  const salereference = doc(db, "sales", sale.id);

  try {
    // Fetch the sale data
    const saledata = (await getDoc(salereference)).data();
    // Get the amount of the sale
    const amount = saledata.amount;
    // Fetch the product documents that match the query
    const productdocuments = await getDocs(queryproduct);
    // Get the first (and presumably only) product document
    const productdocument = productdocuments.docs[0];
    // Get the product data
    const productdata = productdocument.data();
    // Calculate the updated stock available after deleting the sale
    const updatedstockavailable = productdata.stockAvailable + amount;

    // Run a transaction to update the product stock and delete the sale
    await runTransaction(db, async (transaction) => {
      // Update the stock available in the product document
      transaction.update(productdocument.ref, { stockAvailable: updatedstockavailable });
      // Delete the sale document
      transaction.delete(salereference);
    });

  } catch (error) {
    // Log the error and display an alert if there was an issue deleting the sale
    console.error("Error deleting sale:", error);
    alert("Error deleting sale");
  }
}

return (
  <div className="hmm">
    {/* Display a title */}
    <h1 className="h1ll">Sales</h1>

    {/* Create a form to add a sale */}
    <form className='formll' onSubmit={handlesale}>
      {/* Product dropdown selection */}
      <label className="labelll">
        Product:
        <select className="selectll"
          value={productdropdown}
          onChange={(e) => SPD(e.target.value)} required
        >
          <option value="">-- Select a product --</option>
          {products.map((product) => (
            <option key={product.id} value={product.name}>
              {product.name}
            </option>
          ))}
        </select>
      </label>
      
      {/* Input for the amount */}
      <label>
        Amount:
        <input
          className="inputll"
          type="number"
          value={amount}
          onChange={(e) => SA(e.target.value)} required
        />
      </label>

      {/* Customer name dropdown selection */}
      <label>
        Customer Name:
        <select
          className="selectll"
          value={selectedCustomerName}
          onChange={(e) => SSCN(e.target.value)}
          required
        >
          <option value="">--Select a customer name--</option>
          {customernames.map((customerName, index) => (
            <option key={index} value={customerName}>{customerName}</option>
          ))}
        </select>
      </label>

      {/* Add Sale button */}
      <button className='buttonll' type="submit">Add Sale</button>
    </form>

    {/* Display the sales history */}
    <h2 className="h2ll">Sales history</h2>
    <table className="tablell">
      <thead>
        <tr className="trll">
          <th className="thll">Product Name</th>
          <th className="thll">Amount</th>
          <th className="thll">Date</th>
          <th className="thll">Customer Full Name</th>
          <th className="thll">Employee Full Name</th>
          <th className="thll">Employee ID</th>
          <th className="thll">Amount Generated</th>
        </tr>
      </thead>
      <tbody>
        {sales.map((sale) => (
          <tr className="trll" key={sale.id}>
            <td className="tdll">{sale.productName}</td>
            <td className="tdll">{sale.amount}</td>
            <td className="tdll">{sale.date ? sale.date.toDate().toLocaleDateString() : ""}</td>
            <td className="tdll">{sale.customerName}</td>
            <td className="tdll">{sale.fullName}</td>
            <td className="tdll">{sale.employeeId}</td>
            <td className="tdll">{sale.amountGenerated.toString()}</td>
            {currentUser && sale.employeeId === currentUser.employeeId && (
              <td><button className='delete-btn' onClick={() => deletesale(sale)}>Delete</button></td>
            )}
          </tr>
        ))}
      </tbody>
    </table>

    {/* Display the monthly sales */}
    <h2 className="h2ll">Monthly Sales</h2>
    <table>
      <thead>
        <tr className="trll">
          <th className="thll">Month</th>
          <th className="thll">Total Sales</th>
        </tr>
      </thead>
      <tbody>
        {monthlysales.map((monthlysale) => (
          <tr className="trll" key={`${monthlysale.month}-${monthlysale.year}`}>
            <td className="tdll">{`${monthlysale.month + 1}-${monthlysale.year}`}</td>
            <td className="tdll">{monthlysale.totalAmount}</td>
          </tr>
        ))}
      </tbody>
    </table>
    
    {/* Render a bar chart for monthly sales */}
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

    {/* Display the yearly sales */}
    <h2 className="h2ll">Yearly Sales</h2>
    <BarChart width={600} height={300} data={yearlysales}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="year" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="totalAmount" fill="#8884d8" />
    </BarChart>

    {/* Display the employee sales */}
    <h2 className="h2ll">Employee Sales</h2>
    <table className="tablell">
      <thead>
        <tr className="trll">
          <th className="thll">Employee ID</th>
          <th className="thll">Total Sales</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(employeesales).map(([employeeId, totalAmount]) => (
          <tr className="trll" key={employeeId}>
            <td className="tdll">{employeeId}</td>
            <td className="tdll">{totalAmount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
}





