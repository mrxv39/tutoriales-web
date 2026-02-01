# Tutoriales Web

A simple tutorial website built with Node.js and Express.

## Description

This is a minimal static website that serves tutorial content. It uses Express as a lightweight static file server to deliver HTML pages and assets.

## Project Structure

```
tutoriales-web/
├── public/
│   ├── tutoriales/
│   ├── index.html
│   ├── tutorial.html
│   └── style.css
├── server.js
├── package.json
├── Dockerfile
└── README.md
```

## Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Deployment

This project includes a Dockerfile compatible with Fly.io using Node 20 Alpine.

To deploy to Fly.io:
```bash
fly launch
fly deploy
```

## License

ISC
