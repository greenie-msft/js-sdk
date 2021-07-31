import AbstractActor from "../../actors/runtime/AbstractActor";
import Class from "../../types/Class";

export default interface IServerActor {
    registerActor<T extends AbstractActor>(cls: Class<T>): Promise<void>;
}