# AskAny 🙋

> A student help forum API — ask anything, answer anything...

AskAny is a REST API where students can post questions and other students can respond via comments. Built with Node.js and Express, and deployed through a fully automated Jenkins CI/CD pipeline...

---

## Features

- User registration and JWT-based login
- Create, view, edit and delete forum posts (owner only)
- Comment on any post (authenticated users)
- Public viewing of all posts and comments
- Health check endpoint for monitoring

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 18 |
| Framework | Express.js |
| Auth | JWT + bcryptjs |
| Storage | In-memory store |
| Container | Docker |
| CI/CD | Jenkins |
| Code Quality | SonarQube |
| Security | Trivy |
| Monitoring | Prometheus + Grafana |
| Testing | Jest + Supertest |

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login and get JWT token |

### Posts
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/posts | No | Get all posts |
| GET | /api/posts/:id | No | Get single post |
| POST | /api/posts | Yes | Create a post |
| PUT | /api/posts/:id | Yes (owner) | Edit own post |
| DELETE | /api/posts/:id | Yes (owner) | Delete own post |

### Comments
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/posts/:id/comments | No | Get comments |
| POST | /api/posts/:id/comments | Yes | Add a comment |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Health check for monitoring |

---

## Running Locally

```bash
npm install
npm start        # http://localhost:3000
npm test         # Run tests with coverage
```

---

## Pipeline Stages

1. **Build** — npm install and Docker image creation
2. **Test** — Jest unit and integration tests with coverage
3. **Code Quality** — SonarQube static analysis
4. **Security** — Trivy vulnerability scanning
5. **Deploy** — Staging deployment on port 3000
6. **Release** — Production deployment on port 3001 with Git tag
7. **Monitoring** — Prometheus and Grafana health verification
