import os, requests, json

class DownloadableProduct:
    def __init__(self, name, preview_object_url, preview_texture_map_url, preview_normal_map_url):
        self.name = name
        self.preview_object_url = preview_object_url
        self.preview_texture_map_url = preview_texture_map_url
        self.preview_normal_map_url = preview_normal_map_url

def download_file(url, path):
    if not os.path.exists(path):
        print(f"Downloading {path}")
        with open(path, 'wb') as f:
            f.write(requests.get(url).content)

if __name__ == "__main__":
    PRODUCT_URL = "https://bad-dragon.com/api/products"
    SAVE_DIR = "models"
    os.makedirs(SAVE_DIR, exist_ok=True)
    print(f"Saving objects to {SAVE_DIR}")

    products = requests.get(PRODUCT_URL, headers={'User-Agent': 'Mozilla/5.0 (compatible; AcmeInc/1.0)'}).json()
    for product in products:
        name, obj_url, tex_url, norm_url = product.get('sku'), product.get('previewObjModel', {}).get('url'), product.get('previewTextureMap', {}).get('url'), product.get('previewNormalMap', {}).get('url')
        if name and obj_url and tex_url and norm_url:
            dp = DownloadableProduct(name, obj_url, tex_url, norm_url)
            product_dir = os.path.join(SAVE_DIR, dp.name)
            os.makedirs(product_dir, exist_ok=True)
            download_file(dp.preview_object_url, os.path.join(product_dir, f"{dp.name}.obj"))
            download_file(dp.preview_texture_map_url, os.path.join(product_dir, f"{dp.name}_texture_map.png"))
            download_file(dp.preview_normal_map_url, os.path.join(product_dir, f"{dp.name}_normal_map.png"))
