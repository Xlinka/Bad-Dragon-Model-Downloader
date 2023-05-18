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
  const products = await (await axios.get(PRODUCT_URL, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AcmeInc/1.0)' } })).data;
  for (const product of products.map(({ sku: name, previewObjModel, previewTextureMap, previewNormalMap }) =>
    name && previewObjModel && previewTextureMap && previewNormalMap ? new DownloadableProduct(name, previewObjModel.url, previewTextureMap.url, previewNormalMap.url) : null
  ).filter(Boolean)) {
    const productDir = path.join(SAVE_DIR, product.name);
    fs.existsSync(productDir) || fs.mkdirSync(productDir);
    await Promise.all([
      downloadFile(product.previewObjectUrl, path.join(productDir, `${product.name}.obj`)),
      downloadFile(product.previewTextureMapUrl, path.join(productDir, `${product.name}_texture_map.png`)),
      downloadFile(product.previewNormalMapUrl, path.join(productDir, `${product.name}_normal_map.png`))
    ]);
  }
};

const downloadFile = async (url, filePath) => {
  if (fs.existsSync(filePath)) return console.log(`Already downloaded ${filePath}`);
  console.log(`Downloading ${filePath}`);
  fs.writeFileSync(filePath, await (await axios.get(url, { responseType: 'arraybuffer' })).data);
};

main().catch(console.error);
