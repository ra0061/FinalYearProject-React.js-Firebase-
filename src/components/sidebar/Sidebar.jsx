import './sidebar.css'



import { AiOutlineUser } from 'react-icons/ai'
import { MdOutlineProductionQuantityLimits } from 'react-icons/md'


import { AiOutlineBarChart } from 'react-icons/ai'
import { AiOutlineMail } from 'react-icons/ai'
import { MdFeedback } from 'react-icons/md'

import { RiSuitcaseLine } from 'react-icons/ri'
import { MdReportProblem } from 'react-icons/md'
import { Link, useHistory } from "react-router-dom";
import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { CgProfile } from 'react-icons/cg'
import { BiRegistered } from 'react-icons/bi'
import { MdSystemSecurityUpdateWarning } from 'react-icons/md'
import { FcTodoList } from 'react-icons/fc'
import { AiOutlineHome } from 'react-icons/ai'
import { TbBrandGoogleAnalytics } from 'react-icons/tb'
import { HiCurrencyPound } from 'react-icons/hi'
import { GrTransaction } from 'react-icons/gr'
import { BiLogOut } from 'react-icons/bi'

export default function Sidebar() {
  const [error, SE] = useState('')
  const { currentUser, logout } = useAuth()

  const history = useHistory()

  async function handlelogout() {
    SE('')

    try {
      await logout()
      history.push('/login')
    } catch {
      SE('Failed to log out')
    }
  }
  return (
    <div className='sb_container'>
      <div className="sb_wrapper">
        <div className="sb_menu">
          <Link to="/update-profile" className='link'>
            <li className="sb_item">
              <MdSystemSecurityUpdateWarning className='sb_icon' />
              Update password
            </li>
          </Link>
          <Link to="/profile" className='link'>
            <li className="sb_item">
              <CgProfile className='sb_icon' />
              Profile
            </li>
          </Link>
          <Link to="/signup" className='link'>
            <li className="sb_item">
              <BiRegistered className='sb_icon' />
              Register account
            </li>
          </Link>

          <h3 className='sb_title'>Dashboard</h3>
          <ul className="sb_list">
            <Link to="/home" className='link'>
              <li className="sb_item">
                <AiOutlineHome className='sb_icon' />
                Home
              </li>
            </Link>
            <Link to="/analytics" className='link'>
              <li className="sb_item">
                <TbBrandGoogleAnalytics className='sb_icon' />
                Analytics
              </li>
            </Link>
            <Link to="/sales" className='link'>
              <li className="sb_item">
                <HiCurrencyPound className='sb_icon' />
                Sales
              </li>
            </Link>
          </ul>
        </div>
        <div className="sb_menu">
          <h3 className='sb_title'>Quick Menu</h3>
          <ul className="sb_list">
            <Link to="/users" className='link'>
              <li className="sb_item">
                <AiOutlineUser className='sb_icon' />
                Users
              </li>
            </Link>
            <Link to="/products" className='link'>
              <li className="sb_item">
                <MdOutlineProductionQuantityLimits className='sb_icon' />
                Products
              </li>
            </Link>
            <Link to="/transactions" className='link'>
              <li className="sb_item">
                <GrTransaction className='sb_icon' />
                Transactions
              </li>
            </Link>
            <Link to="/reports" className='link'>
              <li className="sb_item">
                <AiOutlineBarChart className='sb_icon' />
                Reports
              </li>
            </Link>
            <Link to="/customerdetails" className='link'>
              <li className="sb_item">
                <AiOutlineUser className='sb_icon' />
                Customers
              </li>
            </Link>
          </ul>
        </div>
        <div className="sb_menu">
          <h3 className='sb_title'>Communication</h3>
          <ul className="sb_list">
            <Link to="mail" className='link'>
              <li className="sb_item">
                <AiOutlineMail className='sb_icon' />
                Webapp mails
                </li>
            </Link>
            <Link to="/feedback" className='link'>
              <li className="sb_item">
                <MdFeedback className='sb_icon' />
                Feedback
              </li>
            </Link>
            <Link to="/todolist" className='link'>
              <li className="sb_item">
                <FcTodoList className='sb_icon' />
                todolist
              </li>
            </Link>
          </ul>
        </div>
        <div className="sb_menu">
          <h3 className='sb_title'>Staff</h3>
          <ul className="sb_list">
            <Link to="/manage" className='link'>
              <li className="sb_item">
                <RiSuitcaseLine className='sb_icon' />
                Manage
              </li>
            </Link>

            <Link to="/logs" className='link'>
              <li className="sb_item">
                <MdReportProblem className='sb_icon' />
                Logs
              </li>
            </Link>

            <li className="sb_item" onClick={handlelogout}>
              <BiLogOut className="sb_icon" />
              Logout
            </li>

          </ul>
        </div>
      </div>
    </div>
)
}