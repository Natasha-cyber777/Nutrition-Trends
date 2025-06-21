import React, { useState, useEffect } from 'react';
import { db } from '../../firebase'; // Adjust path as needed
import { doc, getDoc } from 'firebase/firestore';
import '../../styles/PublicClientProfile.css'; // Create this CSS file
import { useParams } from 'react-router-dom'; // Import useParams

const PublicClientProfile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userId } = useParams(); // Get the userId from the URL parameters

  useEffect(() => {
    const fetchPublicProfile = async () => {
      setLoading(true);
      setError(null);

      if (!userId) {
        setError('No User ID provided.');
        setLoading(false);
        return;
      }

      const profileDocRef = doc(db, 'clientProfiles', userId);

      try {
        const docSnap = await getDoc(profileDocRef);
        if (docSnap.exists()) {
          setProfileData(docSnap.data());
        } else {
          setError(`Profile not found for ID: ${userId}`);
        }
      } catch (err) {
        console.error('Error fetching public client profile:', err);
        setError('Failed to load profile information.');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicProfile();
  }, [userId]);

  if (loading) {
    return <div className="public-profile-container">Loading profile...</div>;
  }

  if (error) {
    return <div className="public-profile-container">Error: {error}</div>;
  }

  if (!profileData) {
    return <div className="public-profile-container">No profile data available.</div>;
  }

  return (
    <div className="public-profile-container">
      <h2>Dietician Profile</h2>
      {profileData.profileImageUrl && (
        <div className="profile-image">
          <img src={profileData.profileImageUrl} alt="Profile" />
        </div>
      )}
      {profileData.name && <p><strong>Name:</strong> {profileData.name}</p>}
      {profileData.bio && <p><strong>Bio:</strong> {profileData.bio}</p>}
      {profileData.expertise && <p><strong>Expertise:</strong> {profileData.expertise}</p>}
      {profileData.contactNumber && <p><strong>Contact Number:</strong> {profileData.contactNumber}</p>}
      {profileData.lastUpdated && (
        <p>
          <strong>Last Updated:</strong> {profileData.lastUpdated.toDate().toLocaleString()}
        </p>
      )}
    </div>
  );
};

export default PublicClientProfile;