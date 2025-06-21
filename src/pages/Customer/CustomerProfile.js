import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import '../../styles/CustomerProfile.css';

const CustomerProfile = ({ customerId }) => {
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [weight, setWeight] = useState('');
    const [weightUnit, setWeightUnit] = useState('kg');
    const [height, setHeight] = useState('');
    const [heightUnit, setHeightUnit] = useState('cm');
    const [activityLevel, setActivityLevel] = useState('');
    const [dietaryPreferences, setDietaryPreferences] = useState([]);
    const [dietaryRestrictions, setDietaryRestrictions] = useState('');
    const [fitnessGoals, setFitnessGoals] = useState('');
    const [medicalConditions, setMedicalConditions] = useState('');

    // New Fields
    const [medications, setMedications] = useState('');
    const [supplements, setSupplements] = useState('');
    const [pastMedicalHistory, setPastMedicalHistory] = useState('');
    const [familyMedicalHistory, setFamilyMedicalHistory] = useState('');
    const [stressLevels, setStressLevels] = useState(''); // 1 to 10 score
    const [wakeTime, setWakeTime] = useState('');
    const [sleepTime, setSleepTime] = useState('');
    const [qualityOfSleep, setQualityOfSleep] = useState(''); // sound, disturbed
    const [cravings, setCravings] = useState('');
    const [favoritesFood, setFavoritesFood] = useState(''); // renamed from favorites to favoritesFood to avoid conflict
    const [foodDislikes, setFoodDislikes] = useState('');
    const [waterIntake, setWaterIntake] = useState('');
    const [smoking, setSmoking] = useState('');
    const [tobacco, setTobacco] = useState('');
    const [alcohol, setAlcohol] = useState('');
    const [dietRecall, setDietRecall] = useState('');
    const [dayRecall, setDayRecall] = useState('');
    const [additionalInformation, setAdditionalInformation] = useState(''); // optional

    const [submissionMessage, setSubmissionMessage] = useState('');
    const [profileImage, setProfileImage] = useState(null); // This state isn't used in the provided code, consider removing if not needed.
    const [profileImageUrl, setProfileImageUrl] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);

    const currentUser = auth.currentUser;

    useEffect(() => {
        let isMounted = true;

        const fetchProfile = async () => {
            if (!isMounted) return;

            const uidToFetch = customerId || currentUser?.uid;

            if (uidToFetch) {
                setLoading(true);
                setError(null);
                const profileDocRef = doc(db, 'profiles', uidToFetch);
                try {
                    const docSnap = await getDoc(profileDocRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setProfileData(data);
                        setName(data.name || '');
                        setEmail(data.email || '');
                        setDateOfBirth(data.dateOfBirth || '');
                        setAge(data.age || '');
                        setGender(data.gender || '');
                        setWeight(data.weight || '');
                        setWeightUnit(data.weightUnit || 'kg');
                        setHeight(data.height || '');
                        setHeightUnit(data.heightUnit || 'cm');
                        setActivityLevel(data.activityLevel || '');
                        setDietaryPreferences(data.dietaryPreferences || []);
                        setDietaryRestrictions(data.dietaryRestrictions || '');
                        setFitnessGoals(data.fitnessGoals || '');
                        setMedicalConditions(data.medicalConditions || '');
                        setProfileImageUrl(data.profileImageUrl || '');
                        setLastUpdated(data.lastUpdated ? data.lastUpdated.toDate() : null);

                        // Load New Fields
                        setMedications(data.medications || '');
                        setSupplements(data.supplements || '');
                        setPastMedicalHistory(data.pastMedicalHistory || '');
                        setFamilyMedicalHistory(data.familyMedicalHistory || '');
                        setStressLevels(data.stressLevels || '');
                        setWakeTime(data.wakeTime || '');
                        setSleepTime(data.sleepTime || '');
                        setQualityOfSleep(data.qualityOfSleep || '');
                        setCravings(data.cravings || '');
                        setFavoritesFood(data.favoritesFood || '');
                        setFoodDislikes(data.foodDislikes || '');
                        setWaterIntake(data.waterIntake || '');
                        setSmoking(data.smoking || '');
                        setTobacco(data.tobacco || '');
                        setAlcohol(data.alcohol || '');
                        setDietRecall(data.dietRecall || '');
                        setDayRecall(data.dayRecall || '');
                        setAdditionalInformation(data.additionalInformation || '');

                        setIsEditing(false); // Ensure edit mode is off after successful load
                    } else {
                        setProfileData(null);
                        if (!customerId) {
                            setIsEditing(true); // If no profile data for current user, show edit form
                        }
                    }
                } catch (err) {
                    console.error('Error fetching profile:', err);
                    setError('Failed to load profile information.');
                } finally {
                    if (isMounted) {
                        setLoading(false);
                    }
                }
            } else {
                setLoading(false);
                setProfileData(null);
                if (!customerId) {
                    setIsEditing(true);
                }
            }
        };

        fetchProfile();

        return () => {
            isMounted = false;
        };
    }, [currentUser, customerId]);

    const handleEditClick = () => {
        setIsEditing(true);
        setSubmissionMessage('');
    };

    const handleCancelClick = () => {
        setIsEditing(false);
        setSubmissionMessage('');
        if (profileData) {
            setName(profileData.name || '');
            setDateOfBirth(profileData.dateOfBirth || '');
            setAge(profileData.age || '');
            setGender(profileData.gender || '');
            setWeight(profileData.weight || '');
            setWeightUnit(profileData.weightUnit || 'kg');
            setHeight(profileData.height || '');
            setHeightUnit(profileData.heightUnit || 'cm');
            setActivityLevel(profileData.activityLevel || '');
            setDietaryPreferences(profileData.dietaryPreferences || []);
            setDietaryRestrictions(profileData.dietaryRestrictions || '');
            setFitnessGoals(profileData.fitnessGoals || '');
            setMedicalConditions(profileData.medicalConditions || '');
            setProfileImageUrl(profileData.profileImageUrl || '');

            // Reset New Fields on Cancel
            setMedications(profileData.medications || '');
            setSupplements(profileData.supplements || '');
            setPastMedicalHistory(profileData.pastMedicalHistory || '');
            setFamilyMedicalHistory(profileData.familyMedicalHistory || '');
            setStressLevels(profileData.stressLevels || '');
            setWakeTime(profileData.wakeTime || '');
            setSleepTime(profileData.sleepTime || '');
            setQualityOfSleep(profileData.qualityOfSleep || '');
            setCravings(profileData.cravings || '');
            setFavoritesFood(profileData.favoritesFood || '');
            setFoodDislikes(profileData.foodDislikes || '');
            setWaterIntake(profileData.waterIntake || '');
            setSmoking(profileData.smoking || '');
            setTobacco(profileData.tobacco || '');
            setAlcohol(profileData.alcohol || '');
            setDietRecall(profileData.dietRecall || '');
            setDayRecall(profileData.dayRecall || '');
            setAdditionalInformation(profileData.additionalInformation || '');
        }
    };

    const handlePreferenceChange = (e) => {
        const value = e.target.value;
        if (e.target.checked) {
            setDietaryPreferences([...dietaryPreferences, value]);
        } else {
            setDietaryPreferences(dietaryPreferences.filter(pref => pref !== value));
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file && currentUser) {
            setUploadingImage(true);
            const storageRef = ref(storage, `profileImages/${currentUser.uid}/${file.name}`);
            try {
                await uploadBytes(storageRef, file);
                const downloadURL = await getDownloadURL(storageRef);
                setProfileImageUrl(downloadURL);
                setUploadingImage(false);
                setSubmissionMessage('Profile image uploaded!');
                setTimeout(() => setSubmissionMessage(''), 3000);
            } catch (error) {
                console.error('Error uploading image:', error);
                setSubmissionMessage('Failed to upload profile image.');
            } finally {
                setUploadingImage(false);
            }
        }
    };

    const calculateAge = (dob) => {
        if (!dob) return '';
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const handleDateOfBirthChange = (e) => {
        const dob = e.target.value;
        setDateOfBirth(dob);
        setAge(calculateAge(dob));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmissionMessage('');
        setLoading(true);

        if (currentUser) {
            const profileDocRef = doc(db, 'profiles', currentUser.uid);
            const profileDataToSave = {
                name,
                email: currentUser.email,
                dateOfBirth,
                age: parseInt(age),
                gender,
                weight: parseFloat(weight),
                weightUnit,
                height: parseFloat(height),
                heightUnit,
                activityLevel,
                dietaryPreferences,
                dietaryRestrictions,
                fitnessGoals,
                medicalConditions,
                profileImageUrl,
                userId: currentUser.uid,
                lastUpdated: new Date(),
                // Save New Fields
                medications,
                supplements,
                pastMedicalHistory,
                familyMedicalHistory,
                stressLevels: stressLevels ? parseInt(stressLevels) : '', // Ensure it's a number or empty string
                wakeTime,
                sleepTime,
                qualityOfSleep,
                cravings,
                favoritesFood,
                foodDislikes,
                waterIntake: waterIntake ? parseFloat(waterIntake) : '', // Ensure it's a number or empty string
                smoking,
                tobacco,
                alcohol,
                dietRecall,
                dayRecall,
                additionalInformation,
            };

            try {
                await setDoc(profileDocRef, profileDataToSave);
                setProfileData(profileDataToSave);
                setIsEditing(false);
                setSubmissionMessage('Profile updated successfully!');
                setLastUpdated(new Date());
            } catch (error) {
                console.error('Error updating profile:', error);
                setSubmissionMessage('Failed to update profile.');
            } finally {
                setLoading(false);
            }
        }
    };

    if (loading) {
        return <div className="profile-container">Loading profile...</div>;
    }

    if (error) {
        return <div className="profile-container">Error: {error}</div>;
    }

    return (
        <div className="profile-container">
            <h2>{customerId ? 'Customer Profile' : 'My Profile'}</h2>

            {profileData === null || isEditing ? (
                <form onSubmit={handleSubmit} className="profile-form">
                    <div className="form-group">
                        <label htmlFor="profileImage">Profile Picture:</label>
                        <input type="file" id="profileImage" accept="image/*" onChange={handleImageUpload} />
                        {uploadingImage && <p>Uploading image...</p>}
                        {profileImageUrl && !uploadingImage && (
                            <div className="profile-image">
                                <img src={profileImageUrl} alt="Current Profile" />
                            </div>
                        )}
                    </div>
                    <div className="form-group">
                        <label htmlFor="name">Name:</label>
                        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input type="email" id="email" value={email} readOnly />
                    </div>
                    <div className="form-group">
                        <label htmlFor="dateOfBirth">Date of Birth:</label>
                        <input type="date" id="dateOfBirth" value={dateOfBirth} onChange={handleDateOfBirthChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="age">Age:</label>
                        <input type="number" id="age" value={age} readOnly />
                    </div>
                    <div className="form-group">
                        <label htmlFor="gender">Gender:</label>
                        <select id="gender" value={gender} onChange={(e) => setGender(e.target.value)}>
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="weight">Weight:</label>
                        <div className="unit-input">
                            <input type="number" id="weight" value={weight} onChange={(e) => setWeight(e.target.value)} />
                            <select value={weightUnit} onChange={(e) => setWeightUnit(e.target.value)}>
                                <option value="kg">kg</option>
                                <option value="lbs">lbs</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="height">Height:</label>
                        <div className="unit-input">
                            <input type="number" id="height" value={height} onChange={(e) => setHeight(e.target.value)} />
                            <select value={heightUnit} onChange={(e) => setHeightUnit(e.target.value)}>
                                <option value="cm">cm</option>
                                <option value="inches">inches</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="activityLevel">Activity Level:</label>
                        <select id="activityLevel" value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)}>
                            <option value="">Select Activity Level</option>
                            <option value="sedentary">Sedentary (little or no exercise)</option>
                            <option value="lightlyActive">Lightly Active (light exercise/sports 1-3 days/week)</option>
                            <option value="moderatelyActive">Moderately Active (moderate exercise/sports 3-5 days/week)</option>
                            <option value="veryActive">Very Active (hard exercise/sports 6-7 days a week)</option>
                            <option value="extraActive">Extra Active (very hard daily exercise/sports & physical job or 2x training)</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Dietary Preferences:</label>
                        <div>
                            <label><input type="checkbox" value="vegetarian" checked={dietaryPreferences.includes('vegetarian')} onChange={handlePreferenceChange} /> Vegetarian</label>
                            <label><input type="checkbox" value="non-vegetarian" checked={dietaryPreferences.includes('non-vegetarian')} onChange={handlePreferenceChange} /> Non-Vegetarian</label>
                            <label><input type="checkbox" value="ovo-vegetarian" checked={dietaryPreferences.includes('ovo-vegetarian')} onChange={handlePreferenceChange} /> Ovo-Vegetarian</label>
                            {/* Add more preferences as needed */}
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="dietaryRestrictions">Dietary Restrictions (e.g., allergies, intolerance):</label>
                        <textarea id="dietaryRestrictions" value={dietaryRestrictions} onChange={(e) => setDietaryRestrictions(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="fitnessGoals">Fitness Goals:</label>
                        <textarea id="fitnessGoals" value={fitnessGoals} onChange={(e) => setFitnessGoals(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="medicalConditions">Medical Conditions (optional):</label>
                        <textarea id="medicalConditions" value={medicalConditions} onChange={(e) => setMedicalConditions(e.target.value)} />
                    </div>

                    {/* NEW FIELDS START HERE */}
                    <div className="form-group">
                        <label htmlFor="medications">Medications:</label>
                        <textarea id="medications" value={medications} onChange={(e) => setMedications(e.target.value)} placeholder="List any current medications" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="supplements">Supplements:</label>
                        <textarea id="supplements" value={supplements} onChange={(e) => setSupplements(e.target.value)} placeholder="List any supplements you take" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="pastMedicalHistory">Past Medical History:</label>
                        <textarea id="pastMedicalHistory" value={pastMedicalHistory} onChange={(e) => setPastMedicalHistory(e.target.value)} placeholder="Any significant past medical conditions, surgeries or any pain." />
                    </div>
                    <div className="form-group">
                        <label htmlFor="familyMedicalHistory">Family Medical History:</label>
                        <textarea id="familyMedicalHistory" value={familyMedicalHistory} onChange={(e) => setFamilyMedicalHistory(e.target.value)} placeholder="Relevant family medical conditions (e.g., diabetes, heart disease)" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="stressLevels">Stress Levels (1-10):</label>
                        <input type="number" id="stressLevels" value={stressLevels} onChange={(e) => setStressLevels(e.target.value)} min="1" max="10" placeholder="1 (low) to 10 (high)" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="wakeTime">Wake Time:</label>
                        <input type="time" id="wakeTime" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="sleepTime">Sleep Time:</label>
                        <input type="time" id="sleepTime" value={sleepTime} onChange={(e) => setSleepTime(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="qualityOfSleep">Quality of Sleep:</label>
                        <select id="qualityOfSleep" value={qualityOfSleep} onChange={(e) => setQualityOfSleep(e.target.value)}>
                            <option value="">Select Quality</option>
                            <option value="sound">Sound</option>
                            <option value="disturbed">Disturbed</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="favoritesFood">Favorite Foods:</label>
                        <textarea id="favoritesFood" value={favoritesFood} onChange={(e) => setFavoritesFood(e.target.value)} placeholder="List your favorite foods/Cravings." />
                    </div>
                    <div className="form-group">
                        <label htmlFor="foodDislikes">Food Dislikes:</label>
                        <textarea id="foodDislikes" value={foodDislikes} onChange={(e) => setFoodDislikes(e.target.value)} placeholder="List foods you dislike or avoid" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="waterIntake">Daily Water Intake (liters/glasses):</label>
                        <input type="number" step="0.1" id="waterIntake" value={waterIntake} onChange={(e) => setWaterIntake(e.target.value)} placeholder="e.g., 2.5 liters or 8 glasses" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="smoking">Smoking:</label>
                        <select id="smoking" value={smoking} onChange={(e) => setSmoking(e.target.value)}>
                            <option value="">Select</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                            <option value="quit">Quit</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="tobacco">Tobacco Use:</label>
                        <select id="tobacco" value={tobacco} onChange={(e) => setTobacco(e.target.value)}>
                            <option value="">Select</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                            <option value="quit">Quit</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="alcohol">Alcohol Consumption:</label>
                        <select id="alcohol" value={alcohol} onChange={(e) => setAlcohol(e.target.value)}>
                            <option value="">Select</option>
                            <option value="never">Never</option>
                            <option value="rarely">Rarely</option>
                            <option value="socially">Socially</option>
                            <option value="regularly">Regularly</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="dietRecall">Diet Recall (24-hour):</label>
                        <textarea id="dietRecall" value={dietRecall} onChange={(e) => setDietRecall(e.target.value)} placeholder="Describe your food intake over the last 24 hours" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="dayRecall">Day Recall (Typical Day):</label>
                        <textarea id="dayRecall" value={dayRecall} onChange={(e) => setDayRecall(e.target.value)} placeholder="Describe a typical day in your life (routines, activities)" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="additionalInformation">Additional Information (optional):</label>
                        <textarea id="additionalInformation" value={additionalInformation} onChange={(e) => setAdditionalInformation(e.target.value)} placeholder="Any other relevant information" />
                    </div>
                    {/* NEW FIELDS END HERE */}

                    <div className="form-actions">
                        <button type="submit">{profileData ? 'Save Changes' : 'Save Profile'}</button>
                        {isEditing && <button type="button" onClick={handleCancelClick}>Cancel</button>}
                    </div>
                    {submissionMessage && <p className={`submission-message ${submissionMessage.includes('success') ? 'success' : 'error'}`}>{submissionMessage}</p>}
                </form>
            ) : (
                <div className="profile-info">
                    {profileImageUrl && (
                        <div className="profile-image">
                            <img src={profileImageUrl} alt="Profile" />
                        </div>
                    )}
                    {profileData?.name && <p><strong>Name:</strong> {profileData.name}</p>}
                    {email && <p><strong>Email:</strong> {email}</p>}
                    {profileData?.dateOfBirth && <p><strong>Date of Birth:</strong> {new Date(profileData.dateOfBirth).toLocaleDateString()}</p>}
                    {profileData?.age && <p><strong>Age:</strong> {profileData.age}</p>}
                    {profileData?.gender && <p><strong>Gender:</strong> {profileData.gender}</p>}
                    {profileData?.weight && <p><strong>Weight:</strong> {profileData.weight} {profileData.weightUnit || 'kg'}</p>}
                    {profileData?.height && <p><strong>Height:</strong> {profileData.height} {profileData.heightUnit || 'cm'}</p>}
                    {profileData?.activityLevel && <p><strong>Activity Level:</strong> {profileData.activityLevel}</p>}
                    {profileData?.dietaryPreferences && profileData.dietaryPreferences.length > 0 && <p><strong>Dietary Preferences:</strong> {profileData.dietaryPreferences.join(', ')}</p>}
                    {profileData?.dietaryRestrictions && <p><strong>Dietary Restrictions:</strong> {profileData.dietaryRestrictions}</p>}
                    {profileData?.fitnessGoals && <p><strong>Fitness Goals:</strong> {profileData.fitnessGoals}</p>}
                    {profileData?.medicalConditions && <p><strong>Medical Conditions:</strong> {profileData.medicalConditions || 'None specified'}</p>}

                    {/* DISPLAY NEW FIELDS START HERE */}
                    {profileData?.medications && <p><strong>Medications:</strong> {profileData.medications}</p>}
                    {profileData?.supplements && <p><strong>Supplements:</strong> {profileData.supplements}</p>}
                    {profileData?.pastMedicalHistory && <p><strong>Past Medical History:</strong> {profileData.pastMedicalHistory}</p>}
                    {profileData?.familyMedicalHistory && <p><strong>Family Medical History:</strong> {profileData.familyMedicalHistory}</p>}
                    {profileData?.stressLevels && <p><strong>Stress Levels:</strong> {profileData.stressLevels}/10</p>}
                    {profileData?.wakeTime && <p><strong>Wake Time:</strong> {profileData.wakeTime}</p>}
                    {profileData?.sleepTime && <p><strong>Sleep Time:</strong> {profileData.sleepTime}</p>}
                    {profileData?.qualityOfSleep && <p><strong>Quality of Sleep:</strong> {profileData.qualityOfSleep}</p>}
                    {profileData?.cravings && <p><strong>Cravings:</strong> {profileData.cravings}</p>}
                    {profileData?.favoritesFood && <p><strong>Favorite Foods:</strong> {profileData.favoritesFood}</p>}
                    {profileData?.foodDislikes && <p><strong>Food Dislikes:</strong> {profileData.foodDislikes}</p>}
                    {profileData?.waterIntake && <p><strong>Water Intake:</strong> {profileData.waterIntake} {profileData.waterIntake > 1 ? 'liters' : 'liter'}</p>} {/* Added a simple unit display */}
                    {profileData?.smoking && <p><strong>Smoking:</strong> {profileData.smoking}</p>}
                    {profileData?.tobacco && <p><strong>Tobacco Use:</strong> {profileData.tobacco}</p>}
                    {profileData?.alcohol && <p><strong>Alcohol Consumption:</strong> {profileData.alcohol}</p>}
                    {profileData?.dietRecall && <p><strong>24-Hour Diet Recall:</strong> {profileData.dietRecall}</p>}
                    {profileData?.dayRecall && <p><strong>Typical Day Recall:</strong> {profileData.dayRecall}</p>}
                    {profileData?.additionalInformation && <p><strong>Additional Information:</strong> {profileData.additionalInformation}</p>}
                    {/* DISPLAY NEW FIELDS END HERE */}

                    {lastUpdated && <p><strong>Last Updated:</strong> {lastUpdated.toLocaleString()}</p>}
                    {!customerId && <button type="button" onClick={handleEditClick}>Edit Profile</button>}
                </div>
            )}
        </div>
    );
};

export default CustomerProfile;