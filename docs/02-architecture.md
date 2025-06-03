
# System-Architektur

## Architektur-Übersicht

```mermaid
graph TB
    subgraph "Frontend (React)"
        UI[User Interface]
        Chat[Chat Interface]
        Offers[Offers Management]
        Booking[Appointment Booking]
        Auth[Authentication]
    end
    
    subgraph "Supabase Backend"
        EdgeFn[Edge Functions]
        DB[(PostgreSQL)]
        AuthSvc[Auth Service]
        Storage[File Storage]
    end
    
    subgraph "External APIs"
        AI[AI Providers<br/>OpenAI/Anthropic/Gemini]
        Email[Resend Email API]
        PDF[PDF Generation]
    end
    
    UI --> Chat
    UI --> Offers
    UI --> Booking
    UI --> Auth
    
    Chat --> EdgeFn
    Offers --> DB
    Booking --> DB
    Auth --> AuthSvc
    
    EdgeFn --> AI
    EdgeFn --> Email
    EdgeFn --> DB
    
    Offers --> PDF
    
    style UI fill:#e1f5fe
    style EdgeFn fill:#f3e5f5
    style DB fill:#e8f5e8
    style AI fill:#fff3e0
```

## Technologie-Stack Details

### Frontend-Layer
```mermaid
graph LR
    subgraph "Frontend Technologies"
        React[React 18]
        TS[TypeScript]
        Tailwind[Tailwind CSS]
        Shadcn[shadcn/ui]
        Router[React Router]
        Query[TanStack Query]
    end
    
    React --> TS
    TS --> Tailwind
    Tailwind --> Shadcn
    React --> Router
    React --> Query
```

**Komponenten:**
- **React 18**: Moderne UI-Framework mit Hooks und Context
- **TypeScript**: Typsicherheit und bessere Entwicklererfahrung  
- **Tailwind CSS**: Utility-first CSS Framework
- **shadcn/ui**: Wiederverwendbare UI-Komponenten
- **React Router**: Client-side Routing
- **TanStack Query**: Server State Management

### Backend-Layer (Supabase)
```mermaid
graph TB
    subgraph "Supabase Services"
        Auth[Authentication<br/>JWT + RLS]
        DB[PostgreSQL<br/>Database]
        Edge[Edge Functions<br/>Deno Runtime]
        RT[Realtime<br/>WebSockets]
    end
    
    subgraph "Database Tables"
        Users[auth.users]
        Offers[saved_offers]
        Convs[chat_conversations]
        Appts[appointments]
        KB[knowledge_base]
        AI_Config[ai_service_config]
    end
    
    Auth --> Users
    DB --> Offers
    DB --> Convs
    DB --> Appts
    DB --> KB
    DB --> AI_Config
    
    Edge --> DB
    Edge --> Auth
```

### Datenfluss-Architektur
```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Supabase
    participant EdgeFn
    participant AI_API
    
    User->>Frontend: Startet Chat
    Frontend->>Supabase: Lädt Conversation
    Frontend->>EdgeFn: Sendet Message
    EdgeFn->>AI_API: KI-Anfrage
    AI_API->>EdgeFn: KI-Antwort + Angebot
    EdgeFn->>Frontend: Verarbeitete Antwort
    Frontend->>Supabase: Speichert Conversation
    Frontend->>User: Zeigt Angebot an
```

## Sicherheitsarchitektur

### Row Level Security (RLS)
```mermaid
graph TD
    subgraph "RLS Policies"
        UserData[Benutzerdaten<br/>user_id = auth.uid()]
        Offers[Angebote<br/>user_id = auth.uid()]
        Conversations[Gespräche<br/>user_id = auth.uid()]
        Appointments[Termine<br/>user_id = auth.uid()]
    end
    
    subgraph "Public Data"
        Knowledge[Knowledge Base<br/>öffentlich lesbar]
        AIConfig[AI Config<br/>nur Admin]
    end
    
    Auth[Supabase Auth] --> UserData
    Auth --> Offers
    Auth --> Conversations
    Auth --> Appointments
```

### API-Sicherheit
- **JWT-Token**: Automatische Authentifizierung über Supabase
- **CORS-Header**: Konfiguriert für Web-Zugriff
- **API-Key Management**: Sichere Speicherung in Supabase Secrets
- **Rate Limiting**: Über Supabase Edge Functions

## Deployment-Architektur
```mermaid
graph TB
    subgraph "Lovable Platform"
        Build[Build Process]
        CDN[Global CDN]
        Domain[Custom Domain]
    end
    
    subgraph "Supabase Cloud"
        DB_Prod[(Production DB)]
        Edge_Prod[Edge Functions]
        Auth_Prod[Auth Service]
    end
    
    subgraph "External Services"
        Resend[Resend Email]
        OpenAI[OpenAI API]
    end
    
    Build --> CDN
    CDN --> Domain
    CDN --> DB_Prod
    CDN --> Edge_Prod
    CDN --> Auth_Prod
    
    Edge_Prod --> Resend
    Edge_Prod --> OpenAI
```

## Performance-Optimierungen

### Frontend
- **Code Splitting**: Route-basiert mit React.lazy()
- **Memoization**: React.memo für schwere Komponenten
- **Virtual Scrolling**: Für große Listen (Nachrichten)
- **Image Optimization**: Lazy Loading und WebP

### Backend
- **Database Indexing**: Optimierte Queries mit Indizes
- **Connection Pooling**: Automatisch über Supabase
- **Caching**: Browser-Cache für statische Assets
- **Edge Computing**: Globale Verteilung über Supabase

## Skalierbarkeits-Überlegungen

### Horizontal Scaling
- **Stateless Frontend**: Einfache CDN-Verteilung
- **Managed Database**: Automatisches Scaling über Supabase
- **Edge Functions**: Serverless mit automatischem Scaling

### Monitoring & Observability
- **Error Tracking**: Console Logs und Supabase Analytics
- **Performance Monitoring**: Core Web Vitals
- **Database Monitoring**: Supabase Dashboard
- **API Monitoring**: Edge Function Logs

## Nächste Architektur-Schritte

1. 📊 [Datenbank-Design](./05-database.md) verstehen
2. 🔌 [API-Dokumentation](./06-api.md) studieren
3. 🚀 [Deployment-Guide](./07-deployment.md) befolgen
