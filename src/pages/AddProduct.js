// Import necessary libraries and components
import React, { useState, useEffect } from "react";
import {
  collection,
  setDoc,

  query,
  where,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import { getAuth } from "firebase/auth";
import { useHistory } from "react-router-dom";
import './addproduct.css'

// Define AddProduct component
export default function AddProduct() {
  // Declare state variables
  const [name, setname] = useState("");
  const [priceperslab, SPPS] = useState(0);
  const [stockavailable, SSA] = useState(0);
  const [pricetobesold, SPTBS] = useState(0);
  const [fullName, SFN] = useState("");
  const [employeeId, SEI] = useState("");
  const [products, SP] = useState([]);
  const [selectedproduct, SSP] = useState(null);
  const history = useHistory();

  const db = firebase.firestore();

  // Fetch products from Firestore and update the products state
  useEffect(() => {
    const fetchproducts = async () => {
      const productreference = collection(firebase.firestore(), "products");
      const PDocs = await getDocs(productreference);
      const productsdata = PDocs.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      SP(productsdata);
    };

    fetchproducts();
  }, []);

  // Update pricetobesold state when priceperslab state changes
  const handlepriceperslabchange = (e) => {
    const newprice = e.target.value;
    SPPS(newprice);
    SPTBS(newprice * 1.3); // Set pricetobesold to 30% more than priceperslab
  };

  // Set form fields for editing a product
  const handleeditproduct = (product) => {
    SSP(product);
    setname(product.name);
    SPPS(product.priceperslab);
    SSA(product.stockavailable);
    SPTBS(product.pricetobesold);
    SFN(product.fullName);
    SEI(product.employeeId);
  };

  // delete a product from Firestore and update the products state
  const handledeleteproduct = async (product) => {
    const productreference = doc(db, "products", product.id);
    await deleteDoc(productreference);
    SP(products.filter((p) => p.id !== product.id));
  };

  // Handle adding a new product 
  async function handlesubmit(e) {
    e.preventDefault();
  
    // Check if the product already exists in Firestore
    const productreference = collection(db, "products");
    const productqueryreference = query(productreference, where("name", "==", name));
    const existingproduct = await getDocs(productqueryreference);
  
    // If the product already exists, display an alert and return
    if (!existingproduct.empty) {
      alert("The product already exists. Please use a different name.");
      return;
    }
  
    // Get the user's information from Firestore
    const auth = getAuth();
    const userId = auth.currentUser.uid;
  
    const userreference = doc(db, "users", userId);
    const userdocument = await getDoc(userreference);
  
    const user = userdocument.data();
    const fullName = user.name + " " + user.lastName;
    const employeeId = user.employeeId;
  
    // Create a new product and add it to Firestore
    const newproductId = doc(productreference).id; // Generate a new product ID
    const newproduct = {
      productId: newproductId,
      name,
      pricePerSlab: Number(priceperslab),
      pricetobesold: Number(pricetobesold),
      stockAvailable: Number(stockavailable),
      createdBy: firebase.auth().currentUser.uid,
      date: serverTimestamp(),
      fullName,
      employeeId, 
    };
  
    await setDoc(doc(productreference, newproductId), newproduct); // Use the new product ID when adding the product to the collection
  
    // Reset form fields and navigate to the add transaction page
    setname("");
    SPPS("");
    SSA("");
    SPTBS("");
    history.push(`/addtransaction`);
  }
  
  // Handle editing an existing product and saving the changes
  async function handleeditsubmit(e) {
    e.preventDefault();
    const productreference = doc(db, "products", selectedproduct.id);
    const updatedproduct = {
      name,
      pricePerSlab: Number(priceperslab),
      pricetobesold: Number(pricetobesold),
      stockAvailable: Number(stockavailable),
      fullName,
      employeeId,
    };

    // Update the product in Firestore
    await updateDoc(productreference, updatedproduct);

    // Update the product in the products state
    SP(
      products.map((product) =>
        product.id === selectedproduct.id ? { ...product, ...updatedproduct } : product
      )
    );

    // Clear the selected product state
    SSP(null);
  }

  return (
    <div className="container12">
      <h1 className="warning-text">Only change stock available when mistakes have been made by an employee, as these usually need to be added on transactions page</h1>
      <h1 className="sub-heading">Add Product (You will be redirected to add transaction page after you add a product)</h1>
      <h1 className="instruction-text">Do not initially put stock available as anything other than the number 0 as transactions calculate amount spent on stock</h1>
      {selectedproduct ? (
        <form onSubmit={handleeditsubmit} className="form">
          <label className="form-label">
            Name:
            <input type="text" value={name} onChange={(e) => setname(e.target.value)} className="form-input" />
          </label>
          <label className="form-label">
            Price per slab:
            <input type="number" value={priceperslab} onChange={handlepriceperslabchange} className="form-input" />
          </label>
          <label className="form-label">
            Price to be sold:
            <input type="number" value={pricetobesold} readOnly className="form-input" />
          </label>
          <label className="form-label">
            Stock available:
            <input type="number" value={stockavailable} onChange={(e) => SSA(e.target.value)} className="form-input" />
          </label>
          <button type="submit" className="submit-btn">Save</button>
          <button onClick={() => SSP(null)} className="cancel-btn">Cancel</button>
        </form>
      ) : (
        <form onSubmit={handlesubmit} className="form">
          <label className="form-label">
            Name:
            <input type="text" value={name} onChange={(e) => setname(e.target.value)} className="form-input" />
          </label>
         
          <label className="form-label">
            Price per slab:
            <input type="number" value={priceperslab} onChange={handlepriceperslabchange} className="form-input" />
          </label>
          <label className="form-label">
            Price to be sold:
            <input type="number" value={pricetobesold} readOnly className="form-input" />
          </label>
          <label className="form-label">
            Stock available:
            <input type="number" value={stockavailable} onChange={(e) => SSA(e.target.value)} className="form-input" />
          </label>
          <button type="submit" className="submit-btn">Add Product</button>
        </form>
      )}

      <h1 className="sub-heading">Products</h1>
      <ul className="product-list">
        {products.map((product) => (
          <li key={product.id} className="product-item">
            {product.name} ({product.stockAvailable} available) - £{product.pricePerSlab} per slab, Price to be sold: £{product.pricetobesold} 
            <button onClick={() => handleeditproduct(product)} className="edit-btn">Edit</button>
            <button onClick={() => handledeleteproduct(product)} className="delete-btn">Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

