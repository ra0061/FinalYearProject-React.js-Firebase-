import React, { useState, useEffect } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";
import './Logs.css'

export default function Logs() {
  // set up state variables using the useState hook
  const [posts, SP] = useState([]);
  const [user, SU] = useState(null);
  const [fullName, SFN] = useState("");

  // set up an effect to run once, when the component mounts
  useEffect(() => {
    // Get the logged-in user
    const DA = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        SU(user);
        // Get the user's full name from the users collection
        const usersreference = firebase.firestore().collection("users");
        const userdocumentreference = usersreference.doc(user.uid);
        userdocumentreference.get().then((doc) => {
          if (doc.exists) {
            const userdata = doc.data();
            SFN(`${userdata.name} ${userdata.lastName}`);
          } else {
            console.log("No such document!");
          }
        }).catch((error) => {
          console.log("Error getting document:", error);
        });
      } else {
        SU(null);
      }
    });


    return () => DA();
  }, []);

  useEffect(() => {
    // get all posts from the Firestore "logs" collection
    const postsreference = firebase.firestore().collection("logs");
    postsreference.get().then((QS) => {
      const posts = [];
      QS.forEach((doc) => {
        const data = doc.data();
        const timestamp = new Date(data.timestamp.seconds * 1000);
        const authorId = data.authorId;

        // get the author's full name from the Firestore "users" collection
        firebase.firestore().collection("users").doc(authorId).get().then((doc) => {
          if (doc.exists) {
            const authordata = doc.data();
            const fullName = `${authordata.name} ${authordata.lastName}`;

            // construct an object representing the post, including its ID, author's name, timestamp, title, and content
            const post = {
              postId: data.postId, 
              fullName,
              content: data.content,
              timestamp,
              title: data.title,
            };

            // add the post object to the posts array
            posts.push(post);

            // set the state variable posts to the updated array
            SP(posts);
          } else {
            console.log("No such document!");
          }
        }).catch((error) => {
          console.log("Error getting document:", error);
        });
      });
    });
  }, []);

  // define a function to handle the form submit event
  const handleformsubmit = (event) => {
    event.preventDefault(); // prevent default form submission behavior

    // extract form data
    const form = event.target;
    const title = form.title.value; // extract title from form data
    const content = form.content.value; // extract content from form data

    // get server timestamp and author ID
    const timestamp = firebase.firestore.FieldValue.serverTimestamp();
    const authorId = user.uid;

    // generate a new post ID
    const postId = firebase.firestore().collection("logs").doc().id;

    // create new Firestore document with post data
    firebase.firestore().collection("logs").doc(postId).set({
      postId,
      authorId,
      title,
      content,
      timestamp,
    })



    // update the posts state variable with the new post object
    .then(() => {
      SP((prevposts) => {
        const newPost = {
          postId,
          fullName,
          content,
          timestamp,
          title,
        };
        return [...prevposts, newPost]; // add new post object to posts array
      });

      form.reset(); // reset the form to its initial state
    })

    // log error if Firestore document creation fails
    .catch((error) => {
      console.error("Error adding post: ", error);
    });
  };

  // define a function to handle deleting a post by ID
  const handledelete = (postId) => {
    console.log("Deleting document with ID:", postId);
    // delete the document with the given ID from the Firestore "logs" collection
    firebase.firestore().collection("logs").doc(postId).delete().then(() => {
      console.log("Document successfully deleted!");

      // remove the deleted post from the state variable
      const updatedposts = posts.filter((post) => post.postId !== postId);
      SP(updatedposts);
    }).catch((error) => {
      console.error("Error removing document: ", error);
    });
  };
    
  return (
    <div className="outer-container">
      <div className="reportscon">
        <h1 className="heading">Logs</h1>
        <p>Welcome, {fullName}!</p>

        <form onSubmit={handleformsubmit} className="form-container">
          <label>
            Title:
            <input type="text" name="title" required className="form-input"/>
          </label>

          <label>
            Content:
            <textarea name="content" required className="form-textarea"></textarea>
          </label>

          <button type="submit" className="submit-button">Submit</button>
        </form>

        {posts.map((post, index) => {
          // check if post.timestamp is a valid Firestore timestamp
          const timestamp = post.timestamp instanceof firebase.firestore.Timestamp
            ? new Date(post.timestamp.seconds * 1000) // convert Firestore timestamp to JS Date object
            : new Date(); // use current date and time if timestamp is not valid

          return (
            <div key={index} className="post">
              <h2 className="post-heading">{timestamp.toString()}</h2>
              <p className="post-paragraph">Posted by: {post.fullName}</p>
              <p className="post-paragraph">Title: {post.title}</p>
              <p className="post-paragraph">Content: {post.content}</p>

              <button onClick={() => handledelete(post.postId)} className="delete-button">Delete</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
