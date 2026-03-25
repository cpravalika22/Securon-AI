# Securon-Insight

**Securon-Insight** is a modern complaint management and oversight system designed for educational institutions or organizations. It enables anonymous reporting, AI-based risk evaluation, and role-based dashboards for authorities to track, manage, and resolve complaints efficiently.

---

## Features

- **Anonymous Complaint Submission** – Users can report issues without logging in.  
- **AI Risk Analyzer** – Evaluates complaint severity using keywords or AI-based analysis.  
- **Role-Based Dashboards** – HOD, Mentor, and Safety Officer views with filtered complaints.  
- **Complaint Tracking** – Pending, In Progress, Resolved status updates.  
- **Internal Messaging** – Chat system within each complaint for authorities and reporters.  
- **Statistics & Visuals** – Pie charts and trend graphs for quick insights.  
- **End-to-End Encryption (Showcase)** – Messages encrypted on the client-side for demo purposes.  

---

## Tech Stack

- **Frontend:** Next.js 15, React, Tailwind CSS, Recharts  
- **Backend / Database:** Firebase Firestore & Authentication  
- **AI Integration:** Gemini API + keyword-based fallback  
- **Security:** Firestore Rules, Role-based access control  

---

## How It Works

1. Users submit complaints (anonymous or logged in).  
2. AI evaluates risk (High, Medium, Low) using keywords or AI analysis.  
3. Complaints are stored in Firestore with unique IDs.  
4. Authorities access complaints based on their roles:  
   - HOD: High-risk  
   - Mentor: Low to Medium risk  
   - Safety: All complaints  
5. Authorities can chat with reporters directly within the complaint thread.  
6. Status and resolution updates are tracked in dashboards.  

---

## Project Structure
