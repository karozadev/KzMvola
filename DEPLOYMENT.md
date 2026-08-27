# Déploiement — CI/CD vers le VPS

Ce projet se déploie automatiquement à chaque push sur `main` :

```
push sur main
   → GitHub Actions build l'image Docker
   → l'image est poussée sur GitHub Container Registry (ghcr.io)
   → GitHub Actions se connecte en SSH au VPS
   → le VPS "pull" la nouvelle image et redémarre le conteneur
```

Le conteneur n'écoute qu'en local (`127.0.0.1`) sur le VPS ; c'est le
**Nginx du VPS** (hors conteneur, déjà en place) qui sert de reverse proxy
public et gère le TLS.

Le pipeline ([.github/workflows/deploy.yml](.github/workflows/deploy.yml))
et les fichiers de config ([deploy/](deploy/)) sont prêts, mais reposent sur
des variables et secrets **à remplir toi-même** avant le premier déploiement.

## 1. Secrets GitHub Actions à renseigner

Dans le repo GitHub : **Settings → Secrets and variables → Actions → New
repository secret**.

| Secret            | Contenu                                                                 |
| ----------------- | ------------------------------------------------------------------------ |
| `VPS_HOST`        | IP ou nom de domaine du VPS                                             |
| `VPS_USER`        | Utilisateur SSH utilisé pour le déploiement                             |
| `VPS_SSH_KEY`     | Clé privée SSH (format PEM) dont la clé publique est autorisée sur le VPS |
| `VPS_PORT`        | Port SSH du VPS (optionnel, `22` par défaut si absent)                  |
| `VPS_DEPLOY_PATH` | Dossier absolu sur le VPS contenant `docker-compose.yml` et `.env`      |

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
cd /opt/kzmvola
```

Copier depuis ce repo :
- [deploy/docker-compose.yml](deploy/docker-compose.yml) → `/opt/kzmvola/docker-compose.yml`
- [deploy/.env.example](deploy/.env.example) → `/opt/kzmvola/.env` (puis remplir les valeurs)

`VPS_DEPLOY_PATH` (secret GitHub) doit pointer vers ce dossier, ex. `/opt/kzmvola`.

Vérifier que Docker et le plugin `docker compose` sont installés sur le VPS.

## 3. Configuration du reverse proxy Nginx (une seule fois)

Utiliser le template [deploy/nginx-vps.conf.example](deploy/nginx-vps.conf.example) :

```bash
# Sur le VPS
sudo cp nginx-vps.conf.example /etc/nginx/sites-available/kzmvola.conf
sudo nano /etc/nginx/sites-available/kzmvola.conf   # remplacer __DOMAIN__ et __APP_PORT__
sudo ln -s /etc/nginx/sites-available/kzmvola.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# TLS (réécrit le fichier pour ajouter le bloc HTTPS)
sudo certbot --nginx -d ton-domaine.exemple.com
```

`__APP_PORT__` doit être identique à `APP_PORT` dans `/opt/kzmvola/.env`.

## 4. Premier déploiement

Une fois les secrets renseignés et le VPS préparé, un simple push sur `main`
(ou un lancement manuel via l'onglet **Actions → Build, push and deploy →
Run workflow**) déclenche le pipeline complet.

## Dépannage

- **`docker compose pull` échoue avec une erreur d'auth** : vérifier que
  `VPS_DEPLOY_PATH` pointe bien vers le dossier contenant le `.env`, et que
  `IMAGE` dans ce `.env` correspond exactement à `ghcr.io/<owner>/<repo>` en
  minuscules.
- **502 Bad Gateway côté Nginx** : vérifier que le conteneur tourne
  (`docker ps`) et que `APP_PORT` (`.env`) correspond au port utilisé dans
  le `proxy_pass` de la config Nginx du VPS.
