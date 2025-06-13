const fs = require("fs");
const https = require("https");
const path = require("path");

const images = {
  "hero-electronics.jpg":
    "https://images.unsplash.com/photo-1498049794561-7780e7231661",
  "smartphones.jpg":
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
  "laptops.jpg": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
  "accessories.jpg":
    "https://images.unsplash.com/photo-1491933382434-500287f9b54b",
};

if (!fs.existsSync("images")) {
  fs.mkdirSync("images");
}

Object.entries(images).forEach(([filename, url]) => {
  const file = fs.createWriteStream(path.join("images", filename));
  https.get(url, (response) => {
    response.pipe(file);
  });
});
