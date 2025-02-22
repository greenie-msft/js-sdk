import { TypeDaprPubSubCallback } from '../../../types/DaprPubSubCallback.type';
import IServerPubSub from '../../../interfaces/Server/IServerPubSub';
import HTTPServer from './HTTPServer';
import HTTPClient from '../../Client/HTTPClient/HTTPClient';

// https://docs.dapr.io/reference/api/pubsub_api/
export default class HTTPServerPubSub implements IServerPubSub {
  private readonly server: HTTPServer;
  private readonly client: HTTPClient;

  constructor(server: HTTPServer, client: HTTPClient) {
    this.client = client;
    this.server = server;
  }

  async subscribe(pubsubName: string, topic: string, cb: TypeDaprPubSubCallback, route: string = "") {
    if (!route) {
      route = `route-${pubsubName}-${topic}`;
    }

    // Register the handler
    await this.server.getServerImpl().registerPubSubSubscriptionRoute(pubsubName, topic, route);
 
    this.server.getServer().post(`/${route}`, async (req, res) => {
      // Process our callback
      // @ts-ignore
      await cb(req?.body?.data);

      // Let Dapr know that the message was processed correctly
      // console.log(`[Dapr API][PubSub][route-${topic}] Ack'ing the message`);
      return res.send({ success: true });
    });
  }
}