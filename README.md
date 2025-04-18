# HDRify

A web application that applies HDR-like effects to images using WebAssembly and ImageMagick.

## About

HDRify allows you to apply custom color profiles to images to give them an HDR-like appearance. This tool is inspired by the blog post [HDR-Infused Emoji](https://sharpletters.net/2025/04/16/hdr-emoji/) by Corry Haines.

The application uses [@imagemagick/magick-wasm](https://github.com/dlemstra/magick-wasm), a WebAssembly implementation of ImageMagick to process images directly in the browser without requiring server-side processing.

## Features

- Two processing modes:
  - **Sane Mode**: Applies a more subtle HDR effect
  - **Chaos Mode**: Applies a more dramatic HDR effect with enhanced colors
- Drag-and-drop file uploads
- Direct download of processed images
- Responsive design for both desktop and mobile devices
- No server-side processing - everything happens in your browser

## How It Works

1. Upload an image using the drag-and-drop zone or file selector
2. Choose between "Sane Mode" or "Chaos Mode"
3. Click "Process Image" to apply the selected HDR effect
4. View the result and download the processed image

## License

This project is dual-licensed:
- Original code is licensed under the MIT License
- The project includes [@imagemagick/magick-wasm](https://github.com/dlemstra/magick-wasm) which is licensed under the Apache-2.0 License

When using or modifying this project, please adhere to both license requirements for the respective components.

## Credits

- Created by Cristian Rivera
- Inspired by [HDR-Infused Emoji](https://sharpletters.net/2025/04/16/hdr-emoji/) by Corry Haines
- Uses [magick-wasm](https://github.com/dlemstra/magick-wasm) (Apache-2.0 License)
