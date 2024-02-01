## [Task: Write a Web Socket Server](https://gromov.youtrack.cloud/issue/MICROBOARD-179/Websockets-Write-a-Web-Socket-Server)

-   **Status**: Done
-   **Priority**: High

Create a web socket server on the server-side application that handles incoming requests from clients.

Wrap the server into a decorator to upgrade a connection.

Upgrade the client connection to a web socket connection, allowing communication between the two endpoints.

## [Task: Receive and remember list of boards client wants to subscribe to](https://gromov.youtrack.cloud/issue/MICROBOARD-180/Websockets-Receive-and-remember-list-of-boards-client-wants-to-subscribe-to)

-   **Status**: Done
-   **Priority**: High

Receive a list of boards that the client would like to subscribe to and keep track of them in a data structure for later use.

Create runtime structures:

1. To keep track of the boards that each client is interested in.

2. To avoid sending the same event to the client multiple times, keep the last event that was sent to the client for each board.

Note: The client should be able to unsubscribe from a board at any time.

No need to save the data in the database. Once the server is restarted, the client will have to reestablish a connection and resubscribe to the boards.

## [Task: Send new events to clients](https://gromov.youtrack.cloud/issue/MICROBOARD-181/Websockets-Send-new-events-to-clients)

-   **Status**: Done
-   **Priority**: High

When a new event is added to the database, fire a trigger to notify all subscribed clients over the open web socket connections.
