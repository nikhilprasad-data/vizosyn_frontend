"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import styles from "./page.module.css";

export default function MySkillsPage() {
  const [skillData, setSkillData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [skillInput, setSkillInput] = useState("");
  const [skillToDelete, setSkillToDelete] = useState("");
  
  const router = useRouter();

  const fetchMySkills = useCallback(async () => {
    setIsLoading(true);
    const token = localStorage.getItem("vizosyn_token");

    if (!token) {
      toast.error("Authentication required.");
      router.push("/signup");
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/skill/view-my-skills`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 404) {
        setSkillData(null);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch skills.");
      }

      const data = await response.json();
      setSkillData(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchMySkills();
  }, [fetchMySkills]);

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

  const handleAddSkills = async (e) => {
    e.preventDefault();
    
    const skillsArray = skillInput
      .split(',')
      .map(s => s.trim())
      .filter(s => s !== "");

    if (skillsArray.length === 0) {
      toast.error("Please enter at least one valid skill.");
      return;
    }

    setIsProcessing(true);
    const token = localStorage.getItem("vizosyn_token");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/skill/add-skills`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(skillsArray)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to add skills.");
      }

      toast.success(data.message || "Skills added successfully!");
      setIsAddModalOpen(false);
      setSkillInput("");
      fetchMySkills();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteSkill = async () => {
    setIsProcessing(true);
    const token = localStorage.getItem("vizosyn_token");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/skill/remove-skills`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skill_name: [skillToDelete]
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to remove skill.");
      }

      toast.success(data.message || "Skill removed.");
      setIsDeleteModalOpen(false);
      setSkillToDelete("");
      fetchMySkills();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmDelete = (skill) => {
    setSkillToDelete(skill);
    setIsDeleteModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className={styles.centerState}>
        <div className={styles.rotatingLoader}></div>
        <p className={styles.loadingText}>Loading Your Arsenal...</p>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      
      {isAddModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>Add New Skills</h2>
            <p className={styles.modalSub}>Enter your technical or soft skills separated by commas.</p>
            
            <form onSubmit={handleAddSkills}>
              <div className={styles.inputGroupFull}>
                <label className={styles.inputLabel}>Skills (Comma Separated)</label>
                <input 
                  type="text" 
                  className={styles.modalInput} 
                  value={skillInput} 
                  onChange={(e) => setSkillInput(e.target.value)} 
                  placeholder="e.g. Python, FastAPI, React, PostgreSQL"
                  required 
                />
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className={styles.modalCancelBtn} disabled={isProcessing}>
                  Cancel
                </button>
                <button type="submit" className={styles.modalSendBtn} disabled={isProcessing || !skillInput.trim()}>
                  {isProcessing ? "Adding..." : "Save Skills"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContentSmall}>
            <h2 className={styles.modalTitleDanger}>Remove Skill?</h2>
            <p className={styles.modalSubDanger}>Are you sure you want to remove <span className={styles.highlightText}>{skillToDelete}</span> from your profile?</p>
            
            <div className={styles.modalActions}>
              <button onClick={() => setIsDeleteModalOpen(false)} className={styles.modalCancelBtn} disabled={isProcessing}>
                Cancel
              </button>
              <button onClick={handleDeleteSkill} className={styles.modalDangerBtn} disabled={isProcessing}>
                {isProcessing ? "Removing..." : "Yes, Remove"}
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className={styles.navbar}>
        <h1 className={styles.navBrand}>Skill Management</h1>
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
        {!skillData || !skillData.skill_name || skillData.skill_name.length === 0 ? (
          <div className={styles.emptyStateCard}>
            <h2 className={styles.emptyTitle}>No Skills Found</h2>
            <p className={styles.emptySub}>You haven't added any professional skills to your profile yet.</p>
            <div className={styles.emptyActionGroup}>
              <button onClick={() => setIsAddModalOpen(true)} className={styles.primaryBtn}>
                Add Your First Skill
              </button>
            </div>
            <p className={styles.socText}>
              Need to switch accounts? <span onClick={() => router.push('/signup')} className={styles.signupLink}>Sign Up Here</span>
            </p>
          </div>
        ) : (
          <div className={styles.profileContainer}>
            <div className={styles.profileCard}>
              <div className={styles.cardHeader}>
                <div>
                  <h2 className={styles.profileName}>{skillData.user_name}</h2>
                  <p className={styles.locationTxt}>Team: {skillData.team_name}</p>
                </div>
                <button onClick={() => setIsAddModalOpen(true)} className={styles.addBtnSmall}>
                  + Add Skills
                </button>
              </div>

              <div className={styles.bioSection}>
                <h3 className={styles.sectionTitle}>Your Verified Skills</h3>
                <div className={styles.skillsWrapper}>
                  {skillData.skill_name.map((skill, index) => (
                    <div key={`${skill}-${index}`} className={styles.skillBadge}>
                      <span className={styles.skillText}>{skill}</span>
                      <button 
                        onClick={() => confirmDelete(skill)} 
                        className={styles.skillDeleteBtn}
                        aria-label={`Remove ${skill}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}