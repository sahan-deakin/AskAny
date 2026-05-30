# AskAny 🙋

> A student help forum API — ask anything, answer anything.

AskAny is a REST API where students can post questions and others can answer via comments. Built with Node.js and designed for a full DevOps CI/CD pipeline using Jenkins.

---

## Features
- 🔐 User registration and JWT login
- 📝 Create, view, edit, delete posts (owner only)
- 💬 Comment on any post (authenticated users)
- 👀 Public viewing of all posts and comments
- ❤️ Health check endpoint for monitoring

---

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 18 |
| Framework | Express.js |
| Database | SQLite (better-sqlite3) |
| Auth | JWT + bcryptjs |
| Container | Docker |
| CI/CD | Jenkins |
| Code Quality | SonarQube |
| Security | Trivy |
| Monitoring | Prometheus + Grafana |

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login, get JWT token |

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

## Docker
```bash
docker build -t askany .
docker-compose up -d        # Staging (port 3000)
```

---

## Pipeline Stages
1. **Build** — npm install + Docker image build
2. **Test** — Jest unit + integration tests with coverage
3. **Code Quality** — SonarQube static analysis
4. **Security** — Trivy vulnerability scanning
5. **Deploy** — Staging deployment (port 3000)
6. **Release** — Production deployment (port 3001)
7. **Monitoring** — Prometheus + Grafana dashboards

---

## Infrastructure Setup
```bash
cd jenkins-setup
docker-compose up -d
```
Then visit http://localhost:8080 to set up Jenkins.
