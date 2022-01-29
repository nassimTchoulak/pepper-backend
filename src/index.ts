import express from 'express';
import bodyParser from 'body-parser';
import https from 'https';
import routes from 'routes';
import { runJobs } from 'services/jobs';
import figlet from 'figlet';
import gradient from 'gradient-string';

const app = express();

const httpServer = https.createServer(app);

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
  extended: false
}));
// parse application/json
app.use(bodyParser.json());
//headers
app.use((_req: any, res: any, next: () => void) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,x-access-token');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});
app.use('/api/', routes);

httpServer.listen(process.env.PORT as string || 8080, () => {
  runJobs();
  console.log(gradient.pastel.multiline(figlet.textSync('Pepper')));
  console.log(`Https server running on port ${process.env.PORT as string || 8080}`);
});

export default app;