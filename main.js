import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { Avatar } from "./avatar";
import { Skybox } from "./skybox";
import { OllamaApi } from "./api";
import { Agent } from "./agent";
import { COSMOS_SYSTEM_PROMPT } from "./prompts";

const scene = new THREE.Scene();
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
const color = 0xffffff;
const color2 = 0xfcc5fc;
const intensity = 2;
const light = new THREE.HemisphereLight(color, color2, intensity);
scene.add(light);
const skybox = new Skybox(scene, "./assets/skybox.png");
skybox.load();

const cosmos = new Agent(
  "./models/cosmos.glb",
  scene,
  camera,
  controls,
  COSMOS_SYSTEM_PROMPT,
);
cosmos.load();

const timer = new THREE.Timer();
timer.connect(document);
function animate(time) {
  timer.update();
  controls.update();
  cosmos.update(timer.getDelta());
  renderer.render(scene, camera);
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
    inputChat.value = "";
    const agentResponse = await cosmos.chat(convo.content);
    conversation.push(agentResponse);
    const agentConvoContainerDiv = document.createElement("div");
    const agentNameDiv = document.createElement("div");
    agentNameDiv.style.color = agentResponse.nameColor;
    const agentMessageDiv = document.createElement("div");
    agentMessageDiv.innerText = agentResponse.content;
    agentNameDiv.innerText = `${agentResponse.name}:  `;
    agentConvoContainerDiv.style.display = "flex";
    agentConvoContainerDiv.appendChild(agentNameDiv);
    agentConvoContainerDiv.appendChild(agentMessageDiv);
    conversationContainer.appendChild(agentConvoContainerDiv);
    conversationContainer.scrollTo(0, conversationContainer.scrollHeight);
  }
});
