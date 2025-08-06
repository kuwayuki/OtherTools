# PyAutoGUIライブラリのインポート
import pyautogui

# timeモジュールのsleep関数をインポート
from time import sleep

# Windowsボタン押下
pyautogui.press('win')

# 検索窓に「notepad」と入力
pyautogui.write('notepad')

# Enterボタン押下
pyautogui.press('enter')

# メモ帳が起動するまで待機（待機時間は適宜調整）
sleep(1)

# 文字を入力
pyautogui.write('abcdefghi')