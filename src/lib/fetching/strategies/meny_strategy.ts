import loadMoreWhileAvailable from '../helpers/loader.js'
import {Browser} from "puppeteer";
import {Product} from "../../../types/Product";
import {Strategy} from "../../../types/Strategy";

async function fetchMenyCoffee(browser: Browser): Promise<Product[]> {
    let puppeteerPage = await browser.newPage();
    await puppeteerPage.setViewport({width: 1920, height: 1080});
    await puppeteerPage.goto('https://meny.no/varer/drikke/kaffe', {waitUntil: 'networkidle2'});
    await loadMoreWhileAvailable(puppeteerPage, '.ws-product-view__footer > .ngr-button');

    return await puppeteerPage.evaluate(() => {
        const productParent = document.querySelector('ul[class*=product-list]');
        return productParent ? [...productParent.children].map(convertToProduct) : [];

        function convertToProduct(item: Element): Product {
            const title = (item.querySelector('[class*=title]')?.firstElementChild as HTMLElement).innerText;
            const subtitle = (item.querySelector('[class*=subtitle]') as HTMLElement).innerText;
            const priceText = (item.querySelector('[class*=price]') as HTMLElement).innerText
                .substr(3)
                .replace(',', '.');

            return {
                vendor: 'meny',
                title: `${title} ${subtitle}`,
                price: parseFloat(priceText)
            };
        }
    });
}

const menyStrategy: Strategy = {
    vendor: 'Meny',
    async execute(browser: Browser): Promise<Product[]> {
        try {
            return await fetchMenyCoffee(browser)
        } catch (error) {
            console.error("[MENY] Fetch failed", error);
            return [];
        }
    }
}

export default menyStrategy
