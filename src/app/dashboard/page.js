"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import SpinnerLoader from "../../components/SpinnerLoader"; 
import styles from "./page.module.css";

export default function Dashboard() {
    const router = useRouter();
    const [id, setId] = useState("");
    const [userName, setUserName] = useState("");
    const [isLoading, setIsLoading] = useState(true); 
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("vizosyn_token");

        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setId(decodedToken.id);
                setUserName(decodedToken.username);
                setIsLoading(false);
            } catch (error) {
                console.error("Token decoding failed", error);
                localStorage.removeItem("vizosyn_token");
                toast.error("Session expired. Please login again.");
                router.push('/');
            }
        } else {
            router.push('/');
        }
    }, [router]);

    const handleLogoutButton = (e) => {
        e.preventDefault();
        setIsLoggingOut(true);
        const token = localStorage.getItem("vizosyn_token");

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
            method: "POST",
            mode: "cors",
            credentials: "omit",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token,
                "Accept": "application/json",
            }
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.status === "success" || data.detail) {
                    localStorage.removeItem("vizosyn_token");
                    toast.success("Logged out securely.");
                    router.push('/');
                }
            })
            .catch((error) => {
                toast.error("Network error: " + error.message);
                setIsLoggingOut(false);
            });
    };

    if (isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <SpinnerLoader /> 
                <p style={{ marginTop: '15px' }}>Loading Dashboard...</p>
            </div>
        );
    }

    return (
        <div className={styles.dashboardWrapper}>
            <header className={styles.header}>
                <div className={styles.welcomeSection}>
                    <h1 className={styles.title}>VizoSyn Dashboard</h1>
                    <p className={styles.subtitle}>Welcome back, <span className={styles.highlight}>{userName}</span> (ID: {id})</p>
                </div>
                <button 
                    onClick={handleLogoutButton} 
                    className={styles.logoutBtn}
                    disabled={isLoggingOut}
                >
                    {isLoggingOut ? <SpinnerLoader /> : "Logout Securely"}
                </button>
            </header>

            <main className={styles.mainContent}>
                <section className={styles.cardGroup}>
                    <h2 className={styles.groupTitle}>Personal Management</h2>
                    <div className={styles.grid}>
                        <button className={styles.actionBtn} onClick={() => router.push('/my-profile')}>
                            My Profile
                        </button>
                        <button className={styles.actionBtn} onClick={() => router.push('/my-skill')}>
                            My Skills
                        </button>
                    </div>
                </section>

                <section className={styles.cardGroup}>
                    <h2 className={styles.groupTitle}>Team Collaboration</h2>
                    <div className={styles.grid}>
                        <button className={styles.actionBtn} onClick={() => router.push('/my-team')}>
                            My Team
                        </button>
                    </div>
                </section>

                <section className={styles.cardGroup}>
                    <h2 className={styles.groupTitle}>Discovery Portal</h2>
                    <div className={styles.grid}>
                        <button className={styles.actionBtn} onClick={() => router.push('/all-profile')}>
                            Browse Profiles
                        </button>
                        <button className={styles.actionBtn} onClick={() => router.push('/all-team')}>
                            Browse Teams
                        </button>
                    </div>
                </section>
            </main>
        </div>
    );
}