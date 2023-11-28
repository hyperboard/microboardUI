# Connection

To have the same list of board events on all the clients as on the server.

To publish events to the server and subscribe to new events from the server.

## Event id

A client should create an unique id for each event.

For the server to identify the event if it gets to the server multiple times.

For the client to know that the server got the message and the client should not send it again.

We can add a Connection Id to the Local Logical Time to get an Event Id.

## Important design decitions (Architecture)

### 1. Server sets the order of events

The order in which events are occured between the clients is the order in which the messages about theese events got to the server.

### 2. Clients apply operations instantly

Clients apply operations from events without the conformation from the server that it recieved the message.

Sometimes a client should revert few operations to insert some operations before them when the client gets such operations from other clients in messages from the server.

### 3. Client Classes handle operations

Classes on the client recieve and apply operations. They should know exactly what method was called and what arguments were passed to handle what cached values dont need to be recalculated.

## Synchronisation

At any time the list of events on a client can be different from the list of events on the server.

Eventually each client will have the same list of events as the server.

To achive that eventual consistency the server orders the events that it recieves from the clients.

1. User calls a setter on an object attached to a board on the client.

2. Board creates an operation and emits it to events manager.

3. Events manager creates an event and sends it to the server, creates a command and applies it to the board.

4. Server recieves an event and searches it in the board events table.

    - If the event is already in the table then it is a repeated message, server does nothing.
    - If the event is not in the table, then server appends it to the table.

5. Events manager recieves an event from the server.

    - Events manager searches the event in the unacknoledged events. If the event in the unacknowledged events then the manager removes it from there and adds to acknoledged events.
    - Events manager sends all unacknowledged events again with a small timeout.
    - Events manager checks if the event is from another client and if it is then the manager checks if their order is lower then the order of acknoledged events and if it is then the server reverts all events with higher order (including all anacknowledged events) applies the event and reapplies all reverted events.
