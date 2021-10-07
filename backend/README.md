# Backend

## Project setup
```
npm install
npm run db_setup
npm run frontend_install
```
### You should also set `.env`, although it works without it
#### --> `PORT`
#### --> `NODE_ENV`     ("development" or "production")
#### --> `TOKEN_SECRET`
#### --> `TOKEN_EXPIRATION`


### Auto-restart for development
```
npm run dev
```
### Development without build
```
npm run dev-b
```

### Starting for production
```
npm run prod
```