# 🏊 FTN - Plateforme de la Fédération Tunisienne de Natation

Plateforme web de gestion complète pour la **Fédération Tunisienne de Natation (FTN)**.
Solution ERP sportif modulaire inspirée de la plateforme **USASwimming**, développée avec
**Spring Boot** (backend), **Angular** (frontend) ---

## 📋 Table des matières

1. [Vue d'ensemble](#-vue-densemble)
2. [Stack technique](#-stack-technique)
3. [Modules fonctionnels](#-modules-fonctionnels)
4. [Architecture du projet](#-architecture-du-projet)
5. [Installation & démarrage](#-installation--démarrage)
6. [Conventions de nommage](#-conventions-de-nommage)
8. [Workflow Git](#-workflow-git)


---

## 🎯 Vue d'ensemble

La plateforme FTN permet la gestion complète :
- des **licenciés** (nageurs, coachs, clubs),
- des **compétitions** (inscriptions, calendrier, résultats),
- des **performances & classements** nationaux,
- des **analyses prédictives** (régression linéaire sur les chronos),
- de la **communication** (actualités, médias, espace athlète personnalisé).

---

## 🛠 Stack technique

| Couche | Technologie |
|---|---|
| **Backend** | Spring Boot 3.x, Java 17+, JPA/Hibernate |
| **Frontend** | Angular 17+, TypeScript, RxJS |
| **Base de données** | MySQL 8.x |
| **Analytics** | Python 3.11, FastAPI, scikit-learn |
| **Sécurité** | Spring Security + JWT |
| **Build** | Maven (backend), npm (frontend) |
| **Versioning** | Git + GitHub |

---

## 🧩 Modules fonctionnels

Le projet est découpé en **5 modules** développés en parallèle par l'équipe :



| # | Module | Responsabilité |
|---|---|---|
| **1** | Auth, Utilisateurs, Nageurs & Licences | Comptes, rôles, JWT, licences saisonnières |
| **2** | Clubs | CRUD clubs, annuaire public, carte interactive |
| **3** | Compétitions & Inscriptions | Calendrier, inscriptions en ligne, séries/heats |
| **4** | Résultats, Classements & Analyse | Chronos, PR, records nationaux, projections ML |
| **5** | Dashboard, Presse & Espace Athlète | KPIs, actualités, espace athlète personnalisé |

---

## 🏗 Architecture du projet

```
ftn/
├── ftn-backend/                     # Spring Boot API REST
│   ├── src/main/java/tn/federation/backend/
│   │   ├── BackendApplication.java
│   │   ├── entities/                # Entités JPA (partagées entre modules)
│   │   ├── dto/                     # Data Transfer Objects
│   │   ├── mapper/                  # Mappers Entity ↔ DTO
│   │   ├── repository/              # Interfaces JPA
│   │   ├── service/                 # Interfaces de service
│   │   │   └── impl/                # Implémentations
│   │   ├── controller/              # Contrôleurs REST
│   │   ├── config/                  # Configuration (Security, CORS, Swagger...)
│   │   ├── exception/               # Exceptions métier & handler global
│   │   └── client/                  # Clients HTTP externes (FastAPI, etc.)
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
│
├── ftn-frontend/                    # Application Angular
│   ├── src/app/
│   │   ├── core/                    # Services transverses, guards, interceptors
│   │   ├── shared/                  # Composants réutilisables
│   │   ├── features/                # Modules fonctionnels (1 par module métier)
│   │   │   ├── auth/
│   │   │   ├── clubs/
│   │   │   ├── competitions/
│   │   │   ├── performances/
│   │   │   └── dashboard/
│   │   └── models/                  # Interfaces TypeScript (DTOs)
│   └── package.json
│
├── ftn-analytics/                   # Microservice Python (Module 4)
│   ├── main.py                      # API FastAPI
│   ├── requirements.txt
│   └── Dockerfile
│
└── README.md
```

---

## 🚀 Installation & démarrage

### Prérequis
- **JDK 17+**
- **Maven 3.8+**
- **Node.js 18+** & npm
- **MySQL 8+**
- **Python 3.11+** (pour le microservice analytics)
- **Git**

### 1. Cloner le projet
```bash
git clone https://github.com/<org>/ftn.git
cd ftn
```

### 2. Base de données
```sql
CREATE DATABASE ftn_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Backend Spring Boot
```bash
cd ftn-backend
# Configurer src/main/resources/application.properties (username/password MySQL)
./mvnw spring-boot:run
```
➡ API disponible sur : **http://localhost:8080**

### 4. Frontend Angular
```bash
cd ftn-frontend
npm install
npm start
```
➡ Interface disponible sur : **http://localhost:4200**

### 5. Microservice Analytics
```bash
cd ftn-analytics
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
➡ Service disponible sur : **http://localhost:8000**

---

## 📝 Conventions de nommage

> ⚠️ **Ces règles sont OBLIGATOIRES pour éviter les conflits entre modules.**

### 🔹 Java — Backend

#### Packages
- **Toujours en minuscules** : `tn.federation.backend.service`
- Organisation **par couche**, pas par module : tous les DTOs dans `dto/`, tous les services dans `service/`, etc.
- Pour éviter les collisions, on **préfixe les classes par l'entité**.
PascalCase 
camelCase
#### Classes

| Type | Convention | Exemple |
|---|---|---|
| **Entité** | `PascalCase`, nom du domaine au singulier | `Performance`, `Club`, `User` |
| **DTO Request** | `<Nom>RequestDTO` | `PerformanceRequestDTO` |
| **DTO Response** | `<Nom>ResponseDTO` | `PerformanceResponseDTO` |
| **DTO spécifique** | `<Contexte>DTO` | `RankingEntryDTO`, `ProjectionDTO` |
| **Repository** | `<Nom>Repository` | `PerformanceRepository` |
| **Service (interface)** | `<Nom>Service` | `PerformanceService` |
| **Service (impl)** | `<Nom>ServiceImpl` | `PerformanceServiceImpl` |
| **Controller** | `<Nom>Controller` | `PerformanceController` |
| **Mapper** | `<Nom>Mapper` | `PerformanceMapper` |
| **Exception** | `<Nom>Exception` | `PerformanceNotFoundException` |
| **Config** | `<Nom>Config` | `SecurityConfig`, `CorsConfig` |

#### Méthodes
- `camelCase`, verbes d'action : `findById`, `createPerformance`, `calculateRanking`
- Getters/Setters générés par **Lombok** (`@Getter`, `@Setter`)
- Méthodes de repository : suivre la convention **Spring Data** (`findBy...`, `existsBy...`, `countBy...`)

#### Variables & constantes
- Variables : `camelCase` — `swimmerId`, `officialTime`
- Constantes : `UPPER_SNAKE_CASE` — `MAX_DISTANCE`, `DEFAULT_PAGE_SIZE`

#### Enums
- Nom au **singulier** en `PascalCase` : `StrokeType`, `Gender`, `Role`
- Valeurs en `UPPER_SNAKE_CASE` : `FREESTYLE`, `BACKSTROKE`, `SHORT_COURSE_25M`

---

### 🔹 Endpoints REST

- **Toujours** en kebab-case et pluriel
- Préfixe commun : `/api`
- Pas de verbe dans l'URL (HTTP verb = action)

| Méthode | URL | Action |
|---|---|---|
| `GET` | `/api/performances` | Liste |
| `GET` | `/api/performances/{id}` | Détail |
| `POST` | `/api/performances` | Création |
| `PUT` | `/api/performances/{id}` | Modification complète |
| `PATCH` | `/api/performances/{id}` | Modification partielle |
| `DELETE` | `/api/performances/{id}` | Suppression |
| `GET` | `/api/performances/swimmer/{swimmerId}` | Ressource liée |

---

### 🔹 Base de données

- **Tables** : `snake_case` au singulier (par convention JPA) → `user`, `performance`, `club`
- **Colonnes** : `snake_case` → `first_name`, `official_time`, `created_at`
- **Clés étrangères** : `<entité>_id` → `swimmer_id`, `club_id`
- **Enums stockés en STRING** (pas en ORDINAL) via `@Enumerated(EnumType.STRING)`

---

### 🔹 Angular — Frontend

| Type | Convention | Exemple |
|---|---|---|
| **Composant** | `kebab-case` | `performance-list.component.ts` |
| **Service** | `kebab-case.service.ts` | `performance.service.ts` |
| **Model/Interface** | `kebab-case.model.ts` | `performance.model.ts` |
| **Guard** | `kebab-case.guard.ts` | `auth.guard.ts` |
| **Interceptor** | `kebab-case.interceptor.ts` | `jwt.interceptor.ts` |
| **Classes TS** | `PascalCase` | `PerformanceService`, `PerformanceDTO` |
| **Variables** | `camelCase` | `swimmerId`, `officialTime` |

---

### 🔹 Git — Commits & branches


#### Messages de commit (Conventional Commits)

Format : `<type>(<scope>): <sujet>`

| Type | Usage |
|---|---|
| `feat` | Nouvelle fonctionnalité |
| `fix` | Correction de bug |
| `refactor` | Refactorisation sans changement fonctionnel |
| `docs` | Documentation uniquement |
| `style` | Formatage (pas de changement de logique) |
| `test` | Ajout/modif de tests |
| `chore` | Maintenance (build, deps, etc.) |

**Exemples** :
```
feat(module4): add performance CRUD endpoints
fix(module1): correct JWT token expiration check
refactor(module4): simplify ranking service logic
docs(readme): add naming conventions section
```



---

## 🌿 Workflow Git

### Règles générales
1. **Jamais de commit direct sur `main` ou `develop`**.
2. Chaque fonctionnalité = **une branche + une Pull Request**.
3. Au moins **1 reviewer** avant merge.
4. Tests qui passent obligatoires avant merge.






### Flow recommandé

```
main                    ← branche de production (stable)
  │
  └── develop           ← branche d'intégration
        │
        ├── feature/module1-auth-jwt
        ├── feature/module4-performance-crud     
        ├── feature/module4-ranking
        └── feature/module5-dashboard
```

### Étapes pour contribuer

```bash
# 1. Récupérer les dernières modifications
git checkout develop
git pull origin develop

# 2. Créer sa branche
git checkout -b feature/module4-performance-crud

# 3. Coder, committer régulièrement
git add .
git commit -m "feat(module4): add PerformanceRepository and CRUD service"

# 4. Pusher
git push origin feature/module4-performance-crud

# 5. Ouvrir une Pull Request sur GitHub vers 'develop'
```

---



