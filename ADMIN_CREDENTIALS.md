# Identifiants ADMIN - FTN Mission

## 📋 Compte Administrateur par Défaut

Au démarrage de l'application, un compte administrateur est automatiquement créé dans la base de données s'il n'existe pas déjà.

### Identifiants :
```
Email :           admin@ftn.tn
Mot de passe :    admin123
Rôle :            ADMIN (non modifiable)
```

## 🚀 Utilisation

### 1. Démarrage du Backend
```powershell
cd "e:\Mission E\FTN-Mission\FTN-Mission\ftn-backend"
mvn spring-boot:run
```

**À la première exécution, vous verrez :**
```
✅ Utilisateur ADMIN créé avec succès!
   Email: admin@ftn.tn
   Mot de passe: admin123
```

### 2. Démarrage du Frontend
```powershell
cd "e:\Mission E\FTN-Mission\FTN-Mission\ftn-frontend"
npm start
```

### 3. Connexion
1. Naviguez vers `http://localhost:4200/auth/login`
2. Entrez les identifiants :
   - **Email** : `admin@ftn.tn`
   - **Mot de passe** : `admin123`
3. Cliquez sur **Connexion**

### 4. Accès à la Gestion des Utilisateurs
Après connexion, vous pouvez :
- ✅ Voir la liste de tous les utilisateurs
- ✅ Créer de nouveaux utilisateurs
- ✅ Modifier les utilisateurs
- ✅ Supprimer les utilisateurs

## 🔐 Sécurité

### Le mot de passe :
- Est haché en utilisant **BCrypt** dans la base de données
- N'est JAMAIS stocké en texte clair
- Est enregistré automatiquement au démarrage (une seule fois)

### Accès à la liste des utilisateurs :
- Les **utilisateurs authentifiés** peuvent voir la liste
- Seuls les **ADMIN** peuvent créer/modifier/supprimer des utilisateurs

## 📊 Quand le compte ADMIN est créé ?

Le compte ADMIN est créé automatiquement **à la première exécution** du backend si :
- La base de données est vide (aucun utilisateur avec email `admin@ftn.tn`)
- Sinon, le compte ADMIN existant est conservé

## ⚙️ Fichier Responsable

Le compte ADMIN est initialisé par le fichier :
```
ftn-backend/src/main/java/tn/federation/backend/config/DataInitializer.java
```

## 💡 Notes Importantes

- **Ne changez PAS le mot de passe directement dans le code source**
- Pour changer le mot de passe, utilisez l'interface web après connexion
- Les identifiants sont les mêmes pour tous les environnements (développement, test)
- Si vous voulez changer le mot de passe par défaut, modifiez le fichier `DataInitializer.java`
