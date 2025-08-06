# pip install selenium webdriver-manager
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options

# ヘッドレスモードで実行するように Chrome オプションを設定
options = Options()
options.add_argument("--headless=new")

# Chrome ドライバーを初期化
driver = webdriver.Chrome(
    service=Service(), 
    options=options
)

# ターゲットウェブページに移動
driver.get("https://httpbin.io/ip")

# ターゲットウェブページの HTML を出力
print(driver.page_source)

# リソースを解放してブラウザを閉じる
driver.quit()