import loadMoreWhileAvailable from '../helpers/loader.js'

async function fetchSparCoffee(browser) {
    let puppeteerPage = await browser.newPage();
    await puppeteerPage.setViewport({ width: 1920, height: 1080 });
    await puppeteerPage.goto('https://spar.no/nettbutikk/varer/drikke/kaffe', { waitUntil: 'networkidle2' });
    await loadMoreWhileAvailable(puppeteerPage, '.ws-product-view__footer > .ngr-button');

    return await puppeteerPage.evaluate(() => {
        return [...document.querySelector('ul[class*=product-list]').children].map(item => {
            return {
                vendor: 'spar',
                title: `${item.querySelector('[class*=title]').children[0].innerText} ${item.querySelector('[class*=subtitle]').innerText}`,
                price: parseFloat(item.querySelector('[class*=price]').innerText.substr(3).replace(',', '.'))
            };
        });
    });
}

export default {
    vendor: 'Spar',
    async execute(browser) {
        try {
            return await fetchSparCoffee(browser)
        } catch (error) {
            console.error("[SPAR] Fetch failed", error);
            return [];
        }
    }
}