import puppeteer from 'puppeteer'
import fs from 'fs'

import sparStrategy from './strategies/spar_strategy.js';
import menyStrategy from './strategies/meny_strategy.js';
import coopStrategy from './strategies/coop_strategy.js';
import europrisStrategy from './strategies/europris_strategy.js';
import {Product} from "../../types/Product";
import {Dataset} from "../../types/Dataset";

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

    const flattenedData: Product[] = products.flat();

    console.log("Storing new dataset...");
    storeDataset(flattenedData, 'products');

    console.log("Complete ✅");
}


function storeDataset(data: Product[], fileName: string) {
    const dataset : Dataset = {
        timestamp: Date.now(),
        itemCount: data.length,
        dataset: data
    };

    fs.writeFile(`./public/${fileName}.json`, JSON.stringify(dataset), (err => {
        if (err) return console.error(err);
    }));
}









