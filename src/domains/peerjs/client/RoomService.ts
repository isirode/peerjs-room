import { IRoom } from "../../room/models/Room";
import { PeerJSServerClient } from "./PeerJSServerClient";

// TODO : should it be managing the p2p room ? should the p2p room use IRoom ?
// TODO : create an interface
export class RoomService {

  client: PeerJSServerClient;
  currentRoom?: IRoom;

  constructor(client: PeerJSServerClient) {
    this.client = client;
  }

  async joinRoom(roomId: string, peerId: string): Promise<IRoom> {
    const resp = await this.client.joinRoom(roomId, peerId);
    console.log("resp join room " + resp);
    const room = await this.client.getRoom(roomId);
    this.currentRoom = room;
    return room;
  }

  async leaveRoom(roomId: string, peerId: string) {
    if (this.currentRoom === null) {
      console.warn("Attempting to leave while not being in the room");// could be there it the server return an error though
    }
    const resp = await this.client.leaveRoom(roomId, peerId);
    console.log("resp leave room " + resp);
    this.currentRoom = null;
  }

  // TODO : create a manager which contains the peerId maybe
  async leaveCurrentRoom(peerId: string) {
    return this.leaveRoom(this.currentRoom?.roomId, peerId);
  }

  async createRoom(room: any, peerId: string): Promise<IRoom> {
    // TODO : checkout if server can make the user join the room automatically
    console.log('creating room');
    console.log(room);
    console.log(peerId);
    const roomId = await this.client.createRoom(room);
    console.log('roomId ' + roomId);
    const joinedRoom = await this.joinRoom(roomId, peerId);
    return joinedRoom;
  }

  async getRooms(): Promise<Map<string, IRoom>> {
    return this.client.getRooms();
  }

}
