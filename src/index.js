require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./utils/db');
const mainRouter = require('./mainRouter');
const errorMiddleware = require('./middlewares/errorMiddleware');

(async () => {
  await sequelize.sync({ force: true });

  console.log('Connection has been established successfully');
})();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true
  })
);
app.use(express.json());
app.use('/api/v1', mainRouter);
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log('app is running');
});
