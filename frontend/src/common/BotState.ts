let bots = [false, false, false, false];

export function setBotActive(index: number, val: boolean) {
  if (index >= 0 && index < bots.length) {
    bots[index] = val;
  }
}

export function getBotActive(index: number) {
  if (index >= 0 && index < bots.length) {
    return bots[index];
  }
  return false;
}