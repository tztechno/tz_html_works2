# Rasterbench

A web tool for batch-converting image formats. Everything runs in your browser — no image is ever uploaded to a server.

## Supported formats

| | Formats |
|---|---|
| Read (input) | PNG / JPEG / WebP / GIF / BMP / SVG |
| Convert to (output) | PNG / JPEG / WebP / GIF |

SVG files are converted to a raster (bitmap) image — there's no way to export back to vector format.

BMP is read-only. Because the browser's save dialog only accepts a fixed list of file extensions, Rasterbench can't write BMP files directly.

## How to use it

1. Drag and drop image files onto the drop zone in the middle of the page, or click it to choose files. You can add several files at once.
2. Pick a target format — PNG, JPEG, WebP, or GIF — from the "Target format" row.
3. Click "Convert all". Each file is converted in turn; its badge switches to "Done" once it's finished.
4. Save the results:
   - One at a time: click the "Download" button on any row.
   - All at once: click "Download all" to walk through the converted files, confirming each save in turn.
5. Your browser or app will show a save confirmation for each file — accept it to save. Declining one file doesn't stop the rest from being offered.

## Things to know

- **Transparency**: JPEG and GIF have no alpha channel, so converting to either format fills transparent areas with white. Choose PNG or WebP if you need to keep transparency.
- **GIF color count**: GIF output is reduced to a maximum of 256 colors using automatic median-cut quantization. Photos with lots of color variation may show visible banding.
- **Animated GIFs**: Conversion always produces a single still frame. If you load an animated GIF, only its first frame is used.
- **File size**: Files larger than 16MB may fail to save.

## Theme

Use the button in the top right to switch between System, Light, and Dark display themes.

## Privacy

Reading, converting, and saving images all happen inside the browser tab you have this page open in. Nothing is ever sent to an external server.
