# Bad Dragon Product Downloader

This repository contains a C# console application that downloads the 3D model, texture map, and normal map for each product from Bad Dragon's API and saves them to a local directory.

## How it works

The application sends a GET request to the Bad Dragon API endpoint and retrieves a list of products. Each product has several properties, including URLs for downloading the product's 3D model, texture map, and normal map.

The application iterates over the list of products, downloading each product's model and maps, and saving them to a specified directory on the local file system.

## Usage

1. Clone this repository to your local machine.
2. Open the solution in Visual Studio.
3. Build and run the application.

The application will create a directory (if it doesn't exist), send a request to the Bad Dragon API, parse the response, and download the products. You can check the progress in the console output.

## Configurations

- **PRODUCT_URL**: This is the Bad Dragon API endpoint from which the products are retrieved. It is defined as a constant in the `Program` class.
- **SAVE_DIR**: This is the directory where the products will be saved. It is defined as a constant in the `Program` class.

You can change these values in the `Program` class according to your needs.

## Troubleshooting

If you encounter an error message stating "Invalid URL", it likely means the URL for a product's model, texture map, or normal map is not correctly formatted or does not exist. Please check the source of the product data or the code handling the data in the application.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
