# backend

## Project setup
```
npm install
cd db
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```
## !! You also have to set .env !!
## --> PORT
## --> NODE_ENV     ("development" || "production")


### Compiles and hot-reloads for development
```
npm run dev
```

### Compiles and minifies for production
```
npm run prod
```