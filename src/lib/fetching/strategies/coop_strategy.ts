import {Browser} from "puppeteer";
import {Product} from "../../../types/Product";
import {Strategy} from "../../../types/Strategy";

async function fetchCoopCoffee(browser: Browser): Promise<Product[]> {
    let puppeteerPage = await browser.newPage();
    await puppeteerPage.setViewport({width: 1920, height: 1080});
    await puppeteerPage.goto('https://matlevering.coop.no/drikkevarer/kaffe?sortBy=Relevance&count=150', {waitUntil: 'networkidle2'});

    return await puppeteerPage.evaluate(() => {
        const productParent = [...document.querySelectorAll('div')].filter(element => element.children.length > 15)[0];
        return productParent ? [...productParent.children].map(convertToProduct) : [];

        function convertToProduct(item: Element): Product {
            let title = (item.querySelector('h3') as HTMLElement).innerText
            let priceNodes = [...[...item.querySelectorAll('span')].filter(element => element.children.length == 3)[0].children] as HTMLElement[];
            let priceParts = priceNodes.map(item => item.innerText);
            let price = parseFloat(priceParts[0] + '.' + priceParts[1]);

            return {
                vendor: 'coop',
                title: title,
                price: price
            };
        }
    });
}

const coopStrategy: Strategy = {
    vendor: 'Coop',
    async execute(browser: Browser): Promise<Product[]> {
        try {
            return await fetchCoopCoffee(browser)
        } catch (error) {
            console.error("[COOP] Fetch failed", error);
            return [];
        }
    }
}

export default coopStrategy

