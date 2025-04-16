document.getElementById("start-button")?.addEventListener("click", () => {
  const startTime = (document.getElementById("start-time") as HTMLInputElement).value;
  const endTime = (document.getElementById("end-time") as HTMLInputElement).value;

  if (startTime && endTime) {
    chrome.runtime.sendMessage({ action: "start", startTime, endTime });
  } else {
    alert("出勤時間と退勤時間を入力してください。");
  }
});

document.getElementById("stop-button")?.addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "stop" });
});

const updateWeekdays = (weekdays: string[]) => {
  const weekdaysList = document.getElementById("weekdays-list");
  if (weekdaysList) {
    weekdaysList.innerHTML = ""; // Clear existing list
    weekdays.forEach(day => {
      const listItem = document.createElement("li");
      listItem.textContent = day;
      weekdaysList.appendChild(listItem);
    });
  }
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "updateWeekdays") {
    updateWeekdays(message.weekdays);
  }
});