# Extending Naja

## Events

Naja is very flexible and extensible, and allows you to easily integrate your application with the lifecycle of the request. The most direct approach is by listening on the events dispatched by Naja and its components — these are further described in the [Events reference](events.md) section.


## Extensions

A more advanced solution is extensions. Extensions allow you to group event listeners that together create a coherent unit of behaviour. For example, an extension that shows a loading indicator might want to listen to several events:

- `interaction` to find the nearest element which can show the loading indicator,
- `start` to actually display the loading indicator as soon as the request is dispatched,
- `complete` to hide the loading indicator once the request is finished.

Extensions allow you to keep this interconnected and interdependent code together. You can find a complete example in the [Writing extensions](extensions-custom.md) section.


### Default extensions

There are a few extensions that come bundled with Naja and are registered by default. You can learn more about what they do and how to customize their behaviour in the [Default extensions](extensions-default.md) section.
