export enum RoomType {
  PUBLIC = 0,
  PRIVATE = 1,
  PROTECTED = 2
}

// Info : this is what we used server side
export interface IClient {
  id: string;
  token: string;
  socket: any;
  lastPing: number;
}

export interface IRoom {
  roomId: string;
  roomName: string;
  roomType: RoomType;
  password: string;
  roomOwner: IClient;
  clients: Map<string, IClient>;
}
