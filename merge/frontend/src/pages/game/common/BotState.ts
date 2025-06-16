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

// Ora richiede il canvas come parametro!
export function predictBallY(ball: any, paddleX: number, canvas: HTMLCanvasElement): number {
  let x = ball.x;
  let y = ball.y;

  let velX = ball.dx * ball.speed;
  let velY = ball.dy * ball.speed;

  while ((velX > 0 && x < paddleX) || (velX < 0 && x > paddleX)) {
    x += velX;
    y += velY;

    if (y <= ball.radius) {
      y = ball.radius;
      velY = -velY;
    }
    if (y >= canvas.height - ball.radius) {
      y = canvas.height - ball.radius;
      velY = -velY;
    }
  }
  return y;
}

export function moveBot(bot: any, predictedY: number) {
  const centerY = bot.y + bot.height / 2;
  const diff = predictedY - centerY;
  const threshold = bot.speed * 2;

  if (Math.abs(diff) <= threshold) {
    bot.dy = 0;
    bot.y = predictedY - bot.height / 2;
  } else if (diff < 0) {
    bot.dy = -bot.speed;
  } else {
    bot.dy = bot.speed;
  }
}