"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import SpinnerLoader from "./SpinnerLoader";
import styles from "./SignupForm.module.css";

export default function SignupForm() {
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handelSignupButton = (e) => {
    e.preventDefault();
    setIsLoading(true);

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/signup`, {
      method: "POST",
      mode: "cors",
      credentials: "omit",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        "username": userName,
        "email": userEmail,
        "password": userPassword
      })
    })
      .then(async (response) => {
        const data = await response.json();
        if (response.ok) {
          return { success: true, payload: data };
        } else {
          return { success: false, payload: data };
        }
      })
      .then((result) => {
        if (result.success) {
          toast.success("Profile secured. Welcome to VizoSyn, " + result.payload.username);
          router.push('/');
        } else {
          toast.error("Registration failed: " + result.payload.detail);
        }
      })
      .catch((error) => {
        toast.error("Network Error: " + error.message);
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.signupCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>Join VizoSyn</h1>
          <p className={styles.subtitle}>Create your enterprise partner profile</p>
        </div>

        <form onSubmit={handelSignupButton} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="username" className={styles.label}>Full Name / Username</label>
            <input
              type="text"
              id="username"
              className={styles.inputField}
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>Work Email</label>
            <input
              type="email"
              id="email"
              className={styles.inputField}
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="name@company.com"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>Secure Password</label>
            <input
              type="password"
              id="password"
              className={styles.inputField}
              value={userPassword}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              required
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? <SpinnerLoader /> : "Create Profile"}
          </button>
        </form>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            Already have a profile?{" "}
            <span onClick={() => router.push('/')} className={styles.loginLink}>
              Login securely
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}