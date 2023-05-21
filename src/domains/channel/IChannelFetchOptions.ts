import { IClientMapper, IServer, IServerHandler, IServerMapper } from "peerjs-request-response";

export interface IChannelFetchOptions<MessageType, RequestBodyType, ResponseBodyType> {
  fetchTimeout?: number;
  clientMapper: IClientMapper<RequestBodyType, ResponseBodyType>;
  serverMapper: IServerMapper<MessageType, RequestBodyType, ResponseBodyType>;
  serverHandler: IServerHandler<RequestBodyType, ResponseBodyType>;
}