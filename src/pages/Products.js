import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import { Link } from "react-router-dom";
import './Products.css';

export default function Products() {
  const [products, SP] = useState([]);

  const db = firebase.firestore();

  useEffect(() => {
    // Fetch products from Firestore and update state with fetched data
    async function fetchproducts() {
      const PDocs = await getDocs(collection(db, "products"));
      const productsdata = PDocs.docs.map((doc) => {
        const data = doc.data();
        const date = data.date ? new Date(data.date.seconds * 1000) : ""; // convert timestamp to Date object
        const fullName = data.fullName ? data.fullName : ""; // check if fullName exists, otherwise set an empty string
        const pricetobesold = data.pricePerSlab ? data.pricePerSlab * 1.3 : 0; // calculate the price to be sold as 1.3 times the price per slab
        return { ...data, date, fullName, pricetobesold };
      });
      SP(productsdata);
    }

    fetchproducts();
  }, []);

  return (
    <div className="products-container">
      <h1>Products</h1>
      <table className="products-table">
        <thead>
          <tr>
            <th>Product name</th>
            <th>Price per slab</th>
            <th>Price to be sold</th>
            <th>Stock available</th>
            <th>Full name</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            // Render a table row for each product with the relevant data
            <tr key={product.name}>
              <td>{product.name}</td>
              <td>{product.pricePerSlab}</td>
              <td>{product.pricetobesold}</td>
              <td>{product.stockAvailable}</td>
              <td>{product.fullName}</td>
              <td>{product.date instanceof Date ? product.date.toLocaleString() : ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Link to="/addproduct" className="link12">
        Add/Edit or Delete product
      </Link>
    </div>
  );
}
