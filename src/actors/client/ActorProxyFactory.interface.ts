import Class from "../../types/Class";
import ActorId from "../ActorId";
import ActorProxy from "./ActorProxy";
import AbstractActor from "../runtime/AbstractActor";

export default interface ActorProxyFactoryInterface {
    create<T extends AbstractActor>(actorType: string, actorId: ActorId, actorInterface: Class<T>): ActorProxy<T>;    
}