const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  switch (message.action) {
    case "find":
      sendResponse(findTargets());
      break;
    case "isMoveReady":
      sendResponse(isMoveReady(message));
      break;
    case "move":
      sendResponse();
      move(message);
      break;
    case "isRegisterReady":
      sendResponse(await isRegisterReady());
      break;
    case "register":
      sendResponse();
      register(message);
      break;
  }
  return true;
});

const findTargets = () => {
  console.log("findTargets called");
  const targets: ButtonTarget[] = [];
  const cells = $$<HTMLTableCellElement>("td.work_day_type");

  for (const cell of cells) {
    if (cell.innerText !== "平日") {
      continue;
    }

    const tr = cell.closest("tr")!;
    const startTd = tr.querySelector<HTMLTableCellElement>("td.start_end_timerecord[data-ht-sort-index='START_TIMERECORD']"); // 出勤列
    const endTd = tr.querySelector<HTMLTableCellElement>("td.start_end_timerecord[data-ht-sort-index='END_TIMERECORD']");   // 退勤列

    if (
      startTd?.innerText.trim() === "" &&
      endTd?.innerText.trim() === ""
    ) {
      const options = tr.firstElementChild?.querySelectorAll("option")!;
      const buttonId = Array.from(options).find((option) => option.text === "打刻編集")!.value;
      const date = tr.querySelector<HTMLTableCellElement>("td:nth-child(2)")!.innerText;

      targets.push({ date, buttonId });
    }
  }
  console.log("targets", targets);
  return targets;
};

const isMoveReady = ({ buttonId }: { buttonId: string }) => {
  return !!$<HTMLButtonElement>(buttonId);
};

const isRegisterReady = async () => {
  do {
    const isReady = $<HTMLElement>("#recording_timestamp_time_1");
    if (isReady) {
      return true;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  } while (true);
};

const register = ({ timestamps }: { timestamps: Timestamp[] }) => {
  setValue(timestamps);
  // submit();
  back();
};

const type = { 出勤: "1", 退勤: "2" } as const;
type Type = (typeof type)[keyof typeof type];

const setValue = (x: Timestamp[]) => {
  x.forEach(({ start, end }, i) => {
    set(i * 2 + 1, type.出勤, start);
    set(i * 2 + 2, type.退勤, end);
  });
};

const set = (index: number, type: Type, value: string) => {
  $<HTMLInputElement>(`#recording_type_code_${index}`)!.value = type;
  $<HTMLInputElement>(`#recording_timestamp_time_${index}`)!.value = value;
  const [hour, minute] = value.split(":");
  $<HTMLInputElement>(`#recording_timestamp_hour_${index}`)!.value = hour;
  $<HTMLInputElement>(`#recording_timestamp_minute_${index}`)!.value = minute;
};

const submit = () => {
  $<HTMLElement>("#button_01")!.click();
};

const move = ({ buttonId }: { buttonId: string }) => {
  console.log("move called", buttonId);
  $<HTMLButtonElement>(buttonId)!.click();
  console.log("ボタンをクリック:", buttonId);
};

const back = () => {
  $<HTMLElement>("#header_menu_back_button")!.click();
};
