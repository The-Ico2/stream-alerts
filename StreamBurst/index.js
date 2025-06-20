i=0
const platformColors = {
  YouTube: ["#FF0000","#CC0000"],
  Twitch: ["#9146FF","#6431A4"],
  Twitter: ["#1DA1F2","#1A91DC"],
  Kick: ["#00E701","#00B401"]
};

function hexToRgba(hex, a = 1) {
  hex = hex.replace(/^#/, '').trim();

  // Expand shorthand (e.g., "abc" → "aabbcc", "abcd" → "aabbccdd")
  const match3 = /^([A-Fa-f\d])([A-Fa-f\d])([A-Fa-f\d])$/;
  const match4 = /^([A-Fa-f\d])([A-Fa-f\d])([A-Fa-f\d])([A-Fa-f\d])$/;

  if (match3.test(hex)) hex = hex.replace(match3, (_, r, g, b) => r + r + g + g + b + b);
  if (match4.test(hex)) hex = hex.replace(match4, (_, r, g, b, o) =>
    r + r + g + g + b + b + o + o
  );

  let r, g, b;
  if (/^[A-Fa-f\d]{6}$/.test(hex)) {
    [r, g, b] = [0,2,4].map(i => parseInt(hex.slice(i, i+2), 16));
  } else if (/^[A-Fa-f\d]{8}$/.test(hex)) {
    [r, g, b] = [0,2,4].map(i => parseInt(hex.slice(i, i+2), 16));
    a = parseInt(hex.slice(6, 8), 16) / 255;
  } else {
    console.warn('Invalid HEX color:', hex);
    return `rgba(0,0,0,${a})`;
  }

  return `rgba(${r},${g},${b},${a})`;
}


function spawnAlert({ name, img, platform, data, message, duration }) {
  i+=1;
  const colors = platformColors[platform] || platformColors.YouTube;
  const primary = hexToRgba(colors[0], fieldData.gradientTransparency);
  const secondary = hexToRgba(colors[1], fieldData.gradientTransparency);

  const wrapper = document.createElement("div");
  wrapper.className = "alert-wrapper fadeIn animated";
  const W = 320, H = 80;
  wrapper.style.left = `${Math.random() * (window.innerWidth - W)}px`;
  wrapper.style.top = `${Math.random() * (window.innerHeight - H)}px`;

  wrapper.innerHTML = `
    <div class="alert-box" style="
      background: linear-gradient(135deg, ${primary}, ${secondary});
      font-family: '${fieldData.fontFamily}', sans-serif;
      font-size: ${fieldData.fontSize}px;
      position: relative;
    ">
      <div class="alert-plat-chip">{{platform}}</div>
      <div class="image-wrap">
        <div class="alert-img"><img src="${img}" alt="${name}"></div>
      </div>
      <div class="alert-info">
        <div class="alert-data">
          <span class="alert-user">${name}</span>
          <span class="alert-action">${data}</span>
        </div>
        <div id="alert-message${i}"></div>
      </div>
    </div>`;

  document.getElementById("alerts-root").appendChild(wrapper);

  if (message?.trim()) {
    messageContainer = document.getElementById(`alert-message${i}`)
    const msgDiv = document.createElement("div");
    msgDiv.className = "alert-msg";
    msgDiv.textContent = message;
    messageContainer.appendChild(msgDiv);
  }

  setTimeout(() => {
    wrapper.classList.replace("fadeIn", "fadeOut");
    wrapper.addEventListener("animationend", () => wrapper.remove());
  }, duration);
}


let fieldData = {};
window.addEventListener("onWidgetLoad", e => {
  fieldData = e.detail.fieldData;
});

window.addEventListener("onEventReceived", e => {
  const listener = (e.detail.listener || "").split("-")[0];
  const evt = e.detail.event;
  const currencySymbol = evt?.currency?.symbol || fieldData?.currency?.symbol || "$";

  if (!evt) return;

  const common = { name: evt.name, img: evt.image || evt.avatar };
  const duration = (parseFloat(fieldData.widgetDuration) || 4) * 1000;

  switch (fieldData.platform) {
    case "YouTube":
      switch (true) {
        case listener === "subscriber" && fieldData.includeSubs:
          spawnAlert({ ...common, platform: "YouTube", data: "just subscribed!", duration });
          break;
        case listener === "tip" && fieldData.includeTips && evt.amount >= +fieldData.minTip:
          spawnAlert({ ...common, platform: "YouTube", data: `tipped ${currencySymbol}${evt.amount}`, message: evt.message, duration });
          break;
        case listener === "superchat" && fieldData.includeSuperchats && evt.amount >= +fieldData.minSuperchat:
          spawnAlert({ ...common, platform: "YouTube", data: `tipped ${currencySymbol}${evt.amount} through superchat!`, message: evt.message, duration });
          break;
        case listener === "sponsor" && fieldData.includeSponsors:
          spawnAlert({ ...common, platform: "YouTube", data: "just became a member!", duration });
          break;
      }
      break;

    case "Twitch":
      switch (true) {
        case listener === "follower" && fieldData.includeFollowers:
          spawnAlert({ ...common, platform: "Twitch", data: "just followed!", duration });
          break;
        case listener === "subscriber" && fieldData.includeSubs:
          spawnAlert({ ...common, platform: "Twitch", data: evt.gifted ? "gifted a sub!" : "just subscribed!", duration });
          break;
        case listener === "cheer" && fieldData.includeCheers && evt.amount >= +fieldData.minCheer:
          spawnAlert({ ...common, platform: "Twitch", data: `cheered with ${evt.amount} bits!`, message: evt.message, duration });
          break;
        case listener === "tip" && fieldData.includeTips && evt.amount >= +fieldData.minTip:
          spawnAlert({ ...common, platform: "Twitch", data: `tipped ${currencySymbol}${evt.amount}`, message: evt.message, duration });
          break;
        case listener === "host" && fieldData.includeHosts && evt.amount >= +fieldData.minHost:
          spawnAlert({ ...common, platform: "Twitch", data: `hosted ${evt.amount}!`, duration });
          break;
        case listener === "raid" && fieldData.includeRaids && evt.amount >= +fieldData.minRaid:
          spawnAlert({ ...common, platform: "Twitch", data: `raided ${evt.amount}!`, duration });
          break;
        case listener === "redemption" && fieldData.includeRedemptions:
          spawnAlert({ ...common, platform: "Twitch", data: "redeemed!", duration });
          break;
      }
      break;

    case "Twitter":
      switch (true) {
        case listener === "subscriber" && fieldData.includeSubs:
          spawnAlert({ ...common, platform: "Twitter", data: evt.gifted ? "gifted a sub!" : "just subscribed!", duration });
          break;
      }

    case "Kick":
      switch (true) {
        case listener === "subscriber" && fieldData.includeSubs:
          spawnAlert({ ...common, platform: "Kick", data: evt.gifted ? "gifted a sub!" : "just subscribed!", duration });
          break;
      }
  }

  if (typeof SE_API?.resumeQueue === "function") SE_API.resumeQueue();
});