const express = require("express");
const youtubedl = require("youtube-dl-exec");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const ffmpegPath = require("ffmpeg-static");

const app = express();
const port = 3503;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

function cleanYouTubeUrl(url) {
  try {
    const parsedUrl = new URL(url);
    let videoId = null;

    if (parsedUrl.hostname === "youtu.be") {
      videoId = parsedUrl.pathname.slice(1);
    } else if (
      parsedUrl.hostname === "www.youtube.com" ||
      parsedUrl.hostname === "youtube.com" ||
      parsedUrl.hostname === "m.youtube.com"
    ) {
      videoId = parsedUrl.searchParams.get("v");
    }

    return videoId ? `https://www.youtube.com/watch?v=${videoId}` : null;
  } catch (error) {
    return null;
  }
}

function generateRandomFileName(extension) {
  return crypto.randomBytes(5).toString("hex") + extension;
}

function cleanupFiles(filePaths) {
  return Promise.all(
    filePaths.map(
      (filePath) =>
        new Promise((resolve, reject) => {
          fs.unlink(filePath, (err) => {
            if (err) return reject(err);
            resolve();
          });
        })
    )
  );
}

app.get("/video-info", async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  const cleanUrl = cleanYouTubeUrl(url);
  if (!cleanUrl) {
    return res.status(400).json({ error: "Invalid YouTube URL" });
  }

  try {
    const output = await youtubedl(cleanUrl, {
      dumpSingleJson: true,
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: true,
    });
    res.json(output);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

app.get("/mp4", async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  const cleanUrl = cleanYouTubeUrl(url);
  if (!cleanUrl) {
    return res.status(400).json({ error: "Invalid YouTube URL" });
  }

  try {
    const fileName = generateRandomFileName(".mp4");
    const tempFilePath = path.join(__dirname, fileName);

    res.setTimeout(0);

    const stream = youtubedl.exec(cleanUrl, {
      output: tempFilePath,
      format: "mp4",
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: true,
    });

    stream.on("close", () => {
      res.download(tempFilePath, (err) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: "Download error" });
        } else {
          cleanupFiles([tempFilePath]).catch(console.error);
        }
      });
    });

    stream.on("error", (error) => {
      console.error(error);
      res.status(500).json({ error: "An error occurred" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

app.get("/mp3", async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  const cleanUrl = cleanYouTubeUrl(url);
  if (!cleanUrl) {
    return res.status(400).json({ error: "Invalid YouTube URL" });
  }

  try {
    const fileName = generateRandomFileName(".mp3");
    const tempFilePath = path.join(__dirname, fileName);

    res.setTimeout(0);

    const stream = youtubedl.exec(cleanUrl, {
      output: tempFilePath,
      extractAudio: true,
      audioFormat: "mp3",
      noCheckCertificates: true,
      noWarnings: true,
    });

    stream.on("close", () => {
      res.download(tempFilePath, (err) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: "Download error" });
        } else {
          cleanupFiles([tempFilePath]).catch(console.error);
        }
      });
    });

    stream.on("error", (error) => {
      console.error(error);
      res.status(500).json({ error: "An error occurred" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
