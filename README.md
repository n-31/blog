# n31.fr

**_Populariser les sciences, philosophies et actions politiques avec objectivité[^1]._**

[^1]: dans la limite des stocks disponibles

## Nous Suivre

[![RSS](https://img.shields.io/badge/RSS-FFA500?style=flat&logo=rss&logoColor=white)](https://www.n31.fr/posts.xml)

[![newsletter](https://img.shields.io/static/v1?style=social&message=Abonnez-vous&color=000000&label=newsletter)](https://listmonk.n31.fr/subscription/form)

[![Profil Mastodon](https://img.shields.io/mastodon/follow/109299531023092841?domain=https%3A%2F%2Fpiaille.fr&label=Mastodon%20%3A%20@n31@piaille.fr)](https://piaille.fr/@n31)

[![Profil Twitter](https://img.shields.io/twitter/follow/n3141?label=Twitter%20%3A%20@n3141)](https://twitter.com/n3141)

## Licence

Sauf mention contraire, le contenu créatif de ce projet (texte, images, etc.) est mis à disposition sous licence Creative Commons Attribution - Pas d’Utilisation Commerciale - Partage dans les Mêmes Conditions 4.0 International ([CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)).

Tout code source (codes d'exemples compris) associé à ce projet est mis à disposition sous [licence MIT](LICENSE).

## Développement

[![Website shields.io](https://img.shields.io/website-up-down-green-red/https/www.n31.fr)](https://www.n31.fr)
[![Netlify Status](https://api.netlify.com/api/v1/badges/1d24018f-209d-448b-be76-decf986a2939/deploy-status)](https://app.netlify.com/sites/n31/deploys)
[![GitHub open-pull-requests](https://badgen.net/github/open-prs/n-31/blog?label=Pull%20Requests)](https://github.com/n-31/blog/pulls?q=is%3Aopen)
[![GitHub last commit](https://img.shields.io/github/last-commit/N-31/blog?label=Dernier%20Commit)](https://github.com/n-31/blog/commits/main)
[![Eleventy](https://img.shields.io/static/v1?style=flat&message=Eleventy&color=000000&logo=Eleventy&logoColor=FFFFFF&label=)](https://www.11ty.dev/)

Ce projet a été initialisé à l'aide du projet [Eleventy Netlify Boilerplate](https://github.com/danurbanowicz/eleventy-netlify-boilerplate).

Plusieurs ajouts ultérieurs ont été inspirés par le projet [eleventy-blog-staticman](https://github.com/eduardoboucas/eleventy-blog-staticman) et d'autres dépôts "starter" 11ty/Netlify.

[11ty](https://www.11ty.dev/) est donc le cœur du projet.

Les pages simples (tels que les articles de blog) sont écrites en Markdown via [markdown-it](https://markdown-it.github.io/) (avec les extensions [liquid](https://www.11ty.dev/docs/languages/liquid/)), incluant les fonctionnalités additionnelles suivantes :

- ancres de titres via [markdown-it-anchor](https://github.com/valeriangalliat/markdown-it-anchor)
- [emojis](https://github.com/markdown-it/markdown-it-emoji/blob/master/lib/data/full.json) via [markdown-it-emoji](https://github.com/markdown-it/markdown-it-emoji)
- [notes de bas de page](https://pandoc.org/MANUAL.html#footnotes) via [markdown-it-footnote](https://github.com/markdown-it/markdown-it-footnote)

Les structures HTML et composants réutilisables sont définis en [Nunjucks](https://mozilla.github.io/nunjucks/).

Enfin, des fonctionnalités additionnelles ont été créées à l'aide de Netlify :

- [commentaires sur les articles de blog](functions/staticman.js) via [Staticman](https://staticman.net/) dans une [fonction Netlify](https://www.netlify.com/products/functions/)
- [un formulaire de contact](_includes/components/contact-form.njk) via [Netlify Forms](https://www.netlify.com/products/forms/)
- [Netlify CMS](https://www.netlifycms.org/) pour le travail collaboratif (brouillons, relecture, etc.)
- [déploiement automatique d'une prévisualisation](https://docs.netlify.com/site-deploys/deploy-previews/) pour chaque Pull Request

### Pas à pas

#### 1. Clonez le dépôt GitHub

```bash
git clone https://github.com/n-31/blog.git n31-fr
```

#### 2. Déplacez vous dans le répertoire

```bash
cd n31-fr
```

#### 3. Installez les dépendances

```bash
npm install
```

#### 4. Lancez Eleventy

Démarrez un serveur de développement local :

```bash
npm start
```

Le site est ensuite disponible dans votre navigateur à l'adresse http://localhost:8080
