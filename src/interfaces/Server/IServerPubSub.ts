import { TypeDaprPubSubCallback } from "../../types/DaprPubSubCallback.type";

export default interface IServerPubSub {
    subscribe(pubSubName: string, topic: string, cb: TypeDaprPubSubCallback, route?: string): Promise<void>;
}