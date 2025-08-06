const puppeteer = require("puppeteer");
const { execSync } = require("child_process");
const path = require("path");

// コマンドライン引数を取得
const args = process.argv.slice(2);
const isTestMode = args.includes("test");

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
  const useTenantName = isTestMode
    ? config.tenantName
    : config.honbanTenantName;

  const browser = await puppeteer.launch({
    headless: false,
    args: ["--start-maximized"], // ブラウザを最大化
  });

  // ★★★ Lambda環境変数設定 ★★★
  const lambdaPage = await browser.newPage();

  // ウィンドウサイズを取得し、最大化
  const windowSize = await lambdaPage.evaluate(() => {
    return { width: window.screen.width, height: window.screen.height };
  });

  // 新しいタブにもウィンドウサイズを適用
  await lambdaPage.setViewport({
    width: windowSize.width,
    height: windowSize.height,
    deviceScaleFactor: 1, // 解像度を維持
  });
  await lambdaPage.goto(
    "https://ap-northeast-1.console.aws.amazon.com/lambda/home?region=ap-northeast-1#/functions/tenant-contractor-user/edit/environment-variables?subtab=envVars&tab=configure"
  );

  // 1. アカウント ID (12桁) またはエイリアスを入力
  await lambdaPage.waitForSelector("input#account", { visible: true });
  await lambdaPage.type("input#account", "599684606536");

  // 2. IAM ユーザー名を入力
  await lambdaPage.waitForSelector("input#username", { visible: true });
  await lambdaPage.type("input#username", "Administrator");

  // 3. パスワードを入力
  await lambdaPage.waitForSelector("input#password", { visible: true });
  await lambdaPage.type("input#password", "interCOM@Admin#Prod2");

  // 4. サインインボタンをクリック
  await lambdaPage.waitForSelector("button#signin_button", { visible: true });
  await lambdaPage.click("button#signin_button");

  // ページが完全にロードされるのを待つ
  await lambdaPage.waitForSelector('input[value="EMAIL"]', { visible: true });

  await new Promise((resolve) => setTimeout(resolve, 5000));

  await lambdaPage.evaluate(
    (newEmail, newLoginId, tenantName) => {
      /**
       * 指定したキーに対応する値入力欄の値を更新する関数
       * @param {string} key - "EMAIL", "LOGIN_ID", "TENANT_NAME" など
       * @param {string} newValue - 設定する新しい値
       * @returns {boolean} - 更新に成功した場合は true
       */
      function updateFieldByKey(key, newValue) {
        // role="group" でグループ化されている全ての要素を取得
        const groups = Array.from(document.querySelectorAll('[role="group"]'));
        for (const group of groups) {
          // キー入力欄：aria-labelledby が "first-control-id-" で始まる input を取得
          const keyInput = group.querySelector(
            'input[aria-labelledby^="first-control-id-"]'
          );
          if (keyInput && keyInput.value.trim() === key) {
            // 値入力欄：aria-labelledby が "formField:" で始まる input を取得
            const valueInput = group.querySelector(
              'input[aria-labelledby^="formField:"]'
            );
            if (valueInput) {
              // ネイティブセッターを使って値を更新し、イベントを発火
              const nativeSetter = Object.getOwnPropertyDescriptor(
                window.HTMLInputElement.prototype,
                "value"
              ).set;
              nativeSetter.call(valueInput, newValue);
              valueInput.dispatchEvent(new Event("input", { bubbles: true }));
              valueInput.dispatchEvent(new Event("change", { bubbles: true }));
              return true;
            }
          }
        }
        return false;
      }

      // EMAIL の更新（キーが "EMAIL" のグループ内の値入力欄を更新）
      updateFieldByKey("EMAIL", newEmail);
      // LOGIN_ID の更新
      updateFieldByKey("LOGIN_ID", newLoginId);
      // TENANT_NAME の更新
      updateFieldByKey("TENANT_NAME", tenantName);
    },
    isTestMode
      ? `ddp.cloud+${useTenantName}@intercom.co.jp`
      : config.adminMailAddress,
    config.adminLoginId,
    useTenantName
  );

  // if (isTestMode) {
  //   // 保存ボタンをクリック
  //   await newPage.waitForSelector('button[data-analytics="save"]', {
  //     visible: true,
  //   });
  //   await newPage.click('button[data-analytics="save"]');
  // }

  // 受け入れ環境構築時は別タブを開かない
  if (isTestMode) return;

  // ★★★ Cognito ★★★
  const cognitoPage = await browser.newPage();
  await cognitoPage.setViewport({
    width: windowSize.width,
    height: windowSize.height,
    deviceScaleFactor: 1, // 解像度を維持
  });

  await cognitoPage.goto(
    "https://ap-northeast-1.console.aws.amazon.com/cognito/v2/idp/user-pools?region=ap-northeast-1"
  );

  await cognitoPage.waitForSelector(
    'input[aria-label="名前または ID でユーザープールを検索"]',
    { visible: true }
  );
  await cognitoPage.type(
    'input[aria-label="名前または ID でユーザープールを検索"]',
    useTenantName
  );

  // 検索結果のテーブルの先頭リンクが表示されるまで待機
  await cognitoPage.waitForSelector("tbody tr:first-child td a", {
    visible: true,
  });

  // 検索結果の先頭リンクをクリック
  await cognitoPage.click("tbody tr:first-child td a");
})();
