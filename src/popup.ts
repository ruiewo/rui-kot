const data: {
	targets: ButtonTarget[];
	timestamps: Timestamp[];
} = {
	targets: [],
	timestamps: [
		{ start: "08:00", end: "17:00" },
		//
	],
};

document.getElementById("find-button")?.addEventListener("click", () => {
	console.log("find-button clicked");
	send("find", (targets: ButtonTarget[]) => {
		if (targets.length === 0) {
			alert("ターゲットが見つかりませんでした。");
			return;
		}

		data.targets = targets;

		const targetsList = document.getElementById("targets-list");
		if (targetsList) {
			targetsList.innerHTML = "";

			for (const { date, buttonId } of targets) {
				const listItem = document.createElement("li");
				listItem.textContent = `日付: ${date}, ボタンID: ${buttonId}`;
				targetsList.appendChild(listItem);
			}
		}
	});
});

document.getElementById("start-button")?.addEventListener("click", () => {
	console.log("start-button clicked");

	// 今日までの日付を対象とするロジック
	const today = new Date(); // 現在の日付を動的に取得
	const filteredTargets = data.targets.filter(({ date }) => {
		// dateを正しくパース
		const [month, day] = date.match(/\d+/g)!.map(Number);
		const targetDate = new Date(today.getFullYear(), month - 1, day); // 年は現在の年を使用
		return targetDate <= today; // 今日までの日付を対象にする
	});

	if (filteredTargets.length === 0) {
		alert("登録可能な日付がありません。");
		return;
	}

	execute(filteredTargets, data.timestamps);
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
	console.log(targets);

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
