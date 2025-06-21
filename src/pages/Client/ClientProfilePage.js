// src/pages/Client/ClientProfilePage.js
import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../../firebase'; // Adjust path as needed
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import '../../styles/ClientProfilePage.css'; // Create this CSS file

const ClientProfilePage = () => {
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState(''); // Read-only
    const [bio, setBio] = useState('');
    const [expertise, setExpertise] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [profileImageUrl, setProfileImageUrl] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);
    const [submissionMessage, setSubmissionMessage] = useState('');
    const [lastUpdated, setLastUpdated] = useState(null);

    // Get UID directly from auth.currentUser and use it as a stable dependency
    const currentUserId = auth.currentUser?.uid; // Use optional chaining to safely get uid

    useEffect(() => {
        let isMounted = true;

        const fetchProfile = async () => {
            // Check for currentUserId instead of currentUser object
            if (!isMounted || !currentUserId) {
                setLoading(false);
                setError('User not authenticated or UID not available.'); // More specific error
                return;
            }

            setLoading(true);
            setError(null);
            setEmail(auth.currentUser.email); // Access email directly from current user
            const profileDocRef = doc(db, 'clientProfiles', currentUserId); // Use currentUserId

            try {
                const docSnap = await getDoc(profileDocRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setProfileData(data);
                    setName(data.name || '');
                    setBio(data.bio || '');
                    setExpertise(data.expertise || '');
                    setContactNumber(data.contactNumber || '');
                    setProfileImageUrl(data.profileImageUrl || '');
                    setLastUpdated(data.lastUpdated ? data.lastUpdated.toDate() : null);
                } else {
                    setProfileData(null);
                    // Optionally set initial values for editing if profile doesn't exist
                    setName('');
                    setBio('');
                    setExpertise('');
                    setContactNumber('');
                    setProfileImageUrl('');
                    setLastUpdated(null);
                    // Automatically switch to editing mode if no profile exists
                    setIsEditing(true);
                    setSubmissionMessage('Please complete your profile.');
                }
            } catch (err) {
                console.error('Error fetching client profile:', err);
                setError('Failed to load profile information.');
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchProfile();

        return () => {
            isMounted = false;
        };
    }, [currentUserId]); // <-- Change dependency to currentUserId

    // --- Start of Handler Functions (These were missing or out of scope) ---
    const handleEditClick = () => {
        setIsEditing(true);
        setSubmissionMessage('');
    };

    const handleCancelClick = () => {
        setIsEditing(false);
        setSubmissionMessage('');
        if (profileData) {
            setName(profileData.name || '');
            setBio(profileData.bio || '');
            setExpertise(profileData.expertise || '');
            setContactNumber(profileData.contactNumber || '');
            setProfileImageUrl(profileData.profileImageUrl || '');
        }
    };
    // --- End of Handler Functions ---

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setUploadingImage(true);

            const storageRef = ref(storage, `profileImages/${currentUserId}/${file.name}`);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmissionMessage('');
        setLoading(true);

        if (currentUserId) {
            const profileDocRef = doc(db, 'clientProfiles', currentUserId);
            const profileDataToSave = {
                name,
                email: auth.currentUser.email,
                bio,
                expertise,
                contactNumber,
                profileImageUrl,
                userId: currentUserId,
                lastUpdated: new Date(),
            };

            try {
                await setDoc(profileDocRef, profileDataToSave);
                setProfileData(profileDataToSave);
                setIsEditing(false);
                setSubmissionMessage('Profile updated successfully!');
                setLastUpdated(new Date());
            } catch (error) {
                console.error('Error updating client profile:', error);
                setSubmissionMessage('Failed to update profile.');
            } finally {
                setLoading(false);
            }
        } else {
            setSubmissionMessage('Error: User not authenticated.');
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="client-profile-container">Loading profile...</div>;
    }

    if (error) {
        return <div className="client-profile-container">Error: {error}</div>;
    }

    return (
        <div className="client-profile-container">
            <h2>My Profile</h2>

            {profileData === null || isEditing ? (
                <form onSubmit={handleSubmit} className="client-profile-form">
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
                        <label htmlFor="bio">Bio:</label>
                        <textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="expertise">Expertise:</label>
                        <input type="text" id="expertise" value={expertise} onChange={(e) => setExpertise(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="contactNumber">Contact Number:</label>
                        <input type="tel" id="contactNumber" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} />
                    </div>

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
                    {profileData?.bio && <p><strong>Bio:</strong> {profileData.bio}</p>}
                    {profileData?.expertise && <p><strong>Expertise:</strong> {profileData.expertise}</p>}
                    {profileData?.contactNumber && <p><strong>Contact Number:</strong> {profileData.contactNumber}</p>}
                    {lastUpdated && <p><strong>Last Updated:</strong> {lastUpdated.toLocaleString()}</p>}
                    <button type="button" onClick={handleEditClick}>Edit Profile</button>
                </div>
            )}
        </div>
    );
};

export default ClientProfilePage;