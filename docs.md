# Flow

This projects uses uWebsockets.js to create a Web Socket Server to receive & send data in real-time with minimum delay.

Here's how it works:

1. When the app is opened, the front-end immediately asks for a connection to the web socket server, sending auth-related headers.

2. The WSS accepts the connection, detects its Supabase ID, detects its chats, and "subscribes" the client to all its chats so that he will be notified if anything happens real-time.

3. The front-end will send events for any action that others should be notified about: send a new message, update status (is typing / stopped typing), etc

4. For every incoming message from a client, the WSS processes it and broadcasts it to everyone affected (usually just 2 clients, the sender and the other user in the chat (only private 1-1 chats are supported atm), but this model works also for group chats), if they are online (connected).

5. In case of MESSAGE_SEND event, if the client is not online he'll receive a notification.
