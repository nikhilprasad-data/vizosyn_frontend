"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import SpinnerLoader from "../../components/SpinnerLoader";
import styles from "./page.module.css";

export default function AllTeamsPage() {
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [requestingTeamId, setRequestingTeamId] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [customMessage, setCustomMessage] = useState("");
  
  const router = useRouter();

  useEffect(() => {
    const fetchTeams = async () => {
      const token = localStorage.getItem("vizosyn_token");

      if (!token) {
        toast.error("Authentication required.");
        router.push("/signup");
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/team/view-all-team`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Failed to fetch teams data.");
        }

        const data = await response.json();
        setTeams(data);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeams();
  }, [router]);

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

  const openRequestModal = (team) => {
    setSelectedTeam(team);
    setCustomMessage(`Hi Admin, I want to join ${team.name} and contribute!`);
    setIsModalOpen(true);
  };

  const closeRequestModal = () => {
    setIsModalOpen(false);
    setSelectedTeam(null);
    setCustomMessage("");
  };

  const handleSendRequest = async () => {
    if (!selectedTeam) return;
    
    setRequestingTeamId(selectedTeam.id);
    const token = localStorage.getItem("vizosyn_token");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/team-request/send-request`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          team_id: selectedTeam.id,
          team_name: selectedTeam.name,
          message: customMessage
        })
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error("Server communication failed.");
      }

      if (!response.ok) {
        throw new Error(data.detail || "Failed to send request.");
      }

      toast.success("Request sent successfully!");
      closeRequestModal();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setRequestingTeamId(null);
    }
  };

  if (isLoading) {
    return (
      <div className={`${styles.pageWrapper} ${styles.centerState}`}>
        <SpinnerLoader />
        <p className={styles.loadingText}>Hydrating Team Network...</p>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      
      {isModalOpen && selectedTeam && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>Join {selectedTeam.name}</h2>
            <p className={styles.modalSub}>Write a short message to the Admin (Max 100 characters).</p>
            
            <textarea 
              className={styles.modalTextarea}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              maxLength={100}
              placeholder="Tell them why you are a great fit..."
            />
            <div className={styles.charCount}>
              {customMessage.length}/100
            </div>

            <div className={styles.modalActions}>
              <button 
                onClick={closeRequestModal} 
                className={styles.modalCancelBtn}
                disabled={requestingTeamId === selectedTeam.id}
              >
                Cancel
              </button>
              <button 
                onClick={handleSendRequest} 
                className={styles.modalSendBtn}
                disabled={requestingTeamId === selectedTeam.id || customMessage.trim().length === 0}
              >
                {requestingTeamId === selectedTeam.id ? "Sending..." : "Send Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className={styles.navbar}>
        <h1 className={styles.navBrand}>Discovery Portal</h1>
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
        {teams.length === 0 ? (
          <div className={styles.emptyStateCard}>
            <h2 className={styles.emptyTitle}>No active teams found</h2>
            <p className={styles.emptySub}>The network is currently empty. Be the first to start a group.</p>
            <p className={styles.socText}>
              Want to lead? <span onClick={() => router.push('/signup')} className={styles.signupLink}>Sign up as a new Admin</span> and create one!
            </p>
          </div>
        ) : (
          <div className={styles.gridContainer}>
            {teams.map((team) => (
              <div key={team.id} className={styles.teamCard}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.teamName}>{team.name}</h2>
                  <span className={`${styles.statusBadge} ${team.status === 'Open' ? styles.statusOpen : styles.statusFull}`}>
                    {team.status}
                  </span>
                </div>

                <p className={styles.teamDescription}>
                  {team.description || "No description provided for this team."}
                </p>

                <div className={styles.teamMeta}>
                  <div className={styles.metaRow}>
                    <span className={styles.metaLabel}>Team Admin</span>
                    <span className={styles.metaValue}>@{team.admin_username}</span>
                  </div>
                  <div className={styles.metaRow}>
                    <span className={styles.metaLabel}>Members</span>
                    <span className={styles.metaValue}>{team.current_members_count} Joined</span>
                  </div>
                </div>

                <button
                  onClick={() => openRequestModal(team)}
                  className={styles.actionBtn}
                  disabled={team.status === 'Full'}
                >
                  {team.status === 'Full' ? "Team Full" : "Request to Join"}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}