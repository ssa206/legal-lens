const fs = require('fs');
const path = require('path');

// Path to the pdf.worker.min.js file in node_modules
const workerPath = path.join(__dirname, '../node_modules/pdfjs-dist/build/pdf.worker.min.js');

// Path to the public directory
const publicPath = path.join(__dirname, '../public/pdf.worker.min.js');

// Copy the file
fs.copyFileSync(workerPath, publicPath);

console.log('PDF worker file copied successfully!');
