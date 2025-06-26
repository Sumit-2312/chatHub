Architecture of using pub-sub in Websockets:
  What i thought of is to have a single chatRoom channel on the redis and every server will subscribe to this channel, whenever from any server someone sends the message the message will be published to the channel and then it will broadcast the same message to all the connected server where we will iterate through each client and check if they are the part of room to which the message is sent, if they are we will send them message through their socket stored


Follow this for Gemini API integration:
    https://ai.google.dev/gemini-api/docs/text-generation


