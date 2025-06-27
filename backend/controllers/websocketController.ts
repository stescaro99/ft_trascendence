import { FastifyRequest } from 'fastify';
import { gameManager, Player } from '../services/gameManager';
import jwt from 'jsonwebtoken';
import User from '../models/user';

export async function handleWebSocketConnection(connection: any, req: FastifyRequest) {
  let authenticatedUser = null;
  const query = req.query as any;
  
  if (query.token) {
    try {
      const decoded = jwt.verify(query.token, process.env.JWT_SECRET!) as any;
      authenticatedUser = decoded;
      console.log(`Authenticated user: ${decoded.nickname || decoded.username}`);
      
      if (decoded.nickname) {
        await updateUserOnlineStatus(decoded.nickname, true);
      }
    } catch (error) {
      console.log('Invalid token, proceeding as guest');
    }
  }

  const player: Player = {
    id: Math.random().toString(36).substring(2),
    nickname: authenticatedUser?.nickname || authenticatedUser?.username || '',
    socket: connection.socket,
    ready: false
  };

  console.log(`Player ${player.id} connected with nickname: ${player.nickname}`);

  connection.socket.send(JSON.stringify({
    type: 'connected',
    playerId: player.id,
    nickname: player.nickname,
    message: 'Connected to game server'
  }));

  connection.socket.on('message', (message: any) => {
    handlePlayerMessage(player, message);
  });

  connection.socket.on('close', async () => {
    await handlePlayerDisconnection(player, authenticatedUser);
  });

  connection.socket.on('error', (error: any) => {
    console.error(`WebSocket error for player ${player.id}:`, error);
  });
}

function handlePlayerMessage(player: Player, message: any) {
  try {
    const data = JSON.parse(message.toString());
    
    switch (data.type) {
      case 'setNickname':
        handleSetNickname(player, data);
        break;

      case 'joinRoom':
        handleJoinRoom(player, data);
        break;

      case 'findMatch':
        handleFindMatch(player, data);
        break;

      case 'createRoom':
        handleCreateRoom(player, data);
        break;

      case 'playerInput':
        handlePlayerInput(player, data);
        break;

      case 'playerReady':
        handlePlayerReady(player, data);
        break;

      case 'getRoomInfo':
        handleGetRoomInfo(player, data);
        break;

      case 'leaveRoom':
        handleLeaveRoom(player, data);
        break;

      default:
        console.log('Unknown message type:', data.type);
        sendToPlayer(player, {
          type: 'error',
          message: `Unknown message type: ${data.type}`
        });
    }
  } catch (error) {
    console.error('Error parsing message:', error);
    sendToPlayer(player, {
      type: 'error',
      message: 'Invalid message format'
    });
  }
}

function handleSetNickname(player: Player, data: any) {
  player.nickname = data.nickname;
  sendToPlayer(player, {
    type: 'nicknameSet',
    playerId: player.id,
    nickname: player.nickname
  });
}

function handleJoinRoom(player: Player, data: any) {
  const success = gameManager.addPlayerToRoom(data.roomId, player);

  if (player.nickname && success) {
    updateUserCurrentRoom(player.nickname, data.roomId).catch(console.error);
  }
  
  sendToPlayer(player, {
    type: 'joinResult',
    success,
    roomId: data.roomId
  });
}

function handleFindMatch(player: Player, data: any) {
  const roomId = gameManager.findMatch(player, data.gameType || 'two');
  sendToPlayer(player, {
    type: 'matchFound',
    roomId
  });
}

function handleCreateRoom(player: Player, data: any) {
  const newRoomId = gameManager.createRoom(data.gameType || 'two');
  gameManager.addPlayerToRoom(newRoomId, player);
  
  if (player.nickname) {
    updateUserCurrentRoom(player.nickname, newRoomId).catch(console.error);
  }
  
  sendToPlayer(player, {
    type: 'roomCreated',
    roomId: newRoomId
  });
}

function handlePlayerInput(player: Player, data: any) {
  gameManager.handlePlayerInput(data.roomId, player.id, data.input);
}

function handlePlayerReady(player: Player, data: any) {
  player.ready = data.ready;
  const room = gameManager.getRoomInfo(data.roomId);
  
  if (room) {
    room.players.forEach(p => {
      if (p.id !== player.id) {
        sendToPlayer(p, {
          type: 'playerReadyChanged',
          playerId: player.id,
          ready: player.ready
        });
      }
    });

    const allReady = room.players.every(p => p.ready);
    if (allReady && room.players.length === room.maxPlayers && !room.isActive) {
      gameManager.startGame(data.roomId);
    }
  }
}

function handleGetRoomInfo(player: Player, data: any) {
  const roomInfo = gameManager.getRoomInfo(data.roomId);
  sendToPlayer(player, {
    type: 'roomInfo',
    room: roomInfo ? {
      id: roomInfo.id,
      players: roomInfo.players.map(p => ({
        id: p.id,
        nickname: p.nickname,
        ready: p.ready
      })),
      isActive: roomInfo.isActive,
      maxPlayers: roomInfo.maxPlayers,
      type: roomInfo.type
    } : null
  });
}

function handleLeaveRoom(player: Player, data: any) {
  gameManager.removePlayerFromRoom(data.roomId, player.id);
  
  if (player.nickname) {
    updateUserCurrentRoom(player.nickname, null).catch(console.error);
  }
  
  sendToPlayer(player, {
    type: 'leftRoom',
    roomId: data.roomId
  });
}

async function handlePlayerDisconnection(player: Player, authenticatedUser?: any) {
  console.log(`Player ${player.id} (${player.nickname}) disconnected`);
  
  if (authenticatedUser?.nickname) {
    await updateUserOnlineStatus(authenticatedUser.nickname, false);
    await updateUserCurrentRoom(authenticatedUser.nickname, null);
  }
  
  const activeRooms = gameManager.getActiveRooms();
  activeRooms.forEach(room => {
    if (room.players.some(p => p.id === player.id)) {
      gameManager.removePlayerFromRoom(room.id, player.id);
    }
  });
}

async function updateUserOnlineStatus(nickname: string, online: boolean): Promise<void> {
  try {
    const user = await (User as any).findOne({ where: { nickname } });
    if (user) {
      user.online = online;
      user.last_seen = new Date();
      await user.save();
    }
  } catch (error) {
    console.error('Error updating user online status:', error);
  }
}

async function updateUserCurrentRoom(nickname: string, roomId: string | null): Promise<void> {
  try {
    const user = await (User as any).findOne({ where: { nickname } });
    if (user) {
      user.current_room = roomId;
      await user.save();
    }
  } catch (error) {
    console.error('Error updating user current room:', error);
  }
}

export function notifyUserStatusChange(nickname: string, online: boolean): void {
  const activeRooms = gameManager.getActiveRooms();
  
  activeRooms.forEach(room => {
    room.players.forEach(player => {
      if (player.socket.readyState === 1) {
        sendToPlayer(player, {
          type: 'userStatusChanged',
          nickname: nickname,
          online: online,
          timestamp: new Date().toISOString()
        });
      }
    });
  });
  
  console.log(`Notified all connected users about ${nickname} going ${online ? 'online' : 'offline'}`);
}

function sendToPlayer(player: Player, message: any) {
  if (player.socket.readyState === 1) {
    player.socket.send(JSON.stringify(message));
  }
}
