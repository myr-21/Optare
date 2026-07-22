# Optare Architecture Documentation

This document provides a comprehensive technical overview of **Optare**, a minimalist content discovery platform that aggregates feeds from multiple platforms (Hacker News, Dev.to, YouTube, RSS feeds) into a single personalized reader.

---

## 1. High-Level Architecture Diagram

The system follows a classic decoupled client-server architecture with an asynchronous background ingestion engine and a PostgreSQL relational database.

```mermaid
graph TD
    User([User / Browser])
    
    subgraph Frontend [Frontend Host - Cloudflare Workers / Pages]
        UI[TanStack Start Web App]
        State[React Query & LocalStorage]
    end
    
    subgraph Backend [Backend Host - Render Docker]
        API[Spring Boot REST Controllers]
        Security[Spring Security & JWT Filter]
        RecEngine[Recommendation & Search Service]
        Ingest[Ingestion Schedulers]
    end
    
    subgraph Database [Database Host - Supabase]
        DB[(PostgreSQL Database)]
    end
    
    subgraph Providers [External Content Providers]
        YT[YouTube Data API v3]
        HN[Hacker News Firebase API]
        DevTo[Dev.to REST API]
        RSS[Generic RSS Feeds]
        Reddit[Reddit API - Stubbed / Future]
    end

    User <-->|HTTPS / UI| UI
    UI <-->|JSON API / JWT Bearer| Security
    Security <--> API
    API <--> RecEngine
    RecEngine <--> DB
    Ingest <--> DB
    Ingest -->|Scheduled Pulls| Providers
```

---

## 2. Detailed Architecture Diagram

A more detailed view showing the actual core classes, client modules, and data repositories.

```mermaid
graph TB
    subgraph Client [Frontend App]
        Router[TanStack Router]
        APIClient[api.ts - Fetch API]
        Theme[theme.tsx - ThemeProvider]
        
        subgraph Components
            Layout[AppLayout]
            Sidebar[Sidebar Component]
            Feed[app.index.tsx]
            Discover[app.discover.tsx]
            Saved[app.saved.tsx]
            Settings[app.settings.tsx]
            RecCard[RecCard Component]
        end
    end

    subgraph Server [Spring Boot Backend]
        subgraph Config
            SecConfig[SecurityConfig]
            JwtFilter[JwtAuthenticationFilter]
            JwtServ[JwtService]
        end

        subgraph Controllers
            AuthController[AuthController]
            FeedController[FeedController]
            InterController[InteractionController]
            SearchController[SearchController]
            InterestsController[UserInterestController]
            ClusterController[TopicClusterController]
        end

        subgraph Services
            UserService[UserService]
            InteractionService[InteractionService]
            RecService[RecommendationService]
            ClusterService[TopicClusterService]
            InterestService[UserInterestService]
        end

        subgraph Repositories
            UserRepo[UserRepository]
            InterRepo[UserInteractionRepository]
            InterestRepo[UserInterestRepository]
            ContentRepo[ContentItemRepository / CustomImpl]
        end
        
        subgraph Ingestion Engine
            Scheduler[IngestionScheduler]
            HNFetcher[HackerNewsFetcher]
            DevToFetcher[DevToFetcher]
            YTFetcher[YoutubeFetcher]
            RssFetcher[RssFetcher]
            RedditFetcher[RedditFetcher - Disabled MVP]
        end
    end

    subgraph Data [PostgreSQL DB]
        TUser[(users)]
        TInteractions[(user_interactions)]
        TInterests[(user_interests)]
        TContent[(content_items)]
    end

    %% Relations
    Router --> APIClient
    APIClient -->|REST requests| JwtFilter
    JwtFilter --> JwtServ
    JwtFilter --> Controllers
    
    AuthController --> UserService
    FeedController --> RecService
    InterController --> InteractionService
    SearchController --> ContentRepo
    InterestsController --> InterestService
    ClusterController --> ClusterService
    
    UserService --> UserRepo
    InteractionService --> InterRepo
    RecService --> InterestRepo
    RecService --> InterRepo
    RecService --> ContentRepo
    InterestService --> InterestRepo
    ClusterService --> ContentRepo
    
    Scheduler --> HNFetcher & DevToFetcher & YTFetcher & RssFetcher & RedditFetcher
    HNFetcher & DevToFetcher & YTFetcher & RssFetcher & RedditFetcher -->|Saves Ingested Data| ContentRepo
    
    UserRepo --> TUser
    InterRepo --> TInteractions
    InterestRepo --> TInterests
    ContentRepo --> TContent
```

---

## 3. Deployment Architecture

The deployment architecture is optimized for performance, scalability, and minimal server load.

```mermaid
graph TD
    User([User Browser])
    CF[Cloudflare CDN Edge Network]
    
    subgraph Cloud [Cloudflare Workers / Pages Hosting]
        FE[TanStack Start SSR App / Static Assets]
    end
    
    subgraph Render [Render PaaS]
        BE[Docker Container running Java 21 Temurin JRE / Spring Boot]
    end
    
    subgraph Supabase [Supabase DB Hosting]
        DB[(PostgreSQL 15+ Managed DB Instance)]
    end
    
    subgraph External [External Internet APIs]
        APIs[YouTube / HackerNews / Dev.to / RSS feeds]
    end

    User <-->|HTTPS| CF
    CF <--> FE
    FE <-->|HTTPS / JSON REST API| BE
    BE <-->|JDBC PostgreSQL Connection| DB
    BE -->|Outbound HTTPS Calls| APIs
```

---

## 4. Data Flow Diagram

Shows how content flows from external providers into the system, gets processed, and is served back to the user.

```mermaid
graph LR
    Ext[External APIs] -->|Scheduled Pull - 45 mins| Fetchers[Fetcher Engines]
    Fetchers -->|Unique Check via Source & ExternalId| Save[saveOrUpdateItems]
    Save -->|INSERT/UPDATE| DB[(PostgreSQL content_items)]
    
    DB -->|Fetch Candidates| Rec[Recommendation Service]
    UserProfile[User Profile & Interactions] -->|Exclusions & Category Weights| Rec
    
    Rec -->|1. Filter out DISMISS/VIEW| Filter[Filtering Layer]
    Filter -->|2. Compute Score: Interest + Freshness + Engagement + Similarity + Diversity| Rank[Ranking Layer]
    Rank -->|Sort DESC| Controller[Feed Controller]
    Controller -->|PageImpl JSON| Client[Vite Frontend Client]
    Client -->|Render HTML| User([End User])
```

---

## 5. Authentication Flow Diagram

Supports both JWT Authenticated Users and an Unauthenticated Guest Mode.

```mermaid
graph TD
    Start[User Visits Page] --> Path{Has Token stored in LocalStorage?}
    
    %% Guest path
    Path -->|No| Guest[Guest Mode Feed]
    Guest -->|Browse Feed / Search| GuestFeed[Renders Popular Content]
    GuestFeed -->|Click Like / Bookmark / Settings| AuthGate[Event: trigger-auth-gate]
    AuthGate -->|Display dialog| JoinModal[Join Optare Dialog]
    JoinModal -->|Click Sign Up / Login| AuthPage[Register / Login Pages]
    
    %% Sign up / Login path
    Path -->|Yes| FetchFeed[Authenticated API Requests]
    AuthPage -->|Submit Credentials| ApiAuth[Backend /api/auth/register or /login]
    ApiAuth -->|Validate & Hashing via BCrypt| DB{User Exists?}
    DB -->|Valid Credentials| GenToken[JWT Generated via JwtService]
    GenToken -->|AuthResponse JSON| StoreToken[Stored in LocalStorage: token & user]
    StoreToken --> FetchFeed
    
    FetchFeed -->|Include Token in Authorization: Bearer Header| Valid{Token Valid?}
    Valid -->|Yes| Service[Access Saved, Settings, Analytics, Personalization]
    Valid -->|No / Expired| HandleErr[Clears localStorage]
    HandleErr --> Guest
    
    %% Logout path
    Service -->|Click Logout| DelToken[Remove token & user from LocalStorage]
    DelToken --> Guest
```

---

## 6. Recommendation Flow Diagram

The backend scores and ranks feed elements on-the-fly when a request is received.

```mermaid
graph TD
    Request[Fetch Feed Request - User ID] --> UserData[Load User Interests, Last Viewed Sources, Seen/Dismissed IDs]
    UserData --> QueryCandidates[Fetch Content Items from DB]
    
    QueryCandidates --> Loop[For Each Content Item...]
    
    Loop --> SeenCheck{Is in Dismissed/Seen Set?}
    SeenCheck -->|Yes| Exclude[Exclude Item]
    
    SeenCheck -->|No| IgnoreCheck{Category Weight is IGNORE?}
    IgnoreCheck -->|Yes| Exclude
    
    IgnoreCheck -->|No| ScoreInterest[Calculate Interest Weight Score: HIGH: 100, MEDIUM: 20, LOW: 10, None: 0]
    ScoreInterest --> ScoreFreshness[Calculate Freshness Score: <6h: 30, <24h: 20, <72h: 10, else: 0]
    ScoreFreshness --> ScoreEngage[Calculate Engagement Score: Database Score * 0.2]
    ScoreEngage --> ScoreSimilarity[Calculate Saved Similarity: +15 if category matches user bookmarks]
    ScoreSimilarity --> ScoreDiversity[Calculate Diversity Bonus: +10 if source underrepresented in last 20 views]
    
    ScoreDiversity --> SumScores[Final Score = Sum of Scores]
    SumScores --> BuildExplanations[Compile Reasons: e.g., 'Matches your Programming interest']
    
    BuildExplanations --> Sort[Sort All Candidates by Final Score DESC]
    Sort --> Paginate[In-Memory Pagination Pageable Offset]
    Paginate --> Response[Return PageImpl ContentItemDto JSON]
```

---

## 7. Search Flow Diagram

Search relies on PostgreSQL database indexing and native text search components.

```mermaid
graph TD
    Input[User enters text in Search Input] --> Route[Navigate to /app/discover?q=query]
    Route --> API[API Client: searchContent query]
    API -->|GET /api/search?q=query| Controller[SearchController]
    
    Controller --> CustomRepo[ContentItemRepositoryCustomImpl]
    
    CustomRepo --> FTS[PostgreSQL Full-Text Search]
    FTS -->|Match search_vector @@ plainto_tsquery| QueryMatch[Filter content_items]
    FTS -->|Rank via ts_rank_cd| Ranking[Calculate Relevance Score]
    FTS -->|Highlight via ts_headline| Highlights[Generate Title Highlights]
    
    Ranking & Highlights --> Paginate[Paginate DB query results]
    Paginate --> Map[Group by ContentType: VIDEO, DISCUSSION, ARTICLE]
    Map --> Send[Return SearchResponse JSON]
    
    Send --> Render[Render SearchResultItem cards on Discover Feed]
```

---

## 8. Backend Layer Diagram

Optare follows a standard layered architecture. The key files in each layer are documented below.

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Controller Layer                              │
│                                                                        │
│ - AuthController.java             - FeedController.java                │
│ - InteractionController.java      - SearchController.java              │
│ - UserInterestController.java     - TopicClusterController.java        │
│ - AnalyticsController.java                                             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ (Drives REST APIs)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                            Service Layer                               │
│                                                                        │
│ - UserService.java                - InteractionService.java            │
│ - TopicClusterService.java        - UserInterestService.java           │
│ - AnalyticsService.java                                                │
│ - IngestionScheduler.java         - ContentFetcher (Interface)         │
│ - HackerNewsFetcher.java          - DevToFetcher.java                  │
│ - YoutubeFetcher.java             - RssFetcher.java                    │
│ - RedditFetcher.java (MVP Stub)                                        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ (Business Logic & Scheduling)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Recommendation Layer                            │
│                                                                        │
│ - RecommendationService.java (Core logic & mathematical scoring)       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ (Uses JPA Entities)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         Repository Layer                               │
│                                                                        │
│ - UserRepository.java             - UserInteractionRepository.java     │
│ - UserInterestRepository.java     - ContentItemRepository.java         │
│ - ContentItemRepositoryCustom.java- ContentItemRepositoryCustomImpl.java│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ (JDBC / Hibernate Queries)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         PostgreSQL Database                            │
│                                                                        │
│ - users                           - user_interests                     │
│ - content_items                   - user_interactions                  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Frontend Component Hierarchy

The frontend is structured with file-based routing and a shared application layout shell containing a collapsible sidebar and dynamic search header.

```
Landing (index.tsx)
  └── Signup Page (signup.tsx)
  └── Login Page (login.tsx)
  └── App Shell Route (/app) (app.tsx)
        └── AppLayout (app-layout.tsx)
              ├── Sidebar Navigation
              │     ├── Brand Logo (logo.tsx)
              │     ├── Navigation Links (Home, Discover, Saved, Settings)
              │     └── Account Dropdown (User Profile / Guest Mode)
              ├── Header
              │     ├── Search Input Form (Triggers Discover Search)
              │     └── Auth Actions (Log In/Sign Up buttons if guest)
              ├── Pages (Dynamic Router Outlets)
              │     ├── Feed / Home Route (app.index.tsx)
              │     │     ├── Interest Tags Carousel
              │     │     └── Recommendation Feed Grid
              │     │           └── RecCard / RecCardSkeleton (rec-card.tsx)
              │     ├── Discover / Search Route (app.discover.tsx)
              │     │     ├── Search Results Grouping (Video, Discussion, Article)
              │     │     └── RecCard Grids
              │     ├── Saved Collections Route (app.saved.tsx)
              │     │     ├── Saved / Bookmark Folders List
              │     │     └── RecCard Grids
              │     ├── Collections Route (app.collections.tsx)
              │     │     └── Collection Feeds
              │     ├── Trending Topics Route (app.trending.tsx)
              │     │     └── Topic Clusters
              │     ├── Analytics Dashboard Route (app.analytics.tsx)
              │     │     ├── Activity Heatmap Chart (Recharts)
              │     │     └── Feed Diversity Breakdown Radar/Pie charts
              │     └── Settings Route (app.settings.tsx)
              │           ├── Platform Connections Card (localStorage state)
              │           ├── Interest Categories Weight Card
              │           └── Profile details card
              └── Shared Dialogs
                    └── Auth Gate Modal (Dialog, DialogContent, DialogHeader)
```

---

## 10. Database Relationship Overview

The database is built on PostgreSQL with Flyway migration management (`V1__init.sql` and `V2__improve_search_ranking.sql`).

```mermaid
erDiagram
    users {
        UUID id PK
        VARCHAR username UK
        VARCHAR email UK
        VARCHAR password_hash
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    user_interests {
        UUID id PK
        UUID user_id FK "REFERENCES users(id) ON DELETE CASCADE"
        VARCHAR category
        VARCHAR weight "HIGH, MEDIUM, LOW, IGNORE"
        TIMESTAMP created_at
    }

    content_items {
        UUID id PK
        VARCHAR external_id "UK combined with source"
        VARCHAR source "YOUTUBE, DEVTO, REDDIT, ARTICLE"
        VARCHAR content_type "VIDEO, DISCUSSION, ARTICLE"
        TEXT title
        TEXT description
        TEXT url
        TEXT thumbnail
        VARCHAR author
        VARCHAR category
        TEXT_ARRAY tags
        TIMESTAMP published_date
        FLOAT engagement_score
        TSVECTOR search_vector "Weighted GIN Index for FTS"
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    user_interactions {
        UUID id PK
        UUID user_id FK "REFERENCES users(id) ON DELETE CASCADE"
        UUID content_id FK "REFERENCES content_items(id) ON DELETE CASCADE"
        VARCHAR interaction "VIEW, BOOKMARK, FAVORITE, DISMISS, WATCH_LATER, READ_LATER"
        VARCHAR collection_name
        TIMESTAMP created_at
    }

    users ||--o{ user_interests : "defines preferences"
    users ||--o{ user_interactions : "performs actions"
    content_items ||--o{ user_interactions : "receives actions"
```

---

## 11. Sequence Diagrams

### 11.1 User Login Flow
```mermaid
sequenceDiagram
    autonumber
    actor User
    participant FE as Frontend Client
    participant BE as Spring Boot Backend
    participant DB as PostgreSQL DB

    User->>FE: Enters email & password
    FE->>BE: POST /api/auth/login
    BE->>DB: Query user by email
    DB-->>BE: Returns User entity (with Password Hash)
    BE->>BE: Verify password using BCrypt
    alt Invalid Credentials
        BE-->>FE: HTTP 401 Unauthorized / bad request
        FE-->>User: Show login error message
    else Valid Credentials
        BE->>BE: Generate JWT token containing claims (id, username, email)
        BE-->>FE: Return AuthResponse (token & user profile info)
        FE->>FE: Save JWT and user details in LocalStorage
        FE->>FE: Route user to '/app'
        FE-->>User: Displays Dashboard & Personalized Feed
    end
```

### 11.2 User Registration Flow
```mermaid
sequenceDiagram
    autonumber
    actor User
    participant FE as Frontend Client
    participant BE as Spring Boot Backend
    participant DB as PostgreSQL DB

    User->>FE: Enters username, email & password
    FE->>BE: POST /api/auth/register
    BE->>DB: Check if email/username already exists
    DB-->>BE: Return boolean (false)
    BE->>BE: Encrypt password with BCrypt
    BE->>DB: Save new User entity
    DB-->>BE: Saved User
    BE->>BE: Generate JWT Token (claims: id, username, email)
    BE-->>FE: Return AuthResponse (token & user profile info)
    FE->>FE: Save JWT and user details in LocalStorage
    FE->>FE: Redirect to /onboarding (or /app)
    FE-->>User: Displays user setup / feed
```

### 11.3 Load Recommendations Flow
```mermaid
sequenceDiagram
    autonumber
    actor User
    participant FE as Frontend Client
    participant BE as Spring Boot Backend
    participant RecServ as RecommendationService
    participant DB as PostgreSQL DB

    User->>FE: Opens Home page (/app)
    FE->>BE: GET /api/feed (Authorization: Bearer token)
    BE->>BE: Extract user principal from token
    BE->>RecServ: getPersonalizedFeed(userId, category, source, pageable)
    
    RecServ->>DB: Get user interests (UserInterestRepository)
    DB-->>RecServ: List of categories and weights (HIGH, MEDIUM, LOW, IGNORE)
    
    RecServ->>DB: Get user's seen/dismissed content IDs (UserInteractionRepository)
    DB-->>RecServ: List of Content IDs (type VIEW/DISMISS)
    
    RecServ->>DB: Get last 20 viewed sources (UserInteractionRepository)
    DB-->>RecServ: List of Sources
    
    RecServ->>DB: Get candidate ContentItems (ContentItemRepository)
    DB-->>RecServ: List of ContentItem entities
    
    RecServ->>RecServ: 1. Filter out seen/dismissed items & IGNORE categories
    RecServ->>RecServ: 2. Compute mathematical scores (Interest + Freshness + Engagement + Similarity + Diversity)
    RecServ->>RecServ: 3. Sort by score descending & Paginate
    
    RecServ-->>BE: Returns Page<ContentItemDto>
    BE-->>FE: Return HTTP 200 OK with Page JSON
    FE->>FE: Update QueryCache (React Query)
    FE-->>User: Renders personalized card grid with relevance explanation
```

### 11.4 Search Content Flow
```mermaid
sequenceDiagram
    autonumber
    actor User
    participant FE as Frontend Client
    participant BE as Spring Boot Backend
    participant Repo as ContentItemRepositoryCustomImpl
    participant DB as PostgreSQL DB

    User->>FE: Types "Artificial Intelligence" in search bar & submits
    FE->>FE: Navigates to /app/discover?q=Artificial+Intelligence
    FE->>BE: GET /api/search?q=Artificial+Intelligence (with Auth Header)
    BE->>Repo: search(q, source, category, type, dateFrom, dateTo, sortBy, pageable)
    
    Repo->>DB: Native Query: search @@ plainto_tsquery, ts_headline, ts_rank_cd
    Note over DB: Matches Gin index on search_vector, highlights matched title text, ranks results
    DB-->>Repo: Returns matching content row array (List<Object[]>)
    
    Repo->>Repo: Map SQL rows to SearchResultDto List
    Repo-->>BE: Returns Page<SearchResultDto>
    BE->>BE: Group results into Video, Discussion, Article based on contentType
    BE-->>FE: Return HTTP 200 OK (SearchResponse json)
    FE-->>User: Renders search results grouped by media type with text highlights
```

### 11.5 Bookmark Content Flow
```mermaid
sequenceDiagram
    autonumber
    actor User
    participant FE as Frontend Client
    participant BE as Spring Boot Backend
    participant DB as PostgreSQL DB

    User->>FE: Clicks Bookmark icon on a card
    alt User is Guest (No Local Token)
        FE->>FE: Dispatch "trigger-auth-gate" event
        FE-->>User: Opens Sign Up / Login Dialog Modal
    else Authenticated User
        FE->>FE: Set state locally (saved = true)
        FE->>BE: POST /api/interactions (Body: contentId, interaction="BOOKMARK", collectionName=null)
        BE->>DB: Upsert UserInteraction (type=BOOKMARK)
        DB-->>BE: Done
        BE-->>FE: HTTP 200 OK
        FE-->>User: Shows active Bookmark icon (filled)
    end
```

### 11.6 Guest Browsing Flow
```mermaid
sequenceDiagram
    autonumber
    actor Guest
    participant FE as Frontend Client
    participant BE as Spring Boot Backend
    participant DB as PostgreSQL DB

    Guest->>FE: Visits platform without logging in (/app)
    FE->>BE: GET /api/feed (No Authorization header)
    BE->>BE: Authenticated Principal is null (Guest mode)
    BE->>DB: fetch all ContentItem entities (findAll)
    DB-->>BE: Content items list
    BE->>BE: Apply generic mapping, default explanations ('Trending', 'Popular')
    BE->>BE: Sort by engagement score & date DESC
    BE->>BE: Slice page results
    BE-->>FE: Return Page<ContentItemDto>
    FE-->>Guest: Renders feed cards
    
    Guest->>FE: Clicks Thumbs Up / Down / Bookmark
    FE->>FE: Detects no token stored
    FE->>FE: Dispatches "trigger-auth-gate" event
    FE-->>Guest: Displays "Join Optare" Modal popup
```

---

## 12. Technology Stack

| Category | Component / Technology | Purpose |
|---|---|---|
| **Frontend Framework** | React 19 / TanStack Start | Core UI framework & server-side rendering support |
| **Routing** | TanStack Router | File-based client-side routing & search parameter validation |
| **State Management** | TanStack React Query (v5) | Server state management, cache management, & background updates |
| **Theme & UI Elements**| Radix UI primitives & Lucide Icons | Accessible interface controls, icons, & dashboard layouts |
| **Styling** | Tailwind CSS v4 & Custom CSS | Responsive layouts, custom fonts, dark/light modes, & animations |
| **Language** | TypeScript (Frontend) & Java 21 (Backend)| Safe type interfaces & modern backend syntax |
| **Backend Core** | Spring Boot 3.x (with Web, JPA, Security, Actuator)| REST controller mapping, dependencies, scheduler, & system APIs |
| **Security** | Spring Security & JWT Token Auth | Stateless API endpoint protection, password salting |
| **Database** | PostgreSQL (v15+) | Data persistence, full-text indexing, & ranking triggers |
| **Flyway** | flyway-core | Direct database schema migration version tracking |
| **Build Tools** | Vite 7 & Maven | Compilation, server bundling, & backend package management |
| **Hosting** | Cloudflare Workers & Render Docker | Frontend serverless edge hosting & backend container web service |

---

## 13. Draw.io Integration and Export Guide

Mermaid is natively supported inside Draw.io. You can import any of the diagrams above directly using the following steps:

1. Open a new or existing diagram in **draw.io** (or app.diagrams.net).
2. Click the **`+` (Insert)** button on the top toolbar or select `Arrange` > `Insert`.
3. Select **Advanced** > **Mermaid**.
4. Copy and paste the Mermaid code block of any diagram from this document into the text area.
5. Click **Insert** to render the vector diagram directly onto your canvas.
