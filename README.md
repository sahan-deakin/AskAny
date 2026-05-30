# AskAny 🙋

> A student help forum API — ask anything, answer anything.

AskAny is a REST API where students can post questions and others can answer via comments.

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 18 |
| Framework | Express.js |
| Storage | In-memory JS store |
| Auth | JWT + bcryptjs |
| Container | Docker |
| CI/CD | Jenkins |
| Code Quality | SonarQube |
| Security | Trivy |
| Monitoring | Prometheus + Grafana |

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
| GET | /health | Health check |

## Running Locally
```bash
npm install
npm start        # http://localhost:3000
npm test         # Run tests with coverage
```

## Pipeline Stages
1. Build — npm ci + Docker image
2. Test — Jest unit + integration tests
3. Code Quality — SonarQube
4. Security — Trivy scan
5. Deploy — Staging (port 3000)
6. Release — Production (port 3001)
7. Monitoring — Prometheus + Grafana
