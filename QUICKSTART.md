# 🚀 Guide de Démarrage Complet - FTN Mission

## 📋 Prérequis

- ✅ Java 17+ (JDK)
- ✅ Node.js 18+ et npm
- ✅ Maven 3.8+
- ✅ MySQL 8.0+ (ou compatible)
- ✅ Base de données `ftn-db` créée et accessible sur `localhost:3307`

## 🎯 Démarrage Rapide (2 terminaux)

### Option 1 : Script Automatique (Windows)
Double-cliquez sur `START.bat` à la racine du projet. Les deux terminaux s'ouvriront automatiquement.

### Option 2 : Démarrage Manuel

#### Terminal 1 - Backend (Spring Boot)
```powershell
cd "e:\Mission E\FTN-Mission\FTN-Mission\ftn-backend"
mvn spring-boot:run
```

**Attendez le message :**
```
✅ Utilisateur ADMIN créé avec succès!
   Email: admin@ftn.tn
   Mot de passe: admin123
```

#### Terminal 2 - Frontend (Angular)
```powershell
cd "e:\Mission E\FTN-Mission\FTN-Mission\ftn-frontend"
npm start
```

Attendez : `✔ Compiled successfully` ou `Angular Live Development Server is listening`

## 🔐 Connexion avec le Compte ADMIN

1. **Ouvrez** votre navigateur sur `http://localhost:4200`
2. **Cliquez** sur **Connexion** (ou allez à `/auth/login`)
3. **Entrez les identifiants ADMIN :**
   ```
   Email :        admin@ftn.tn
   Mot de passe : admin123
   ```
4. **Cliquez** sur **Connexion**

## ✅ Fonctionnalités à Tester

### 📊 Après connexion en tant qu'ADMIN

#### 1. Gestion des Utilisateurs
- Naviguez vers **Gestion des Utilisateurs**
- Vous devriez voir :
  - ✅ La liste des utilisateurs (vide ou avec des utilisateurs créés)
  - ✅ Bouton **+ Nouvel Utilisateur**
  - ✅ Boutons **Modifier** et **Supprimer** pour chaque utilisateur

#### 2. Créer un Nouvel Utilisateur
- Cliquez sur **+ Nouvel Utilisateur**
- Remplissez le formulaire complet :
  - Prénom, Nom, Email, Mot de passe
  - Rôle (ADMIN, COACH, SWIMMER, VISITOR)
  - Date de naissance (optionnel)
  - Genre : HOMME, FEMME
  - Niveau : POUSSIN, BENJAMIN, MINIME, CADET, JUNIOR, SENIOR, MASTER
  - Discipline : NATATION, EAU_LIBRE, WATER_POLO, PLONGEON, NAGE_SYNCHRONISEE
  - Ancienneté en années (optionnel)
- Cliquez sur **Enregistrer**

#### 3. Modifier un Utilisateur
- Cliquez sur **Modifier** pour un utilisateur
- Modifiez les champs
- Cliquez sur **Enregistrer**

#### 4. Supprimer un Utilisateur
- Cliquez sur **Supprimer**
- Confirmez la suppression

## 🌐 URLs Importantes

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:4200 | Interface utilisateur |
| **Login** | http://localhost:4200/auth/login | Page de connexion |
| **Inscription** | http://localhost:4200/auth/register | Page d'inscription |
| **Gestion Users** | http://localhost:4200/users | Gestion des utilisateurs |
| **Backend API** | http://localhost:8083 | API REST |
| **Swagger UI** | http://localhost:8083/swagger-ui.html | Documentation API |
| **API Docs** | http://localhost:8083/v3/api-docs | Spécification OpenAPI |

## 🔗 Endpoints API

### Authentification
```
POST   /auth/register          - S'inscrire
POST   /auth/login             - Se connecter
POST   /auth/password-reset-request - Demander une réinitialisation
POST   /auth/password-reset    - Réinitialiser le mot de passe
```

### Gestion des Utilisateurs (authentifiés)
```
GET    /users                  - Récupérer tous les utilisateurs
GET    /users/{id}             - Récupérer un utilisateur par ID
GET    /users/swimmers         - Récupérer tous les nageurs
POST   /users                  - Créer un utilisateur (ADMIN uniquement)
PUT    /users/{id}             - Modifier un utilisateur (ADMIN uniquement)
DELETE /users/{id}             - Supprimer un utilisateur (ADMIN uniquement)
```

## 🛠️ Dépannage

### Erreur: "Erreur lors du chargement: Le serveur n'a pas répondu"
**Cause** : Le backend n'est pas démarré
**Solution** : 
1. Vérifiez que le terminal backend affiche `Started BackendApplication`
2. Attendez 5-10 secondes après le démarrage
3. Rechargez la page du navigateur

### Erreur: "Accès refusé" (403)
**Cause** : L'utilisateur n'a pas le rôle ADMIN
**Solution** : Connectez-vous avec `admin@ftn.tn / admin123`

### Erreur: "Impossible de contacter la base de données"
**Cause** : MySQL n'est pas accessible
**Solution** :
1. Vérifiez que MySQL est en cours d'exécution
2. Vérifiez l'URL de connexion dans `application.properties`
3. Assurez-vous que la base de données `ftn-db` existe

### Frontend ne compile pas
**Cause** : Dépendances manquantes
**Solution** :
```powershell
cd ftn-frontend
npm install
npm start
```

## 📚 Fichiers Importants

- `ftn-backend/src/main/resources/application.properties` - Configuration backend
- `ftn-backend/src/main/java/tn/federation/backend/config/DataInitializer.java` - Création ADMIN
- `ftn-frontend/src/app/modules/users/` - Module de gestion des utilisateurs
- `ADMIN_CREDENTIALS.md` - Identifiants ADMIN détaillés

## ✨ Prochaines Étapes

1. **Tester l'inscription** : Créez un compte avec un rôle VISITOR
2. **Connectez-vous** avec ce nouveau compte
3. **Constatez** que vous pouvez voir la liste des utilisateurs
4. **Essayez** de créer un utilisateur (vous aurez une erreur 403)
5. **Reconnectez-vous** en tant qu'ADMIN pour créer/modifier/supprimer

---

**Questions ou problèmes ?** Consultez les fichiers README dans le répertoire du projet.
