# Backend

## Project setup
```
npm install
cd db
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```
### You also have to set `.env`!
#### --> `PORT`
#### --> `NODE_ENV`     ("development" || "production")


### Auto-restart for development
```
npm run dev
```

### Starting for production
```
npm run prod
```