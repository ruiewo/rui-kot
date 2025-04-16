chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action === "find") {
		const targets = findTargets();
		console.log("勤怠管理ページのターゲット:", targets);
		sendResponse(targets);
		return true;
	}
});

const findTargets = () => {
	const targets: ButtonTarget[] = [];
	const cells =
		document.querySelectorAll<HTMLTableCellElement>("td.work_day_type");

	for (const cell of cells) {
		if (cell.innerText !== "平日") {
			return;
		}

		const tr = cell.closest("tr");
		if (!tr) return;

		const options = tr.firstElementChild?.querySelectorAll("option");
		if (!options) return;

		const buttonId = Array.from(options).find(
			(option) => option.text === "打刻編集",
		)?.value;
		if (!buttonId) return;

		const date =
			tr.querySelector<HTMLTableCellElement>("td:nth-child(1)")?.innerText;
		if (!date) return;

		targets.push({ date, buttonId });
	}

	return targets;
};
