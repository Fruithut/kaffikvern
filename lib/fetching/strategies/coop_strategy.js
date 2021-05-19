async function fetchCoopCoffee(browser) {
    let puppeteerPage = await browser.newPage();
    await puppeteerPage.setViewport({ width: 1920, height: 1080 });
    await puppeteerPage.goto('https://matlevering.coop.no/drikkevarer/kaffe?sortBy=Relevance&count=150', { waitUntil: 'networkidle2' });

    return await puppeteerPage.evaluate(() => {
        let mostLikelyProductContainer = [...document.querySelectorAll('div')].filter(element => element.children.length > 15)[0];
        let products = [...mostLikelyProductContainer.children];
        return products.map(item => {
            let priceNodes = [...[...item.querySelectorAll('span')].filter(element => element.children.length == 3)[0].children];
            let priceParts = priceNodes.map(item => item.innerText);
            let price = parseFloat(priceParts[0] + '.' + priceParts[1]);

            return {
                vendor: 'coop',
                title: item.querySelector('h3').innerText,
                price: price
            };
        });
    });
}

export default {
    vendor: 'Coop',
    async execute(browser) {
        try {
            return await fetchCoopCoffee(browser)
        } catch (error) {
            console.error("[COOP] Fetch failed", error);
            return [];
        }
    }
}