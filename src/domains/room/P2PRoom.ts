import prand from "pure-rand";// TODO : checkout other random libraries
import { Connection } from "./models/Connection";
import { IPeer, Peer } from "./models/Peer";
import { DataConnection } from 'peerjs';
import { IClient, IRoom } from "./models/Room";
import Emittery from "emittery";
import { list } from 'iterative';
import { LocalUser, User } from "./models/User";
import { TextMessage, Message, RenameUserMessage, AnyMessage, MessageType, RoomMessage, RoomMessageType, AppMessage } from "./models/Message";
import { IChannel } from "../channel/IChannel";
import { Channel } from "../channel/Channel";
import { error } from "console";

// Info : we add a circular reference issue
// For now, we are doing this
// TODO : find a good library, one which respect interfaces
export function sanitizeUser(user: User) {
  const result: User = {
    peer: {
      id: user.peer.id
    },
    name: user.name,
  };
  return result;
};

export interface Events {
  // technical
  connectionEstablished: {connection: DataConnection, user: User};
  connectionClosed: {connection: DataConnection, user: User | undefined};
  connectionError: {connection: DataConnection, user: User, error: Error};
  missingConnections: {missingConnections: IClient[]};
  allConnected: {clients: IClient[]};
  // messaging
  textMessage: {connection: DataConnection | undefined, user: User | undefined, text: string, textMessage: TextMessage, root: Message};
  renameUserMessage: {connection: DataConnection, user: User | undefined, newName: string, formerName: string, renameUserMessage: RenameUserMessage, root: Message};
  // app
  appMessage: {user: User | undefined, appMessage: AnyMessage, root: Message};
}

// TODO : ensure unique name setting

// TODO : use a room model object ?

// TODO : implement ownership ?

// should be able to handle chatting and switching to a game or a specialized room
export class P2PRoom {

  localUser: LocalUser;

  room: IRoom;

  users:  Map<string, User> = new Map();

  names: string[] = [];

  // PeerJS connections are not typed
  connections: Map<string, Connection> = new Map();

  channels: Map<string, IChannel<unknown>> = new Map();

  events: Emittery<Events> = new Emittery();

  get admin(): User | undefined {
    return this.getUserByPeerId(this.room.roomOwner.id);
  }

  constructor(localUser: LocalUser, room: IRoom, names: string[] = []) {
    this.localUser = localUser;
    this.room = room;
    this.names = names;

    this.users.set(localUser.peer.id, localUser);

    this.bindPeer();

    this.connectToClients();

    setTimeout(() => {
      let successful = this.verifyRoomConnections();
      // TODO : initiate the echo here
    }, 10 * 1000);// TODO : make it configurable
  }

  public broadcast(message: Message) {
    console.log('connections : ' + this.connections.size);
    this.broadcastToConnections(list(this.connections.values()), message);
  }

  public broadcastApplicationMessage(message: AnyMessage) {
    const rootMessage = {
      type: MessageType.App,
      from: this.getUserPayload(this.localUser),
      payload: message,
    } as Message;
    this.broadcast(rootMessage);
  }

  protected broadcastToConnections(connections: Connection[], message: Message) {
    connections.forEach(connection => {
      console.log(`Sending message to ${connection.peer}`);
      // FIXME : I am not sure I need to stringify the object actually
      connection.send(message);
    });
  }

  public send(user: User, message: Message) {
    const connection = this.getConnection(user);
    if (connection === undefined) {
      throw new Error(`attempting to send a message to a user not present: '${user.name}:${user.peer.id}'`);
    }
    message.isWhisper = true;
    connection.send(message);
  }

  public sendToUsers(users: User[], message: Message) {
    // FIXME : should it be considered to be a whisper
    message.isWhisper = true;
    const connections = this.getConnections(users);
    this.broadcastToConnections(connections, message);
  }

  public sendApplicationMessage(user: User, message: AnyMessage) {
    const rootMessage = {
      type: MessageType.App,
      from: this.getUserPayload(this.localUser),
      payload: message,
      isWhisper: true
    } as Message;
    this.send(user, rootMessage);
  }

  public sendApplicationMessageToUsers(users: User[], message: AnyMessage) {
    const rootMessage = {
      type: MessageType.App,
      from: this.getUserPayload(this.localUser),
      payload: message,
      isWhisper: true
    } as Message;
    this.sendToUsers(users, rootMessage);
  }

  public bindPeer() {
    const self = this;

    // TODO : use a common method for both sides of connections
    // This is not called when we are the ones opening the connection
    this.localUser.peer.base.on('connection', (connection: DataConnection) => {
      console.log('connection');
      console.log(connection);
      this.bindConnection(connection, true);
      // FIXME : put this in connection.on('open') ?
      // peer.connections.set(connection.peer, new Connection(connection))
    });
  }

  public bindConnection (dataConnection: DataConnection, isEstablished: boolean) {
    // Info : this method is called when we are attempting to bind an user
    // And when we have received a connection

    // TODO : compare the room clients and the connections here

    console.log("connection state");
    console.log(dataConnection.peerConnection.connectionState);
    console.log("connection reliable: " + dataConnection.reliable);
    console.log("established: " + isEstablished);
    
    // FIXME ; remove it or set it back if necessary
    const self = this;
    console.log('attempt to bind connection');
    console.log('peer ' + dataConnection.peer);

    const connection = new Connection(dataConnection);

    for (let channel of this.channels.values()) {
      this.bindConnectionToChannel(connection, channel);
    }

    // TODO : replace strings events by an enum
    dataConnection.on('open', () => {
      console.log('connection opened to ' + dataConnection.peer);

      this.connections.set(dataConnection.peer, connection);

      // Init a user
      const peer = {
        id: dataConnection.peer
      } as IPeer;

      const user = {
        peer: peer,
        name: this.getRandomUninitializedName()
      } as User;

      this.users.set(peer.id, user);

      this.events.emit('connectionEstablished', {connection: dataConnection, user});

      // Info : to synchronize the names
      this.broadcastRenameMessage(this.localUser.name, '');
    });
    dataConnection.on('data', (data) => {
      console.log("Data received");
      console.log(data);
      this.handleMessage(dataConnection, data);
    });
    // TODO : (duplicate function) move this into a method with all the bindings
    dataConnection.on('close', () => {
      console.log('connection closed');

      // FIXME : remove the user from the room server side too ?

      // TODO : rename peer of connection in either a Peer or peerId

      let user = this.users.get(dataConnection.peer);

      this.users.delete(dataConnection.peer);

      this.connections.delete(dataConnection.peer);

      this.events.emit('connectionClosed', {connection: dataConnection, user});

      // TODO : unit test that we never call this.api.leaveRoom ?
      // this.api.leaveRoom(this.room.roomId, this.peer.id)
      // this.pushMessage(new Message('(info)', this.localeMessaging.formatPeerHasDisconnected(connection.peer), ''))
    });
    // Seems to be never called
    dataConnection.on('error', function (error) {
      console.log('connection : error received');
      console.log(error);

      let user = this.users.get(dataConnection.peer);
      
      this.roomMessageHandler.onConnectionError(dataConnection, error);
    });

  }

  public connectToClients() {
    this.room.clients.forEach((client: IClient, peerId: string) => {
      if (client.id === this.localUser.peer.id) return;

      console.log('connections');
      console.log(this.localUser.peer.base.connections);

      const connection = this.localUser.peer.base.connect(client.id);

      // TODO : unit test to add to check we are not adding the connection here (at this level, it could failed at this point)
      // this.connections.set(connection.peer, new Connection(connection))
      // TODO : display the connection on 'connecting' et indiquer connected / failed|error
      this.bindConnection(connection, false);
    });
  }

  public handleMessage (connection: DataConnection, data: any) {
    console.log('handleMessage');
    console.log(data);

    const message: Message = data as Message;

    let user: User | undefined = this.getUserByPeerId(message.from.peer.id);
    if (user === undefined) {
      console.warn("user is undefined");
    }

    // TODO : move all that into separate methods ?
    // TODO : put message formatting into separate class, can then translate it into fr / en
    switch (message.type) {
      case MessageType.Room:
        const roomMessage = message.payload as RoomMessage;
        this.handleRoomMessage(connection, user, roomMessage, message);
        break;
      case MessageType.App:
        const appMessage = message.payload;
        this.events.emit('appMessage', {user, appMessage, root: message});
        break;
      default:
        throw new Error('unknown peer message type')
    }
  }

  protected handleRoomMessage(connection: DataConnection, user: User | undefined, message: RoomMessage, root: Message) {
    switch (message.type) {
      case RoomMessageType.Text:
        const textMessage = message.payload as TextMessage;
        this.events.emit('textMessage', {connection, user, text: textMessage.text, textMessage, root})
        break;
      case RoomMessageType.RenameUser:
        const renameUserMessage = message.payload as RenameUserMessage;
        if (user !== undefined) {
          user.name = renameUserMessage.newName;
        }
        this.events.emit('renameUserMessage', {connection, user, newName: renameUserMessage.newName, formerName: renameUserMessage.formerName, renameUserMessage, root})
        break;
      default:
        throw new Error("unknown room message type");
    }
  }

  broadcastTextMessage (text: string) {

    const textMessage: TextMessage = {
      text: text,
    };
    const message = this.getTextMessageAsMessage(text);

    // Info : we display the message
    this.events.emit('textMessage', {
      connection: undefined,
      user: this.localUser,
      text,
      textMessage,
      root: message
    });

    this.broadcast(message);
  }

  public broadcastRenameMessage(newName: string, formerName: string) {
    const renameMessage: RenameUserMessage = {
      newName: newName,
      formerName: formerName,
    }
    const roomMessage: RoomMessage = {
      type: RoomMessageType.RenameUser,
      payload: renameMessage,
    }
    const message: Message = {
      type: MessageType.Room,
      from: this.getUserPayload(this.localUser),
      payload: roomMessage,
    };

    this.broadcast(message);
  }

  sendTextMessage(user: User, text: string) {

    const textMessage: TextMessage = {
      text: text,
    };
    const message = this.getTextMessageAsMessage(text);

    // Info : we display the message
    this.events.emit('textMessage', {
      connection: undefined,
      user: this.localUser,
      text,
      textMessage,
      root: message
    });

    this.send(user, message);
  }

  // TODO : something for channels accross multiples rooms ?
  getChannel<T>(channelName: string): IChannel<T> {
    let channel = this.channels.get(channelName) as IChannel<T>;
    if (channel === undefined) {
      let _broadcast = (data: T) => {
        const message = this.getChannelMessage(data, channelName);
        this.broadcast(message);
      }
      let _broadcastToUsers = (data: T, users: User[]) => {
        const message = this.getChannelMessage(data, channelName);
        this.sendToUsers(users, message);
      }
      let _broadcastToConnections = (data: T, connections: DataConnection[]) => {
        // TODO : a boolean to indicate wether or not send to connections not in the room ?
        const message = this.getChannelMessage(data, channelName);
        for (let co of connections) {
          co.send(message);
        }
      }
      let _send = (data: T, user: User) => {
        const message = this.getChannelMessage(data, channelName);
        this.send(user, message);
      }
      channel = new Channel<T>(
        channelName,
        _broadcast,
        _broadcastToUsers,
        _broadcastToConnections,
        _send
      );
      this.channels.set(channelName, channel);
      for (let connection of this.connections.values()) {
        // FIXME : replace _connection by connection ?
        this.bindConnectionToChannel(connection, channel);
      }
    }

    return channel;
  }

  protected bindConnectionToChannel(connection: Connection, channel: IChannel<unknown>) {
    connection._connection.on('open', () => {
      channel.events.emit('open', { user: this.getUserByPeerId(connection.peer), connection: connection._connection });
    });
    connection._connection.on('data', (data) => {
      // TODO : verify data
      channel.events.emit('data', {data: data, user: this.getUserByPeerId(connection.peer), connection: connection._connection});
    });
    connection._connection.on('error', (error) => {
      channel.events.emit('error', {error, user: this.getUserByPeerId(connection.peer), connection: connection._connection});
    });
    connection._connection.on('close', () => {
      channel.events.emit('close', { user: this.getUserByPeerId(connection.peer), connection: connection._connection });
    });
  }

  closeChannel(channelName: string) {
    // TODO : could have a settings to throw or throw
    // Want to use the logger system here as well
    const channel = this.channels.get(channelName);
    if (channel === undefined) {
      console.warn(`channel '${channelName}' was not present in the room`);
      return;
    }
    this.channels.delete(channelName);
    channel.events.emit('closeChannel');
  }

  public disconnect() {
    this.connections.forEach(connection => {
      console.log('closing connection ' + connection.peer);
      connection.close();
    });
    this.connections.clear();
  }

  // Info : necessary to avoid a circular dependency issue with the JSON serialization
  // Not sure why
  // FIXME : remedy this
  protected getUserPayload(localUser: LocalUser): User {
    const user: User = {
      peer: {
        id: localUser.peer.id
      },
      name: localUser.name,
    };
    return user;
  }

  // TODO : we are not handling the case connection followed by disconnection
  protected verifyRoomConnections(): boolean {
    const missingConnections: IClient[] = [];

    if (this.connections.size > this.room.clients.size) {
      console.warn("too many connections compared to the room");
      console.log("room.clients.size: " + this.room.clients.size);// TODO : method to map a Map to something else
      console.log("room.clients:");
      this.room.clients.forEach((x, k) => {
        console.log(x.id);
      });
      console.log("connections.size: " + this.connections.size);
      console.log("connections:");
      this.connections.forEach((connection, k) => {
        console.log(connection.peer);
        if (connection._connection.reliable) {
          console.warn(`Connection ${connection.peer} is not marked as reliable but is marked as connected`);
        }
      });
    }

    this.room.clients.forEach((client: IClient, id: string) => {
      if (id === this.localUser.peer.id) return;

      if (this.users.get(id) === undefined) {
        missingConnections.push(client);
      }
    });
    if (missingConnections.length === 0) {
      this.events.emit('allConnected', {clients: list(this.room.clients.values())})
      return true;
    } 
    else {
      this.events.emit('missingConnections', {missingConnections});
      return false;
    }
  }

  protected getTextMessageAsMessage(text: string): Message {
    const textMessage: TextMessage = {
      text: text,
    };
    const roomMessage: RoomMessage = {
      type: RoomMessageType.Text,
      payload: textMessage,
    }
    // TODO : provide helpers for this
    const message: Message = {
      type: MessageType.Room,
      from: this.getUserPayload(this.localUser),
      payload: roomMessage,
    };
    return message;
  }

  protected getChannelMessage(data: unknown, channelName: string, isWhisper?: boolean): Message {
    const appMessage: AppMessage = {
      app: channelName,
      payload: data
    }
    const message: Message = {
      type: MessageType.Room,
      from: this.getUserPayload(this.localUser),
      payload: appMessage,
      isWhisper: isWhisper
    };
    return message;
  }

  // TODO : maybe use a class for this
  getRandomUninitializedName() {
    const seed = Date.now() ^ (Math.random() * 0x100000000);
    const rng = prand.xoroshiro128plus(seed);
    const randomValue = prand.unsafeUniformIntDistribution(1, 999, rng);
    return `uninitialized-${randomValue}`;
  }

  getRandomName(): string {
    // TODO : generate a ano name if names is empty
    return this.names[Math.floor(Math.random() * this.names.length)];
  }

  getUser(peerId: string): User | undefined {
    return this.getUserByPeerId(peerId);
  }

  getUserByPeerId(peerId: string): User | undefined {
    return this.users.get(peerId);
  }

  getUserByName(name: string): User | undefined {
    // FIXME : should we check if the name is present multiple times ?
    // Since we are not ensuring that the name is unique
    for (const user of this.users.values()) {
      if (user.name === name) {
        return user;
      }
    }
    return undefined;
  }

  getConnection(user: User): Connection | undefined {
    return this.connections.get(user.peer.id);
  }

  getConnections(users: User[]): Connection[] {
    const result: Connection[] = [];
    for (let user of users) {
      const connection = this.getConnection(user);
      if (connection !== undefined) {
        result.push(connection);
      }
    }
    return result;
  }

}
