const fs = require('fs');

const sprints = [
  {
    num: 1, color: "#94a3b8",
    title: "Planning and Approval",
    goal: "To define the project scope, identify all core system requirements (SRS), establish a robust user flow, and secure final supervisor approval for the PetEase architecture.",
    tasks: ["Identify Stakeholders", "Define Project Scope", "Create Software Requirements Specification (SRS)", "Gather UI References", "Develop User Flow", "Supervisor Approval"],
    evidenceText: "The initial planning phase concluded with comprehensive documentation mapping all system use cases. The SRS serves as the backbone for continuous development.",
    evidenceItems: ["Approved System Requirements Specification Document", "User Flow Mapping Diagrams", "Stakeholder Sign-off Matrix"],
    resources: [
      { tech: "Google Docs / Word", purpose: "SRS Document Collaboration and tracking", link: "#" },
      { tech: "Miro / Whimsical", purpose: "Drafting the initial User Flow Logic", link: "#" }
    ]
  },
  {
    num: 2, color: "#64748b",
    title: "Backlog and Design",
    goal: "To architect the exact system workflow and relational database schema, transitioning conceptual requirements into tangible engineering blueprints.",
    tasks: ["Create Use Case Diagrams", "Develop Activity Diagrams", "Create Sequence Diagrams", "Design Entity-Relationship Diagram (ERD)", "Define Database Schema", "Compile Backlog and Sprint Plan"],
    evidenceText: "System logic flows and the PostgreSQL relational schema definitions were finalized. Prisma models were strictly derived from the ERD design.",
    evidenceItems: ["UML Activity and Sequence Diagrams", "ERD showing Patient, Doctor, Pet, Appointment mapping", "Compiled TeamGantt Sprint Plan"],
    resources: [
      { tech: "Lucidchart / Draw.io", purpose: "UML and Entity Relationship Diagram generation", link: "#" },
      { tech: "TeamGantt", purpose: "Agile sprint backlog and scheduling creation", link: "#" }
    ]
  },
  {
    num: 3, color: "#f87171",
    title: "Prototyping",
    goal: "To produce high-fidelity wireframes and interactive prototypes for all primary views (Home, Adoption, Doctors, Store, Admin) establishing the final UI guidelines.",
    tasks: ["Create Wireframes for Home Page", "Create Wireframes for Adoption Page", "Create Wireframes for Doctors Page", "Create Wireframes for Store Page", "Create Wireframes for Blogs and Events Page", "Create Admin Wireframes", "Develop UI Kit", "Create Prototype"],
    evidenceText: "Figma was utilized to draft the entire PetEase visual aesthetic. A unified UI kit including specific typography (Inter) and color palettes was enforced across all components.",
    evidenceItems: ["Figma UI Component Kit Overview", "Interactive Prototype for Adoption User Flow", "Doctor Scheduling Interface Mockup"],
    resources: [
      { tech: "Figma", purpose: "High-fidelity vector graphic prototyping and UI mapping", link: "https://figma.com" }
    ]
  },
  {
    num: 4, color: "#38bdf8",
    title: "Backend Development",
    goal: "To instantiate the Node.js Express server, link the PostgreSQL database via Prisma ORM, and expose secured REST APIs for authentication, adopting, and user management.",
    tasks: ["Set Up Backend Environment", "Integrate PostgreSQL and Prisma", "Implement Authentication", "Develop APIs for Adoption Module", "Develop APIs for User Management"],
    evidenceText: "The Express API was mounted successfully. Prisma Client maps directly to PostgreSQL, and Authentication flows secure user passwords using bcrypt and issue signing JWTs.",
    evidenceItems: ["server/index.js initialization and active listener", "Prisma Migration Execution and schema mapping", "Auth Controller resolving JWTs explicitly"],
    codeSnippet: `// Backend Entry Point Summary (server/index.js)
import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";

const app = express();
const prisma = new PrismaClient();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/adoptions", adoptionRoutes);
// Application backend securely mounted and running...`,
    resources: [
      { tech: "Node.js & Express", purpose: "Core asynchronous JavaScript backend runtime", link: "https://expressjs.com/" },
      { tech: "Prisma ORM", purpose: "Type-safe database interactions mapping ERD to Postgres", link: "https://www.prisma.io/" },
      { tech: "PostgreSQL", purpose: "Relational data persistence targeting User/Pet relations", link: "https://www.postgresql.org/" }
    ]
  },
  {
    num: 5, color: "#4ade80",
    title: "Frontend Development",
    goal: "To execute the UI prototypes into production-ready React components using Vite and TailwindCSS, integrating hooks to fetch data from the established Backend APIs.",
    tasks: ["Develop Frontend for Home Module", "Develop Frontend for Adoption Module", "Develop Frontend for Doctors Module", "Develop Frontend for Store Module", "Create Admin Panel"],
    evidenceText: "The Vite frontend successfully connects to the backend REST API via Axios instances. React Router natively handles component navigation across the User, Doctor, and System Admin roles.",
    evidenceItems: ["React Router DOM Layout Component Tree", "Adoption Feed mapping live Backend REST Data", "Admin Dashboard data visualization tables"],
    codeSnippet: `// Frontend Interceptor Integration (services/api.js)
import axios from 'axios';
const api = axios.create({ baseURL: 'http://localhost:5000/api' });

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = \`Bearer \${token}\`;
    return config;
});
export default api;`,
    resources: [
      { tech: "Vite + React", purpose: "Blazing fast client-side rendering environment", link: "https://vitejs.dev/" },
      { tech: "Tailwind CSS", purpose: "Utility-first CSS framework mirroring exact Figma designs", link: "https://tailwindcss.com/" },
      { tech: "React Router", purpose: "Client-side routing encapsulating role-based views", link: "https://reactrouter.com/" }
    ]
  },
  {
    num: 6, color: "#facc15",
    title: "Enhancements",
    goal: "To integrate advanced monolithic services extending system capabilities: live socket messaging, geographical maps, analytical tracking, and tracking vaccinations.",
    tasks: ["Implement Real-Time Chat", "Develop Rescue Updates Feature", "Add Vaccination Tracking", "Integrate Maps Feature", "Implement Analytics Module", "Add Reviews and Notifications"],
    evidenceText: "Socket.io was deeply integrated into the Node backend and React frontend allowing instant private doctor-patient chats. Rescue maps accurately utilize spatial map data.",
    evidenceItems: ["Socket.io 'receive_message' active event mappings", "Interactive Rescue Map mounting API hooks", "Unified Analytics extraction mapping User activity"],
    codeSnippet: `// Socket.io Real-Time Connectivity (server/index.js)
io.on("connection", (socket) => {
  socket.on("join_chat", (room) => socket.join(room));

  socket.on("send_message", async (data) => {
    await prisma.message.create({
      data: { chatId: data.roomId, senderId: data.senderId, messageText: data.message, messageType: 'text' }
    });
    io.to(data.roomId).emit("receive_message", data);
  });
});`,
    resources: [
      { tech: "Socket.io", purpose: "Event-driven real-time bidirectional messaging pipeline", link: "https://socket.io/" },
      { tech: "Leaflet / Google Maps", purpose: "Spatial geography mapping for Rescue alerts", link: "https://developers.google.com/maps" }
    ]
  },
  {
    num: 7, color: "#c084fc",
    title: "Testing",
    goal: "To ensure code regression passes across unit scopes and API integrations, stabilizing bugs and ensuring the User Acceptance Test criteria is achieved.",
    tasks: ["Conduct Unit Testing", "Perform Integration Testing", "API Testing", "Bug Fixes", "User Acceptance Testing (UAT)"],
    evidenceText: "Extensive API testing validated token access parameters. UAT testing was carried out confirming all 3 user roles (Patient, Doctor, Admin) navigate seamlessly without structural crashes.",
    evidenceItems: ["Postman API successful response traces", "Console bug-fixes relating to React key warnings", "Successful completion of all mapped System Use Cases"],
    resources: [
      { tech: "Postman API", purpose: "Isolated endpoint integrity and payload verification", link: "https://www.postman.com/" }
    ]
  },
  {
    num: 8, color: "#fb7185",
    title: "Deployment",
    goal: "To push the application into live staging environments, finalize testing within external domains, and complete academic presentation deliverables.",
    tasks: ["Prepare for Deployment", "Set Up Domain", "Create Final Report", "Develop Presentation Slides (PPT)", "Conduct Rehearsal for Presentation"],
    evidenceText: "Application built locally and dependencies frozen. Static environment variables were secured for production scaling. Slide deck finalized highlighting core architectural decisions.",
    evidenceItems: ["Compiled Production Build ('npm run build')", "Final Academic Report compilation mapping Sprint 1-8", "Final PPT Presentation Deck"],
    resources: [
      { tech: "Vercel / Render", purpose: "Cloud platform CI/CD pushing repository into live environment", link: "https://vercel.com" }
    ]
  }
];

function generateHTML(title, bodyContent, color) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; margin: 0; padding: 40px; color: #333; max-width: 900px; margin: auto; }
        h1, h2, h3 { color: #1e293b; }
        h1 { text-align: center; border-bottom: 3px solid ${color}; padding-bottom: 10px; text-transform: uppercase;}
        .subtitle { text-align: center; font-style: italic; color: #64748b; margin-bottom: 40px; }
        .section { margin-bottom: 40px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
        th { background-color: #f8fafc; color: #333; font-weight: bold; }
        .metadata-box { background-color: #f8fafc; padding: 20px; border-left: 5px solid ${color}; margin-bottom: 30px; border-radius: 4px;}
        .metadata-box strong { display: inline-block; width: 130px; color: #475569;}
        pre { background-color: #0f172a; color: #f8fafc; padding: 15px; border-radius: 6px; overflow-x: auto; font-size: 0.9em; box-shadow: inset 0 2px 4px rgba(0,0,0,0.2); }
        code { font-family: "Courier New", Courier, monospace; }
        ul { padding-left: 20px; }
        li { margin-bottom: 8px; }
    </style>
</head>
<body>
${bodyContent}
</body>
</html>`;
}

// Generate files for all 8 Sprints
sprints.forEach(s => {
  // Backlog
  let backlogContent = `
    <h1>SPRINT ${s.num} ARTIFACT (${s.title})</h1>
    <h2 style="text-align: center; color: ${s.color};">Sprint Backlog & Plan</h2>
    <div class="metadata-box">
        <div><strong>Project:</strong> PetEase – Smart Pet Adoption & Rescue System</div>
        <div><strong>Sprint phase:</strong> Sprint ${s.num} – ${s.title}</div>
    </div>
    <div class="section">
        <h2>1 Sprint Goal</h2>
        <p>${s.goal}</p>
    </div>
    <div class="section">
        <h2>2 Planned Tasks (Per Gantt Chart)</h2>
        <table>
            <tr><th>SN</th><th>Task Description</th><th>Status</th></tr>
            ${s.tasks.map((t, i) => `<tr><td>S${s.num}-0${i+1}</td><td>${t}</td><td>Completed</td></tr>`).join('')}
        </table>
    </div>`;
  fs.writeFileSync(`sprint${s.num}_backlog.html`, generateHTML(`Sprint ${s.num} Backlog`, backlogContent, s.color));

  // Evidence
  let evidenceContent = `
    <h1>SPRINT ${s.num} ARTIFACT (${s.title})</h1>
    <h2 style="text-align: center; color: ${s.color};">Feature Work Evidence</h2>
    <div class="metadata-box">
        <div><strong>Project:</strong> PetEase – Smart Pet Adoption & Rescue System</div>
        <div><strong>Sprint phase:</strong> Sprint ${s.num} – ${s.title}</div>
        <div><strong>Document Type:</strong> Implementation Evidence</div>
    </div>
    <div class="section">
        <h2>1 Implementation Summary</h2>
        <p>${s.evidenceText}</p>
    </div>
    <div class="section">
        <h2>2 Verified Output / Core Deliverables</h2>
        <ul>
            ${s.evidenceItems.map(item => `<li><strong>Completed:</strong> ${item}</li>`).join('')}
        </ul>
    </div>
    ${s.codeSnippet ? `<div class="section"><h2>3 Code Integration Excerpt</h2><pre><code>${s.codeSnippet}</code></pre></div>` : ''}
  `;
  fs.writeFileSync(`sprint${s.num}_evidence.html`, generateHTML(`Sprint ${s.num} Evidence`, evidenceContent, s.color));

  // Resources
  let resourcesContent = `
    <h1>SPRINT ${s.num} ARTIFACT (${s.title})</h1>
    <h2 style="text-align: center; color: ${s.color};">Resources Used</h2>
    <div class="metadata-box">
        <div><strong>Project:</strong> PetEase – Smart Pet Adoption & Rescue System</div>
        <div><strong>Sprint phase:</strong> Sprint ${s.num} – ${s.title}</div>
    </div>
    <div class="section">
        <h2>1 Tools & Documentation Mapping</h2>
        <table>
            <tr><th>Technology / Tool</th><th>Purpose in this Sprint</th><th>Reference Link</th></tr>
            ${s.resources.map(r => `<tr><td><strong>${r.tech}</strong></td><td>${r.purpose}</td><td><a href="${r.link}" target="_blank">View Docs</a></td></tr>`).join('')}
        </table>
    </div>`;
  fs.writeFileSync(`sprint${s.num}_resources.html`, generateHTML(`Sprint ${s.num} Resources`, resourcesContent, s.color));
});

// Generate board.html
let boardCards = sprints.map(s => `
        <div class="card" style="border-top: 4px solid ${s.color}">
            <div class="card-header">
                Sprint ${s.num} — ${s.title}
            </div>
            <div class="item-list">
                <a href="sprint${s.num}_backlog.html" class="doc-item">
                    <svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg> Sprint ${s.num} Backlog
                </a>
                <a href="sprint${s.num}_evidence.html" class="doc-item">
                    <svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg> Work Evidence
                </a>
                <a href="sprint${s.num}_resources.html" class="doc-item">
                    <svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg> Resources Used
                </a>
            </div>
        </div>
`).join('');

let boardHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PetEase - Official Project Board</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body { margin: 0; padding: 40px; background-color: #0f172a; font-family: 'Inter', -apple-system, sans-serif; color: #f8fafc; }
        .header { text-align: center; margin-bottom: 50px; }
        .header h1 { margin: 0; font-size: 2.5rem; color: #f1f5f9; }
        .header p { color: #94a3b8; font-size: 1.1rem; }
        .board-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 30px; max-width: 1400px; margin: 0 auto; }
        .card { background-color: #1e293b; border-radius: 12px; padding: 24px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3); border: 1px solid #334155; display: flex; flex-direction: column; gap: 16px; }
        .card-header { font-size: 1.2rem; font-weight: 600; color: #f1f5f9; padding-bottom: 10px; border-bottom: 1px solid #334155; }
        .item-list { display: flex; flex-direction: column; gap: 10px; }
        .doc-item { background-color: #273548; border-radius: 8px; padding: 14px 16px; display: flex; align-items: center; gap: 12px; font-size: 0.95rem; font-weight: 500; color: #cbd5e1; text-decoration: none; cursor: pointer; transition: all 0.2s ease; border: 1px solid transparent; }
        .doc-item:hover { background-color: #334155; color: #ffffff; border-color: #475569; transform: translateY(-2px); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .doc-item svg { width: 18px; height: 18px; fill: #94a3b8; }
        .doc-item:hover svg { fill: #f8fafc; }
    </style>
</head>
<body>
    <div class="header">
        <h1>PetEase Official Project Board</h1>
        <p>Complete 8-Sprint Tracking & Artifact Evidence Repository</p>
    </div>
    <div class="board-grid">
        ${boardCards}
    </div>
</body>
</html>`;

fs.writeFileSync('board.html', boardHtml);
console.log('Successfully generated 24 sprint files + board.html!');
