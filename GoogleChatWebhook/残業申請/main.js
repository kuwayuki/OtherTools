const axios = require(`axios`);
const JapaneseHolidays = require("japanese-holidays");
const WEBHOOK_URL =
  "https://chat.googleapis.com/v1/spaces/AAAAiE9tcuQ/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=GLXKKqfpdDiBMRQJe8YxPXRx3xYQsQcXs-z7BXPUh6M%3D";

const date = new Date();
const dayOfWeek = date.getDay();
if (0 === dayOfWeek || 6 === dayOfWeek) return;
const holiday = JapaneseHolidays.isHoliday(date);
if (holiday) {
  console.log("今日は " + holiday + " です");
  return;
} else {
  console.log("今日は祝日ではありません");
}

const text =
  "<users/all> *🏢残業する方は必ず事由の記載をお願いします！！📒*\r\n（🙆‍♂️🙅‍♂️の合計は7人になるはずです）\r\n\r\nhttps://docs.google.com/spreadsheets/d/1CabylQdPxH_ajudoqhd14VWOrOJ1cB5aYwLogXdPS74";

axios
  .post(WEBHOOK_URL, {
    text: text,
  })
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.error(err.toJSON());
  });

