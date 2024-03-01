import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import config from './config/configSetup';

import { initDB } from './controllers/db';
import index from './routes/index';
import auth from './routes/auth';
import { isAuthorized } from './middlewares/authorise';



const app: Application = express();

const http = require('http').Server(app);

app.use(morgan('dev'));

// PARSE JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ENABLE CORS AND START SERVER
app.use(cors({ origin: true }));
initDB();
app.listen(config.PORT, () => {
	console.log(`Server started on port ${config.PORT}`);
});



app.all('*', isAuthorized);
app.use("/api", index);
app.use("/api", auth);






