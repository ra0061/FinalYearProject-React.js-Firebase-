import React from 'react';
import "./topbar.css";


import {Link} from "react-router-dom";

export default function Topbar() {
  return (
    <div className='topbar'>
      <div className="topbarwrapper">
        <div className="topLeft">
          <Link to="/home" className='link'>
            <span className='logo'>Stone Fabricators</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
