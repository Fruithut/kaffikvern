async function isElementVisible(page, cssSelector) {
    let visible = true;
    await page
        .waitForSelector(cssSelector, { visible: true, timeout: 2000 })
        .catch(() => {
            visible = false;
        });
    return visible;
};

export default async function loadMoreWhileAvailable(page, cssSelectorLoadMoreButton) {
    let loadMoreVisible = await isElementVisible(page, cssSelectorLoadMoreButton);
    while (loadMoreVisible) {
        await page
            .click(cssSelectorLoadMoreButton)
            .catch(() => { });
        loadMoreVisible = await isElementVisible(page, cssSelectorLoadMoreButton);
    }
}


export {loadMoreWhileAvailable}