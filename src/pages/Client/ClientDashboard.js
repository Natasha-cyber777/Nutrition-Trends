// src/pages/Client/ClientDashboard.js
import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, query, where, getDoc } from 'firebase/firestore'; // Added getDoc
import '../../styles/ClientDashboard.css';

const ClientDashboard = () => {
  const [customerEmail, setCustomerEmail] = useState('');
  const [dietPlanName, setDietPlanName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [mealsGrid, setMealsGrid] = useState(Array(7).fill(null).map(() => Array(8).fill('')));
  const [notes, setNotes] = useState('');
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerUid, setSelectedCustomerUid] = useState(null);
  const [customerDietPlans, setCustomerDietPlans] = useState([]);
  const [editingPlan, setEditingPlan] = useState(null);
  const [currentStartDate, setCurrentStartDate] = useState(null);
  const [showSavedPlans, setShowSavedPlans] = useState(false);
  const [savedDietPlans, setSavedDietPlans] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [mealTimings, setMealTimings] = useState(Array(8).fill(''));

  // NEW STATES for customer plan status
  const [selectedCustomerPlanStatus, setSelectedCustomerPlanStatus] = useState(null);
  const [selectedCustomerPlanEndDate, setSelectedCustomerPlanEndDate] = useState(null);

  const getMealDisplaySlots = () => {
    return Array.from({ length: 8 }, (_, i) => mealTimings[i] || `Meal ${i + 1}`);
  };

  const fetchSavedDietPlans = async () => {
    if (selectedCustomerUid && showSavedPlans) {
      const savedPlansCollection = collection(db, 'savedDietPlans');
      // Changed where('clientId', '==', selectedCustomerUid) to where('clientUid', '==', client's own UID) if you want clients to see their own saved plans.
      // If `clientId` is truly meant to store `customerUid` in `savedDietPlans`, then the current logic is fine for showing customer-specific saved plans.
      // Assuming 'clientId' means the client's own UID (the uploader's UID)
      // You'll need to know the current logged-in client's UID for this.
      // For now, I'll keep it as selectedCustomerUid based on your original code, but this might be a logical inconsistency depending on your 'savedDietPlans' structure.
      const q = query(savedPlansCollection, where('clientId', '==', selectedCustomerUid)); // This needs attention if 'clientId' means the actual client's UID.
      const querySnapshot = await getDocs(q);
      const plans = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setSavedDietPlans(plans);
    } else {
      setSavedDietPlans([]);
    }
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const usersCollection = collection(db, 'users');
        const querySnapshot = await getDocs(usersCollection);

        const usersList = querySnapshot.docs
          .filter((doc) => doc.data()?.role === 'customer')
          .map((doc) => ({
            uid: doc.id,
            email: doc.data().email,
            // Include plan status and end date here if you want to initially load it with all customers
            planStatus: doc.data().planStatus || 'active', // Default to active if not set
            planEndDate: doc.data().planEndDate || null,
          }));

        setCustomers(usersList);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };

    fetchCustomers();
  }, []);

  // NEW useEffect to fetch selected customer's plan status and end date
  useEffect(() => {
    const fetchSelectedCustomerPlanDetails = async () => {
      if (selectedCustomerUid) {
        try {
          const customerDocRef = doc(db, 'users', selectedCustomerUid);
          const customerDocSnap = await getDoc(customerDocRef);

          if (customerDocSnap.exists()) {
            const customerData = customerDocSnap.data();
            setSelectedCustomerPlanStatus(customerData.planStatus || 'active'); // Default to 'active'
            setSelectedCustomerPlanEndDate(customerData.planEndDate || null);
          } else {
            // Customer document not found, reset status
            setSelectedCustomerPlanStatus(null);
            setSelectedCustomerPlanEndDate(null);
          }
        } catch (error) {
          console.error('Error fetching selected customer plan details:', error);
          setSelectedCustomerPlanStatus(null);
          setSelectedCustomerPlanEndDate(null);
        }
      } else {
        // No customer selected, reset status
        setSelectedCustomerPlanStatus(null);
        setSelectedCustomerPlanEndDate(null);
      }
    };

    fetchSelectedCustomerPlanDetails();
  }, [selectedCustomerUid]); // Re-run when selectedCustomerUid changes

  const handleCustomerChange = (e) => {
    const selectedEmail = e.target.value;
    setCustomerEmail(selectedEmail);
    const selectedCustomer = customers.find((c) => c.email === selectedEmail);
    setSelectedCustomerUid(selectedCustomer?.uid || null);
    setCustomerDietPlans([]); // Clear previous plans
    setEditingPlan(null); // Reset editing when customer changes
    setDietPlanName('');
    setStartDate('');
    setEndDate('');
    setMealsGrid(Array(7).fill(null).map(() => Array(8).fill('')));
    setNotes('');
    setCurrentStartDate(null); // Reset current start date
    setShowSavedPlans(false); // Reset visibility of saved plans
    setSavedDietPlans([]); // Clear saved plans
    setMealTimings(Array(8).fill('')); // Reset meal timings

    // Reset status and end date when customer changes
    setSelectedCustomerPlanStatus(null);
    setSelectedCustomerPlanEndDate(null);
  };

  useEffect(() => {
    const fetchCustomerDietPlans = async () => {
      if (selectedCustomerUid) {
        const dietPlansCollection = collection(db, 'users', selectedCustomerUid, 'dietPlans');
        const querySnapshot = await getDocs(dietPlansCollection);
        const plans = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setCustomerDietPlans(plans);
      } else {
        setCustomerDietPlans([]);
      }
      setEditingPlan(null); // Reset editing when no customer is selected
    };

    fetchCustomerDietPlans();
  }, [selectedCustomerUid]);

  useEffect(() => {
    fetchSavedDietPlans();
  }, [selectedCustomerUid, showSavedPlans]);

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
    setCurrentStartDate(e.target.value ? new Date(e.target.value) : null);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  const handleMealChange = (row, col, value) => {
    const newMealsGrid = [...mealsGrid];
    newMealsGrid[row][col] = value;
    setMealsGrid(newMealsGrid);
  };

  const handleMealTimingChange = (index, value) => {
    const newMealTimings = [...mealTimings];
    newMealTimings[index] = value;
    setMealTimings(newMealTimings);
  };

  const resetForm = () => {
    setDietPlanName('');
    setStartDate('');
    setEndDate('');
    setMealsGrid(Array(7).fill(null).map(() => Array(8).fill('')));
    setNotes('');
    setCurrentStartDate(null);
    setMealTimings(Array(8).fill(''));
    setEditingPlan(null);
    setUploadStatus(null);
    setUploadError(null);
  }

  const handleEditPlan = (plan) => {
    setEditingPlan(plan);
    setCustomerEmail(customers.find(c => c.uid === selectedCustomerUid)?.email || '');
    setDietPlanName(plan.name);
    setStartDate(plan.startDate || '');
    setEndDate(plan.endDate || '');
    setMealsGrid(plan.weeklyDietPlan ? plan.weeklyDietPlan.map(dayPlan => dayPlan.meals.map(meal => `${meal}`)) : Array(7).fill(null).map(() => Array(8).fill('')));
    setNotes(plan.notes || '');
    setCurrentStartDate(plan.startDate ? new Date(plan.startDate) : null);
    setMealTimings(plan.mealTimings || Array(8).fill(''));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyPlan = (plan) => {
    resetForm();
    setDietPlanName(`Copy of ${plan.name}`);
    setStartDate(plan.startDate || '');
    setEndDate(plan.endDate || '');
    setMealsGrid(plan.weeklyDietPlan ? plan.weeklyDietPlan.map(dayPlan => [...dayPlan.meals]) : Array(7).fill(null).map(() => Array(8).fill('')));
    setNotes(plan.notes || '');
    setCurrentStartDate(plan.startDate ? new Date(plan.startDate) : null);
    setMealTimings(plan.mealTimings ? [...plan.mealTimings] : Array(8).fill(''));
    setEditingPlan(null);
    setUploadStatus('Plan copied to form. Modify and upload as a new plan.');
    setUploadError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeletePlan = async (customerUid, planId) => {
    if (window.confirm('Are you sure you want to delete this diet plan?')) {
      try {
        const dietPlanDocRef = doc(db, 'users', customerUid, 'dietPlans', planId);
        await deleteDoc(dietPlanDocRef);
        console.log('Diet plan deleted successfully!');
        const updatedPlans = customerDietPlans.filter((plan) => plan.id !== planId);
        setCustomerDietPlans(updatedPlans);
        setUploadStatus('Diet plan deleted successfully!');
        setTimeout(() => setUploadStatus(null), 3000);
      } catch (error) {
        console.error('Error deleting diet plan:', error);
        setUploadError('Failed to delete diet plan.');
        setTimeout(() => setUploadError(null), 3000);
      }
    }
  };

  const handleSaveDietPlan = async (planToSave) => {
    if (!selectedCustomerUid) {
      setUploadError('Please select a customer first to save a plan.');
      return;
    }

    const savedPlansCollection = collection(db, 'savedDietPlans');
    const planData = { ...planToSave, clientId: selectedCustomerUid, savedAt: new Date(), mealTimings };

    try {
      await setDoc(doc(savedPlansCollection), planData);
      setUploadStatus(`Diet plan "${planToSave.name}" saved successfully!`);
      if (showSavedPlans) {
        fetchSavedDietPlans();
      }
      setTimeout(() => setUploadStatus(null), 3000);
    } catch (error) {
      console.error('Error saving diet plan:', error);
      setUploadError('Failed to save diet plan.');
      setTimeout(() => setUploadError(null), 3000);
    }
  };

  const handleToggleSavedPlans = () => {
    setShowSavedPlans(!showSavedPlans);
  };

  const handleUploadDiet = async (e) => {
    e.preventDefault();
    setUploadStatus('Uploading...');
    setUploadError(null);

    try {
      if (!customerEmail) {
        setUploadError('Please select a customer.');
        setUploadStatus(null);
        return;
      }

      const selectedCustomer = customers.find((customer) => customer.email === customerEmail);
      if (!selectedCustomer) {
        setUploadError('Selected customer not found.');
        setUploadStatus(null);
        return;
      }

      const customerUid = selectedCustomer.uid;

      // --- START OF NEW VALIDATION LOGIC ---
      if (selectedCustomerPlanStatus === 'paused') {
        setUploadError('Cannot upload diet plan: Customer plan is currently paused. Please unpause their plan in the customer management section first.');
        setUploadStatus(null);
        return;
      }

      // Check if plan has expired
      if (selectedCustomerPlanEndDate) {
        const today = new Date();
        // Set both dates to start of day for accurate comparison
        today.setHours(0, 0, 0, 0);
        const planEndDateObj = new Date(selectedCustomerPlanEndDate);
        planEndDateObj.setHours(0, 0, 0, 0);

        if (today > planEndDateObj) {
          setUploadError('Cannot upload diet plan: Customer plan has expired. Please update their plan end date in the customer management section first.');
          setUploadStatus(null);
          return;
        }
      }
      // --- END OF NEW VALIDATION LOGIC ---

      const dietPlanId = editingPlan?.id || doc(collection(db, 'users', customerUid, 'dietPlans')).id;

      const dietPlanDocRef = doc(db, 'users', customerUid, 'dietPlans', dietPlanId);

      const weeklyDietPlan = Array(7).fill(null).map((_, dayIndex) => {
        const dailyMeals = Array.from({ length: 8 }, (_, mealIndex) => mealsGrid[dayIndex][mealIndex] || '');
        const currentDate = currentStartDate ? new Date(currentStartDate) : new Date();
        currentDate.setDate(currentDate.getDate() + dayIndex);
        const formattedDate = currentDate.toISOString().split('T')[0];
        return { date: formattedDate, meals: dailyMeals };
      });

      const dietPlanData = {
        name: dietPlanName,
        startDate: startDate,
        endDate: endDate,
        weeklyDietPlan,
        notes: notes,
        mealTimings: mealTimings,
        uploadedAt: editingPlan?.uploadedAt || new Date(),
        lastModified: new Date(),
      };

      await setDoc(dietPlanDocRef, dietPlanData, { merge: true });

      setUploadStatus(`Diet plan ${editingPlan ? 'updated' : 'uploaded'} successfully!`);
      resetForm();
      const updatedPlansSnapshot = await getDocs(collection(db, 'users', customerUid, 'dietPlans'));
      setCustomerDietPlans(updatedPlansSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setTimeout(() => setUploadStatus(null), 3000);

    } catch (error) {
      console.error(`Error ${editingPlan ? 'updating' : 'uploading'} diet plan:`, error);
      setUploadError(`Failed to ${editingPlan ? 'update' : 'upload'} diet plan. Error: ${error.message}`); // Show more specific error
      setUploadStatus(null);
      setTimeout(() => setUploadError(null), 5000); // Give more time for error messages
    }
  };

  const getDatesArray = () => {
    if (!currentStartDate) {
      return Array(7).fill('Date');
    }
    return Array(7).fill(null).map((_, index) => {
      const date = new Date(currentStartDate);
      date.setDate(date.getDate() + index);
      return date.toLocaleDateString();
    });
  };

  return (
    <div className="dashboard-container client-dashboard">
      <h1>My Dashboard</h1>
      <h2>Welcome</h2>
      <div className="dashboard-content">
        <h2>{editingPlan ? 'Edit Diet Plan' : 'Upload Weekly Diet Plan for Customer'}</h2>
        <form onSubmit={handleUploadDiet} className="diet-plan-form">
          <div>
            <label htmlFor="customerEmail">Select Customer:</label>
            <select
              id="customerEmail"
              value={customerEmail}
              onChange={handleCustomerChange}
              required
            >
              <option value="">-- Select a Customer --</option>
              {customers.length > 0 ? (
                customers.map((customer) => (
                  <option key={customer.uid} value={customer.email}>
                    {customer.email}
                  </option>
                ))
              ) : (
                <option disabled>No customers found</option>
              )}
            </select>
          </div>
          {selectedCustomerUid && (
            <div className="customer-plan-status-info">
              {selectedCustomerPlanStatus && (
                <p>
                  <strong>Customer Plan Status:</strong> {selectedCustomerPlanStatus.toUpperCase()}
                </p>
              )}
              {selectedCustomerPlanEndDate && (
                <p>
                  <strong>Plan End Date:</strong> {new Date(selectedCustomerPlanEndDate).toLocaleDateString()}
                  {selectedCustomerPlanEndDate && (new Date() > new Date(selectedCustomerPlanEndDate)) && (
                    <span style={{ color: 'red', marginLeft: '10px' }}> (EXPIRED!)</span>
                  )}
                </p>
              )}
              {selectedCustomerPlanStatus === 'paused' && (
                <p style={{ color: 'orange', fontWeight: 'bold' }}>
                  This customer's plan is PAUSED. You cannot upload a diet plan until it's unpaused.
                </p>
              )}
              {selectedCustomerPlanEndDate && (new Date() > new Date(selectedCustomerPlanEndDate)) && (
                <p style={{ color: 'red', fontWeight: 'bold' }}>
                  This customer's plan has EXPIRED. You cannot upload a diet plan until the end date is updated.
                </p>
              )}
            </div>
          )}
          <div>
            <label htmlFor="dietPlanName">Diet Plan Name:</label>
            <input
              type="text"
              id="dietPlanName"
              value={dietPlanName}
              onChange={(e) => setDietPlanName(e.target.value)}
              required
            />
          </div>
          <div className="date-range">
            <div>
              <label htmlFor="startDate">Start Date:</label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={handleStartDateChange}
              />
            </div>
            <div>
              <label htmlFor="endDate">End Date:</label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={handleEndDateChange}
              />
            </div>
          </div>

          <div className="weekly-meals-grid">
            <h3>Weekly Meal Plan</h3>
            <table className="meals-table">
              <thead>
                <tr>
                  <th>Date</th>
                  {Array.from({ length: 8 }, (_, index) => (
                    <th key={index}>
                      <input
                        type="text"
                        placeholder={`Meal ${index + 1} Timing`}
                        value={mealTimings[index]}
                        onChange={(e) => handleMealTimingChange(index, e.target.value)}
                        className="timing-input"
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array(7).fill(null).map((_, rowIndex) => (
                  <tr key={rowIndex}>
                    <th>{currentStartDate ? getDatesArray()[rowIndex] : `Day ${rowIndex + 1}`}</th>
                    {Array.from({ length: 8 }, (_, colIndex) => (
                      <td key={colIndex}>
                        <input
                          type="text"
                          placeholder=""
                          value={mealsGrid[rowIndex][colIndex]}
                          onChange={(e) => handleMealChange(rowIndex, colIndex, e.target.value)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mobile-weekly-plan">
              {Array(7).fill(null).map((_, dayIndex) => (
                <div key={dayIndex} className="daily-plan-card">
                  <h4>{currentStartDate ? getDatesArray()[dayIndex] : `Day ${dayIndex + 1}`}</h4>
                  {Array.from({ length: 8 }, (_, mealIndex) => (
                    <div key={mealIndex} className="daily-plan-meals">
                      <div className="meal-label">
                        <input
                          type="text"
                          placeholder={`Meal ${mealIndex + 1} Timing`}
                          value={mealTimings[mealIndex]}
                          onChange={(e) => handleMealTimingChange(mealIndex, e.target.value)}
                          className="timing-input"
                        />
                      </div>
                      <input
                        type="text"
                        className="meal-input"
                        value={mealsGrid[dayIndex][mealIndex]}
                        onChange={(e) => handleMealChange(dayIndex, mealIndex, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="notes">Additional Notes:</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="4"
            />
          </div>
          <button type="submit"
            disabled={selectedCustomerPlanStatus === 'paused' ||
              (selectedCustomerPlanEndDate && (new Date() > new Date(selectedCustomerPlanEndDate)))}
          >
            {editingPlan ? 'Update Diet Plan' : 'Upload Diet Plan'}
          </button>
          {editingPlan && <button type="button" onClick={resetForm}>Cancel Edit</button>}
        </form>

        {selectedCustomerUid && customerDietPlans.length > 0 && !editingPlan && (
          <div className="existing-diet-plans">
            <h3>Existing Diet Plans for {customers.find(c => c.uid === selectedCustomerUid)?.email}</h3>
            <ul>
              {customerDietPlans.map((plan) => (
                <li key={plan.id}>
                  {plan.name} (Uploaded: {plan.uploadedAt?.toDate().toLocaleDateString()})
                  <button onClick={() => handleEditPlan(plan)}>Edit</button>
                  <button onClick={() => handleDeletePlan(selectedCustomerUid, plan.id)}>Delete</button>
                  <button onClick={() => handleCopyPlan(plan)}>Copy</button>
                  <button onClick={() => handleSaveDietPlan(plan)}>Save</button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {selectedCustomerUid && (
          <div className="saved-diet-plans-section">
            <h3>
              Saved Diet Plans for {customers.find(c => c.uid === selectedCustomerUid)?.email}
              <button type="button" onClick={handleToggleSavedPlans}>
                {showSavedPlans ? 'Hide Saved Plans' : 'Show Saved Plans'}
              </button>
            </h3>
            {showSavedPlans && savedDietPlans.length > 0 ? (
              <ul>
                {savedDietPlans.map((plan) => (
                  <li key={plan.id}>
                    {plan.name} (Saved: {plan.savedAt?.toDate().toLocaleDateString()})
                    <button onClick={() => handleCopyPlan(plan)}>Use This Plan</button>
                  </li>
                ))}
              </ul>
            ) : (
              showSavedPlans && <p>No saved diet plans for this customer.</p>
            )}
          </div>
        )}

        {uploadStatus && <p className="success">{uploadStatus}</p>}
        {uploadError && <p className="error">{uploadError}</p>}
      </div>
    </div>
  );
};

export default ClientDashboard;