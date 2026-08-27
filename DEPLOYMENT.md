# Déploiement — CI/CD vers le VPS

Ce projet se déploie automatiquement à chaque push sur `main` :

```
push sur main
   → GitHub Actions build l'image Docker
   → l'image est poussée sur GitHub Container Registry (ghcr.io)
   → GitHub Actions se connecte en SSH au VPS
   → le VPS "pull" la nouvelle image et redémarre le conteneur
```

Le conteneur écoute en local sur **`127.0.0.1:8080`** (port fixé dans
[deploy/docker-compose.yml](deploy/docker-compose.yml)) ; c'est le
**Nginx du VPS** (hors conteneur, déjà en place) qui sert de reverse proxy
public et gère le TLS.

## 1. Secrets GitHub Actions à renseigner

Dans le repo GitHub : **Settings → Secrets and variables → Actions → New
repository secret**.

| Secret            | Contenu                                                                 |
| ----------------- | ------------------------------------------------------------------------ |
| `VPS_HOST`        | IP ou nom de domaine du VPS                                             |
| `VPS_USER`        | Utilisateur SSH utilisé pour le déploiement                             |
| `VPS_SSH_KEY`     | Clé privée SSH (format PEM) dont la clé publique est autorisée sur le VPS |
| `VPS_PORT`        | Port SSH du VPS (optionnel, `22` par défaut si absent)                  |
| `VPS_DEPLOY_PATH` | Dossier absolu sur le VPS contenant `docker-compose.yml`                |

Aucun secret n'est nécessaire pour le registre : l'image est poussée vers
`ghcr.io` avec le `GITHUB_TOKEN` généré automatiquement par Actions.

> Le package `ghcr.io/karozadev/kzmvola` créé au premier push sera **privé**
> par défaut. Le workflow se réauthentifie à chaque déploiement donc ça
> fonctionne tel quel ; si tu préfères éviter cette étape, tu peux rendre
> le package public dans **Packages → kzmvola → Package settings**.

## 2. Préparation du VPS (une seule fois)

```bash
# Sur le VPS
mkdir -p /opt/kzmvola
```

Copier [deploy/docker-compose.yml](deploy/docker-compose.yml) tel quel vers
`/opt/kzmvola/docker-compose.yml` — aucune valeur à remplir dedans, l'image
et le port (`8080`) y sont déjà fixés.

`VPS_DEPLOY_PATH` (secret GitHub) doit pointer vers ce dossier, ex. `/opt/kzmvola`.

Vérifier que Docker et le plugin `docker compose` sont installés sur le VPS.

## 3. Configuration du reverse proxy Nginx (à faire toi-même, une seule fois)

C'est la seule étape manuelle côté VPS. Utiliser le template
[deploy/nginx-vps.conf.example](deploy/nginx-vps.conf.example), qui pointe
déjà vers le bon port (`127.0.0.1:8080`) :

```bash
# Sur le VPS
sudo cp nginx-vps.conf.example /etc/nginx/sites-available/kzmvola.conf
sudo nano /etc/nginx/sites-available/kzmvola.conf   # remplacer __DOMAIN__
sudo ln -s /etc/nginx/sites-available/kzmvola.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# TLS (réécrit le fichier pour ajouter le bloc HTTPS)
sudo certbot --nginx -d ton-domaine.exemple.com
```

## 4. Premier déploiement

Une fois les secrets renseignés et le VPS préparé, un simple push sur `main`
(ou un lancement manuel via l'onglet **Actions → Build, push and deploy →
Run workflow**) déclenche le pipeline complet.

## Dépannage

- **`docker compose pull` échoue avec une erreur d'auth** : vérifier que
  `VPS_DEPLOY_PATH` pointe bien vers le dossier contenant le
  `docker-compose.yml`.
- **502 Bad Gateway côté Nginx** : vérifier que le conteneur tourne
  (`docker ps`) et écoute bien sur `127.0.0.1:8080`.
