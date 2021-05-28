import {Browser} from "puppeteer";
import {Product} from "../../../types/Product";
import {Strategy} from "../../../types/Strategy";

async function fetchEuroprisCoffee(browser: Browser): Promise<Product[]>  {
    let puppeteerPage = await browser.newPage();
    await puppeteerPage.setViewport({ width: 1920, height: 1080 });
    await puppeteerPage.goto('https://www.europris.no/dagligvarer/drikke/kaffe?product_list_limit=64', { waitUntil: 'networkidle2' });

    return await puppeteerPage.evaluate(() => {
        const productParent = document.querySelector('ol[class*=products]');
        return productParent ? [...productParent.children].map(convertToProduct) : [];

        function textUnderElement(element: Element): string[] {
            let currentNode = null;
            let textElements : string[] | null = [];
            let walk = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);

            while (currentNode = walk.nextNode()) {
                if (currentNode.textContent){
                    textElements.push(currentNode.textContent);
                }
            }
            return textElements;
        }

        function convertToProduct(item: Element): Product {
            const title = (item.querySelector('[class*=product-item-link]') as HTMLElement).innerText
            const subtitle = (item.querySelector('[class=subname]') as HTMLElement).innerText
            const priceText = textUnderElement((item.querySelector('[class=price]') as HTMLElement)).join('.');

            return {
                vendor: 'europris',
                title: `${title} ${subtitle}`,
                price: parseFloat(priceText)
            };
        }
    });
}

const europrisStrategy: Strategy = {
    vendor: 'Europris',
    async execute(browser: Browser): Promise<Product[]> {
        try {
            return await fetchEuroprisCoffee(browser)
        } catch (error) {
            console.error("[EUROPRIS] Fetch failed", error);
            return [];
        }
    }
}

export default europrisStrategy;
