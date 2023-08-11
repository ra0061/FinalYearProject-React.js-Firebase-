import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import './todolist.css';

function TodoList() {
  // Define state variables for tasks and newtask
  const [tasks, ST] = useState([]);
  const [newtask, SNT] = useState('');

  // Initialize Firestore and get the current user
  const db = firebase.firestore();
  const user = firebase.auth().currentUser;

  useEffect(() => {
    let DA;
    if (user) {
      // Fetch tasks from Firestore where the userId matches the current user's ID
      DA = db
        .collection('tasks')
        .where('userId', '==', user.uid)
        .onSnapshot((snapshot) => {
          // Map the snapshot data to an array and set the tasks state
          const tasksdata = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          ST(tasksdata);
        });
    }
    // Clean up the Firestore listener on component unmount
    return () => DA && DA();
  }, [db, user]);

  const handlesubmit = (e) => {
    e.preventDefault();
    // Add a new task to the Firestore 'tasks' collection
    db.collection('tasks').add({ text: newtask, userId: user.uid });
    // Clear the newtask input field
    SNT('');
  };

  const handledelete = (id) => {
    // Delete a task by its ID from the Firestore 'tasks' collection
    db.collection('tasks').doc(id).delete();
  };

  return (
    <div className='maybe1'>
      <div className='outer-container'>
        <div className="todolist-container">
          <h1 className="todolist-title">To-Do List</h1>
          <form className="todolist-form" onSubmit={handlesubmit}>
            <input
              className="todolist-input"
              type="text"
              value={newtask}
              onChange={(e) => SNT(e.target.value)}
            />
            <button className="todolist-button" type="submit">
              Add Task
            </button>
          </form>
          <ul className="todolist-list">
            {tasks.map((task) => (
              <li className="todolist-item" key={task.id}>
                <span className="todolist-task-text">{task.text}</span>
                <button
                  className="todolist-delete"
                  onClick={() => handledelete(task.id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default TodoList;
