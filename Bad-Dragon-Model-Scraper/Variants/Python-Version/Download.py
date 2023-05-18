import os
import requests
import json

class DownloadableProduct:
    def __init__(self, name, preview_object_url, preview_texture_map_url, preview_normal_map_url):
        self.name = name
        self.preview_object_url = preview_object_url
        self.preview_texture_map_url = preview_texture_map_url
        self.preview_normal_map_url = preview_normal_map_url

PRODUCT_URL = "https://bad-dragon.com/api/products"
SAVE_DIR = "models"

def main():
    os.makedirs(SAVE_DIR, exist_ok=True)
    print(f"Saving objects to {SAVE_DIR}")
    products = load_products()
    for product in process_products(products):
        download_product(product, SAVE_DIR)

def load_products():
    return requests.get(PRODUCT_URL, headers={'User-Agent': 'Mozilla/5.0 (compatible; AcmeInc/1.0)'}).json()

def process_products(products):
    return [
        DownloadableProduct(
            product['sku'],
            product.get('previewObjModel', {}).get('url'),
            product.get('previewTextureMap', {}).get('url'),
            product.get('previewNormalMap', {}).get('url')
        )
        for product in products
        if all([
            product['sku'],
            product.get('previewObjModel', {}).get('url'),
            product.get('previewTextureMap', {}).get('url'),
            product.get('previewNormalMap', {}).get('url')
        ])
    ]

def download_file(url, path):
    if os.path.exists(path):
        print(f"Already downloaded {path}")
        return
    print(f"Downloading {path}")
    with open(path, 'wb') as f:
        f.write(requests.get(url).content)

def download_product(product, save_dir):
    product_dir = os.path.join(save_dir, product.name)
    os.makedirs(product_dir, exist_ok=True)
    download_file(product.preview_object_url, os.path.join(product_dir, f"{product.name}.obj"))
    download_file(product.preview_texture_map_url, os.path.join(product_dir, f"{product.name}_texture_map.png"))
    download_file(product.preview_normal_map_url, os.path.join(product_dir, f"{product.name}_normal_map.png"))

if __name__ == "__main__":
    main()
