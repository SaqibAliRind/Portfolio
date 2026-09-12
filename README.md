# Portfolio

A professional, production-quality personal portfolio for a MERN Stack / Full-Stack Developer.

## Description

This project will grow into a full-stack portfolio featuring a public-facing site with dynamic projects, case study pages, a secure admin panel, contact management, dark/light theming, Framer Motion animations, and Three.js 3D elements — all powered by a Node.js + Express + MongoDB backend.

This repository currently contains the **frontend foundation only**.

## Tech Stack

| Layer       | Technology                              |
|-------------|----------------------------------------|
| Frontend    | React 18, Vite 5                       |
| Routing     | React Router v6                        |
| State       | Redux Toolkit + React-Redux            |
| HTTP client | Axios                                  |
| Styling     | CSS3 (custom properties)               |
| Backend*    | Node.js, Express *(coming soon)*       |
| Database*   | MongoDB *(coming soon)*                |
| Auth*       | JWT *(coming soon)*                    |

## Installation

```bash
# Clone the repository
git clone <repo-url>
cd portfolio

# Install dependencies
npm install
```

## Development

```bash
npm run dev
```

The app will start at [http://localhost:5173](http://localhost:5173).

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable            | Description                          |
|---------------------|--------------------------------------|
| `VITE_API_BASE_URL` | Base URL of the Express backend API  |

> **Never commit your `.env` file.** It is already listed in `.gitignore`.
