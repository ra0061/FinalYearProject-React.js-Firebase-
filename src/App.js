import Sidebar from "./components/sidebar/Sidebar"
import Topbar from "./components/topbar/Topbar";
import "./app.css"
import Home from "./pages/home/Home";
import {BrowserRouter as Router,Switch,Route,Link} from "react-router-dom";




import Products from '../src/pages/Products'

import { AuthProvider } from '../src/contexts/AuthContext'
import Login from '../src/pages/Login'
import ForgotPassword from "./pages/ForgotPassword";
import PrivateRoute from '../src/pages/PrivateRoute';

import UpdateProfile from '../src/pages/UpdateProfile'
import Signup from "./pages/Signup";
import Sales from "./pages/Sales";
import AddProduct from "./pages/AddProduct";
import Profile from '../src/pages/Profile'
import Transactions from '../src/pages/transactions'
import Addtransaction from '../src/pages/Addtransaction'
import Customerdetails from "./pages/Customerdetails";
import Userspage from '../src/pages/Userspage'
import Reports from '../src/pages/Reports'
import Analytics from "./pages/Analytics";
import Filtertransactions from "./pages/Filtertransactions";
import Mail from '../src/pages/Mail'
import Feedback from '../src/pages/feedback'
import Todolist from "./pages/todolist";
import Manage from "./pages/Manage";
import Logs from './pages/Logs'


function App() {
  return (
    <Router className="App">
      <AuthProvider>

      <Topbar />
      <div className="container">
        <Sidebar />

      <Switch>
        <Route exact path="/login">
      <Login />
      </Route>
      <Route exact path="/forgot-password">
      <ForgotPassword />
      </Route>
      <PrivateRoute  path='/update-profile'>
      <UpdateProfile />
      </PrivateRoute>
      <PrivateRoute  path='/home'>
      <Home />
      </PrivateRoute>
      <PrivateRoute  path='/signup'>
      <Signup />
      </PrivateRoute>
      <PrivateRoute  path='/products'>
      <Products />
      </PrivateRoute>
      <PrivateRoute  path='/addproduct'>
      <AddProduct />
      </PrivateRoute>
      <PrivateRoute  path='/sales'>
      <Sales />
      </PrivateRoute>
      <PrivateRoute  path='/profile'>
      <Profile />
      </PrivateRoute>
      <PrivateRoute  path='/transactions'>
      <Transactions />
      </PrivateRoute>
      <PrivateRoute path='/addtransaction'>
        <Addtransaction/>
      </PrivateRoute>
      <PrivateRoute path='/customerdetails'>
        <Customerdetails/>
      </PrivateRoute>
      <PrivateRoute path='/users'>
        <Userspage/>
      </PrivateRoute>
      <PrivateRoute path='/reports'>
        <Reports/>
      </PrivateRoute>
      <PrivateRoute path='/analytics'>
        <Analytics/>
      </PrivateRoute>
      <PrivateRoute path='/filtertransactions'>
        <Filtertransactions/>
      </PrivateRoute>
      <PrivateRoute path='/mail'>
        <Mail/>
      </PrivateRoute>
      <PrivateRoute path='/feedback'>
        <Feedback/>
      </PrivateRoute>
      <PrivateRoute path='/todolist'>
        <Todolist/>
      </PrivateRoute>
      <PrivateRoute path='/manage'>
        <Manage/>
      </PrivateRoute>
      <PrivateRoute path='/logs'>
        <Logs/>
      </PrivateRoute>
 
      
         <PrivateRoute  path='/'>
      <Home />
      </PrivateRoute> 
      </Switch>
      
      </div>
      </AuthProvider>

    </Router>
  );
}

export default App;
