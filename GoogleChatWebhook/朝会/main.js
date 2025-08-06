const axios = require(`axios`)

// 環境変数 `WEBHOOK_URL` を介して incoming webhook を受け取る
const WEBHOOK_URL = "https://chat.googleapis.com/v1/spaces/AAAAnqFt5_Q/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=I9UsHqPhHp-cL0i3NonwmgWWJUPcgaG8FcYq3pNDBcw%3D"

const text = "<users/all> 朝会です。\r\nhttps://meet.google.com/uxt-fsdj-jrw"
// const text = `こんにちは。通知です。<users/123456789012345678901>`
axios.post(WEBHOOK_URL, {
  text: text,
})
.then((res) => {
  console.log(res)
})
.catch((err) => {
  console.error(err.toJSON())
})