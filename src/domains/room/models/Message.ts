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