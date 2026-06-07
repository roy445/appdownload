Protected Download API
======================

How it works
- The service exposes `/download/:name` and requires a token.
- It fetches the file from the GitHub raw URL (repo `download/` folder) and streams it to the client.

Deploy on Render
1. Create a new Web Service in Render, or use `render.yaml` provided.
2. Set environment variable `DOWNLOAD_TOKEN` to a strong secret.
3. Deploy. The service will listen on the Render-assigned port.

Usage
- Example request (query token):

  GET https://<your-api>.onrender.com/download/app-v1.0.1.apk?token=YOUR_TOKEN

- Or use Authorization header:

  Authorization: Bearer YOUR_TOKEN

Frontend
- Update your `config/version.json` or download links to point to the new API URL.
