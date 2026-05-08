"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import styles from "./page.module.css";

function TeamMembersContent() {
  const [membersData, setMembersData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [memberToRemove, setMemberToRemove] = useState(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const teamId = searchParams.get("teamId");

  const fetchMembers = useCallback(async () => {
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
    } catch (error) {
      toast.error("Invalid token.");
      router.push("/signup");
      return;
    }

    if (!teamId) {
      toast.error("Team ID is missing.");
      router.push("/my-team");
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/team/view-my-team-members/${teamId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch team members.");
      }

      const data = await response.json();
      setMembersData(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [router, teamId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

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

  const confirmRemoveMember = async () => {
    if (!memberToRemove) return;
    
    setIsProcessing(true);
    const token = localStorage.getItem("vizosyn_token");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/team/delete-team-member/${memberToRemove}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Unable to remove member.");
      }

      toast.success("Team member successfully removed from the workspace.");
      setMemberToRemove(null);
      fetchMembers();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.centerState}>
        <div className={styles.professionalLoader}></div>
        <p className={styles.loadingText}>Fetching Team Roster...</p>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      {memberToRemove && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitleDanger}>Remove Member?</h2>
            <p className={styles.modalSubDanger}>This action will immediately revoke their access to the team workspace.</p>
            
            <div className={styles.modalActions}>
              <button 
                onClick={() => setMemberToRemove(null)} 
                className={styles.modalCancelBtn}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button 
                onClick={confirmRemoveMember} 
                className={styles.modalDangerBtn}
                disabled={isProcessing}
              >
                {isProcessing ? "Removing..." : "Yes, Remove"}
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className={styles.navbar}>
        <h1 className={styles.navBrand}>Team Roster</h1>
        <div className={styles.navActions}>
          <button onClick={() => router.push("/my-team")} className={styles.backBtn}>
            ← Back to Workspace
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
        {membersData.length === 0 ? (
          <div className={styles.emptyStateCard}>
            <h2 className={styles.emptyTitle}>No Members Found</h2>
            <p className={styles.emptySub}>This team currently has no active members associated with it.</p>
            <button onClick={() => router.push("/all-profile")} className={styles.primaryBtn}>
              Recruit Members
            </button>
            <p className={styles.socText}>
              Not registered yet? <span onClick={() => router.push('/signup')} className={styles.signupLink}>Sign Up Here</span>
            </p>
          </div>
        ) : (
          <div className={styles.membersGrid}>
            {membersData.map((member) => (
              <div key={member.team_member_user_id} className={styles.memberCard}>
                <div className={styles.memberAvatar}>
                  {member.team_member_name.charAt(0).toUpperCase()}
                </div>
                <h3 className={styles.memberName}>{member.team_member_name}</h3>
                
                <div className={styles.memberLinks}>
                  {member.team_member_github_url && (
                    <a href={member.team_member_github_url} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                      GitHub
                    </a>
                  )}
                  {member.team_member_linkedin_url && (
                    <a href={member.team_member_linkedin_url} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                      LinkedIn
                    </a>
                  )}
                </div>

                {member.team_member_user_id !== currentUserId && (
                  <button 
                    onClick={() => setMemberToRemove(member.team_member_user_id)} 
                    className={styles.removeBtn}
                    disabled={isProcessing}
                  >
                    Remove Member
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function TeamMembersPage() {
  return (
    <Suspense fallback={
      <div className={styles.centerState}>
        <div className={styles.professionalLoader}></div>
        <p className={styles.loadingText}>Initializing...</p>
      </div>
    }>
      <TeamMembersContent />
    </Suspense>
  );
}