// src/pages/Customer/Dashboard.js
import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import '../../styles/CustomerDashboard.css';

const CustomerDashboard = () => {
  const [dietPlanData, setDietPlanData] = useState(null);
  const [loading, setLoading] = useState(true); // Start loading true
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [currentUser, setCurrentUser] = useState(null); // Keep currentUser state

  // Effect 1: Handle window resize for mobile view (correct as is)
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Empty dependency array, runs once on mount/unmount for listener setup

  // Effect 2: Consolidated Auth State and Initial Data Fetch
  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates on unmounted component

    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (!isMounted) return; // Prevent updates if component unmounted

      setCurrentUser(user); // Update currentUser state

      // If a user is logged in, proceed to fetch their diet plan
      if (user) {
        setLoading(true); // Set loading true as we are about to fetch data
        setError(null); // Clear any previous errors

        try {
          const dietPlansCollectionRef = collection(db, 'users', user.uid, 'dietPlans');
          const q = query(dietPlansCollectionRef, orderBy('uploadedAt', 'desc'), limit(1));
          const querySnapshot = await getDocs(q);

          if (isMounted) { // Check mount status again before setting state after async op
            if (!querySnapshot.empty) {
              const latestPlanDoc = querySnapshot.docs[0];
              setDietPlanData(latestPlanDoc.data());
            } else {
              setDietPlanData(null); // No diet plan found
            }
          }
        } catch (err) {
          console.error('Error fetching diet plan:', err);
          if (isMounted) {
            setError('Failed to fetch diet plan.');
          }
        } finally {
          if (isMounted) {
            setLoading(false); // Always set loading to false in finally block
          }
        }
      } else {
        // User logged out or no user is authenticated
        if (isMounted) {
          setDietPlanData(null);
          setError('Please log in to view your dashboard.'); // Inform user to log in
          setLoading(false); // No loading required if no user
        }
      }
    });

    return () => {
      isMounted = false; // Set flag to false on unmount
      unsubscribeAuth(); // Cleanup the Firebase auth listener
    };
  }, []); // This effect runs ONLY ONCE when the component mounts

  // The previous third useEffect for data fetching is now removed as its logic
  // has been moved into the onAuthStateChanged listener.

  if (loading) {
    return <div className="dashboard-container customer-dashboard">Loading diet plan...</div>;
  }

  if (error) {
    return <div className="dashboard-container customer-dashboard">Error: {error}</div>;
  }

  // Get meal timings from dietPlanData, or default to generic names
  const mealTimings = dietPlanData?.mealTimings || Array(8).fill('').map((_, i) => `Meal ${i + 1}`);

  return (
    <div className="dashboard-container customer-dashboard">
      <h1>My Dashboard</h1>
      <div className="username">
        Welcome, {currentUser?.email || 'Customer'}!
      </div>
      <div className="dashboard-content">
        <h2>Your Diet Plan</h2>
        {dietPlanData ? (
          <div className="diet-plan-details">
            <h3>{dietPlanData.name}</h3>
            {dietPlanData.startDate && dietPlanData.endDate && (
              <p>
                Valid from: {new Date(dietPlanData.startDate).toLocaleDateString()} to{' '}
                {new Date(dietPlanData.endDate).toLocaleDateString()}
              </p>
            )}
            <h4>Weekly Meal Plan:</h4>
            {dietPlanData.weeklyDietPlan && dietPlanData.weeklyDietPlan.length > 0 ? (
              <div className="weekly-meals-grid">
                {!isMobile ? (
                  <table className="meals-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        {/* Display meal timings from fetched data, or fallback to generic */}
                        {mealTimings.map((timing, i) => (
                          <th key={i}>{timing || `Meal ${i + 1}`}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dietPlanData.weeklyDietPlan.map((dayPlan, index) => (
                        <tr key={index}>
                          <th>{dayPlan.date ? new Date(dayPlan.date).toLocaleDateString() : `Day ${index + 1}`}</th>
                          {dayPlan.meals.map((meal, mealIndex) => (
                            <td key={mealIndex}>{meal}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="mobile-weekly-plan">
                    {dietPlanData.weeklyDietPlan.map((dayPlan) => (
                      <div key={dayPlan.date} className="daily-plan-card">
                        <h4>{dayPlan.date ? new Date(dayPlan.date).toLocaleDateString() : 'Day'}</h4>
                        {dayPlan.meals.map((meal, index) => (
                          <div key={index} className="daily-plan-meals">
                            {/* Display meal timings from fetched data, or fallback to generic */}
                            <div className="meal-label">
                              {mealTimings[index] ? `${mealTimings[index]}:` : `Meal ${index + 1}:`}
                            </div>
                            <div className="meal-value">{meal || 'N/A'}</div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p>No weekly meal plan available.</p>
            )}

            {dietPlanData.notes && (
              <div className="notes-section">
                <h4>Notes:</h4>
                <p>{dietPlanData.notes}</p>
              </div>
            )}
            {dietPlanData.uploadedAt && (
              <p className="uploaded-at">
                Uploaded on: {new Date(dietPlanData.uploadedAt.toDate()).toLocaleString()}
              </p>
            )}
          </div>
        ) : (
          <p>No diet plan available yet.</p>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;