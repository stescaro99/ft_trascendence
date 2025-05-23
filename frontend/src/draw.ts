export function drawPowerUp(ctx: CanvasRenderingContext2D, powerUp: any)
{
    if (powerUp.active)
    {
        ctx.fillStyle = "orange";
        ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
    }
}

export function drawRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string)
{
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

export function drawBall(ctx: CanvasRenderingContext2D, ball: any)
{
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.closePath();
}

export function drawScore(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, scoreLeft: number, scoreRight: number)
{
    ctx.font = "40px 'Bit5x3'";
    ctx.fillStyle = "white";
    ctx.textBaseline = "top";
    ctx.textAlign = "center";

    ctx.fillText(scoreLeft.toString(), canvas.width / 2 - 20, 20);
    ctx.fillText(scoreRight.toString(), canvas.width / 2 + 20, 20);
}
export function drawField(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement)
{
    const segmentHeight = 15;
    const segmentSpacing = 10;
    const lineWidth = 4;
    const centerX = Math.floor(canvas.width / 2) - 0.5;
  
    ctx.strokeStyle = "white";
    ctx.lineWidth = lineWidth;
  
    for (let y = 0; y < canvas.height; y += segmentHeight + segmentSpacing) {
        ctx.beginPath();
        ctx.moveTo(centerX - lineWidth / 2, y);
        ctx.lineTo(centerX - lineWidth / 2, y + segmentHeight);
        ctx.stroke();
    }
  }