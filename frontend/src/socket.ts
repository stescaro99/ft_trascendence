// type EvenType = 'join' | 'start' |  'update';

// type PongEvent = {
//     type: EvenType;
//     room: string;
//     paddle?: number;
//     ball?: { x: number; y: number };
//     playerId?: number;
// };

// let socket: WebSocket;
// let onUpdateCallback: (data: PongEvent) => void = () => {};
// let onStartCallback: () => void = () => {};

// export function connectToServer(serverUrl: string) {
//     socket = new WebSocket(serverUrl);

//     socket.onopen = () => {
//         console.log('WebSocket connected');
//     };

//     socket.onmessage = (event: MessageEvent) => {
//         const data: PongEvent = JSON.parse(event.data);

//         if (data.type === 'start') {
//             onStartCallback();
//         }

//         if (data.type === 'update') {
//             onUpdateCallback(data);
//         }
//     };

//     socket.onclose = () => {
//         console.log('WebSocket disconnected');
//     };
// }

// export function joinRoom(roomId: string, playerId: number) {
//     const message: PongEvent = {
//         type: 'join',
//         room: roomId,
//         playerId,
//     };
//     socket.send(JSON.stringify(message));
// }

// export function sendUpdate(data: PongEvent) {
//     socket.send(JSON.stringify(data));
// }

// export function onRemoteUpdate(callback: (data: PongEvent) => void) {
//     onUpdateCallback = callback;
// }

// export function onGameStart(callback: () => void) {
//     onStartCallback = callback;
// }