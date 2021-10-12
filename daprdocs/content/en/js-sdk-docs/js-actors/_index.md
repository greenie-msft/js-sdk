---
type: docs
title: "JavaScript SDK for Actors"
linkTitle: "Actors"
weight: 1000
description: How to get up and running with Actors using the Dapr JavaScript SDK
---

The Dapr actors package allows you to interact with Dapr virtual actors from a JavaScript application. The examples below demonstrate how to use the JavaScript SDK for interacting with virtual actors.

For a more in-depth overview of Dapr actors, visit the [actors overview page]({{< ref actors-overview >}}).

## Pre-requisites
- [Dapr CLI]({{< ref install-dapr-cli.md >}}) installed
- Initialized [Dapr environment]({{< ref install-dapr-selfhost.md >}})
- [Latest LTS version of Node or greater](https://nodejs.org/en/)
- [JavaScript NPM package installed](https://www.npmjs.com/package/dapr-client)

## Scenario
The below code examples loosely follow the scenario of a Parking Garage Spot Monitoring System, which can be seen in this [video](https://www.youtube.com/watch?v=eJCu6a-x9uo&t=3785) by Mark Russinovich. 

A parking garage consists of hundreds of parking spaces, where each parking space includes a sensor that provides updates to a centralized monitoring system. The parking space sensors (our actors) detect if a parking space is occupied, or available.

To run through this example yourself, clone the source code that can be found in the [JavaScript SDK examples directory](https://github.com/dapr/js-sdk/tree/master/examples/http/actor-parking-sensor).

## Actor Interface 
The actor interface defines the contract that is shared between the actor implementation and the clients calling the actor. In the example below, we have created an interace for a parking space sensor. Each sensor has 2 methods: `carEnter` and `carLeave`, which updates the state of the parking space:

```javascript
export default interface ParkingSensorInterface {
  carEnter(): Promise<void>;
  carLeave(): Promise<void>;
}
```

## Actor Implementation
An actor implementation defines a class by extending the base type `AbstractActor` and implements the actor interface. The following example is a shell of an actor implmentation. It is structured to implememnt the methods defined in the `ParkingSensorInterface`. It also defines a few additional helper methods.


```javascript
import { AbstractActor } from "dapr-client";
import ParkingSensorInterface from "./ParkingSensorInterface";

export default class ParkingSensorImpl extends AbstractActor implements ParkingSensorInterface {
  async carEnter(): Promise<void> {
    // Implementation that updates state that this parking spaces is occupied.
  }

  async carLeave(): Promise<void> {
    // Implementation that updates state that this parking spaces is available.
  }

  async getParkingSpaceUpdate(): Promise<object> {
    // Helper method that implements requesting an update from the parking space sensor.
  }

  async onActivate(): Promise<void> {
    // Actor constructor.
  }
}
```

## Registering Actors
Initialize and register your actors by using the DaprServer package:

```javascript
import { DaprServer } from "dapr-server";
import ParkingSensorImpl from "./ParkingSensorImpl";

async function start() {
  const server = new DaprServer("server-host", "server-port", "dapr-host", "dapr-port");

  await server.actor.init(); // Let the server know we need actors
  server.actor.registerActor(ParkingSensorImpl); // Register the actor
  await server.startServer(); // Start the server
}
```                                              

## Invoking Actors
After Actors are registered, use the DaprClient to invoke methods on an actor. The client will call the actor methods defined in the actor interface.

```javascript
import { DaprClient, DaprServer } from "dapr-client";
import ParkingSensorImpl from "./ParkingSensorImpl";

async function start() {
  const server = new DaprServer("server-host","server-port", "dapr-host", "dapr-port");
  const client = new DaprClient("dapr-host", "dapr-port");

  await server.actor.init(); 
  server.actor.registerActor(ParkingSensorImpl); 
  await server.startServer();

  // Invoke the ParkingSensor Actor by calling the carEnter function
  await client.actor.invoke("PUT", ParkingSensorImpl.name, "actor-id", "carEnter"); 
}
```

## Saving and Getting State 
There are two approaches for interacting with actor state. The first approach is in the actor implementation where you save state on the server via the `stateManager`.  See the `carEnter` method as an example: 

```javascript
import { AbstractActor } from "dapr-client";
import ParkingSensorInterface from "./ParkingSensorInterface";

export default class ParkingSensorImpl extends AbstractActor implements ParkingSensorInterface {
  async carEnter(): Promise<void> {
    // Use state manager to save state:
    await this.getStateManager().setState("state-name", "value");

    // Use state manager to get state:
    const location = await this.getStateManager().getState("location-key");
  }
```
The second approach is saving state through the DaprClient package (through the dapr sidecar):

```javascript
import { DaprClient, DaprServer } from "dapr-client";
import ParkingSensorImpl from "./ParkingSensorImpl";

async function start() {
  const server = new DaprServer("server-host", "server-port", "dapr-host", "dapr-port");
  const client = new DaprClient("dapr-host", "dapr-port");

  await server.actor.init(); 
  server.actor.registerActor(ParkingSensorImpl); 
  await server.startServer();

  // Perform state transaction
  await client.actor.stateTransaction("ParkingSensorImpl", "actor-id", [
    {
      operation: "upsert",
      request: {
        key: "parking-sensor-location-lat",
        value: "location-x"
      }
    },
    {
      operation: "upsert",
      request: {
        key: "parking-sensor-location-lang",
        value: "location-y"
      }
    }
  ]);

  // GET state from an actor
  await client.actor.stateGet("ParkingSensorImpl", "actor-id", "parking-sensor-location-lat")
  await client.actor.stateGet("ParkingSensorImpl", "actor-id", "parking-sensor-location-lang")
}
```

## Actor Timers and Reminders
The JS SDK supports actors that can schedule periodic work on themselves by registering either timers or reminders. The main difference between timers and reminders is that the Dapr actor runtime is not retaining any information about timers after deactivation, while persisting the information about reminders using the Dapr actor state provider.

This distintcion allows users to trade off between light-weight but stateless timers vs. more resource-demanding but stateful reminders.

The scheduling interface of timers and reminders is identical. For an more in-depth look at the scheduling configurations see the [actors timers and reminders docs]({{< ref "howto-actors.md#actor-timers-and-reminders" >}}).

### Actor Timers
```javascript
import { DaprClient, DaprServer } from "dapr-client";
import ParkingSensorImpl from "./ParkingSensorImpl";

async function start() 
  const server = new DaprServer("server-host", "server-port", "dapr-host", "dapr-port");
  const client = new DaprClient("dapr-host", "dapr-port");

  await server.actor.init(); 
  server.actor.registerActor(ParkingSensorImpl); 
  await server.startServer();

  // Register a timer
  await client.actor.timerCreate(ParkingSensorImpl.name, "actor-id", "timer-id", {
    callback: "method-to-excute-on-actor",
    dueTime: Temporal.Duration.from({ seconds: integer }),
    period: Temporal.Duration.from({ seconds: integer })
  });

  // Delete the timer
  await client.actor.timerDelete(ParkingSensorImpl.name, "actor-id", "timer-id");
}
```

### Actor Reminders
```javascript
import { DaprClient, DaprServer } from "dapr-client";
import ParkingSensorImpl from "./ParkingSensorImpl";

async function start() 
  const server = new DaprServer("server-host", "server-port", "dapr-host", "dapr-port");
  const client = new DaprClient("dapr-host", "dapr-port");

  await server.actor.init(); 
  server.actor.registerActor(ParkingSensorImpl); 
  await server.startServer();


  // Register a reminder, it has a default callback
  await client.actor.reminderCreate(DemoActorImpl.name, "actor-id", "timer-id", {
    dueTime: Temporal.Duration.from({ seconds: integer }),
    period: Temporal.Duration.from({ seconds: integer }),
    data: "value"
  });

  // Delete the reminder
  await client.actor.reminderDelete(DemoActorImpl.name, "actor-id", "timer-id");
}
```

- For a full guide on actors visit [How-To: Use virtual actors in Dapr]({{< ref howto-actors.md >}}).