# Deployment guide

## Configure Server
### MySQL
1. Install your preferred MySQl variant, I generally use MariaDB.
2. Set up the database
```sql
-- Make db
CREATE DATABASE xtie;
USE xtie;

-- Redirects
CREATE TABLE Rules (
    subdomain VARCHAR(50) UNIQUE NOT NULL PRIMARY KEY,
    destination VARCHAR(128) NOT NULL,
    protection CHAR(64) DEFAULT NULL
);
```

### dotenv
This project uses `dotenv`. Please create a file called `.env` contaning fields for the database like so:
```.env
# Info for the primary database
RW_DB='{"host": "localhost", "user": "root", "password": "admin", "database": "xtie"}'

# Info for the read-replica database
RO_DB='{"host": "localhost", "user": "root", "password": "admin", "database": "xtie"}'

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
