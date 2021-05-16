async function fetchEuroprisCoffee(browser) {
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

export default {
    vendor: 'Europris',
    execute: fetchEuroprisCoffee
}