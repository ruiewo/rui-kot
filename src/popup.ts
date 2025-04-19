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

		const targetsList = document.getElementById("target-list");
		if (targetsList) {
			targetsList.innerHTML = "";

			for (const { date } of targets) {
				const listItem = document.createElement("li");
				listItem.textContent = date;
				targetsList.appendChild(listItem);
			}
		}
	});
});

document.getElementById("start-button")?.addEventListener("click", () => {
	console.log("start-button clicked");

	if (data.targets.length === 0) {
		alert("登録可能な日付がありません。");
		return;
	}

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
