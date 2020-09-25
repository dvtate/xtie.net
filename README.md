# xTie
xTie is a simple service that works somewhat like a url shortener except it uses subdomains instead of directories so that you can create CNAME rules among other things with it.

## Using the app
- Choose subdomain
- Choose url to redirect to (or leave it blank to remove rule)
- (optional) Choose a key to prevent other users from changing the rule
    - Hashed with SHA256 on server

## Deploy your own instance
See [docs/deployment](/docs/deploy.md)
