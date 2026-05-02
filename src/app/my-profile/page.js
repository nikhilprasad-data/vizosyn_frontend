"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import SpinnerLoader from "../../components/SpinnerLoader";
import styles from "./page.module.css";

export default function MyProfilePage() {
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  
  const router = useRouter();

  const fetchMyProfile = useCallback(async () => {
    setIsLoading(true);
    const token = localStorage.getItem("vizosyn_token");

    if (!token) {
      toast.error("Authentication required.");
      router.push("/signup");
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile/view-my-profile`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 404) {
        setProfileData(null);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch profile.");
      }

      const data = await response.json();
      setProfileData(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchMyProfile();
  }, [fetchMyProfile]);

  const handleLogoutButton = async (e) => {
    e.preventDefault();
    setIsLoggingOut(true);
    const token = localStorage.getItem("vizosyn_token");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: "POST",
        mode: "cors",
        credentials: "omit",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
          "Accept": "application/json",
        }
      });

      const data = await response.json();

      if (data.status === "success" || data.detail) {
        localStorage.removeItem("vizosyn_token");
        toast.success("Logged out securely.");
        router.push('/');
      }
    } catch (error) {
      toast.error("Network error: " + error.message);
      setIsLoggingOut(false);
    }
  };

  const buildPayload = () => {
    const payload = {
      full_name: fullName.trim(),
      city: city.trim(),
      state: stateName.trim()
    };
    if (bio.trim()) payload.bio = bio.trim();
    if (githubUrl.trim()) payload.github_url = githubUrl.trim();
    if (linkedinUrl.trim()) payload.linkedin_url = linkedinUrl.trim();
    return payload;
  };

  const handleCreateProfile = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !city.trim() || !stateName.trim()) {
      toast.error("Full Name, City, and State are required.");
      return;
    }

    setIsProcessing(true);
    const token = localStorage.getItem("vizosyn_token");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile/create-profile`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildPayload())
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to create profile.");
      }

      toast.success("Profile created successfully!");
      setIsCreateModalOpen(false);
      fetchMyProfile();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    const token = localStorage.getItem("vizosyn_token");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile/update-my-profile`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildPayload())
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to update profile.");
      }

      toast.success("Profile updated successfully!");
      setIsEditModalOpen(false);
      fetchMyProfile();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteProfile = async () => {
    setIsProcessing(true);
    const token = localStorage.getItem("vizosyn_token");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile/delete-my-profile`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to delete profile.");
      }

      toast.success(data.message || "Profile deleted.");
      setIsDeleteModalOpen(false);
      setProfileData(null);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const openCreateModal = () => {
    setFullName("");
    setBio("");
    setGithubUrl("");
    setLinkedinUrl("");
    setCity("");
    setStateName("");
    setIsCreateModalOpen(true);
  };

  const openEditModal = () => {
    setFullName(profileData.full_name || "");
    setBio(profileData.bio || "");
    setGithubUrl(profileData.github_url || "");
    setLinkedinUrl(profileData.linkedin_url || "");
    setCity(profileData.city || "");
    setStateName(profileData.state || "");
    setIsEditModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className={styles.centerState}>
        <SpinnerLoader />
        <p className={styles.loadingText}>Loading Your Profile...</p>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      
      {isCreateModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>Create Profile</h2>
            <p className={styles.modalSub}>Set up your identity to join teams.</p>
            
            <form onSubmit={handleCreateProfile} className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Full Name *</label>
                <input type="text" className={styles.modalInput} value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>City *</label>
                <input type="text" className={styles.modalInput} value={city} onChange={(e) => setCity(e.target.value)} required />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>State *</label>
                <input type="text" className={styles.modalInput} value={stateName} onChange={(e) => setStateName(e.target.value)} required />
              </div>
              <div className={styles.inputGroupFull}>
                <label className={styles.inputLabel}>Bio (Max 500 chars)</label>
                <textarea className={styles.modalTextarea} value={bio} onChange={(e) => setBio(e.target.value)} maxLength={500} />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>GitHub URL</label>
                <input type="url" className={styles.modalInput} value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/..." />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>LinkedIn URL</label>
                <input type="url" className={styles.modalInput} value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/..." />
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className={styles.modalCancelBtn} disabled={isProcessing}>
                  Cancel
                </button>
                <button type="submit" className={styles.modalSendBtn} disabled={isProcessing || !fullName.trim() || !city.trim() || !stateName.trim()}>
                  {isProcessing ? "Creating..." : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>Edit Profile</h2>
            <p className={styles.modalSub}>Update your personal information.</p>
            
            <form onSubmit={handleUpdateProfile} className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Full Name</label>
                <input type="text" className={styles.modalInput} value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>City</label>
                <input type="text" className={styles.modalInput} value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>State</label>
                <input type="text" className={styles.modalInput} value={stateName} onChange={(e) => setStateName(e.target.value)} />
              </div>
              <div className={styles.inputGroupFull}>
                <label className={styles.inputLabel}>Bio</label>
                <textarea className={styles.modalTextarea} value={bio} onChange={(e) => setBio(e.target.value)} maxLength={500} />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>GitHub URL</label>
                <input type="url" className={styles.modalInput} value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>LinkedIn URL</label>
                <input type="url" className={styles.modalInput} value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} />
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={() => setIsEditModalOpen(false)} className={styles.modalCancelBtn} disabled={isProcessing}>
                  Cancel
                </button>
                <button type="submit" className={styles.modalUpdateBtn} disabled={isProcessing}>
                  {isProcessing ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContentSmall}>
            <h2 className={styles.modalTitleDanger}>Deactivate Profile?</h2>
            <p className={styles.modalSubDanger}>This will hide your profile from the directory. You can recreate it later.</p>
            
            <div className={styles.modalActions}>
              <button onClick={() => setIsDeleteModalOpen(false)} className={styles.modalCancelBtn} disabled={isProcessing}>
                Cancel
              </button>
              <button onClick={handleDeleteProfile} className={styles.modalDangerBtn} disabled={isProcessing}>
                {isProcessing ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className={styles.navbar}>
        <h1 className={styles.navBrand}>Personal Profile</h1>
        <div className={styles.navActions}>
          <button onClick={() => router.push("/dashboard")} className={styles.backBtn}>
            ← Dashboard
          </button>
          <button onClick={handleLogoutButton} className={styles.logoutBtn} disabled={isLoggingOut}>
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </nav>

      <main className={styles.mainContent}>
        {!profileData ? (
          <div className={styles.emptyStateCard}>
            <h2 className={styles.emptyTitle}>Profile Not Found</h2>
            <p className={styles.emptySub}>You haven't set up your identity on VizoSyn yet.</p>
            <div className={styles.emptyActionGroup}>
              <button onClick={openCreateModal} className={styles.primaryBtn}>
                Create Profile
              </button>
            </div>
            <p className={styles.socText}>
              Using a different account? <span onClick={() => router.push('/signup')} className={styles.signupLink}>Sign Up Here</span>
            </p>
          </div>
        ) : (
          <div className={styles.profileContainer}>
            <div className={styles.profileCard}>
              <div className={styles.cardHeader}>
                <div>
                  <h2 className={styles.profileName}>{profileData.full_name}</h2>
                  <p className={styles.locationTxt}>📍 {profileData.city}, {profileData.state}</p>
                </div>
                <span className={styles.statusBadge}>Active</span>
              </div>

              <div className={styles.bioSection}>
                <h3 className={styles.sectionTitle}>About</h3>
                <p className={styles.bioText}>{profileData.bio || "No biography provided."}</p>
              </div>

              <div className={styles.linksGrid}>
                <div className={styles.linkBox}>
                  <span className={styles.linkLabel}>GitHub</span>
                  {profileData.github_url ? (
                    <a href={profileData.github_url} target="_blank" rel="noopener noreferrer" className={styles.linkValueActive}>View GitHub ↗</a>
                  ) : (
                    <span className={styles.linkValueInactive}>Not Provided</span>
                  )}
                </div>
                <div className={styles.linkBox}>
                  <span className={styles.linkLabel}>LinkedIn</span>
                  {profileData.linkedin_url ? (
                    <a href={profileData.linkedin_url} target="_blank" rel="noopener noreferrer" className={styles.linkValueActive}>View LinkedIn ↗</a>
                  ) : (
                    <span className={styles.linkValueInactive}>Not Provided</span>
                  )}
                </div>
              </div>

              <div className={styles.adminZone}>
                <h3 className={styles.adminZoneTitle}>Profile Settings</h3>
                <div className={styles.adminActionGroup}>
                  <button onClick={openEditModal} className={styles.editBtn}>
                    Edit Profile
                  </button>
                  <button onClick={() => router.push('/my-skill')} className={styles.manageSkillsBtn}>
                    Manage Skills →
                  </button>
                  <button onClick={() => setIsDeleteModalOpen(true)} className={styles.deleteBtn}>
                    Deactivate
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}