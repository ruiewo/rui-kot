const data: {
	targets: ButtonTarget[];
	timestamps: Timestamp[];
} = {
	targets: [],
	timestamps: [{ start: "09:00", end: "18:00" }],
};

const ui = {
	startTime: document.querySelector<HTMLInputElement>(".start-time")!,
	endTime: document.querySelector<HTMLInputElement>(".end-time")!,
	findButton: document.getElementById("find-button")!,
	startButton: document.getElementById("start-button")!,
	dateList: document.getElementById("date-list")!,
};

ui.startTime.value = data.timestamps[0].start;
ui.endTime.value = data.timestamps[0].end;

ui.findButton.addEventListener("click", () => {
	send("find", (targets: ButtonTarget[]) => {
		if (targets.length === 0) {
			alert("ターゲットが見つかりませんでした。");
			return;
		}

		data.targets = targets;

		if (ui.dateList) {
			ui.dateList.innerHTML = "";

			for (const { date, buttonId } of targets) {
				const listItem = document.createElement("li");
				listItem.textContent = date;
				listItem.dataset.buttonId = buttonId
				ui.dateList.appendChild(listItem);
			}
		}
	});
});

ui.startButton.addEventListener("click", () => {
	if (data.targets.length === 0) {
		alert("登録可能な日付がありません。");
		return;
	}

	const startInput = document.querySelector<HTMLInputElement>(".start-time")!;
	const endInput = document.querySelector<HTMLInputElement>(".end-time")!;

	if (!startInput.value || !endInput.value) {
		alert("開始時刻と終了時刻を入力してください。");
		return;
	}

	data.timestamps = [{ start: startInput.value, end: endInput.value }];

	execute(data.targets, data.timestamps);
});

const send = <T>(action: string, callback: (response: T) => void) => {
	chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
		const tabId = tabs[0]?.id;
		if (!tabId) {
			return;
		}

		chrome.tabs.sendMessage(tabId, { action }, (response: T) => {
			callback(response);
		});
	});
};

const getTabId = (): Promise<number> => {
	return new Promise((resolve, reject) => {
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			if (tabs.length > 0 && tabs[0].id) {
				resolve(tabs[0].id);
			} else {
				reject("No active tab found");
			}
		});
	});
};

const execute = async (targets: ButtonTarget[], timestamps: Timestamp[]) => {
	const tabId = await getTabId();

	for (const { buttonId } of targets) {
		await loadComplete(tabId);

		let isMoveReady = false;
		do {
			isMoveReady = await chrome.tabs.sendMessage(tabId, { action: "isMoveReady", buttonId });
			if (!isMoveReady) {
				await new Promise((resolve) => setTimeout(resolve, 300));
			}
		} while (!isMoveReady);
		await chrome.tabs.sendMessage(tabId, { action: "move", buttonId });

		await loadComplete(tabId);

		let isRegisterReady = false;
		do {
			isRegisterReady = await chrome.tabs.sendMessage(tabId, { action: "isRegisterReady" });
			if (!isRegisterReady) {
				await new Promise((resolve) => setTimeout(resolve, 300));
			}
		} while (!isRegisterReady);

		await chrome.tabs.sendMessage(tabId, { action: "register", timestamps });
		ui.dateList.querySelector(`[data-button-id="${buttonId}"]`)?.remove();
	}
};

const loadComplete = async (tabId: number) => {
	await new Promise((resolve) => setTimeout(resolve, 100));

	let tab: chrome.tabs.Tab;
	do {
		tab = await chrome.tabs.get(tabId);
		await new Promise((resolve) => setTimeout(resolve, 300));
	} while (tab.status === "loading");
};
