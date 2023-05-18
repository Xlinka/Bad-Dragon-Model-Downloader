const axios = require('axios');
const fs = require('fs');
const path = require('path');

class DownloadableProduct {
    constructor(name, previewObjectUrl, previewTextureMapUrl, previewNormalMapUrl) {
        this.name = name;
        this.previewObjectUrl = previewObjectUrl;
        this.previewTextureMapUrl = previewTextureMapUrl;
        this.previewNormalMapUrl = previewNormalMapUrl;
    }
}

const PRODUCT_URL = "https://bad-dragon.com/api/products";
const SAVE_DIR = "models";

async function main() {
    if (!fs.existsSync(SAVE_DIR)) fs.mkdirSync(SAVE_DIR);
    console.log(`Saving objects to ${SAVE_DIR}`);

    const products = await loadProducts();
    for (const product of processProducts(products))
        await downloadProduct(product, SAVE_DIR);
}

async function loadProducts() {
    const response = await axios.get(PRODUCT_URL, { headers: {'User-Agent': 'Mozilla/5.0 (compatible; AcmeInc/1.0)'}});
    return response.data;
}

function processProducts(products) {
    return products.map(product => {
        const { sku: name, previewObjModel, previewTextureMap, previewNormalMap } = product;

        if (!name || !previewObjModel || !previewTextureMap || !previewNormalMap)
            return null;

        return new DownloadableProduct(name, previewObjModel.url, previewTextureMap.url, previewNormalMap.url);
    }).filter(Boolean);
}

async function downloadFile(url, filePath) {
    if (fs.existsSync(filePath)) {
        console.log(`Already downloaded ${filePath}`);
        return;
    }

    console.log(`Downloading ${filePath}`);
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    fs.writeFileSync(filePath, Buffer.from(response.data, 'binary'));
}

async function downloadProduct(product, saveDir) {
    const productDir = path.join(saveDir, product.name);

    if (!fs.existsSync(productDir)) fs.mkdirSync(productDir);

    await downloadFile(product.previewObjectUrl, path.join(productDir, `${product.name}.obj`));
    await downloadFile(product.previewTextureMapUrl, path.join(productDir, `${product.name}_texture_map.png`));
    await downloadFile(product.previewNormalMapUrl, path.join(productDir, `${product.name}_normal_map.png`));
}

main().catch(console.error);
