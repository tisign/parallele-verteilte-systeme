const WebSocket = require("ws");
const { getMongoClient } = require("./database");

const sockets = [];

const initializeWebsocketServer = (server) => {
  const websocketServer = new WebSocket.Server({ server });
  websocketServer.on("connection", onConnection);
  setInterval(broadcastPrices, 500);
};

const broadcastPrices = async () => {
  console.log("Broadcasting prices to", sockets.length, "sockets");
  if (sockets.length === 0) return;
  const prices = await getLatestPrices();
  console.log("Latest prices:", prices);
  if (prices.length === 0) return;
  sockets.forEach((socket) => sendPrices(socket, prices));
};

const onConnection = async (ws) => {
  console.log("New websocket connection");
  sockets.push(ws);
  ws.on("close", () => onDisconnect(ws));
};

const getLatestPrices = async () => {
  const client = getMongoClient();
  const dbName = process.env.MONGODB_DB || "stockdb";

  const collections = ['AAPL', 'TSLA', 'MSFT'];
  const latestPrices = [];
  console.log("Fetching latest prices for", collections);
  for (const collectionName of collections) {
    const result = await client
      .db(dbName)
      .collection(collectionName)
      .find({})
      .sort({ timestamp: -1 })
      .limit(1)
      .toArray();
    console.log("Latest entry:", result);
    if (result.length > 0) {
      const latestEntry = result[0];
      latestPrices.push({
        company: collectionName, 
        avgBuyPrice: latestEntry.averageBuyPrice,
        avgSellPrice: latestEntry.averageSellPrice,
        timestamp: latestEntry.timestamp,
      });
    }
  }

  latestPrices.sort((a, b) => a.company.localeCompare(b.company));
  return latestPrices;
};

const sendPrices = async (ws, prices) => {
  ws.send(JSON.stringify({ type: "prices", prices }));
};

const onDisconnect = (ws) => {
  console.log("Websocket disconnected");
  sockets.splice(sockets.indexOf(ws), 1);
  console.log("Remaining sockets:", sockets.length);
};

module.exports = { initializeWebsocketServer };
