// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/Home';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import ClientDashboard from './pages/Client/ClientDashboard';
import CustomerDashboard from './pages/Customer/CustomerDashboard';
import Navbar from './components/Navbar';
import MyProgress from './pages/Customer/MyProgress';
import CustomerProfile from './pages/Customer/CustomerProfile';
import ClientProfilePage from './pages/Client/ClientProfilePage';
import PublicClientProfile from './pages/Customer/PublicClientProfile'; // Re-added import
import Customers from './pages/Client/Customers';

import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import './App.css';
import Loading from './components/Loading';

function App() {
    const [userRole, setUserRole] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);

    // Added a log for debugging render cycles
    console.log('App.js: Rendered. Current Path:', window.location.pathname, 'isAuthenticated:', isAuthenticated, 'userRole:', userRole, 'authLoading:', authLoading);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            console.log('App.js: onAuthStateChanged fired. User:', user ? user.uid : 'null');
            if (user) {
                setIsAuthenticated(true);
                try {
                    const userDocRef = doc(db, 'users', user.uid);
                    const userDocSnap = await getDoc(userDocRef);

                    if (userDocSnap.exists()) {
                        const data = userDocSnap.data();
                        const fetchedRole = data.role;

                        if (fetchedRole) {
                            setUserRole(fetchedRole);
                            localStorage.setItem('role', fetchedRole);
                            console.log('App.js: ✅ Role fetched and set in localStorage:', fetchedRole);
                        } else {
                            console.warn('App.js: ⚠️ User document exists, but role field is missing for UID:', user.uid);
                            setUserRole('unassigned');
                            localStorage.removeItem('role');
                        }
                    } else {
                        console.warn('App.js: ❌ Authenticated user, but document not found in Firestore for UID:', user.uid);
                        setUserRole('unassigned');
                        localStorage.removeItem('role');
                    }
                } catch (error) {
                    console.error('App.js: 🔥 Error fetching user role from Firestore:', error);
                    setUserRole('unassigned');
                    localStorage.removeItem('role');
                }
            } else {
                setIsAuthenticated(false);
                setUserRole(null);
                localStorage.removeItem('role');
                console.log('App.js: 🗑️ User logged out (onAuthStateChanged).');
            }
            setAuthLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (authLoading) {
        return <Loading />;
    }

    const PrivateRoute = ({ children, allowedRoles }) => {
        if (!isAuthenticated) {
            console.log('App.js: PrivateRoute - Not authenticated, redirecting to /login');
            return <Navigate to="/login" replace />;
        }

        if (userRole === null || userRole === 'unassigned') {
            console.log('App.js: PrivateRoute - Authenticated but role is null/unassigned, redirecting to /login or /profile-setup');
            return <Navigate to="/login" replace />;
        }

        if (allowedRoles && !allowedRoles.includes(userRole)) {
            console.log(`App.js: PrivateRoute - Role '${userRole}' not allowed, redirecting to /`);
            return <Navigate to="/" replace />;
        }

        return children;
    };

    return (
        <BrowserRouter>
            <div className="app-container">
                {isAuthenticated && <Navbar userRole={userRole} />}

                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />

                    {/* Dynamic Dashboard Redirection */}
                    <Route
                        path="/dashboard"
                        element={
                            isAuthenticated ? (
                                userRole === 'client' ? (
                                    <Navigate to="/client/dashboard" replace />
                                ) : userRole === 'customer' ? (
                                    <Navigate to="/customer/dashboard" replace />
                                ) : (
                                    <Navigate to="/login" replace />
                                )
                            ) : (
                                <Navigate to="/login" replace />
                            )
                        }
                    />

                    {/* Client Routes protected by PrivateRoute */}
                    <Route
                        path="/client/*"
                        element={
                            <PrivateRoute allowedRoles={['client']}>
                                <div className="content-container">
                                    <Routes>
                                        <Route path="dashboard" element={<ClientDashboard />} />
                                        <Route path="customers" element={<Customers />} />
                                        <Route path="clientprofilepage" element={<ClientProfilePage />} />
                                        {/* IMPORTANT: Ensure this is an absolute path to prevent infinite appending */}
                                        <Route path="*" element={<Navigate to="/client/dashboard" replace />} />
                                    </Routes>
                                </div>
                            </PrivateRoute>
                        }
                    />

                    {/* Customer Routes protected by PrivateRoute */}
                    <Route
                        path="/customer/*"
                        element={
                            <PrivateRoute allowedRoles={['customer']}>
                                <div className="content-container">
                                    <Routes>
                                        <Route path="dashboard" element={<CustomerDashboard />} />
                                        <Route path="myprogress" element={<MyProgress />} />
                                        <Route path="customerprofile" element={<CustomerProfile />} />
                                        {/* PublicClientProfile re-added */}
                                        <Route path="publiclientprofile/:userId" element={<PublicClientProfile />} />
                                        {/* FIX APPLIED HERE: Changed to an absolute path */}
                                        <Route path="*" element={<Navigate to="/customer/dashboard" replace />} />
                                    </Routes>
                                </div>
                            </PrivateRoute>
                        }
                    />

                    {/* Catch-all for unknown routes */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;