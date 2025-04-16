document.getElementById("find-button")?.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "find" },
        (targets: ButtonTarget[]) => {
          console.log("come hrere");
          if (targets.length === 0) {
            alert("ターゲットが見つかりませんでした。");
            return;
          }

          const targetsList = document.getElementById("targets-list");
          if (targetsList) {
            targetsList.innerHTML = "";

            for (const { date, buttonId } of targets) {
              const listItem = document.createElement("li");
              listItem.textContent = `日付: ${date}, ボタンID: ${buttonId}`;
              targetsList.appendChild(listItem);
            }
          }
        },
      );
    }
  });
});
