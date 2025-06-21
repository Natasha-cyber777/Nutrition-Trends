// src/pages/Client/Customers.js
import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import '../../styles/Customers.css';
import CustomerProfile from '../Customer/CustomerProfile';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [customerProgress, setCustomerProgress] = useState(null);
    const [loadingCustomers, setLoadingCustomers] = useState(true);
    const [errorCustomers, setErrorCustomers] = useState(null);
    const [loadingProgress, setLoadingProgress] = useState(false);
    const [errorProgress, setErrorProgress] = useState(null);
    const [customerNotes, setCustomerNotes] = useState('');
    const [loadingNotes, setLoadingNotes] = useState(false);
    const [errorNotes, setErrorNotes] = useState(null);
    const [showProfile, setShowProfile] = useState(true);
    const [showProgress, setShowProgress] = useState(false);

    // New states for plan management
    const [planStartDate, setPlanStartDate] = useState('');
    const [planEndDate, setPlanEndDate] = useState('');
    const [planStatus, setPlanStatus] = useState(''); // e.g., 'active', 'paused', 'expired'
    const [loadingPlanActions, setLoadingPlanActions] = useState(false);
    const [planActionError, setPlanActionError] = useState(null);

    useEffect(() => {
        const fetchCustomers = async () => {
            setLoadingCustomers(true);
            setErrorCustomers(null);
            try {
                const usersRef = collection(db, 'users');
                const q = query(usersRef, where('role', '==', 'customer'));
                const querySnapshot = await getDocs(q);
                const customerList = [];
                for (const doc of querySnapshot.docs) {
                    const customerData = doc.data();
                    customerList.push({
                        id: doc.id,
                        ...customerData,
                        notes: customerData.notes || '',
                        planStartDate: customerData.planStartDate || '',
                        planEndDate: customerData.planEndDate || '',
                        planStatus: customerData.planStatus || 'not_set' // Default status
                    });
                }
                setCustomers(customerList);
            } catch (error) {
                console.error('Error fetching customers:', error);
                setErrorCustomers('Failed to fetch customers.');
            } finally {
                setLoadingCustomers(false);
            }
        };

        fetchCustomers();
    }, []);

    useEffect(() => {
        const fetchCustomerProgress = async () => {
            if (selectedCustomer && selectedDate) {
                setLoadingProgress(true);
                setErrorProgress(null);
                setCustomerProgress(null);
                try {
                    const progressDocRef = doc(
                        db,
                        'progress',
                        selectedCustomer.id,
                        'dailyProgress',
                        selectedDate
                    );
                    const docSnap = await getDoc(progressDocRef);
                    if (docSnap.exists()) {
                        setCustomerProgress(docSnap.data());
                    } else {
                        console.log('No progress found for this customer and date.');
                        setCustomerProgress(null);
                    }
                } catch (error) {
                    console.error('Error fetching customer progress:', error);
                    setErrorProgress('Failed to fetch customer progress.');
                } finally {
                    setLoadingProgress(false);
                }
            } else {
                setCustomerProgress(null);
            }
        };

        fetchCustomerProgress();
    }, [selectedCustomer, selectedDate]);

    // Effect to update notes, plan dates, and status when selectedCustomer changes
    useEffect(() => {
        if (selectedCustomer) {
            setCustomerNotes(selectedCustomer.notes || '');
            setPlanStartDate(selectedCustomer.planStartDate || '');
            setPlanEndDate(selectedCustomer.planEndDate || '');
            setPlanStatus(selectedCustomer.planStatus || 'not_set');
        } else {
            setCustomerNotes('');
            setPlanStartDate('');
            setPlanEndDate('');
            setPlanStatus('');
        }
        setPlanActionError(null); // Clear any previous plan action errors
    }, [selectedCustomer]);

    const handleCustomerSelect = (customer) => {
        setSelectedCustomer(customer);
        setShowProfile(true);
        setShowProgress(false);
    };

    const handleDateChange = (event) => {
        setSelectedDate(event.target.value);
    };

    const handleNotesChange = (event) => {
        setCustomerNotes(event.target.value);
    };

    const saveCustomerNotes = async () => {
        if (selectedCustomer) {
            setLoadingNotes(true);
            setErrorNotes(null);
            try {
                const userDocRef = doc(db, 'users', selectedCustomer.id);
                await updateDoc(userDocRef, { notes: customerNotes });
                // Update the customer list to reflect the change
                setCustomers(prevCustomers =>
                    prevCustomers.map(cust =>
                        cust.id === selectedCustomer.id ? { ...cust, notes: customerNotes } : cust
                    )
                );
                // Update the selected customer state as well
                setSelectedCustomer(prev => ({ ...prev, notes: customerNotes }));
                setLoadingNotes(false);
            } catch (error) {
                console.error('Error saving customer notes:', error);
                setErrorNotes('Failed to save notes.');
                setLoadingNotes(false);
            }
        }
    };

    // New Functions for Plan Management
    const updateCustomerPlan = async (updates) => {
        if (!selectedCustomer) {
            setPlanActionError("No customer selected.");
            return false;
        }
        setLoadingPlanActions(true);
        setPlanActionError(null);
        try {
            const userDocRef = doc(db, 'users', selectedCustomer.id);
            await updateDoc(userDocRef, updates);

            // Update local state and customers list
            setCustomers(prevCustomers =>
                prevCustomers.map(cust =>
                    cust.id === selectedCustomer.id ? { ...cust, ...updates } : cust
                )
            );
            setSelectedCustomer(prev => ({ ...prev, ...updates }));

            setLoadingPlanActions(false);
            return true;
        } catch (error) {
            console.error('Error updating customer plan:', error);
            setPlanActionError(`Failed to update plan: ${error.message}`);
            setLoadingPlanActions(false);
            return false;
        }
    };

    const handleUpdatePlanDates = async () => {
        if (!planStartDate || !planEndDate) {
            setPlanActionError("Please select both start and end dates.");
            return;
        }
        if (new Date(planStartDate) > new Date(planEndDate)) {
            setPlanActionError("Start date cannot be after end date.");
            return;
        }
        await updateCustomerPlan({ planStartDate, planEndDate, planStatus: 'active' });
    };

    const handlePausePlan = async () => {
        await updateCustomerPlan({ planStatus: 'paused' });
    };

    const handleResumePlan = async () => {
        // When resuming, ensure there are valid dates, or prompt to set them
        if (!planStartDate || !planEndDate || new Date(planEndDate) < new Date()) {
            setPlanActionError("Please set valid start and end dates before resuming the plan.");
            return;
        }
        await updateCustomerPlan({ planStatus: 'active' });
    };

    const handleRenewPlan = async () => {
        // A simple renewal could be extending the end date, or setting new dates
        // For simplicity, let's allow setting new start/end dates for renewal
        if (!planStartDate || !planEndDate) {
             setPlanActionError("Please set new start and end dates for renewal.");
             return;
        }
        if (new Date(planStartDate) > new Date(planEndDate)) {
            setPlanActionError("New start date cannot be after new end date for renewal.");
            return;
        }
        await updateCustomerPlan({ planStartDate, planEndDate, planStatus: 'active' });
        // Optionally, you might want to automatically set new dates based on current end date + duration
        // For now, it relies on the user inputting new dates.
    };

    const toggleProfile = () => {
        setShowProfile(!showProfile);
        setShowProgress(false);
    };

    const toggleProgress = () => {
        setShowProgress(!showProgress);
        setShowProfile(false);
    };

    if (loadingCustomers) {
        return <div className="customers-container">Loading customers...</div>;
    }

    if (errorCustomers) {
        return <div className="customers-container">Error loading customers: {errorCustomers}</div>;
    }

    return (
        <div className="customers-container">
            <aside className="customer-list-sidebar">
                <h3>Customers</h3>
                <ul>
                    {customers.map((customer) => (
                        <li
                            key={customer.id}
                            className={selectedCustomer?.id === customer.id ? 'selected' : ''}
                            onClick={() => handleCustomerSelect(customer)}
                        >
                            {customer.email}
                        </li>
                    ))}
                </ul>
            </aside>
            <main className="customer-details">
                {selectedCustomer ? (
                    <>
                        <h2>{selectedCustomer.email}</h2>
                        <div className="customer-toggles">
                            <button
                                type="button"
                                className={showProfile ? 'active' : ''}
                                onClick={toggleProfile}
                            >
                                {showProfile ? 'Hide Profile' : 'Show Profile'}
                            </button>
                            <button
                                type="button"
                                className={showProgress ? 'active' : ''}
                                onClick={toggleProgress}
                            >
                                {showProgress ? 'Hide Progress' : 'Show Progress'}
                            </button>
                        </div>

                        {showProfile && <CustomerProfile customerId={selectedCustomer.id} />}

                        {/* Plan Management Section */}
                        <div className="customer-plan-management-section">
                            <h3>Plan Management</h3>
                            <p><strong>Current Plan Status:</strong> {planStatus}</p>
                            <p><strong>Plan Start Date:</strong> {planStartDate || 'Not Set'}</p>
                            <p><strong>Plan End Date:</strong> {planEndDate || 'Not Set'}</p>

                            <div className="plan-date-inputs">
                                <label htmlFor="planStartDate">Set/Update Start Date:</label>
                                <input
                                    type="date"
                                    id="planStartDate"
                                    value={planStartDate}
                                    onChange={(e) => setPlanStartDate(e.target.value)}
                                    disabled={loadingPlanActions}
                                />
                                <label htmlFor="planEndDate">Set/Update End Date:</label>
                                <input
                                    type="date"
                                    id="planEndDate"
                                    value={planEndDate}
                                    onChange={(e) => setPlanEndDate(e.target.value)}
                                    disabled={loadingPlanActions}
                                />
                                <button onClick={handleUpdatePlanDates} disabled={loadingPlanActions}>
                                    {loadingPlanActions ? 'Updating...' : 'Set/Update Dates'}
                                </button>
                            </div>

                            <div className="plan-action-buttons">
                                {planStatus === 'active' ? (
                                    <button onClick={handlePausePlan} disabled={loadingPlanActions}>
                                        {loadingPlanActions ? 'Pausing...' : 'Pause Plan'}
                                    </button>
                                ) : (
                                    <button onClick={handleResumePlan} disabled={loadingPlanActions}>
                                        {loadingPlanActions ? 'Resuming...' : 'Resume Plan'}
                                    </button>
                                )}
                                <button onClick={handleRenewPlan} disabled={loadingPlanActions}>
                                    {loadingPlanActions ? 'Renewing...' : 'Renew Plan'}
                                </button>
                            </div>
                            {planActionError && <p className="error-message">{planActionError}</p>}
                        </div>


                        {showProgress && (
                            <div className="progress-section">
                                <h3>Progress for:</h3>
                                <input type="date" value={selectedDate} onChange={handleDateChange} />

                                {loadingProgress && <p>Loading progress...</p>}
                                {errorProgress && <p className="error-message">{errorProgress}</p>}
                                {customerProgress && (
                                    <div className="progress-details">
                                        <h4>Meals:</h4>
                                        <ul>
                                            {customerProgress.meals &&
                                                Object.entries(customerProgress.meals).map(([mealIndex, completed]) => (
                                                    <li key={mealIndex}>
                                                        <input type="checkbox" checked={completed} readOnly /> Meal {parseInt(mealIndex) + 1}
                                                    </li>
                                                ))}
                                        </ul>
                                        <p><strong>Water Intake:</strong> {customerProgress.waterIntake || 'N/A'}</p>
                                        <p><strong>Sleep Hours:</strong> {customerProgress.sleepHours || 'N/A'}</p>
                                        <p><strong>Mood:</strong> {customerProgress.mood || 'N/A'}</p>
                                        <p><strong>Diet Score:</strong> {customerProgress.dietScore || 'N/A'}</p>
                                        {customerProgress.notes && <p><strong>Notes:</strong> {customerProgress.notes}</p>}
                                        {customerProgress.submittedAt && customerProgress.submittedAt.toDate ? (
                                            <p>
                                                <strong>Submitted At:</strong> {customerProgress.submittedAt.toDate().toLocaleString()}
                                            </p>
                                        ) : customerProgress.submittedAt ? (
                                            <p><strong>Submitted At:</strong> {customerProgress.submittedAt.toString()}</p>
                                        ) : null}
                                    </div>
                                )}
                                {!loadingProgress && !errorProgress && !customerProgress && (
                                    <p>No progress submitted for this customer on this date.</p>
                                )}
                            </div>
                        )}

                        <div className="customer-notes-section">
                            <h3>Notes for {selectedCustomer.email}</h3>
                            <textarea
                                value={customerNotes}
                                onChange={handleNotesChange}
                                placeholder="Add notes about this customer..."
                            />
                            <button onClick={saveCustomerNotes} disabled={loadingNotes}>
                                {loadingNotes ? 'Saving Notes...' : 'Save Notes'}
                            </button>
                            {errorNotes && <p className="error-message">{errorNotes}</p>}
                        </div>
                    </>
                ) : (
                    <p>Select a customer from the sidebar to view their details.</p>
                )}
            </main>
        </div>
    );
};

export default Customers;