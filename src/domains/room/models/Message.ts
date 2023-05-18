// TODO : add possibility to add application level messages at the root ? based on an option
// It would improve performance, lightly

import { User } from "./User";

// TODO : add app version and protocole version in the message

// Info : We use a model where the application will implement its own messaging on top on the base one
export enum MessageType {
  Room = 'Room',
  App = 'App'
}

export interface Message {
  type: MessageType;
  from: User;
  payload: AnyMessage;
}

// Info : using an empty interface so that we do not use any, for now
export interface AnyMessage {

}

export enum RoomMessageType {
  Text = 'Text',
  RenameUser = 'RenameUser'
}

// FWarn : they were classes, I changed them to interfaces, rollback if necessary
export interface RoomMessage extends AnyMessage {
  type: RoomMessageType;
  payload: AnyMessage;
}

export interface TextMessage extends AnyMessage {
  text: string;
}

export interface RenameUserMessage extends AnyMessage {
  formerName: string;
  newName: string;
}

export function getApplicationMessage(from: User, payload: AnyMessage): Message {
  return {
    type: MessageType.App,
    from: from,
    payload: payload,
  };
}

// Info : this is a message type that you can use per app
// It is useful to support multiple app / message provided by different libraries without colliding with each other
// I do not explicitly use it here, so that you implement the app layer as you want, but it is an useful feature
export interface AppMessage {
  app: string;// Identifier for your app / plugin
  payload: AnyMessage;
}
