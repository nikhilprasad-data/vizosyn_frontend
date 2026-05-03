# ⚡ VizoSyn - Skill-Based Teammate Matchmaking Frontend

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![CSS Modules](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)

> **Live Frontend Deployment:** [https://vizosyn-frontend.vercel.app](https://vizosyn-frontend.vercel.app)
> 
> **Associated Backend API:** [https://vizosyn-api.onrender.com/api](https://vizosyn-api.onrender.com/api)

## 📖 Overview (The Backend Engineer's Perspective)
This is the client-side interface for VizoSyn, built with the Next.js App Router. As a "T-shaped" developer whose core mastery lies in backend architecture, I engineered this frontend deliberately to be clean and minimal. Rather than focusing on complex UI animations, this repository serves as a functional vessel to demonstrate **high-speed API communication, strict state management, and reliable data hydration** from the high-concurrency FastAPI backend.

## ✨ Core Engineering Features
1. **API Flow & Data Hydration:** Utilizes native `fetch()` alongside React hooks (`useState`, `useEffect`) to seamlessly handle asynchronous promises, payload extraction, and loading states without relying on heavy third-party data-fetching libraries.
2. **Secure Token Integration:** Safely stores JWTs upon login and strictly injects them into HTTP headers for authenticated routes (e.g., updating profiles, parsing hackathon team requests).
3. **Error Handling & Response Parsing:** Intelligently evaluates HTTP status codes (2xx vs 4xx/5xx) from the Python backend to render contextual success alerts or error boundaries (e.g., "Username already taken").

## 💻 Tech Stack
* **Framework:** Next.js (React)
* **Authentication:** JWT (Client-Side Storage & Header Injection)
* **API Communication:** `fetch` / Axios
* **Styling Strategy:** Native CSS / CSS Modules (Scoped styling)

## 🚀 Local Installation & Setup

To run the frontend client locally and connect it to your backend:

**1. Clone the repository**
```bash
git clone https://github.com/nikhilprasad-data/vizosyn_frontend.git
cd vizosyn_frontend
```

**2. Install Node Dependencies**
This project relies on `package.json` for dependency management.
```bash
npm install
```

**3. Environment Configuration**
Create a .env.local file in the root directory to point to your local FastAPI server. (Note: The /api routing is handled directly by the backend).
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**4. Start the Development Server**
Launch the Next.js development environment.
```bash
npm run dev
```
*Navigate to `http://localhost:3000` in your browser.*

---
*Architected for robust data flow and security by [Nikhil Prasad](https://github.com/nikhilprasad-data).*