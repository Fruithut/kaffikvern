import puppeteer from 'puppeteer'
import fs from 'fs'

import sparStrategy from './strategies/spar_strategy.js';
import menyStrategy from './strategies/meny_strategy.js';
import coopStrategy from './strategies/coop_strategy.js';
import europrisStrategy from './strategies/europris_strategy.js';

export default async function fetchAndStoreCoffee() {
    console.log("Fetching fresh data ☕");
    const browser = await puppeteer.launch();
    const products = await Promise.all([
        sparStrategy.execute(browser),
        menyStrategy.execute(browser),
        coopStrategy.execute(browser),
        europrisStrategy.execute(browser)
    ]);

    await browser.close();

    let flattenedData = products.flat();

    console.log("Storing new dataset...");
    storeDataset(flattenedData, 'products');

    console.log("Complete ✅")
}

function storeDataset(data, fileName) {
    let dataset = {
        timestamp: Date.now(),
        itemCount: data.length,
        dataset: data
    };

    fs.writeFile(`./public/${fileName}.json`, JSON.stringify(dataset), (err, data) => {
        if (err) {
            return console.error(err);
        }
        console.log(data);
    });
}









