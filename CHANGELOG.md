# EPS Pro — Fonctionnalités & journal des changements

> Ce fichier doit être mis à jour à **chaque** modification apportée à l'application :
> une nouvelle fonction, une correction de bug, ou une évolution d'une fonction existante.
> La version affichée dans l'application (constante `APP_VERSION` dans `src/App.jsx`,
> visible en petit à côté de « by C. Guilhem » en haut de l'écran) doit être incrémentée
> à chaque mise à jour livrée.

Version actuelle : **1.1.0**

---

## 1. Vue d'ensemble des fonctionnalités

### Accueil
- Emploi du temps de la semaine affiché sous forme de tableau (jours × heures)
- Navigation semaine précédente / suivante (par 1), retour rapide à « cette semaine »
- Saut direct à une date précise
- Sélecteur d'alternance Semaine A / B / Auto
- Bannière vacances / jour férié (jour même)
- Nom de l'établissement et année scolaire en cours affichés au-dessus de l'EDT

### Gestion de classe (Classe/Groupe classe, Appel, Trombinoscope)
- Classes simples et groupes classe (jusqu'à 5 classes d'origine réunies)
- Fiche classe : PP, CPE, délégués, photo, renommage
- Appel avec statuts Présent / Sans tenue / Dispensé / Absent, compteur d'oublis de tenue par cycle
- Gestion des dispenses (ponctuelles ou par période), avec photo de justificatif dupliquée dans Documents
- Annotations rapides horodatées (positif/négatif), contextualisées à l'activité du cycle en cours
- Fiche générale d'appel par classe, consultable par cycle

### Emploi du temps (onglet Outils)
- Ajout de créneaux manuel ou import Excel/CSV/ODS
- Alternance semaine A/B calculée automatiquement à partir de la rentrée
- Gestion des vacances et jours fériés
- **Création de Cycles** (nouveau) : pour chaque classe/groupe classe, définition de périodes
  (dates début/fin) associées à une activité, qui pilotent automatiquement l'activité affichée
  dans l'emploi du temps sans avoir à modifier chaque créneau. Gère les classes à deux séances
  hebdomadaires avec une activité distincte par séance. Alerte en cas de trou ou de chevauchement
  entre cycles d'une même classe. Duplication de la programmation de cycles vers d'autres classes
  (dates et activités modifiables ensuite indépendamment).

### Documents
- Fichiers de tout type, prise de photo, organisation en dossiers/sous-dossiers
- Impression de tout document, dossier "Dispenses EPS" avec récapitulatif imprimable

### Outils
- Minuteur (modes Simple/Tabata/EMOM/Test VMA/Vaussenat)
- Chronomètre multi-temps avec classement, vitesse calculée, sauvegarde par classe
- Bloc-note (texte + photo/vidéo)
- Éditeur de tableaux d'évaluation (formules, agrégats, pondérations, min/max)

### Liens
- Liens vers les autres applications (Suivi AS, Muscu Pro, VMA Pro, Fractionné GPS Pro)
- Liens personnalisés ajoutables librement

### Autres
- Stockage local persistant (IndexedDB) + synchronisation en ligne (Firebase/Firestore)
- Assistant de rentrée (établissement, année scolaire, vacances, fériés, archivage annuel)
- Code PIN à l'ouverture, mode jour/sombre
- Numéro de version affiché discrètement en haut de l'écran

---

## 2. Journal des versions

### v1.1.0 — 31/08/2026
- Ajout du numéro de version discret dans l'application (affiché en haut, à côté de la signature)
- Création de ce fichier CHANGELOG.md
- Nouvelle fonction **Création de Cycles** dans l'outil Emploi du temps :
  - bouton dédié sous "Ajouter un créneau" / "Importer"
  - définition de cycles (dates début/fin + activité) par classe/groupe classe
  - prise en charge des classes à deux séances/semaine avec activité distincte par séance
  - alerte en cas de trou ou de chevauchement entre cycles
  - duplication de la programmation de cycles vers d'autres classes
  - les activités affichées dans l'emploi du temps (accueil + écran de gestion) suivent
    désormais automatiquement le cycle en cours à la date concernée, sauf saisie manuelle
    explicite sur un créneau
- Ajout de la navigation par semaine sur l'accueil (semaine précédente/suivante, retour à
  "cette semaine") et d'un champ pour sauter directement à une date précise
