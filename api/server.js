const express = require("express");
const cors = require("cors");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const rateLimit = require("express-rate-limit");

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});

app.use(limiter);
app.use(cors());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, 
  },
});

// Upload
app.post("/api/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      resource_type: "auto",
      folder: "imageuploader",
    });

    return res.status(200).json({
      message: "File uploaded successfully",
      url: result.secure_url,
      filename: req.file.originalname,
      size: req.file.size,
      public_id: result.public_id,
    });
  } catch (error) {
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return res
        .status(500)
        .json({ error: "Cloudinary configuration is missing" });
    }
    if (error.http_code === 400) {
      return res
        .status(400)
        .json({ error: "Invalid file format or corrupt image" });
    }
    if (error.http_code === 401) {
      return res.status(401).json({ error: "Invalid Cloudinary credentials" });
    }
    res.status(500).json({ error: "An error occurred during upload." });
  }
});


app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

app.get("/api/download/:public_id", async (req, res) => {
  const { public_id } = req.params;
  const { filename } = req.query;
  if (!public_id) {
    return res.status(400).json({ error: "Public ID parameter is required" });
  }

  try {
    const resource = await cloudinary.api.resource(public_id, {
      resource_type: "image",
    });
    if (!resource || !resource.secure_url) {
      return res.status(404).json({ error: "File not found" });
    }

    let downloadFilename = filename || public_id;
    if (downloadFilename && !downloadFilename.includes(".")) {
      if (resource.format) {
        downloadFilename += "." + resource.format;
      } else if (resource.secure_url) {
        const urlParts = resource.secure_url.split(".");
        if (urlParts.length > 1) {
          downloadFilename += "." + urlParts[urlParts.length - 1].split("?")[0];
        }
      }
    }

    const https = require("https");
    https
      .get(resource.secure_url, (cloudinaryRes) => {
        res.setHeader(
          "Content-Type",
          cloudinaryRes.headers["content-type"] || "application/octet-stream"
        );
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${downloadFilename}"`
        );
        cloudinaryRes.pipe(res);
      })
      .on("error", (err) => {
        res.status(500).json({ error: "Error downloading file" });
      });
  } catch (error) {
    res.status(500).json({ error: "Failed to download file" });
  }
});

if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 3001;
  app.listen(port, () => console.log(`Server running on port ${port}`));
}

module.exports = app;
