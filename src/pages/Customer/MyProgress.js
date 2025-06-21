import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import '../../styles/MyProgress.css';

const MyProgress = () => {
  const [dietPlan, setDietPlan] = useState(null);
  const [loadingDiet, setLoadingDiet] = useState(true);
  const [errorDiet, setErrorDiet] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [mealsProgress, setMealsProgress] = useState({});
  const [waterIntake, setWaterIntake] = useState('');
  const [sleepHours, setSleepHours] = useState('');
  const [mood, setMood] = useState('');
  const [dietScore, setDietScore] = useState('');
  const [notes, setNotes] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [submittedProgress, setSubmittedProgress] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchDietPlan = async () => {
      if (currentUser) {
        setLoadingDiet(true);
        setErrorDiet(null);
        try {
          const dietPlansCollectionRef = collection(db, 'users', currentUser.uid, 'dietPlans');
          const q = query(dietPlansCollectionRef, orderBy('uploadedAt', 'desc'), limit(1));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const latestPlanDoc = querySnapshot.docs[0];
            setDietPlan(latestPlanDoc.data());
          } else {
            setDietPlan(null);
          }
        } catch (err) {
          console.error('Error fetching diet plan:', err);
          setErrorDiet('Failed to fetch diet plan.');
        } finally {
          setLoadingDiet(false);
        }
      }
    };

    fetchDietPlan();
  }, [currentUser]);

  useEffect(() => {
    const fetchProgressForDate = async () => {
      if (currentUser && selectedDate) {
        try {
          const progressDocRef = doc(db, 'progress', currentUser.uid, 'dailyProgress', selectedDate);
          const docSnap = await getDoc(progressDocRef);
          if (docSnap.exists()) {
            setSubmittedProgress(docSnap.data());
            setMealsProgress(docSnap.data().meals || {});
            setWaterIntake(docSnap.data().waterIntake || '');
            setSleepHours(docSnap.data().sleepHours || '');
            setMood(docSnap.data().mood || '');
            setDietScore(docSnap.data().dietScore || '');
            setNotes(docSnap.data().notes || '');
            setSubmissionStatus('view'); // Indicate viewing submitted data
          } else {
            setSubmittedProgress(null);
            setMealsProgress({});
            setWaterIntake('');
            setSleepHours('');
            setMood('');
            setDietScore('');
            setNotes('');
            setSubmissionStatus('edit'); // Indicate ready to edit/submit
          }
        } catch (error) {
          console.error('Error fetching progress for date:', error);
          setSubmissionStatus('error');
        }
      }
    };

    fetchProgressForDate();
  }, [currentUser, selectedDate]);

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const handleMealCheck = (mealIndex) => {
    if (submissionStatus === 'edit') {
      setMealsProgress((prevProgress) => ({
        ...prevProgress,
        [mealIndex]: !prevProgress[mealIndex],
      }));
    }
  };

  const calculateProgress = () => {
    if (!dietPlan?.weeklyDietPlan) return 0;
    const selectedDayPlan = dietPlan.weeklyDietPlan.find((day) => {
      const dayDate = day.date ? new Date(day.date).toISOString().split('T')[0] : null;
      return dayDate === selectedDate;
    });

    if (!selectedDayPlan || !selectedDayPlan.meals) return 0;

    const totalMeals = selectedDayPlan.meals.length;
    const checkedMeals = Object.values(mealsProgress).filter((checked) => checked).length;
    return totalMeals > 0 ? (checkedMeals / totalMeals) * 100 : 0;
  };

  const handleSubmitProgress = async (event) => {
    event.preventDefault();
    if (currentUser && selectedDate && submissionStatus === 'edit') {
      setSubmissionStatus('submitting');
      try {
        const progressData = {
          date: selectedDate,
          meals: mealsProgress,
          waterIntake,
          sleepHours,
          mood,
          dietScore,
          notes,
          submittedAt: new Date(),
        };
        const progressDocRef = doc(db, 'progress', currentUser.uid, 'dailyProgress', selectedDate);
        await setDoc(progressDocRef, progressData);
        setSubmittedProgress(progressData);
        setSubmissionStatus('view');
      } catch (error) {
        console.error('Error submitting progress:', error);
        setSubmissionStatus('error');
      }
    }
  };

  if (loadingDiet) {
    return <div className="my-progress-container">Loading diet plan...</div>;
  }

  if (errorDiet) {
    return <div className="my-progress-container">Error: {errorDiet}</div>;
  }

  if (!dietPlan?.weeklyDietPlan) {
    return <div className="my-progress-container">No diet plan available.</div>;
  }

  const selectedDayPlan = dietPlan.weeklyDietPlan.find((day) => {
    const dayDate = day.date ? new Date(day.date).toISOString().split('T')[0] : null;
    return dayDate === selectedDate;
  });

  if (!selectedDayPlan || !selectedDayPlan.meals) {
    return (
      <div className="my-progress-container">
        <h2>My Progress</h2>
        <label htmlFor="date">Select Date:</label>
        <input type="date" id="date" value={selectedDate} onChange={handleDateChange} />
        <p>No diet plan found for the selected date.</p>
      </div>
    );
  }

  const progressPercentage = calculateProgress();

  return (
    <div className="my-progress-container">
      <h2>My Progress</h2>
      <label htmlFor="date">Select Date:</label>
      <input type="date" id="date" value={selectedDate} onChange={handleDateChange} />

      {submissionStatus === 'view' && submittedProgress ? (
        <div className="progress-summary">
          <h3>Progress for {new Date(selectedDate).toLocaleDateString()}</h3>
          <div className="meals-summary">
            <h4>Meals:</h4>
            <ul>
              {selectedDayPlan.meals.map((meal, index) => (
                <li key={index}>
                  <input type="checkbox" checked={submittedProgress.meals[index] || false} readOnly />
                  {meal || 'N/A'}
                </li>
              ))}
            </ul>
          </div>
          <p><strong>Water Intake:</strong> {submittedProgress.waterIntake}</p>
          <p><strong>Sleep Hours:</strong> {submittedProgress.sleepHours}</p>
          <p><strong>Mood:</strong> {submittedProgress.mood}</p>
          <p><strong>Diet Score:</strong> {submittedProgress.dietScore}</p>
          {submittedProgress.notes && <p><strong>Notes:</strong> {submittedProgress.notes}</p>}
          {submittedProgress.submittedAt && submittedProgress.submittedAt.toDate ? (
            <p><strong>Submitted At:</strong> {submittedProgress.submittedAt.toDate().toLocaleString()}</p>
          ) : submittedProgress.submittedAt ? (
            <p><strong>Submitted At:</strong> {submittedProgress.submittedAt.toString()}</p>
          ) : null}
          <button onClick={() => setSubmissionStatus('edit')}>Edit Progress</button>
        </div>
      ) : (
        <form onSubmit={handleSubmitProgress} className="progress-form">
          <h3>Track Your Progress for {new Date(selectedDate).toLocaleDateString()}</h3>
          <div className="meals-checklist">
            <h4>Meals:</h4>
            <ul>
              {selectedDayPlan.meals.map((meal, index) => (
                <li key={index}>
                  <input
                    type="checkbox"
                    checked={mealsProgress[index] || false}
                    onChange={() => handleMealCheck(index)}
                  />
                  {meal || 'N/A'}
                </li>
              ))}
            </ul>
          </div>

          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progressPercentage}%` }}>
              {progressPercentage.toFixed(0)}%
            </div>
          </div>

          {progressPercentage === 100 && (
            <p className="cheerful-message">🎉 Great job! You've completed all your meals for today!</p>
          )}

          <div className="additional-info">
            <h4>Additional Information</h4>
            <div className="form-group">
              <label htmlFor="waterIntake">Water Intake (e.g., 8 glasses):</label>
              <input
                type="text"
                id="waterIntake"
                value={waterIntake}
                onChange={(e) => setWaterIntake(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="sleepHours">Sleep Hours:</label>
              <input
                type="number"
                id="sleepHours"
                value={sleepHours}
                onChange={(e) => setSleepHours(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="mood">Mood:</label>
              <input type="text" id="mood" value={mood} onChange={(e) => setMood(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="dietScore">Diet Score (e.g., 1-5):</label>
              <input
                type="number"
                id="dietScore"
                min="1"
                max="5"
                value={dietScore}
                onChange={(e) => setDietScore(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="notes">Additional Notes for Dietician:</label>
              <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>

          {submissionStatus === 'submitting' ? (
            <p>Submitting progress...</p>
          ) : (
            <button type="submit" disabled={submissionStatus === 'view'}>
              Submit Progress
            </button>
          )}
          {submissionStatus === 'error' && <p className="error-message">Failed to submit progress.</p>}
        </form>
      )}
    </div>
  );
};

export default MyProgress;