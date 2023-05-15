using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;

public class DownloadableProduct
{
    public string Name { get; set; }
    public string PreviewObjectUrl { get; set; }
    public string PreviewTextureMapUrl { get; set; }
    public string PreviewNormalMapUrl { get; set; }
}

public class Program
{
    const string PRODUCT_URL = "https://bad-dragon.com/api/products";
    const string SAVE_DIR = "models";

    static async Task Main(string[] args)
    {
        var saveDir = SAVE_DIR;

        if (!Directory.Exists(saveDir))
        {
            Directory.CreateDirectory(saveDir);
        }

        Console.WriteLine($"Saving objects to {saveDir}");

        var products = await LoadProducts();
        foreach (var product in ProcessProducts(products))
        {
            await DownloadProduct(product, saveDir);
        }
    }

    static async Task<List<Dictionary<string, object>>> LoadProducts()
    {
        using (var client = new HttpClient())
        {
            client.DefaultRequestHeaders.UserAgent.ParseAdd("Mozilla/5.0 (compatible; AcmeInc/1.0)");
            string url = "https://bad-dragon.com/api/products";
            var response = await client.GetStringAsync(new Uri(url));
            return JsonSerializer.Deserialize<List<Dictionary<string, object>>>(response);
        }
    }

    static IEnumerable<DownloadableProduct> ProcessProducts(List<Dictionary<string, object>> products)
    {
        foreach (var product in products)
        {
            var name = product.ContainsKey("sku") ? product["sku"].ToString() : null;

            var previewObjectUrl = product.ContainsKey("previewObjModel") ? JsonSerializer.Deserialize<Dictionary<string, object>>(product["previewObjModel"].ToString())["url"].ToString() : null;
            var previewTextureMapUrl = product.ContainsKey("previewTextureMap") ? JsonSerializer.Deserialize<Dictionary<string, object>>(product["previewTextureMap"].ToString())["url"].ToString() : null;
            var previewNormalMapUrl = product.ContainsKey("previewNormalMap") ? JsonSerializer.Deserialize<Dictionary<string, object>>(product["previewNormalMap"].ToString())["url"].ToString() : null;

            if (string.IsNullOrWhiteSpace(name)
                || string.IsNullOrWhiteSpace(previewObjectUrl)
                || string.IsNullOrWhiteSpace(previewTextureMapUrl)
                || string.IsNullOrWhiteSpace(previewNormalMapUrl))
            {
                continue;
            }

            yield return new DownloadableProduct
            {
                Name = name,
                PreviewObjectUrl = previewObjectUrl,
                PreviewTextureMapUrl = previewTextureMapUrl,
                PreviewNormalMapUrl = previewNormalMapUrl
            };
        }
    }

    static async Task DownloadFile(string url, string path)
    {
        if (File.Exists(path))
        {
            Console.WriteLine($"Already downloaded {path}");
            return;
        }

        Console.WriteLine($"Downloading {path}");

        using (var client = new HttpClient())
        {
            // Ensure the URL is a valid absolute URL
            if (!Uri.IsWellFormedUriString(url, UriKind.Absolute))
            {
                Console.WriteLine($"Invalid URL: {url}");
                return;
            }

            var response = await client.GetByteArrayAsync(url);
            await File.WriteAllBytesAsync(path, response);
        }
    }

    static async Task DownloadProduct(DownloadableProduct product, string saveDir)
    {
        await DownloadFile(product.PreviewObjectUrl, Path.Combine(saveDir, $"{product.Name}.obj"));
        await DownloadFile(product.PreviewTextureMapUrl, Path.Combine(saveDir, $"{product.Name}_texture_map.png"));
        await DownloadFile(product.PreviewNormalMapUrl, Path.Combine(saveDir, $"{product.Name}_normal_map.png"));
    }
}
