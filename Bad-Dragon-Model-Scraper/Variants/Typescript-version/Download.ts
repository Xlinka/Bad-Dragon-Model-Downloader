import * as fs from 'fs';
import * as https from 'https';

class DownloadableProduct {
  name: string;
  preview_object_url: string;
  preview_texture_map_url: string;
  preview_normal_map_url: string;

  constructor(name: string, preview_object_url: string, preview_texture_map_url: string, preview_normal_map_url: string) {
    this.name = name;
    this.preview_object_url = preview_object_url;
    this.preview_texture_map_url = preview_texture_map_url;
    this.preview_normal_map_url = preview_normal_map_url;
  }
}

const PRODUCT_URL = "https://bad-dragon.com/api/products";
const SAVE_DIR = "models";

function main() {
  fs.mkdirSync(SAVE_DIR, { recursive: true });
  console.log(`Saving objects to ${SAVE_DIR}`);

  const products = loadProducts();
  for (const product of processProducts(products)) {
    downloadProduct(product, SAVE_DIR);
  }
}

function loadProducts(): any[] {
  const options = {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AcmeInc/1.0)' }
  };

  const response = https.get(PRODUCT_URL, options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      const products = JSON.parse(data);
      return products;
    });
  });

  response.on('error', (error) => {
    console.error(`Error loading products: ${error}`);
    return [];
  });

  return [];
}

function processProducts(products: any[]): DownloadableProduct[] {
  const processedProducts: DownloadableProduct[] = [];
  for (const product of products) {
    const name = product.sku;
    const previewObjectUrl = product.previewObjModel?.url;
    const previewTextureMapUrl = product.previewTextureMap?.url;
    const previewNormalMapUrl = product.previewNormalMap?.url;

    if (name && previewObjectUrl && previewTextureMapUrl && previewNormalMapUrl) {
      processedProducts.push(new DownloadableProduct(name, previewObjectUrl, previewTextureMapUrl, previewNormalMapUrl));
    }
  }
  return processedProducts;
}

function downloadFile(url: string, path: string) {
  if (fs.existsSync(path)) {
    console.log(`Already downloaded ${path}`);
    return;
  }

  console.log(`Downloading ${path}`);

  https.get(url, (res) => {
    const file = fs.createWriteStream(path);
    res.pipe(file);
    file.on('finish', () => {
      file.close();
    });
  }).on('error', (error) => {
    console.error(`Error downloading file: ${error}`);
  });
}

function downloadProduct(product: DownloadableProduct, saveDir: string) {
  const productDir = `${saveDir}/${product.name}`;
  fs.mkdirSync(productDir, { recursive: true });

  downloadFile(product.preview_object_url, `${productDir}/${product.name}.obj`);
  downloadFile(product.preview_texture_map_url, `${productDir}/${product.name}_texture_map.png`);
  downloadFile(product.preview_normal_map_url, `${productDir}/${product.name}_normal_map.png`);
}

main();
