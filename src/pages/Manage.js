import React from 'react';
import { Link } from 'react-router-dom';
import './manage.css';

function Manage() {
  return (
    <div className="manage-container1">
      <Link className="custom-link1" to="/addproduct">
        Edit, Delete or Add Product
      </Link>
      <Link className="custom-link1" to="/profile">
        Edit or Delete User
      </Link>
      <Link className="custom-link1" to="/addtransaction">
        Add Transactions
      </Link>
      <Link className="custom-link1" to="/transactions">
        Delete Transactions
      </Link>
      <Link className="custom-link1" to="/customerdetails">
        Add or delete Customers
      </Link>
      <Link className="custom-link1" to="/sales">
        Add or delete Sales
      </Link>
      <Link className="custom-link1" to="/reports">
        Add or delete Reports
      </Link>
      <Link className="custom-link1" to="/feedback">
        Add or delete Feedback
      </Link>
      <Link className="custom-link1" to="/logs">
        Add or delete Logs
      </Link>
      <Link className="custom-link1" to="/todolist">
        Add or delete your todos
      </Link>
      <Link className="custom-link1" to="/Mail">
        Add or delete Mails
      </Link>
    </div>
  );
}

export default Manage;
