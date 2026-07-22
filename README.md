# Optare Architecture

Optare follows a modern three-tier architecture consisting of a React-based frontend, a Spring Boot backend, and a PostgreSQL database.

---

## Interface Preview

### Landing Page
![Landing Page](./public/preview/landing-page.png)

---

### Personalized Feed
![Personalized Feed](./public/preview/personalized-feed.png)

---

### Discover Topics
![Discover Topics](./public/preview/discover-topics.png)

---

### Search & Articles
![Search Articles](./public/preview/search-articles.png)

---

### Videos & Discussions Search
![Videos & Discussions](./public/preview/search-videos-discussions.png)

---

## Frontend Layer

* React + TanStack Start
* TypeScript
* Tailwind CSS
* Cloudflare Workers deployment
* Responsive user interface
* JWT-based authentication handling

## Backend Layer

* Spring Boot REST API
* JWT Authentication & Authorization
* Recommendation Engine
* Search Service
* User Interaction Tracking
* Content Aggregation Logic

## Data Layer

* PostgreSQL (Supabase)
* User Profiles
* Interests
* Content Metadata
* Bookmarks
* Interaction History

## External Integrations

* YouTube Data API
* Hacker News
* Dev.to
* Web Articles / RSS Sources

## Recommendation Flow

User Activity
→ Interest Profile
→ Recommendation Engine
→ Ranking & Filtering
→ Personalized Feed

## Deployment

Frontend:
Cloudflare Workers

Backend:
Render

Database:
Supabase PostgreSQL

Authentication:
JWT Tokens
