/**
 * Image Optimization Script
 * 
 * This script optimizes all images in the public directory and creates WebP versions.
 * It uses sharp for image processing and maintains the original directory structure.
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const glob = require('glob');

// Configuration
const config = {
  // Source directory containing images
  sourceDir: path.join(__dirname, '../public'),
  
  // Output directory for optimized images
  outputDir: path.join(__dirname, '../public/optimized'),
  
  // Image formats to process
  formats: ['.jpg', '.jpeg', '.png', '.gif'],
  
  // Quality settings (0-100)
  quality: {
    jpeg: 80,
    webp: 75,
    avif: 65,
    png: 80
  },
  
  // Generate responsive sizes
  sizes: [320, 640, 960, 1280, 1920],
  
  // Skip files larger than this size (in bytes)
  maxFileSize: 10 * 1024 * 1024, // 10MB
};

// Create output directory if it doesn't exist
if (!fs.existsSync(config.outputDir)) {
  fs.mkdirSync(config.outputDir, { recursive: true });
}

// Find all images in the source directory
const findImages = () => {
  const patterns = config.formats.map(format => `${config.sourceDir}/**/*${format}`);
  return glob.sync(patterns, { nocase: true });
};

// Process an image
const processImage = async (imagePath) => {
  try {
    const stats = fs.statSync(imagePath);
    
    // Skip files that are too large
    if (stats.size > config.maxFileSize) {
      console.log(`Skipping large file: ${imagePath}`);
      return;
    }
    
    const relativePath = path.relative(config.sourceDir, imagePath);
    const fileDir = path.dirname(relativePath);
    const fileName = path.basename(relativePath, path.extname(relativePath));
    const outputDir = path.join(config.outputDir, fileDir);
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Load the image
    const image = sharp(imagePath);
    const metadata = await image.metadata();
    
    // Generate responsive sizes
    for (const size of config.sizes) {
      // Skip sizes larger than the original
      if (size >= metadata.width) continue;
      
      const resizedImage = image.clone().resize(size);
      
      // Original format (optimized)
      if (['.jpg', '.jpeg'].includes(path.extname(imagePath).toLowerCase())) {
        await resizedImage
          .jpeg({ quality: config.quality.jpeg, progressive: true })
          .toFile(path.join(outputDir, `${fileName}-${size}.jpg`));
      } else if (path.extname(imagePath).toLowerCase() === '.png') {
        await resizedImage
          .png({ quality: config.quality.png, compressionLevel: 9 })
          .toFile(path.join(outputDir, `${fileName}-${size}.png`));
      }
      
      // WebP format
      await resizedImage
        .webp({ quality: config.quality.webp })
        .toFile(path.join(outputDir, `${fileName}-${size}.webp`));
      
      // AVIF format (if supported)
      try {
        await resizedImage
          .avif({ quality: config.quality.avif })
          .toFile(path.join(outputDir, `${fileName}-${size}.avif`));
      } catch (error) {
        console.log(`AVIF conversion failed for ${imagePath}: ${error.message}`);
      }
    }
    
    // Original size (optimized)
    if (['.jpg', '.jpeg'].includes(path.extname(imagePath).toLowerCase())) {
      await image
        .jpeg({ quality: config.quality.jpeg, progressive: true })
        .toFile(path.join(outputDir, `${fileName}.jpg`));
    } else if (path.extname(imagePath).toLowerCase() === '.png') {
      await image
        .png({ quality: config.quality.png, compressionLevel: 9 })
        .toFile(path.join(outputDir, `${fileName}.png`));
    } else if (path.extname(imagePath).toLowerCase() === '.gif') {
      // Just copy GIFs for now
      fs.copyFileSync(imagePath, path.join(outputDir, `${fileName}.gif`));
    }
    
    // WebP format (original size)
    await image
      .webp({ quality: config.quality.webp })
      .toFile(path.join(outputDir, `${fileName}.webp`));
    
    // AVIF format (original size)
    try {
      await image
        .avif({ quality: config.quality.avif })
        .toFile(path.join(outputDir, `${fileName}.avif`));
    } catch (error) {
      console.log(`AVIF conversion failed for ${imagePath}: ${error.message}`);
    }
    
    console.log(`Processed: ${relativePath}`);
  } catch (error) {
    console.error(`Error processing ${imagePath}: ${error.message}`);
  }
};

// Main function
const main = async () => {
  console.log('Starting image optimization...');
  
  const images = findImages();
  console.log(`Found ${images.length} images to process`);
  
  // Process images in batches to avoid memory issues
  const batchSize = 5;
  for (let i = 0; i < images.length; i += batchSize) {
    const batch = images.slice(i, i + batchSize);
    await Promise.all(batch.map(processImage));
  }
  
  console.log('Image optimization complete!');
  console.log(`Optimized images saved to: ${config.outputDir}`);
};

// Run the script
main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});