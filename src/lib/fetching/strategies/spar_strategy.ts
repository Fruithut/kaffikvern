import loadMoreWhileAvailable from '../helpers/loader.js'
import {Browser} from "puppeteer";
import {Product} from "../../../types/Product";
import {Strategy} from "../../../types/Strategy";

async function fetchSparCoffee(browser: Browser): Promise<Product[]> {
    let puppeteerPage = await browser.newPage();
    await puppeteerPage.setViewport({width: 1920, height: 1080});
    await puppeteerPage.goto('https://spar.no/nettbutikk/varer/drikke/kaffe', {waitUntil: 'networkidle2'});
    await loadMoreWhileAvailable(puppeteerPage, '.ws-product-view__footer > .ngr-button');

    return await puppeteerPage.evaluate(() => {
        const productParent = document.querySelector('ul[class*=product-list]');
        return productParent ? [...productParent.children].map(convertToProduct) : [];

        function convertToProduct(item: Element) : Product {
            const title = (item.querySelector('[class*=title]')?.firstElementChild as HTMLElement).innerText;
            const subtitle = (item.querySelector('[class*=subtitle]') as HTMLElement).innerText;
            const priceText = (item.querySelector('[class*=price]') as HTMLElement).innerText
                .substr(3)
                .replace(',', '.');

            return {
                vendor: 'spar',
                title: `${title} ${subtitle}`,
                price: parseFloat(priceText)
            };
        }
    });
}

const sparStrategy : Strategy = {
    vendor: 'Spar',
    async execute(browser: Browser) : Promise<Product[]> {
        try {
            return await fetchSparCoffee(browser)
        } catch (error) {
            console.error("[SPAR] Fetch failed", error);
            return [];
        }
    }
}

export default sparStrategy
