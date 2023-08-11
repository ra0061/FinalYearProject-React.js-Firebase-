import React, {useContext,useState,useEffect} from 'react'
import {auth} from '../firebase'

const AuthContext=React.createContext()

export function useAuth(){
    return useContext(AuthContext)
}


export  function AuthProvider({children}) {
const [currentUser,SCU]=useState()
const [loading,SL]=useState(true)

function signup(email,password)
{
    return auth.createUserWithEmailAndPassword(email,password)
}

function login(email,password){
  return auth.signInWithEmailAndPassword(email,password)
}
function logout(){
  return auth.signOut()
}

function ResPass(email){
  return auth.sendPasswordResetEmail(email)
}


function UPass(password){
  return currentUser.updatePassword(password)
}

useEffect(()=>{
    const US= auth.onAuthStateChanged(user=>{
      SCU(user)
      SL(false)  

    })

    return US

},[])

  const value = { 
    currentUser,
    login,
    signup,
    logout,
    ResPass,

    UPass
}
  return (
    <div>      
      <AuthContext.Provider value={value}>
        {!loading && children}
      </AuthContext.Provider>
    </div>
  )
}
