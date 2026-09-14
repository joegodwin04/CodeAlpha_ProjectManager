# 🚀 CodeAlpha ProjectManager

A modern, full-stack **Project Management Platform** developed as part of the **CodeAlpha Full Stack Development Internship — Task 3**.

CodeAlpha ProjectManager helps users organize projects, manage tasks, assign work, communicate through task comments, receive notifications, and collaborate with real-time updates.

---

## ✨ Features

### 🔐 Authentication & Security
- User registration and login
- JWT-based authentication
- bcrypt password hashing
- Protected application routes
- Secure session-based authentication
- Automatic logout for invalid/expired sessions
- Login required for new browser sessions

### 📊 Dashboard
- Overview of total projects and tasks
- Project progress tracking
- Task status statistics
- Active and completed project information
- Overdue task tracking
- Real-time project/task information

### 📁 Project Management
- Create new projects
- View project details
- Edit existing projects
- Delete projects with confirmation
- Set project status and priority
- Set project start and due dates
- Track project completion progress

### 📋 Task Management
- Create tasks inside projects
- Edit tasks
- Delete tasks
- Set task priority
- Set task status:
  - Todo
  - In Progress
  - Done
- Assign tasks to users
- Reassign tasks
- Display task assignees
- Automatic project progress calculation

### 👥 Task Assignment
- Select an assignee while creating a task
- Change the assignee while editing a task
- Validate users before assignment
- Display assigned user information on task cards
- Assignment notifications
- Real-time assignment updates

### 💬 Task Comments
- Add comments directly to tasks
- View task comments
- Delete your own comments
- Automatic comment updates
- Real-time comment synchronization using Socket.IO
- Duplicate comment protection

### 🔔 Notifications
- Real-time notifications
- Task assignment notifications
- Comment notifications
- Task status notifications
- Unread notification counter
- Mark individual notifications as read
- Mark all notifications as read
- Delete notifications

### ⚡ Real-Time Collaboration
Powered by **Socket.IO** for real-time communication.

Real-time events include:
- Task updates
- Task assignments
- New comments
- Comment deletion
- User-specific notifications

Changes can appear across connected clients without manually refreshing the page.

### 🔎 Quick Search
- Quick Search command palette
- Search projects and tasks
- Live search filtering
- `Ctrl + K` keyboard shortcut on Windows/Linux
- `⌘ + K` keyboard shortcut on macOS
- Arrow-key navigation
- Enter to open search results
- Escape to close
- Direct navigation to projects/tasks

### 👤 Profile & Account
- View profile information
- Update personal information
- View account statistics
- Security settings
- Secure logout

### 📱 Responsive Design
- Desktop-friendly interface
- Tablet support
- Mobile-responsive layouts
- Modern UI with Tailwind CSS
- Clean dashboard and project management interface

---

## 🛠️ Tech Stack

### Frontend

- **React** — UI library
- **Vite** — Frontend build tool
- **Tailwind CSS v4** — Styling
- **React Router** — Client-side routing
- **Axios** — HTTP/API requests
- **Socket.IO Client** — Real-time communication
- **Lucide React** — Icons
- **date-fns** — Date formatting

### Backend

- **Node.js** — Runtime environment
- **Express.js** — REST API framework
- **Sequelize** — ORM
- **PostgreSQL** — Relational database
- **Neon PostgreSQL** — PostgreSQL-compatible cloud database
- **JSON Web Tokens (JWT)** — Authentication
- **bcryptjs** — Password hashing
- **Socket.IO** — Real-time communication

---

## 🗄️ Database Models

### User

Stores user authentication and profile information.

Relationships:
- Has many Projects
- Has many Tasks
- Has many Comments
- Has many Notifications

### Project

Stores project information including:

- Title
- Description
- Status
- Priority
- Start date
- Due date
- Progress
- Owner

Relationships:
- Belongs to User
- Has many Tasks

### Task

Stores task information including:

- Title
- Description
- Status
- Priority
- Due date
- Project
- Assignee

Relationships:
- Belongs to Project
- Belongs to User

### Comment

Stores task discussion information including:

- Comment content
- Task
- Author
- Created/updated timestamps

### Notification

Stores user notifications including:

- Notification type
- Message
- Read/unread status
- User
- Project
- Task

---

## 🔌 API Overview

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive authentication token |
| GET | `/api/auth/me` | Get current authenticated user |

### Projects

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/projects` | Get user's projects |
| POST | `/api/projects` | Create a project |
| GET | `/api/projects/:id` | Get project details |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |

### Tasks

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tasks` | Get user's tasks |
| POST | `/api/tasks` | Create a task |
| GET | `/api/tasks/:id` | Get task details |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

### Comments

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/comments/task/:taskId` | Get task comments |
| POST | `/api/comments/task/:taskId` | Add a comment |
| DELETE | `/api/comments/:id` | Delete a comment |

### Notifications

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notifications` | Get notifications |
| PATCH | `/api/notifications/:id/read` | Mark notification as read |
| PATCH | `/api/notifications/mark-all-read` | Mark all notifications as read |
| DELETE | `/api/notifications/:id` | Delete notification |

### Users

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users` | Get available users |
| GET | `/api/users/profile` | Get profile and statistics |
| PUT | `/api/users/profile` | Update profile |
| GET | `/api/users/dashboard` | Get dashboard statistics |

---

## ⚡ Real-Time Architecture

The application uses **Socket.IO** for real-time communication.

### Project Rooms

Clients can join project-specific rooms to receive updates related to a project.

Example events:

```text
taskUpdated

**📂 Project Structure**

CodeAlpha_ProjectManager/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── CustomSelect.jsx
│   │   │   │   ├── GuestAuthPrompt.jsx
│   │   │   │   ├── NotificationBell.jsx
│   │   │   │   ├── QuickSearchModal.jsx
│   │   │   │   └── TaskComments.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── Sidebar.jsx
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── hooks/
│   │   │   └── useNotifications.js
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── ProjectDetails.jsx
│   │   │   ├── Projects.jsx
│   │   │   └── Tasks.jsx
│   │   │
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── socket.js
│   │   │
│   │   └── App.jsx
│   │
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── commentController.js
│   │   │   ├── notificationController.js
│   │   │   ├── projectController.js
│   │   │   ├── taskController.js
│   │   │   └── userController.js
│   │   │
│   │   ├── models/
│   │   │   ├── Comment.js
│   │   │   ├── Notification.js
│   │   │   ├── Project.js
│   │   │   ├── Task.js
│   │   │   ├── User.js
│   │   │   └── index.js
│   │   │
│   │   ├── routes/
│   │   │   ├── commentRoutes.js
│   │   │   ├── notificationRoutes.js
│   │   │   ├── projectRoutes.js
│   │   │   ├── taskRoutes.js
│   │   │   └── userRoutes.js
│   │   │
│   │   ├── socket.js
│   │   └── server.js
│   │
│   └── package.json
│
└── README.md

---

```
## ⚙️ Installation

### Prerequisites

Make sure you have the following installed:

- Node.js 18+
- npm
- PostgreSQL or a Neon PostgreSQL database
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/joegodwin04/CodeAlpha_ProjectManager.git
cd CodeAlpha_ProjectManager
```

### 2. Backend Setup

**Navigate to the backend directory:**

```bash
cd server
npm install
```

**Create a `.env` file inside the `server` directory:**

```env
PORT=5000
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_secure_jwt_secret
NODE_ENV=development
```

**Start the backend:**

```bash
npm run dev
```

**The backend will run on:**

`http://localhost:5000`

### 3. Frontend Setup

**Open another terminal and navigate to the frontend:**

```bash
cd client
npm install
npm run dev
```

**The frontend will run on:**

`http://localhost:5173`

▶️ Running the Project

After starting both the frontend and backend:

Open http://localhost:5173
Register a new account.
Log in to the application.
Create a project.
Add tasks to the project.
Assign tasks to users.
Update task status and priority.
Add comments to tasks.
Check real-time notifications.
Use Quick Search with Ctrl + K.

🔒 Security & Privacy

The application includes several security and privacy measures:

JWT-based authentication
Password hashing using bcrypt
Protected API routes
Session-based authentication storage
Automatic session cleanup on logout
Unauthorized request handling
Guest protection for mutation requests
User-specific notification rooms
Input validation for task assignments
Authorization checks for project and task operations

⚡ Real-Time Collaboration

CodeAlpha ProjectManager uses Socket.IO to provide real-time collaboration features.

Real-Time Features
Task updates
Task assignments
New comments
Comment deletion
User-specific notifications

When a change occurs, connected users can receive the update without manually refreshing the page.

Socket.IO Events
taskUpdated
task_assigned
commentAdded
commentDeleted
notification

## ⚡ Real-Time Architecture

The application uses **Socket.IO** for real-time communication between connected clients and the backend server.

### **Project Rooms**

Clients can join project-specific Socket.IO rooms to receive updates related to a particular project.

Example event:

```text
taskUpdated
```

### **User Rooms**

Each authenticated user can join a user-specific room to receive personal notifications such as task assignments and task activity.

### **Architecture**

```text
┌──────────────────────────────┐
│       React Frontend         │
│                              │
│      Socket.IO Client        │
└──────────────┬───────────────┘
               │
               │ WebSocket
               ▼
┌──────────────────────────────┐
│      Node.js + Express       │
│                              │
│      Socket.IO Server        │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│       PostgreSQL / Neon      │
│                              │
│  Users                       │
│  Projects                    │
│  Tasks                       │
│  Comments                    │
│  Notifications               │
└──────────────────────────────┘
```

### **Real-Time Events**

```text
taskUpdated
task_assigned
commentAdded
commentDeleted
notification
```

When a change occurs, connected clients receive the relevant update without manually refreshing the page.

---

## 🔄 Application Workflow

```text
┌───────────────────────┐
│   User Registration   │
└───────────┬───────────┘
            ▼
┌───────────────────────┐
│        Login          │
└───────────┬───────────┘
            ▼
┌───────────────────────┐
│      Dashboard        │
└───────────┬───────────┘
            ▼
┌───────────────────────┐
│    Create Project     │
└───────────┬───────────┘
            ▼
┌───────────────────────┐
│     Create Tasks      │
└───────────┬───────────┘
            ▼
┌───────────────────────┐
│     Assign Tasks      │
└───────────┬───────────┘
            ▼
┌───────────────────────┐
│  Update Task Status   │
└───────────┬───────────┘
            ▼
┌───────────────────────┐
│     Add Comments      │
└───────────┬───────────┘
            ▼
┌───────────────────────┐
│    Notifications      │
└───────────┬───────────┘
            ▼
┌───────────────────────┐
│   Real-Time Updates   │
└───────────────────────┘
```

---

## 📂 Main Application Pages

### **Login**

Allows users to securely register and authenticate.

### **Dashboard**

Provides an overview of projects, tasks, progress, and activity.

### **Projects**

Allows users to create, view, edit, and manage projects.

### **Project Details**

Provides project-specific task management, task assignment, comments, and project progress.

### **Tasks**

Provides a centralized view of tasks and task management operations.

### **Profile**

Allows users to manage their personal information and account settings.

---

## 🗃️ Data Flow

```text
┌───────────────────────┐
│       React UI        │
└───────────┬───────────┘
            ▼
┌───────────────────────┐
│   Axios API Requests  │
└───────────┬───────────┘
            ▼
┌───────────────────────┐
│    Express REST API   │
└───────────┬───────────┘
            ▼
┌───────────────────────┐
│      Controllers      │
└───────────┬───────────┘
            ▼
┌───────────────────────┐
│     Sequelize ORM     │
└───────────┬───────────┘
            ▼
┌───────────────────────┐
│    PostgreSQL / Neon  │
└───────────────────────┘
```

### **Real-Time Data Flow**

```text
┌───────────────────────┐
│   Database Operation  │
└───────────┬───────────┘
            ▼
┌───────────────────────┐
│    Socket.IO Event    │
└───────────┬───────────┘
            ▼
┌───────────────────────┐
│   Connected Clients    │
└───────────┬───────────┘
            ▼
┌───────────────────────┐
│ UI Updates Without    │
│       Refresh         │
└───────────────────────┘
```

---

## 🚀 Future Improvements

Possible future enhancements include:

- Drag-and-drop task management
- Advanced team roles and permissions
- Email notifications
- File attachments
- Rich-text task descriptions
- Advanced project analytics
- Calendar integration
- Activity history
- Enhanced team collaboration
- Project activity timeline

---

## 🎓 CodeAlpha Internship

This project was developed as part of the:

**CodeAlpha Full Stack Development Internship**

### **Task 3 — Project Management Tool**

The project demonstrates a full-stack project management platform featuring:

- User authentication
- Project management
- Task management
- Task assignment
- Task comments
- Notifications
- Real-time collaboration
- Responsive frontend
- REST API backend
- PostgreSQL database

---

## 📄 License

This project is licensed under the **MIT License**.

See the [LICENSE](LICENSE) file for more information.

---

## 👨‍💻 Author

**Joe Godwin**

**GitHub:** [joegodwin04](https://github.com/joegodwin04)

---

**Built with ❤️ as part of the CodeAlpha Full Stack Development Internship.**
