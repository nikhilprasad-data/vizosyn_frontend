"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import SpinnerLoader from "../../components/SpinnerLoader";
import styles from "./page.module.css";

export default function TeamRequestsPage() {
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchRequests = async () => {
            const token = localStorage.getItem("vizosyn_token");

            if (!token) {
                toast.error("Authentication required.");
                router.push("/signup");
                return;
            }

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/team-request/view-request`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || "Failed to fetch requests.");
                }

                const data = await response.json();
                setRequests(data);
            } catch (error) {
                toast.error(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRequests();
    }, [router]);

    const handleProcessRequest = async (requestId, actionType) => {
        setProcessingId(requestId);
        const token = localStorage.getItem("vizosyn_token");

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/team-request/process-request`, {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    request_id: requestId,
                    action: actionType
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || `Failed to process request.`);
            }

            toast.success(data.message || `Request ${actionType} successfully!`);
            setRequests(currentRequests => currentRequests.filter(req => req.id !== requestId));
            
        } catch (error) {
            toast.error(error.message);
        } finally {
            setProcessingId(null);
        }
    };

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

    if (isLoading) {
        return (
            <div className={styles.centerState}>
                <SpinnerLoader />
                <p className={styles.loadingText}>Fetching Candidate Profiles...</p>
            </div>
        );
    }

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.headerContainer}>
                <h1 className={styles.pageTitle}>Applicant Dashboard</h1>
                <div className={styles.headerActions}>
                    <button onClick={() => router.push("/dashboard")} className={styles.backBtn}>
                        ← Back to Dashboard
                    </button>
                    <button 
                        onClick={handleLogoutButton} 
                        className={styles.logoutBtn}
                        disabled={isLoggingOut}
                    >
                        {isLoggingOut ? "Logging out..." : "Logout Securely"}
                    </button>
                </div>
            </div>

            <main className={styles.mainContent}>
                {requests.length === 0 ? (
                    <div className={styles.emptyStateCard}>
                        <h2 className={styles.emptyTitle}>Inbox Zero</h2>
                        <p className={styles.emptySub}>Your team currently has no new applications.</p>
                        <p className={styles.socText}>
                            Looking for more members? Share VizoSyn and ask them to <span onClick={() => router.push('/signup')} className={styles.signupLink}>Sign Up Here</span>.
                        </p>
                    </div>
                ) : (
                    <div className={styles.gridContainer}>
                        {requests.map((request, index) => (
                            <div key={`${request.id}-${index}`} className={styles.profileCard}>
                                <div className={styles.cardHeader}>
                                    <div>
                                        <h2 className={styles.fullName}>{request.full_name || `User ID: ${request.user_id}`}</h2>
                                        <p className={styles.locationTxt}>📍 {request.city || "Unknown"}, {request.state || "Location"}</p>
                                    </div>
                                    <span className={styles.statusBadge}>{request.status}</span>
                                </div>

                                <div className={styles.bioSection}>
                                    <p className={styles.bioText}>{request.bio || "No bio provided by candidate."}</p>
                                </div>

                                <div className={styles.messageSection}>
                                    <span className={styles.sectionLabel}>Cover Message:</span>
                                    <p className={styles.requestMessage}>"{request.message || "No message attached."}"</p>
                                </div>

                                <div className={styles.socialLinks}>
                                    {request.github_url && (
                                        <a href={request.github_url} target="_blank" rel="noopener noreferrer" className={styles.socialBtn}>
                                            GitHub ↗
                                        </a>
                                    )}
                                    {request.linkedin_url && (
                                        <a href={request.linkedin_url} target="_blank" rel="noopener noreferrer" className={styles.socialBtn}>
                                            LinkedIn ↗
                                        </a>
                                    )}
                                </div>

                                <div className={styles.actionGroup}>
                                    <button
                                        onClick={() => handleProcessRequest(request.id, "Accepted")}
                                        disabled={processingId === request.id}
                                        className={styles.acceptBtn}
                                    >
                                        {processingId === request.id ? "Processing..." : "Accept Candidate"}
                                    </button>
                                    <button
                                        onClick={() => handleProcessRequest(request.id, "Rejected")}
                                        disabled={processingId === request.id}
                                        className={styles.rejectBtn}
                                    >
                                        {processingId === request.id ? "..." : "Reject"}
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