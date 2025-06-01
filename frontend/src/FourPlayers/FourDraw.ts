export function drawPowerUp(ctx: CanvasRenderingContext2D, powerUp: any)
{
    if (powerUp.active)
    {
        ctx.fillStyle = "#ff9900";
        ctx.shadowColor = "#ff9900";
        ctx.shadowBlur = 20;

        const radius = 8;
        ctx.beginPath();
        ctx.moveTo(powerUp.x + radius, powerUp.y);
        ctx.lineTo(powerUp.x + powerUp.width - radius, powerUp.y);
        ctx.quadraticCurveTo(powerUp.x + powerUp.width, powerUp.y, powerUp.x + powerUp.width, powerUp.y + radius);
        ctx.lineTo(powerUp.x + powerUp.width, powerUp.y + powerUp.height - radius);
        ctx.quadraticCurveTo(powerUp.x + powerUp.width, powerUp.y + powerUp.height, powerUp.x + powerUp.width - radius, powerUp.y + powerUp.height);
        ctx.lineTo(powerUp.x + radius, powerUp.y + powerUp.height);
        ctx.quadraticCurveTo(powerUp.x, powerUp.y + powerUp.height, powerUp.x, powerUp.y + powerUp.height - radius);
        ctx.lineTo(powerUp.x, powerUp.y + radius);
        ctx.quadraticCurveTo(powerUp.x, powerUp.y, powerUp.x + radius, powerUp.y);
        ctx.closePath();
        ctx.fill();

        ctx.shadowBlur = 0;
    }
}

export function drawRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string)
{
    const radius = 10;
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 20;

    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;
}

export function drawBall(ctx: CanvasRenderingContext2D, ball: any)
{
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#ff00ff"; // fucsia neon
    ctx.shadowColor = "#ff00ff";
    ctx.shadowBlur = 20;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.closePath();
}

export function drawScore(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, scoreLeft: number, scoreRight: number)
{
    ctx.font = "40px 'Bit5x3'";
    ctx.fillStyle = "white";
    ctx.textBaseline = "top";
    ctx.textAlign = "center";


    ctx.fillText(scoreLeft.toString(), canvas.width / 4, 10);
    ctx.fillText(scoreRight.toString(), (canvas.width * 3) / 4, 10);
}

function drawCornerTriangles(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement)
{
    const size = 60;

    ctx.fillStyle = "#00ffff";
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 10;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(size, 0);
    ctx.lineTo(0, size);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(canvas.width, 0);
    ctx.lineTo(canvas.width - size, 0);
    ctx.lineTo(canvas.width, size);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(0, canvas.height - size);
    ctx.lineTo(size, canvas.height);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(canvas.width, canvas.height);
    ctx.lineTo(canvas.width - size, canvas.height);
    ctx.lineTo(canvas.width, canvas.height - size);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;
}


export function drawField(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement)
{
    const segmentHeight = 15;
    const segmentSpacing = 10;
    const lineWidth = 4;
    const centerX = Math.floor(canvas.width / 2);

    ctx.strokeStyle = "#00ffff";
    ctx.lineWidth = lineWidth;
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 10;

    for (let y = 0; y < canvas.height; y += segmentHeight + segmentSpacing) {
        ctx.beginPath();
        ctx.moveTo(centerX, y);
        ctx.lineTo(centerX, y + segmentHeight);
        ctx.stroke();
    }

    drawCornerTriangles(ctx, canvas);
    ctx.shadowBlur = 0;
}