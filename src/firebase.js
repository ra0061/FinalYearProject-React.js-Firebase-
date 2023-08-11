import firebase from 'firebase/compat/app'
import "firebase/compat/auth"

import 'firebase/compat/firestore'





const app = firebase.initializeApp({
    apiKey: "AIzaSyBqFSSNn1q3k0hE1rnf80wh9tO__lop2UA",
    authDomain: "fyproject-35faa.firebaseapp.com",
    projectId: "fyproject-35faa",
    storageBucket: "fyproject-35faa.appspot.com",
    messagingSenderId: "953438831194",
    appId: "1:953438831194:web:6453b3f5ddaa26c3da4e63"
})

export const auth = app.auth()
export const firestore = app.firestore()





export default {app}


