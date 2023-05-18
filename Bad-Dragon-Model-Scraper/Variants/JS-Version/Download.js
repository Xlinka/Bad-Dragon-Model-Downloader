const axios = require('axios');
const fs = require('fs');
const path = require('path');

class DownloadableProduct {
  constructor(name, previewObjectUrl, previewTextureMapUrl, previewNormalMapUrl) {
    Object.assign(this, { name, previewObjectUrl, previewTextureMapUrl, previewNormalMapUrl });
  }
}

const PRODUCT_URL = "https://bad-dragon.com/api/products";
const SAVE_DIR = "models";

const main = async () => {
  fs.existsSync(SAVE_DIR) || fs.mkdirSync(SAVE_DIR);
  console.log(`Saving objects to ${SAVE_DIR}`);

  const products = await loadProducts();
  for (const product of processProducts(products)) {
    await downloadProduct(product, SAVE_DIR);
  }
};

const loadProducts = async () => (await axios.get(PRODUCT_URL, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AcmeInc/1.0)' } })).data;

const processProducts = (products) =>
  products.map(({ sku: name, previewObjModel, previewTextureMap, previewNormalMap }) => {
    if (!name || !previewObjModel || !previewTextureMap || !previewNormalMap) return null;
    return new DownloadableProduct(name, previewObjModel.url, previewTextureMap.url, previewNormalMap.url);
  }).filter(Boolean);

const downloadFile = async (url, filePath) => {
  if (fs.existsSync(filePath)) return console.log(`Already downloaded ${filePath}`);
  console.log(`Downloading ${filePath}`);
  fs.writeFileSync(filePath, Buffer.from((await axios.get(url, { responseType: 'arraybuffer' })).data, 'binary'));
};

const downloadProduct = async (product, saveDir) => {
  const productDir = path.join(saveDir, product.name);

  fs.existsSync(productDir) || fs.mkdirSync(productDir);

  await Promise.all([
    downloadFile(product.previewObjectUrl, path.join(productDir, `${product.name}.obj`)),
    downloadFile(product.previewTextureMapUrl, path.join(productDir, `${product.name}_texture_map.png`)),
    downloadFile(product.previewNormalMapUrl, path.join(productDir, `${product.name}_normal_map.png`))
  ]);
};

main().catch(console.error);
