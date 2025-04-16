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
  else if (message.action === "findTargets") {
    const targets = findTargets();
    console.log("勤怠管理ページのターゲット:", targets);
    sendResponse({ targets });
  }

});

const sendWeekdaysToPopup = () => {
  const weekdays = findTargets().map(cell => cell.innerText);
  chrome.runtime.sendMessage({ action: "updateWeekdays", weekdays });
};

// ページ読み込み時に平日の情報を送信
window.addEventListener("load", sendWeekdaysToPopup);

const findTargets = () => {
  const targets: { date: string, buttonId: string }[] = [];
  const cells = document.querySelectorAll<HTMLTableCellElement>('td.work_day_type');

  cells.forEach(cell => {
    if (cell.innerText !== '平日') {
      return
    }

    const tr = cell.closest('tr')
    if (!tr) return

    const options = tr.firstElementChild?.querySelectorAll('option')
    if (!options) return;

    const buttonId = Array.from(options).find((option) => option.innerText === '打刻編集')?.value
    if (!buttonId) return;

    const date = tr.querySelector<HTMLTableCellElement>('td:nth-child(1)')!.innerText
    targets.push({ date, buttonId, })
  });

  return targets;
};