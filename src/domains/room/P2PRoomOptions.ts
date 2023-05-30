export interface ChannelOptions {
  // FIXME : auto start is better maybe ?
  autoListen: boolean;
  excludeChannelMessagesFromDataNotifications: boolean;
}

export interface P2PRoomOptions {
  channelOptions?: ChannelOptions;
}