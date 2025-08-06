const puppeteer = require("puppeteer");
const { execSync } = require("child_process");
const path = require("path");

// 環境変数にGoogleのログイン用アドレスとパスワードを設定
const googleAddr = process.env.GOOGLE_ADDRESS;
const googlePasswd = process.env.GOOGLE_PASSWD;

// PowerShell スクリプトを実行して `tenantName` を取得
function getConfig() {
  try {
    const scriptPath = path.resolve(__dirname, "../config/config-Prod.ps1"); // 絶対パスに変換
    const command = `powershell -ExecutionPolicy Bypass -Command "& { ${scriptPath} | ConvertTo-Json -Depth 10 }"`;
    const output = execSync(command, { encoding: "utf8" });
    const config = JSON.parse(output);
    return config;
  } catch (error) {
    console.error("PowerShell スクリプトの実行に失敗:", error);
    return "defaultTenant";
  }
}

(async () => {
  const config = getConfig(); // PowerShell から取得
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ["--start-maximized"],
  });
  const page = await browser.newPage();

  // Googleログインが必要なサイトへ移動
  await page.goto(
    "https://console.cloud.google.com/apis/credentials/oauthclient/816830832337-dih0g11vrovdggbl2dktv9qckkevgfsq.apps.googleusercontent.com?inv=1&invt=AboMQw&project=final-document-441102"
  );

  // Googleログインボタンをクリック
  await page.type('input[type="email"]', googleAddr);
  await page.keyboard.press("Enter"); // エンターキーを押す

  // Googleアドレスの@より前の部分を取得
  const googleUsername = googleAddr.split("@")[0];
  await page.waitForSelector("input#rawUsername", { visible: true }); // 要素が表示されるまで待機
  await page.type("input#rawUsername", googleUsername);
  await page.keyboard.press("Enter"); // エンターキーを押す

  await page.waitForSelector("input#password", { visible: true }); // 要素が表示されるまで待機
  await page.type("input#password", googlePasswd);
  await page.keyboard.press("Enter"); // エンターキーを押す

  await page.waitForSelector('button[jsname="LgbsSe"]', { visible: true }); // ボタンが表示されるまで待機
  await page.click('button[jsname="LgbsSe"]'); // クリック

  await page.waitForSelector('button[aria-label="URI を追加"]', {
    visible: true,
  });
  await page.click('button[aria-label="URI を追加"]'); // クリック

  // すべての `URI` 入力欄を取得し、一番最後のものを選択
  const url = `https://${config.honbanTenantName}.finaldocument.jp`;
  const uriInputs = await page.$$('input[formcontrolname="uri"]');
  const lastInput = uriInputs[uriInputs.length - 1]; // 一番下の要素
  await lastInput.type(url); // 追記する

  // ズームを90%に設定
  await page.evaluate(() => {
    document.body.style.zoom = "0.9";
  });

  // 不要ならコメントアウト
  // await page.keyboard.press("Enter"); // エンターキーを押す

  // 処理完了後、ブラウザを閉じる
  // await browser.close();
})();
