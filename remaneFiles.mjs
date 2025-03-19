import { readdir, stat, rename } from 'fs/promises';
import { join, extname } from 'path';

const directory = './src'; // Change this to your source directory

async function renameFiles(dir) {
  try {
    const files = await readdir(dir);

    for (const file of files) {
      const filePath = join(dir, file);
      const fileStat = await stat(filePath);

      if (fileStat.isDirectory()) {
        await renameFiles(filePath); // Recursively rename files in subdirectories
      } else if (extname(file) === '.js') {
        const newFilePath = filePath.replace(/\.js$/, '.jsx');
        await rename(filePath, newFilePath);
        console.log(`Renamed: ${filePath} -> ${newFilePath}`);
      }
    }
  } catch (err) {
    console.error(`Error processing directory ${dir}:`, err);
  }
}

renameFiles(directory);
