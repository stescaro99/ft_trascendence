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
    ctx.font = "28px 'Bit5x3'";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(scoreLeft.toString(), canvas.width / 4, 40);
    ctx.fillText(scoreRight.toString(), (canvas.width * 3) / 4, 40);}

// export function drawField(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement)
// {
//     const segmentHeight = 15;
//     const segmentSpacing = 10;
//     const lineWidth = 4;
  
//     ctx.strokeStyle = "white";
//     ctx.lineWidth = lineWidth;
  
//     for (let y = 0; y < canvas.height; y += segmentHeight + segmentSpacing) {
//       ctx.beginPath();
//       ctx.moveTo(canvas.width / 2, y);
//       ctx.lineTo(canvas.width / 2, y + segmentHeight);
//       ctx.stroke();
//     }
//   }