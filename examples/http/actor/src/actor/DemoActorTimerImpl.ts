import { AbstractActor } from "dapr-client";
import DemoActorTimerInterface from "./DemoActorTimerInterface";

export default class DemoActorTimerImpl extends AbstractActor implements DemoActorTimerInterface {
    counter: number = 0;

    async init(): Promise<string> {
        return "Actor Activated";
    }

    async count(): Promise<void> {
        this.counter++;
    }

    async countBy(amount: number): Promise<void> {
        this.counter += amount;
    }
}