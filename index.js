import puppeteer from 'puppeteer'
import fs from 'fs'
import { loadMoreWhileAvailable } from './lib/puppeteer-helpers.js';

(async () => {
    let coffeData = JSON.parse(fs.readFileSync('./storage/coffeeData.json'));

    if (isDatasetUpdateNessecary(Date.now(), coffeData.timestamp)) {
        console.log("Updating dataset ☕");

        const browser = await puppeteer.launch();
        const [sparCoffee, menyCoffee, coopCoffee, europrisCoffee] = await Promise.all([
            fetchSparCoffee(browser),
            fetchMenyCoffee(browser),
            fetchCoopCoffee(browser),
            fetchEuroprisCoffee(browser)
        ]);
        await browser.close();

        console.log("Storing prices");
        let allCoffee = [...sparCoffee, ...menyCoffee, ...coopCoffee, ...europrisCoffee];
        let fetchedDataset = {
            timestamp: Date.now(),
            itemCount: allCoffee.length,
            dataset: allCoffee
        }
        storeDataset(fetchedDataset, 'coffeeData');

        console.log("Beans fetched ✅")
        coffeData = fetchedDataset;
    }
})();

function isDatasetUpdateNessecary(timeOfAccess, datasetTimestamp) {
    return (timeOfAccess - datasetTimestamp) >= 3600 * 1000;
}

function storeDataset(dataset, fileName) {
    fs.writeFile(`./storage/${fileName}.json`, JSON.stringify(dataset), (err, data) => {
        if (err) console.error(err);
        console.log(data);
    });
}

async function fetchSparCoffee(browser) {
    console.log("Fetching coffee prices from Spar");

    let puppeteerPage = await browser.newPage();
    await puppeteerPage.setViewport({ width: 1920, height: 1080 });
    await puppeteerPage.goto('https://spar.no/nettbutikk/varer/drikke/kaffe', { waitUntil: 'networkidle2' });
    await loadMoreWhileAvailable(puppeteerPage, '.ws-product-view__footer > .ngr-button')

    return await puppeteerPage.evaluate(() => {
        let coffeList = [];

        [...document.querySelector('ul[class*=product-list]').children].forEach(item => {
            coffeList.push({
                vendor: 'spar',
                title: `${item.querySelector('[class*=title]').children[0].innerText} ${item.querySelector('[class*=subtitle]').innerText}`,
                price: parseFloat(item.querySelector('[class*=price]').innerText.substr(3).replace(',', '.'))
            });
        })

        return coffeList;
    });
}

async function fetchMenyCoffee(browser) {
    console.log("Fetching coffee prices from Meny");

    let puppeteerPage = await browser.newPage();
    await puppeteerPage.setViewport({ width: 1920, height: 1080 });
    await puppeteerPage.goto('https://meny.no/varer/drikke/kaffe', { waitUntil: 'networkidle2' });
    await loadMoreWhileAvailable(puppeteerPage, '.ws-product-view__footer > .ngr-button')

    return await puppeteerPage.evaluate(() => {
        let coffeList = [];

        [...document.querySelector('ul[class*=product-list]').children].forEach(item => {
            coffeList.push({
                vendor: 'meny',
                title: `${item.querySelector('[class*=title]').children[0].innerText} ${item.querySelector('[class*=subtitle]').innerText}`,
                price: parseFloat(item.querySelector('[class*=price]').innerText.substr(3).replace(',', '.'))
            });
        })

        return coffeList;
    });
}

async function fetchCoopCoffee(browser) {
    console.log("Fetching coffee prices from Coop");

    let puppeteerPage = await browser.newPage();
    await puppeteerPage.setViewport({ width: 1920, height: 1080 });
    await puppeteerPage.goto('https://matlevering.coop.no/drikkevarer/kaffe?sortBy=Relevance&count=150', { waitUntil: 'networkidle2' });

    return await puppeteerPage.evaluate(() => {
        let coffeeList = [];

        let mostLikelyProductContainer = [...document.querySelectorAll('div')].filter(element => element.children.length > 15)[0];
        let products = [...mostLikelyProductContainer.children];
        products.forEach(item => {
            let priceNodes = [...[...item.querySelectorAll('span')].filter(element => element.children.length == 3)[0].children];
            let priceParts = priceNodes.map(item => item.innerText);
            let price = parseFloat(priceParts[0] + '.' + priceParts[1]);

            coffeeList.push({
                vendor: 'coop',
                title: item.querySelector('h3').innerText,
                price: price
            });
        });

        return coffeeList;
    });
}

async function fetchEuroprisCoffee(browser) {
    console.log("Fetching coffee prices from Europris");

    let puppeteerPage = await browser.newPage();
    await puppeteerPage.setViewport({ width: 1920, height: 1080 });
    await puppeteerPage.goto('https://www.europris.no/dagligvarer/drikke/kaffe?product_list_limit=64', { waitUntil: 'networkidle2' });

    return await puppeteerPage.evaluate(() => {
        function textUnderElement(element) {
            let currentNode, textElements = [], walk = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
            while (currentNode = walk.nextNode()) {
                textElements.push(currentNode.textContent);
            }
            return textElements;
        }

        let coffeList = [];

        [...document.querySelector('ol[class*=products]').children].forEach(item => {
            coffeList.push({
                vendor: 'europris',
                title: `${item.querySelector('[class*=product-item-link]').innerText} ${item.querySelector('[class=subname]').innerText}`,
                price: parseFloat(textUnderElement(item.querySelector('[class=price]')).join('.'))
            });
        });

        return coffeList;
    });
}