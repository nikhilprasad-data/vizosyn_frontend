"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import SpinnerLoader from "../../components/SpinnerLoader";
import styles from "./page.module.css";

export default function AllProfilesPage() {
  const [profiles, setProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [selectedUserName, setSelectedUserName] = useState("");
  const [userSkills, setUserSkills] = useState([]);
  const [isSkillsLoading, setIsSkillsLoading] = useState(false);

  const router = useRouter();

  const fetchProfiles = useCallback(async () => {
    setIsLoading(true);
    const token = localStorage.getItem("vizosyn_token");

    if (!token) {
      toast.error("Authentication required.");
      router.push("/signup");
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile/view-all-profile`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch profiles.");
      }

      const data = await response.json();
      setProfiles(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

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

  const handleViewSkills = async (targetUserId, targetUserName) => {
    setSelectedUserName(targetUserName);
    setIsSkillModalOpen(true);
    setIsSkillsLoading(true);
    setUserSkills([]);

    const token = localStorage.getItem("vizosyn_token");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user-skill/view-user-skill/${targetUserId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch skills.");
      }

      const data = await response.json();
      setUserSkills(data.skill_name || []);
    } catch (error) {
      toast.error(error.message);
      setUserSkills(["Error loading skills"]);
    } finally {
      setIsSkillsLoading(false);
    }
  };

  const closeModal = () => {
    setIsSkillModalOpen(false);
    setUserSkills([]);
    setSelectedUserName("");
  };

  if (isLoading) {
    return (
      <div className={styles.centerState}>
        <SpinnerLoader />
        <p className={styles.loadingText}>Loading Talent Network...</p>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      
      {isSkillModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalTitle}>{selectedUserName}'s Skills</h2>
                <p className={styles.modalSub}>Technical and professional capabilities</p>
              </div>
              <button onClick={closeModal} className={styles.closeBtn}>×</button>
            </div>
            
            <div className={styles.modalBody}>
              {isSkillsLoading ? (
                <div className={styles.loaderContainer}>
                  <div className={styles.rotatingLoader}></div>
                  <p className={styles.loaderText}>Fetching skills...</p>
                </div>
              ) : (
                <div className={styles.skillsWrapper}>
                  {userSkills.map((skill, index) => (
                    <span 
                      key={`${skill}-${index}`} 
                      className={skill === "No Skills Yet" ? styles.skillBadgeEmpty : styles.skillBadge}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.modalActions}>
              <button onClick={closeModal} className={styles.modalCancelBtn}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className={styles.navbar}>
        <h1 className={styles.navBrand}>Talent Directory</h1>
        <div className={styles.navActions}>
          <button onClick={() => router.push("/dashboard")} className={styles.backBtn}>
            ← Dashboard
          </button>
          <button
            onClick={handleLogoutButton}
            className={styles.logoutBtn}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </nav>

      <main className={styles.mainContent}>
        {profiles.length === 0 ? (
          <div className={styles.emptyStateCard}>
            <h2 className={styles.emptyTitle}>No profiles found</h2>
            <p className={styles.emptySub}>The talent network is currently empty.</p>
            <p className={styles.socText}>
              Be the first to join! <span onClick={() => router.push('/signup')} className={styles.signupLink}>Sign Up Here</span> and build your profile.
            </p>
          </div>
        ) : (
          <div className={styles.gridContainer}>
            {profiles.map((profile, index) => (
              <div key={`${profile.id}-${index}`} className={styles.profileCard}>
                <div className={styles.cardHeader}>
                  <div>
                    <h2 className={styles.fullName}>{profile.full_name}</h2>
                    <p className={styles.locationTxt}>📍 {profile.city}, {profile.state}</p>
                  </div>
                  {profile.is_active && (
                    <span className={styles.statusBadge}>Active</span>
                  )}
                </div>

                <div className={styles.bioSection}>
                  <p className={styles.bioText}>{profile.bio || "No bio provided."}</p>
                </div>

                <div className={styles.cardActionsGroup}>
                  <div className={styles.socialLinks}>
                    {profile.github_url ? (
                      <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className={styles.socialBtn}>
                        GitHub ↗
                      </a>
                    ) : (
                      <span className={styles.socialBtnDisabled}>GitHub N/A</span>
                    )}
                    {profile.linkedin_url ? (
                      <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className={styles.socialBtn}>
                        LinkedIn ↗
                      </a>
                    ) : (
                      <span className={styles.socialBtnDisabled}>LinkedIn N/A</span>
                    )}
                  </div>
                  <button 
                    onClick={() => handleViewSkills(profile.user_id, profile.full_name)} 
                    className={styles.viewSkillsBtn}
                  >
                    View Skills
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}