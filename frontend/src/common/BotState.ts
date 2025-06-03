let isBotActive = false;

export function setBotActive(val: boolean) {
  isBotActive = val;
}

export function getBotActive() {
  return isBotActive;
}