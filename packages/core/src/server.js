import http from "http";
import fs from "fs";
import path from "path";

export function createServer(options) {
  const root = options.root;
  const onReady = options.onReady;

  const server = http.createServer((req, res) => {
    const { pathname } = new URL(req.url, `http://${req.headers.host}`);

    const filePath =
      pathname === "/"
        ? path.join(root, "index.html")
        : path.join(root, pathname);

    if (!fs.existsSync(filePath)) {
      res.statusCode = 404;
      res.end("Not Found");
      return;
    }

    const content = fs.readFileSync(filePath);

    res.setHeader("Content-Type", getContentType(filePath));
    res.end(content);
  });

  server.listen(2580, () => {
    onReady?.("http://localhost:2580/");
  });
}

function getContentType(file) {
  if (file.endsWith(".html")) return "text/html";
  if (file.endsWith(".js")) return "application/javascript";
  if (file.endsWith(".css")) return "text/css";
  return "text/plain";
}

