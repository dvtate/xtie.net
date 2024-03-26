# Deployment guide
## Configure Server
### Database
Make sure the xtie_rules.json store is valid JSON.
`xtie $ echo '{}' > xtie_rules.json`

### dotenv
This project uses `dotenv`. Please create a file called `.env` contaning fields for the database like so:
```.env
# Port to listen on
PORT=80

# Hash salt
SALT="asfkasndfadfn34jnq34ntu3in5i3"

# Name for server that xtie is running on
HOSTNAME="xtie.net"
```

### Node
1. Install Node.js, for Arch Linux it's as simple as `pacman -Syu nodejs`
2. cd into repo, `npm install`
3. start app with `npm start`

## Configure DNS
You need to make a wildcard dns rule that points to your server
