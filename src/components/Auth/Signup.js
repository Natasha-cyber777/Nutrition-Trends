// src/components/Auth/SignUp.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, googleAuthProvider, db } from "../../firebase"; // Import Firestore DB
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore"; // Import Firestore functions
import "../../styles/AuthStyles.css";
import MinimalNavbar from "../MinimalNavbar";
const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Function to determine the user role
  const determineRole = (email) => {
    if (email && email.endsWith("trendzz@gmail.com")) {
      return "client";
    }
    return "customer";
  };

  // Function to handle Email/Password Signup
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("User signed up successfully!", user);

      const role = determineRole(email);

      // Firestore Reference with User UID
      const userDocRef = doc(db, "users", user.uid);

      // Check if user already exists
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) {
        await setDoc(userDocRef, {
          email: user.email,
          role: role,
        });
      }

      navigate(`/${role === "client" ? "client" : "customer"}/dashboard`); // Redirect based on role
    } catch (error) {
      console.error("Signup failed:", error.message);
      setError(error.message);
    }
  };

  // Function to handle Google Sign Up
  const signUpWithGoogle = async () => {
    setError("");
    try {
      const userCredential = await signInWithPopup(auth, googleAuthProvider);
      const user = userCredential.user;
      console.log("User signed up with Google!", user);

      const role = determineRole(user.email);

      // Firestore Reference with User UID
      const userDocRef = doc(db, "users", user.uid);

      // Check if user already exists
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) {
        await setDoc(userDocRef, {
          email: user.email,
          role: role,
        });
      }

      navigate(`/${role === "client" ? "client" : "customer"}/dashboard`); // Redirect based on role
    } catch (error) {
      console.error("Google sign-up failed:", error.message);
      setError(error.message);
    }
  };

  return (
    <div className="auth-container">
      <MinimalNavbar />
      <div className="auth-card">
        <h2>Sign Up</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSignUp}>
          <div>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <div className="button-container">
            <button type="submit">Sign Up</button>
            <button type="button" onClick={signUpWithGoogle}>
              Sign Up with Google
            </button>
          </div>
        </form>
        <p>
          Already have an account? <Link to="/login">Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
