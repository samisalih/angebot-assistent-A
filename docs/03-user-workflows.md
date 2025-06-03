
# Benutzer-Workflows

## 1. Chat-zu-Angebot Workflow

Der Hauptworkflow des Systems führt Benutzer von einem initialen Chat zu einem fertigen Angebot.

```mermaid
graph TD
    A[Benutzer startet Chat] --> B{Authentifiziert?}
    B -->|Nein| C[Gastmodus - Warnung anzeigen]
    B -->|Ja| D[Chat laden/erstellen]
    
    C --> E[Chat beginnen]
    D --> E
    
    E --> F[Nachricht senden]
    F --> G[KI-Antwort erhalten]
    G --> H{Genug Informationen?}
    
    H -->|Nein| I[Weitere Fragen stellen]
    I --> F
    
    H -->|Ja| J[Angebot explizit anfordern]
    J --> K[KI generiert Angebot]
    K --> L[Angebot anzeigen]
    
    L --> M[Angebot-Aktionen verfügbar]
    M --> N[PDF Download]
    M --> O[Angebot speichern]
    M --> P[Termin vereinbaren]
    
    style A fill:#e1f5fe
    style K fill:#f3e5f5
    style L fill:#e8f5e8
```

### Workflow-Details

#### Phase 1: Chat-Initialisierung
```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Auth
    participant DB
    
    User->>Frontend: Öffnet Chat-Interface
    Frontend->>Auth: Prüft Authentifizierung
    
    alt Benutzer angemeldet
        Auth->>Frontend: Authentifiziert
        Frontend->>DB: Lädt bestehende Conversation
        DB->>Frontend: Conversation-Daten
        Frontend->>User: Chat mit Historie
    else Benutzer nicht angemeldet
        Auth->>Frontend: Nicht authentifiziert
        Frontend->>User: Gastmodus-Warnung
        Frontend->>User: Chat ohne Speicherung
    end
```

#### Phase 2: Angebotsgenerierung
```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant EdgeFn
    participant AI
    participant KnowledgeBase
    
    User->>Frontend: "Erstelle mir ein Angebot"
    Frontend->>EdgeFn: Chat-Historie + Anfrage
    EdgeFn->>KnowledgeBase: Lädt Unternehmenswissen
    EdgeFn->>AI: Generiert Angebot
    AI->>EdgeFn: Strukturiertes Angebot
    EdgeFn->>Frontend: Angebot + Chat-Antwort
    Frontend->>User: Angebot anzeigen
```

## 2. Angebots-Management Workflow

```mermaid
graph TD
    A[Angebot generiert] --> B[Angebot-Display]
    B --> C[Benutzer-Aktionen]
    
    C --> D[PDF herunterladen]
    C --> E[Angebot speichern]
    C --> F[Termin vereinbaren]
    C --> G[Angebot teilen]
    
    D --> H[PDF generieren]
    H --> I[Download starten]
    
    E --> J{Authentifiziert?}
    J -->|Nein| K[Auth-Dialog öffnen]
    J -->|Ja| L[In Datenbank speichern]
    K --> M[Nach Login speichern]
    L --> N[Bestätigung anzeigen]
    M --> N
    
    F --> O[Zur Terminbuchung]
    
    style B fill:#e1f5fe
    style N fill:#e8f5e8
    style O fill:#fff3e0
```

### Angebot-Speicherung Details
```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Auth
    participant DB
    
    User->>Frontend: Klickt "Angebot speichern"
    Frontend->>Auth: Prüft Authentifizierung
    
    alt Authentifiziert
        Frontend->>DB: Speichert Angebot
        DB->>Frontend: Bestätigung
        Frontend->>User: "Angebot gespeichert"
    else Nicht authentifiziert
        Frontend->>User: Auth-Dialog
        User->>Auth: Meldet sich an
        Auth->>Frontend: Authentifizierung erfolgreich
        Frontend->>DB: Speichert Angebot automatisch
        DB->>Frontend: Bestätigung
        Frontend->>User: "Angebot gespeichert"
    end
```

## 3. Terminbuchungs-Workflow

```mermaid
graph TD
    A[Termin vereinbaren] --> B{Authentifiziert?}
    B -->|Nein| C[Authentifizierung erforderlich]
    B -->|Ja| D{Angebot vorhanden?}
    
    C --> E[Login/Registrierung]
    E --> D
    
    D -->|Nein| F[Erst Angebot erstellen]
    D -->|Ja| G[Terminbuchungs-Interface]
    
    G --> H[Angebot auswählen]
    H --> I[Datum wählen]
    I --> J[Uhrzeit wählen]
    J --> K[Kundendaten eingeben]
    K --> L[Termin bestätigen]
    
    L --> M[Termin speichern]
    M --> N[E-Mail versenden]
    N --> O[Bestätigung anzeigen]
    
    F --> P[Zurück zum Chat]
    
    style G fill:#e1f5fe
    style O fill:#e8f5e8
```

### Detaillierter Buchungsprozess
```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant OfferService
    participant BookingService
    participant EmailService
    
    User->>Frontend: Öffnet Terminbuchung
    Frontend->>OfferService: Lädt verfügbare Angebote
    OfferService->>Frontend: Angebotsliste
    
    User->>Frontend: Wählt Angebot + Datum + Zeit
    User->>Frontend: Gibt Kontaktdaten ein
    
    Frontend->>BookingService: Erstellt Termin
    BookingService->>EmailService: Sendet Bestätigung
    
    par
        BookingService->>Frontend: Termin bestätigt
    and
        EmailService->>User: Bestätigungs-E-Mail
    end
    
    Frontend->>User: Erfolgsmeldung
```

## 4. Authentifizierungs-Workflow

```mermaid
graph TD
    A[Benutzer-Aktion erfordert Auth] --> B[Auth-Dialog öffnen]
    B --> C[Login/Register Tabs]
    
    C --> D[Bestehender Benutzer]
    C --> E[Neuer Benutzer]
    
    D --> F[E-Mail + Passwort eingeben]
    E --> G[Registrierungsdaten eingeben]
    
    F --> H[Login-Versuch]
    G --> I[Registrierungs-Versuch]
    
    H --> J{Login erfolgreich?}
    I --> K{Registrierung erfolgreich?}
    
    J -->|Ja| L[Authentifiziert]
    J -->|Nein| M[Fehlermeldung]
    K -->|Ja| N[E-Mail-Bestätigung erforderlich]
    K -->|Nein| O[Fehlermeldung]
    
    M --> F
    O --> G
    N --> P[E-Mail bestätigen]
    P --> L
    
    L --> Q[Ursprüngliche Aktion fortsetzen]
    
    style L fill:#e8f5e8
    style Q fill:#fff3e0
```

## 5. Admin-Workflow

```mermaid
graph TD
    A[Admin-Login] --> B[Admin-Dashboard]
    B --> C[AI-Service Konfiguration]
    B --> D[Knowledge Base Management]
    
    C --> E[Service hinzufügen/bearbeiten]
    E --> F[API-Keys konfigurieren]
    F --> G[Endpoints testen]
    
    D --> H[Artikel erstellen/bearbeiten]
    H --> I[Kategorien verwalten]
    I --> J[Inhalte publizieren]
    
    G --> K[Service aktivieren]
    J --> L[Knowledge Base aktualisieren]
    
    K --> M[System bereit]
    L --> M
    
    style B fill:#e1f5fe
    style M fill:#e8f5e8
```

## Workflow-Optimierungen

### Performance-Optimierungen
- **Lazy Loading**: Komponenten werden nur bei Bedarf geladen
- **Optimistic Updates**: UI aktualisiert sich vor Server-Bestätigung
- **Background Sync**: Daten werden im Hintergrund synchronisiert

### UX-Optimierungen
- **Progressive Disclosure**: Informationen werden schrittweise enthüllt
- **Smart Defaults**: Vorausgefüllte Formulare basierend auf Kontext
- **Error Recovery**: Klare Fehlermeldungen mit Lösungsvorschlägen

### Accessibility
- **Keyboard Navigation**: Vollständig über Tastatur bedienbar
- **Screen Reader Support**: ARIA-Labels und semantische HTML
- **High Contrast**: Unterstützung für hohen Kontrast

## Nächste Schritte

1. 🧩 [Komponenten-Dokumentation](./04-components.md) verstehen
2. 🗄️ [Datenbank-Design](./05-database.md) studieren
3. 🔧 [Entwickler-Leitfaden](./08-developer-guide.md) befolgen
