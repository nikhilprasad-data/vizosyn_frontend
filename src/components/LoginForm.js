"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import SpinnerLoader from "./SpinnerLoader";
import styles from "./LoginForm.module.css";

export default function LoginForm() {
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const loadDemoDetails = (demo) => {
    if (demo === 'demo1') {
      setUserEmail("admin_demo@vizosyn.com");
      setPassword("demo_password_1");
    } else if (demo === 'demo2') {
      setUserEmail("teammate_demo@vizosyn.com");
      setPassword("demo_password_2");
    } else {
      setUserEmail("fresh_demo@vizosyn.com");
      setPassword("demo_password_3");
    }
  };

  const handelLoginButton = (e) => {
    e.preventDefault();
    setIsLoading(true);

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: "POST",
      mode: "cors",
      credentials: "omit",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        "email": userEmail,
        "password": userPassword
      })
    })
      .then((reponse) => reponse.json())
      .then((data) => {
        if (data.message === "success") {
          toast.success("Authentication successful. Welcome back.");
          localStorage.setItem("vizosyn_token", data.access_token);
          router.push('/dashboard');
        } else {
          toast.error("Authentication failed: " + data.detail);
        }
      })
      .catch((error) => {
        toast.error("Network Error: " + error.message);
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>VizoSyn Portal</h1>
          <p className={styles.subtitle}>Secure access for enterprise partners</p>
        </div>

        <form onSubmit={handelLoginButton} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>Email Address</label>
            <input
              type="email"
              id="email"
              className={styles.inputField}
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input
              type="password"
              id="password"
              className={styles.inputField}
              value={userPassword}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? <SpinnerLoader /> : "Login Securely"}
          </button>
        </form>

        <div className={styles.demoSection}>
          <p className={styles.demoText}>Interviewer Demo Shortcuts</p>
          <div className={styles.demoButtons}>
            <button type="button" onClick={() => loadDemoDetails('demo1')} className={styles.demoBtn}>Team Admin</button>
            <button type="button" onClick={() => loadDemoDetails('demo2')} className={styles.demoBtn}>Join Team</button>
            <button type="button" onClick={() => loadDemoDetails('demo3')} className={styles.demoBtn}>Fresh Profile</button>
          </div>
        </div>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            Don't have an account?{" "}
            <span onClick={() => router.push('/signup')} className={styles.signupLink}>
              Create a profile
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}