# 靜態版本網站

簡單靜態網站，會自動從 `config/version.json` 讀取版本資訊並同步到首頁、下載按鈕、版本歷史與 Footer。

快速測試（需要有 node 或安裝 `http-server` / `serve`）：

```bash
# 使用 http-server (安裝: npm i -g http-server)
http-server . -c-1

# 或使用 serve (安裝: npm i -g serve)
serve .
```

更新版本：編輯 `config/version.json` 的欄位（`latest`, `apk`, `releaseDate`, `size`, `minAndroid`, `status`），儲存後重新整理頁面即可。

Vercel 部署（建議）

1. 建議先把專案推到 GitHub（或 GitLab/Bitbucket）。
2. 使用 Vercel CLI 快速部署（會要求登入並建立或連結專案）：

```bash
# 安裝 Vercel CLI
npm i -g vercel

# 第一次登入並連結專案（互動式）
vercel

# 一次性生產環境部署
vercel --prod
```

3. 或直接在 Vercel 網站新增專案，連結你的 Git 倉庫，推送後會自動部署。`vercel.json` 已包含靜態部署設定。

注意：若要自動將 APK 上傳到公開 URL，請把正式 APK 放到 `download/`，並確認 `config/version.json` 的 `apk` 欄位路徑正確。

