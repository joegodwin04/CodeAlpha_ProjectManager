# CodeAlpha ProjectManager

A professional, full-stack Project Management Platform built for the **CodeAlpha Full Stack Development Internship — Task 3**.

## Features

- **Authentication**: Secure JWT-based registration and login with bcrypt password hashing.
- **Dashboard**: High-level overview of your projects and tasks, including total counts, active status, and overdue tasks.
- **Project Management**: Create, read, update, and delete projects. Track progress, status, priority, and deadlines.
- **Task Management**: Create tasks within projects, set priorities, and update statuses (Todo, In Progress, Done).
- **Profile Management**: Update your personal information and track your stats.
- **Responsive UI**: A modern, clean, and portfolio-ready interface designed to work seamlessly on desktop, tablet, and mobile devices.

## Tech Stack

### Frontend
- **React**: UI library
- **Vite**: Fast build tool
- **Tailwind CSS v4**: Utility-first CSS framework for styling
- **React Router**: Client-side routing
- **Axios**: HTTP client for API requests
- **Lucide React**: Modern iconography
- **date-fns**: Date formatting

### Backend
- **Node.js & Express**: Server environment and web framework
- **Sequelize**: Promise-based Node.js ORM
- **PostgreSQL**: Relational database (Compatible with Neon PostgreSQL)
- **JSON Web Tokens (JWT)**: Secure authentication
- **bcryptjs**: Password hashing

## Database Models

- **User**: Stores user credentials and profile information. (hasMany Projects, hasMany Tasks)
- **Project**: Stores project details like title, description, status, priority, and progress. (belongsTo User, hasMany Tasks)
- **Task**: Stores task details linked to specific projects. (belongsTo Project, belongsTo User)

## API Overview

### Auth
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive JWT
- `GET /api/auth/me` - Get current authenticated user

### Projects
- `GET /api/projects` - Get all projects for user
- `POST /api/projects` - Create a new project
- `GET /api/projects/:id` - Get specific project details
- `PUT /api/projects/:id` - Update a project
- `DELETE /api/projects/:id` - Delete a project

### Tasks
- `GET /api/tasks` - Get all tasks for user
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/:id` - Get specific task details
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

### Users
- `GET /api/users/profile` - Get user profile and stats
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/dashboard` - Get dashboard statistics

## Installation

### Prerequisites
- Node.js (v18 or higher recommended)
- A PostgreSQL database (e.g., Neon PostgreSQL)

### Setup

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd CodeAlpha_ProjectManager
   \`\`\`

2. **Backend Setup**
   \`\`\`bash
   cd server
   npm install
   \`\`\`
   - Copy `.env.example` to `.env` and fill in your details:
     \`\`\`
     PORT=5000
     DATABASE_URL=postgres://your_user:your_password@your_host/your_db
     JWT_SECRET=your_super_secret_key
     NODE_ENV=development
     \`\`\`
   - Start the backend server:
     \`\`\`bash
     npm run dev
     \`\`\`

3. **Frontend Setup**
   \`\`\`bash
   cd client
   npm install
   \`\`\`
   - Start the frontend development server:
     \`\`\`bash
     npm run dev
     \`\`\`

## Running Locally

Once both servers are running:
- **Frontend** will be available at `http://localhost:5173`
- **Backend API** will be available at `http://localhost:5000`

The application supports responsive design and will adjust perfectly across all your devices.

## Screenshots

*(Placeholder for future screenshots of the Dashboard, Project Board, and Mobile Views)*

## Future Improvements

- Add drag-and-drop functionality for Kanban-style task management.
- Implement user roles and team collaboration features.
- Add email notifications for overdue tasks.
- Include rich text editing for project and task descriptions.

---
*Built with ❤️ for CodeAlpha.*
