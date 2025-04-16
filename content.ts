chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "start") {
    const { startTime, endTime } = message;

    // 勤怠管理ページでの入力ロジックをここに記述します。
    console.log(`出勤時間: ${startTime}, 退勤時間: ${endTime}`);

    // ページのDOM操作を行い、出退勤時間を入力します。
    // 必要に応じてページ遷移のロジックも追加します。
  } else if (message.action === "stop") {
    console.log("入力処理が中止されました。");
    // 中止処理のロジックをここに記述します。
  }
});