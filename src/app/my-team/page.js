"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import SpinnerLoader from "../../components/SpinnerLoader";
import styles from "./page.module.css";

export default function MyTeamPage() {
  const [teamData, setTeamData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [teamNameInput, setTeamNameInput] = useState("");
  const [teamDescInput, setTeamDescInput] = useState("");
  
  const [currentUserId, setCurrentUserId] = useState(null);
  
  const router = useRouter();

  const fetchMyTeam = useCallback(async () => {
    setIsLoading(true);
    const token = localStorage.getItem("vizosyn_token");

    if (!token) {
      toast.error("Authentication required.");
      router.push("/signup");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setCurrentUserId(decoded.id);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/team/view-my-team`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 404) {
        setTeamData(null);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch team data.");
      }

      const data = await response.json();
      setTeamData(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchMyTeam();
  }, [fetchMyTeam]);

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

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!teamNameInput.trim()) {
      toast.error("Team name is required.");
      return;
    }

    setIsProcessing(true);
    const token = localStorage.getItem("vizosyn_token");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/team/create-team`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: teamNameInput,
          description: teamDescInput || null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to create team.");
      }

      toast.success("Team created successfully!");
      setIsCreateModalOpen(false);
      setTeamNameInput("");
      setTeamDescInput("");
      fetchMyTeam();
      
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateTeam = async (e) => {
    e.preventDefault();
    if (!teamNameInput.trim()) {
      toast.error("Team name cannot be empty.");
      return;
    }

    setIsProcessing(true);
    const token = localStorage.getItem("vizosyn_token");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/team/update-my-team`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: teamNameInput,
          description: teamDescInput || null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to update team.");
      }

      toast.success(data.message || "Team updated successfully!");
      setIsEditModalOpen(false);
      fetchMyTeam();
      
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteTeam = async () => {
    setIsProcessing(true);
    const token = localStorage.getItem("vizosyn_token");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/team/delete-my-team`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to delete team.");
      }

      toast.success(data.message || "Team deleted securely.");
      setIsDeleteModalOpen(false);
      setTeamData(null);
      
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const openEditModal = () => {
    setTeamNameInput(teamData.name);
    setTeamDescInput(teamData.description || "");
    setIsEditModalOpen(true);
  };

  const isAdmin = teamData && currentUserId === teamData.admin_id;

  if (isLoading) {
    return (
      <div className={styles.centerState}>
        <SpinnerLoader />
        <p className={styles.loadingText}>Loading Your Workspace...</p>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      
      {isCreateModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>Create New Team</h2>
            <p className={styles.modalSub}>Establish your group and invite top talent.</p>
            
            <form onSubmit={handleCreateTeam}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Team Name *</label>
                <input 
                  type="text"
                  className={styles.modalInput}
                  value={teamNameInput}
                  onChange={(e) => setTeamNameInput(e.target.value)}
                  maxLength={100}
                  placeholder="e.g. Backend Ninjas"
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Description</label>
                <textarea 
                  className={styles.modalTextarea}
                  value={teamDescInput}
                  onChange={(e) => setTeamDescInput(e.target.value)}
                  maxLength={500}
                  placeholder="What is your team's mission?"
                />
              </div>

              <div className={styles.modalActions}>
                <button 
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)} 
                  className={styles.modalCancelBtn}
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className={styles.modalSendBtn}
                  disabled={isProcessing || !teamNameInput.trim()}
                >
                  {isProcessing ? "Creating..." : "Launch Team"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>Update Team Details</h2>
            <p className={styles.modalSub}>Modify your team's identity.</p>
            
            <form onSubmit={handleUpdateTeam}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Team Name *</label>
                <input 
                  type="text"
                  className={styles.modalInput}
                  value={teamNameInput}
                  onChange={(e) => setTeamNameInput(e.target.value)}
                  maxLength={100}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Description</label>
                <textarea 
                  className={styles.modalTextarea}
                  value={teamDescInput}
                  onChange={(e) => setTeamDescInput(e.target.value)}
                  maxLength={500}
                />
              </div>

              <div className={styles.modalActions}>
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)} 
                  className={styles.modalCancelBtn}
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className={styles.modalUpdateBtn}
                  disabled={isProcessing || !teamNameInput.trim()}
                >
                  {isProcessing ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitleDanger}>Delete Team?</h2>
            <p className={styles.modalSubDanger}>This action cannot be undone. All members will be removed and the team will be permanently deactivated.</p>
            
            <div className={styles.modalActions}>
              <button 
                onClick={() => setIsDeleteModalOpen(false)} 
                className={styles.modalCancelBtn}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteTeam} 
                className={styles.modalDangerBtn}
                disabled={isProcessing}
              >
                {isProcessing ? "Deleting..." : "Yes, Delete Team"}
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className={styles.navbar}>
        <h1 className={styles.navBrand}>My Workspace</h1>
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
        {!teamData ? (
          <div className={styles.emptyStateCard}>
            <h2 className={styles.emptyTitle}>You are a Solo Player</h2>
            <p className={styles.emptySub}>You are currently not part of any team. Join an existing one or build your own empire.</p>
            <div className={styles.emptyActionGroup}>
              <button onClick={() => router.push("/all-team")} className={styles.secondaryBtn}>
                Browse Active Teams
              </button>
              <button onClick={() => {
                setTeamNameInput("");
                setTeamDescInput("");
                setIsCreateModalOpen(true);
              }} className={styles.primaryBtn}>
                Create New Team
              </button>
            </div>
            <p className={styles.socText}>
              Need to switch accounts? <span onClick={() => router.push('/signup')} className={styles.signupLink}>Sign Up Here</span>
            </p>
          </div>
        ) : (
          <div className={styles.teamDetailsContainer}>
            <div className={styles.teamCard}>
              <div className={styles.cardHeader}>
                <div>
                  <h2 className={styles.teamName}>{teamData.name}</h2>
                  {isAdmin && <span className={styles.adminBadge}>Admin Access</span>}
                </div>
                <span className={`${styles.statusBadge} ${teamData.status === 'Open' ? styles.statusOpen : styles.statusFull}`}>
                  {teamData.status}
                </span>
              </div>

              <div className={styles.bioSection}>
                <p className={styles.bioText}>{teamData.description || "No description provided for your team."}</p>
              </div>

              <div className={styles.statsGrid}>
                <div className={styles.statBox}>
                  <span className={styles.statLabel}>Team Admin</span>
                  <span className={styles.statValue}>@{teamData.admin_username}</span>
                </div>
                <div className={styles.statBox}>
                  <span className={styles.statLabel}>Current Members</span>
                  <span className={styles.statValue}>{teamData.current_members_count} Joined</span>
                </div>
                <div className={styles.statBox}>
                  <span className={styles.statLabel}>Team ID</span>
                  <span className={styles.statValue}>#{teamData.id}</span>
                </div>
              </div>

              <div className={styles.actionGroup}>
                <button onClick={() => router.push(`/team-member?teamId=${teamData.id}`)} className={styles.primaryBtn} style={{ backgroundColor: "#0f172a" }}>
                  View Team Members
                </button>
                <button onClick={() => router.push("/all-profile")} className={styles.primaryBtn}>
                  Find More Members
                </button>
                <button onClick={() => router.push("/team-request")} className={styles.secondaryBtn}>
                  View Requests
                </button>
              </div>

              {isAdmin && (
                <div className={styles.adminZone}>
                  <h3 className={styles.adminZoneTitle}>Admin Controls</h3>
                  <div className={styles.adminActionGroup}>
                    <button onClick={openEditModal} className={styles.editBtn}>
                      Edit Team Info
                    </button>
                    <button onClick={() => setIsDeleteModalOpen(true)} className={styles.deleteBtn}>
                      Delete Team
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}