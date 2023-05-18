use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::fs;
use std::path::Path;
use std::error::Error;
use reqwest::header::USER_AGENT;

#[derive(Debug, Serialize, Deserialize)]
struct DownloadableProduct {
    name: Option<String>,
    preview_object_url: Option<String>,
    preview_texture_map_url: Option<String>,
    preview_normal_map_url: Option<String>,
}

const PRODUCT_URL: &str = "https://bad-dragon.com/api/products";
const SAVE_DIR: &str = "models";

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    fs::create_dir_all(SAVE_DIR)?;

    println!("Saving objects to {}", SAVE_DIR);

    let products = load_products().await?;
    for product in process_products(products) {
        download_product(product).await?;
    }
    Ok(())
}

async fn load_products() -> Result<Vec<Value>, Box<dyn Error>> {
    let client = reqwest::Client::new();
    let res = client.get(PRODUCT_URL)
        .header(USER_AGENT, "Mozilla/5.0 (compatible; AcmeInc/1.0)")
        .send()
        .await?
        .text()
        .await?;

    let products: Vec<Value> = serde_json::from_str(&res)?;
    Ok(products)
}

fn process_products(products: Vec<Value>) -> Vec<DownloadableProduct> {
    products.into_iter().filter_map(|product| {
        let name = product.get("sku")?.as_str()?.to_string();

        let preview_object_url = product.get("previewObjModel")?.get("url")?.as_str()?.to_string();
        let preview_texture_map_url = product.get("previewTextureMap")?.get("url")?.as_str()?.to_string();
        let preview_normal_map_url = product.get("previewNormalMap")?.get("url")?.as_str()?.to_string();

        Some(DownloadableProduct {
            name: Some(name),
            preview_object_url: Some(preview_object_url),
            preview_texture_map_url: Some(preview_texture_map_url),
            preview_normal_map_url: Some(preview_normal_map_url),
        })
    }).collect()
}

async fn download_file(url: &str, path: &Path) -> Result<(), Box<dyn Error>> {
    if path.exists() {
        println!("Already downloaded {:?}", path);
        return Ok(());
    }

    println!("Downloading {:?}", path);

    let response = reqwest::get(url).await?.bytes().await?;
    fs::write(path, response)?;
    Ok(())
}

async fn download_product(product: DownloadableProduct) -> Result<(), Box<dyn Error>> {
    if let (Some(name), Some(preview_object_url), Some(preview_texture_map_url), Some(preview_normal_map_url)) = (product.name, product.preview_object_url, product.preview_texture_map_url, product.preview_normal_map_url) {
        let product_dir = Path::new(SAVE_DIR).join(&name);
        fs::create_dir_all(&product_dir)?;

        download_file(&preview_object_url, &product_dir.join(format!("{}.obj", name))).await?;
        download_file(&preview_texture_map_url, &product_dir.join(format!("{}_texture_map.png", name))).await?;
        download_file(&preview_normal_map_url, &product_dir.join(format!("{}_normal_map.png", name))).await?;
    }
    Ok(())
}
