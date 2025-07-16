const WebSocket = require('ws');

// Test WebSocket connections to verify matchmaking
const baseUrl = 'wss://transcendence.be:9443/ws/game';

// Fake tokens for testing (replace with real JWT if needed)
const player1Token = 'fake_token_1';
const player2Token = 'fake_token_2';

console.log('Starting WebSocket matchmaking test...');

// Player 1
const ws1 = new WebSocket(`${baseUrl}?token=${player1Token}`, {
    rejectUnauthorized: false  // Accept self-signed certificates
});

ws1.on('open', () => {
    console.log('Player 1 connected');
    
    // Set nickname first
    ws1.send(JSON.stringify({
        type: 'setNickname',
        nickname: 'TestPlayer1'
    }));
    
    // Find match after a short delay
    setTimeout(() => {
        console.log('Player 1 finding match...');
        ws1.send(JSON.stringify({
            type: 'findMatch',
            gameType: 'two'
        }));
    }, 1000);
});

ws1.on('message', (data) => {
    const message = JSON.parse(data.toString());
    console.log('Player 1 received:', message);
});

ws1.on('error', (error) => {
    console.error('Player 1 WebSocket error:', error);
});

// Player 2 - start after Player 1
setTimeout(() => {
    const ws2 = new WebSocket(`${baseUrl}?token=${player2Token}`, {
        rejectUnauthorized: false
    });

    ws2.on('open', () => {
        console.log('Player 2 connected');
        
        // Set nickname first
        ws2.send(JSON.stringify({
            type: 'setNickname',
            nickname: 'TestPlayer2'
        }));
        
        // Find match after a short delay
        setTimeout(() => {
            console.log('Player 2 finding match...');
            ws2.send(JSON.stringify({
                type: 'findMatch',
                gameType: 'two'
            }));
        }, 1000);
    });

    ws2.on('message', (data) => {
        const message = JSON.parse(data.toString());
        console.log('Player 2 received:', message);
    });

    ws2.on('error', (error) => {
        console.error('Player 2 WebSocket error:', error);
    });
}, 3000);

// Exit after 15 seconds
setTimeout(() => {
    console.log('Test completed');
    process.exit(0);
}, 15000);
