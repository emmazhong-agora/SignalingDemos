import AgoraRTM from "agora-rtm-sdk";

const appId = "d4b2aade700e49c2a99c99745088195a";
let rtm = null;
let channelName = "";
let publishChannelName = "";
let userId = "";
let isLoggedIn = false;
let isSubscribed = false;

function setButtonStates() {
  document.getElementById("loginBtn").disabled = isLoggedIn;
  document.getElementById("logoutBtn").disabled = !isLoggedIn;
  document.getElementById("subscribeBtn").disabled = !isLoggedIn || isSubscribed;
  document.getElementById("unsubscribeBtn").disabled = !isLoggedIn || !isSubscribed;
  document.getElementById("publishBtn").disabled = !isLoggedIn;
  document.getElementById("uidInput").disabled = isLoggedIn;
  document.getElementById("channelInput").disabled = !isLoggedIn || isSubscribed;
}

async function login() {
  userId = document.getElementById("uidInput").value.trim();
  const token = document.getElementById("tokenInput").value.trim();
  if (!userId) {
    alert("Please enter a user ID.");
    return;
  }
  if (!token) {
    alert("Please enter a token.");
    return;
  }
  try {
    const { RTM, setParameter } = AgoraRTM;
    setParameter("ENABLE_EDGE_AUTO_FALLBACK", false);
    setParameter("AP_DOMAIN_LIST", Array(200).fill("ap-web-rtm-ngt.agora.io"));
    setParameter("CONCURRENT_AP_NUM", 1);

    const rtmConfig = { logUpload: true, logLevel: "debug" };
    rtm = new RTM(appId, userId, rtmConfig);
    rtm.addEventListener("message", event => {
      console.log("Message received:", event);
      showMessage("Recived Message from: ", event.publisher + " Message content is: " + event.message);
    });

    await rtm.login({ token: token });
    isLoggedIn = true;
    setButtonStates();
    showMessage("SYSTEM", "Login successful as " + userId);
  } catch (err) {
    showMessage("SYSTEM", "Login failed: " + err);
  }
}

async function subscribeChannel() {
  channelName = document.getElementById("channelInput").value.trim();
  if (!channelName) {
    alert("Please enter a channel name.");
    return;
  }
  try {
    console.log("Subscribing to channel:", channelName);
    const result = await rtm.subscribe(channelName);
    console.log("Subscribe result:", result);
    showMessage("SYSTEM", "Subscribe on channel: " + channelName);
    // await channel.join();
    isSubscribed = true;
    setButtonStates();
    // showMessage("SYSTEM", "Subscribed to channel: " + channelName);
  } catch (err) {
    showMessage("SYSTEM", "Subscribe failed: " + err);
  }
  
}

async function unsubscribeChannel() {
  if (!isSubscribed || !channelName) {
    alert("You are not subscribed to any channel.");
    return;
  }
  try {
    await rtm.unsubscribe(channelName);
    isSubscribed = false;
    setButtonStates();
    showMessage("SYSTEM", "Unsubscribed from channel: " + channelName);
  } catch (err) {
    showMessage("SYSTEM", "Unsubscribe failed: " + err);
  }
}

async function publishMessage() {
  const message = document.getElementById("messageInput").value;
  if (!message) {
    alert("Please enter a message.");
    return;
  }
  publishChannelName = document.getElementById("publishChannelInput").value.trim();

  try {
    console.log("Publishing message to channel:", publishChannelName, "Message:", message);
    await rtm.publish(publishChannelName, message);
    showMessage("SYSTEM", "Publish message to channel: " + publishChannelName + ", message: " + message);
    // showMessage("Publish " + message + " to " + publishChannelName);
    document.getElementById("messageInput").value = "";
  } catch (err) {
    showMessage("SYSTEM", "Publish failed: " + err);
  }
}

function showMessage(user, msg) {
  const textDisplay = document.getElementById("textDisplay");
  const newText = document.createTextNode(user + ": " + msg);
  const newLine = document.createElement("br");
  textDisplay.appendChild(newText);
  textDisplay.appendChild(newLine);
  textDisplay.scrollTop = textDisplay.scrollHeight;
}

async function logout() {
  if (rtm) {
    try {
      await rtm.logout();
      showMessage("SYSTEM", "Logout successful.");
    } catch (err) {
      showMessage("SYSTEM", "Logout failed: " + err);
    }
  }
  rtm = null;
  isLoggedIn = false;
  isSubscribed = false;
  setButtonStates();
}

window.login = login;
window.logout = logout;
window.subscribeChannel = subscribeChannel;
window.unsubscribeChannel = unsubscribeChannel;
window.publishMessage = publishMessage;

window.onload = () => {
  setButtonStates();
};
