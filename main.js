import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { Avatar } from "./avatar";
import { Skybox } from "./skybox";
import { OllamaApi } from "./api";
import { Agent } from "./agent";
import { COSMOS_SYSTEM_PROMPT } from "./prompts";
import { World } from "./world";

function createMessage(conversationContainer, convo) {
  const userConvoContainerDiv = document.createElement("div");
  const userNameDiv = document.createElement("div");
  const userMessageDiv = document.createElement("div");
  userMessageDiv.innerText = convo.content;
  userNameDiv.innerText = `${convo.name}:  `;
  userNameDiv.style.color = convo.nameColor;
  userConvoContainerDiv.style.display = "flex";
  userConvoContainerDiv.appendChild(userNameDiv);
  userConvoContainerDiv.appendChild(userMessageDiv);
  conversationContainer.appendChild(userConvoContainerDiv);
  conversationContainer.scrollTo(0, conversationContainer.scrollHeight);
}

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
const container = document.getElementById("canvas-container");
container.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

const world = new World(camera, controls);
world.loadMap();

const timer = new THREE.Timer();
timer.connect(document);
function animate(time) {
  timer.update();
  controls.update();
  if (world.cosmos) {
    world.cosmos.update(timer.getDelta());
  }
  renderer.render(world.scene, camera);
}
renderer.setAnimationLoop(animate);

const conversation = [];
const conversationContainer = document.getElementById("conversation-container");
const inputChat = document.querySelector("#input-chat");

document.addEventListener("keyup", (event) => {
  if (event.key === "C") {
    inputChat.focus();
  }
});

inputChat.addEventListener("keyup", async (event) => {
  if (event.key === "Enter") {
    const convo = {
      error: null,
      name: "You",
      nameColor: "white",
      content: inputChat.value,
    };
    conversation.push(convo);
    createMessage(conversationContainer, convo);
    inputChat.value = "";
    const agentResponse = await world.cosmos.chat(convo.content);
    try {
      const parsed = JSON.parse(agentResponse.content);
      world.teleportTo(new THREE.Vector3(0, 5, 0));
      conversation.push(agentResponse);
      createMessage(conversationContainer, {
        ...agentResponse,
        content: parsed.message,
      });
    } catch (e) {
      conversation.push({
        error: null,
        name: "Cosmos",
        nameColor: "#adc2ff",
        content: agentResponse.content,
      });
      createMessage(conversationContainer, {
        error: null,
        name: "Cosmos",
        nameColor: "#adc2ff",
        content: agentResponse.content,
      });
    }
  }
});
