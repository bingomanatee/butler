This is a structure for connecting services and instances using emitted messaging.

It is useful for representing a distributed microservice architecture where actions
from one system trigger responses in another. 

There are two (or three depending on how you count them)  types of interactions 
represented in Butler. 

1. **Service to service events**: events in one service trigger events in another. 
   the data that is transmitted can be filtered throubh action methods (or kept as is). 
2. **Service to instance events**: events in a service call a method of an object. 
   There is no requirement of what that object is -- it doesn't have to be a Service
   instance. 
3. **External calls** any external system can tell a service to emit an event. 

## Creating connections between Service instances

The `.bridge` and `.trigger` methods of a Service instance create cause-and-effects
between services and other services or instances. 

### `.bridge`

The `.bridge` method creates a cascading emission from one service to another.
then the calling service is active:

* *when* the `fromEvent` event emits from the `fromService`
* ... the payload of the `fromEvent` emission (optionally filtered by `action`)
* ... is emitted as `emit` on `toService`. 

Note the default service *in both cases* is the service from which you call `.bridge`.
So if those values aren't provided you'll be both watching for `fromEvent` on the 
calling service and sending the resulting `emit` back to that service. 

Note, there's no reason that either the target or the source be `Service` instances!
any class that provides a Node.js style EventEmitter interface can be bridged.
 
### `.trigger`

Where Bridge serves in the emitter-to-emitter capacity, trigger enables calling a method
of an object upon emission of the `fromEvent`. 

The call is made in one of two manners: 

* If callType === `apply`, the output of the action is spread as multiple arguments 
  into the target method. 
* If callType === `pass`, the actions' output is sent as a single argument to method. (default)

note as with Bridge, both the target and the source of the event default to the service;
so unless specified, this will call a method on the service instance itself. 

### Triggering events on services

There's no special mechanic for triggering an event on a service from the outside. 
Just call `.emit(type, payload...)` on the service. 

## Service Lifecycle 

Services can be turned on and off. The `.serviceStart()` and `.serviceEnd()` calls
enable or disable all relationships initiated by a service. 

Only the state of the *initiating service* matters here. the links are active when
and always if, the initiating service is on, and until it's turned off.

That is, the status of the linked services are ignored. T

`.bridge` and `.trigger` can be called from anywhere, at any time. You can call 
them in the constructor, in the code that creates them, in a method, etc. 

They are designed to respect the initating lifecycle regardless of whether they are 
called before or after the service is on, and to shut off when it's turned off. 

## Synchronicity

