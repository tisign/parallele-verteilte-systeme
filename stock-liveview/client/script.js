const url = window.location.href;
const socket = new WebSocket(url.replace("http", "ws"));

// Listen for WebSocket open event
socket.addEventListener("open", (event) => {
  console.log("WebSocket connected.");
  console.log(event);
});

let oldPrices = [];
let prices = [];

const renderPrices = () => {
  const pricesDiv = document.getElementById("prices");
  if (prices.length === 0) {
    return;
  }
  pricesDiv.innerHTML = "";

  prices.forEach((price) => {
    const div = document.createElement("div");
    div.classList.add(
      "flex",
      "flex-col",
      "items-center",
      "justify-center",
      "rounded",
      "bg-slate-500"
    );

    const h2 = document.createElement("h2");
    h2.classList.add("text-2xl", "font-semibold");
    h2.innerText = price.company;

    const spanBuy = document.createElement("span");
    spanBuy.classList.add("text-xl");
    spanBuy.innerText = `Avg Buy Price: ${price.avgBuyPrice.toFixed(2)}`;

    const spanSell = document.createElement("span");
    spanSell.classList.add("text-xl");
    spanSell.innerText = `Avg Sell Price: ${price.avgSellPrice.toFixed(2)}`;

    div.appendChild(h2);
    div.appendChild(spanBuy);
    div.appendChild(spanSell);
    pricesDiv.appendChild(div);

    if(oldPrices.length > 0) {
      const oldPrice = oldPrices.find((oldPrice) => oldPrice.company === price.company);
      if(oldPrice) {
        if(price.avgBuyPrice > oldPrice.avgBuyPrice) {
          div.classList.add("bg-green-500");
        } else if(price.avgBuyPrice < oldPrice.avgBuyPrice) {
          div.classList.add("bg-red-500");
        }
      }
    }
  });
    oldPrices = prices;
};

// Listen for messages from server
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  switch (message.type) {
    case "prices":
      prices = message.prices;
      renderPrices();
      break;
    default:
      console.error("Unknown message type:", message.type);
  }
});

// Listen for WebSocket close event
socket.addEventListener("close", (event) => {
  console.log("WebSocket closed.");
});

// Listen for WebSocket errors
socket.addEventListener("error", (event) => {
  console.error("WebSocket error:", event);
});
