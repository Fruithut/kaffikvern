import Koa from 'koa'
import cors from '@koa/cors'
import serve from 'koa-static'
import schedule from 'node-schedule'

import fetchAndStoreCoffee from './lib/fetching/coffee_fetcher.js';

// Startup fetch
await fetchAndStoreCoffee();

const fetchCoffeJob = schedule.scheduleJob('0 * * * *', fetchAndStoreCoffee);

const app = new Koa();
app.use(cors());
app.use(serve('public'));
app.listen(3001);