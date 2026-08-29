import * as THREE from "three";
import { Agent } from "./agent";
import { COSMOS_SYSTEM_PROMPT } from "./prompts";
import { locationsTypes } from "./location";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { Skybox } from "./skybox";

export class WorldObject {
  id;
  name;
  position;
  interactable;
  constructor(id, name, position, interactable) {
    this.id = id;
    this.name = name;
    this.position = position;
    this.interactable = interactable;
  }
}

export class World {
  map3d;
  camera;
  cosmos;
  controls;
  scene = new THREE.Scene();
  objects = new Map();
  interactables = [];
  locations = [
    {
      id: "location.default",
      name: "default",
      description:
        "A starter location consisting of one baseplate Cosmos can stand on",
      spawnPoint: new THREE.Vector3(0, 0, 0),
      filePath: "./scenes/baseplate.gltf",
    },
    {
      id: "location.garden",
      name: "garden",
      description:
        "Minimalistic, but beautiful garden with a few trees surrounding a water pond",
      spawnPoint: new THREE.Vector3(0, 0, 0),
      filePath: "./scenes/garden.glb",
    },
  ];
  currentLocation;

  constructor(camera, controls) {
    this.currentLocation = this.locations[0];
    const color = 0xffffff;
    const color2 = 0xfcc5fc;
    const intensity = 2;
    const light = new THREE.HemisphereLight(color, color2, intensity);
    this.scene.add(light);
    const skybox = new Skybox(this.scene, "./assets/skybox.png");
    skybox.load();
    this.camera = camera;
    this.controls = controls;
  }

  buildPrompt(prompt) {
    const p = prompt
      .replace("{{locationName}}", this.currentLocation.name)
      .replace("{{locationDescription}}", this.currentLocation.description)
      .replace(
        "{{availableLocations}}",
        this.locations.map((x) => x.name).join(", "),
      )
      .replace(
        "{{availableInteractables}}",
        this.interactables.length > 0
          ? [...this.objects.values()].map((x) => x.name).join(",")
          : "None",
      );
    return p;
  }

  load(path) {}

  loadMap() {
    if (!this.camera || !this.controls) return;
    const loader = new GLTFLoader();
    const thisRef = this;
    const currLocationPath = this.currentLocation.filePath;

    loader.load(
      currLocationPath,
      function (gltf) {
        thisRef.map3d = gltf.scene;
        thisRef.scene.add(gltf.scene);
        console.log(this);

        gltf.scene.traverse((obj) => {
          if (obj.type === "Mesh") {
            const userData = obj.userData;
            if (userData.id) {
              const worldObj = new WorldObject(
                userData.id,
                userData.name,
                obj.position,
                userData.interactable,
              );
              thisRef.objects.set(worldObj.id, worldObj);
            }
          }
        });
        this.loadAvatar();
      }.bind(this),
    );
  }

  loadAvatar() {
    const prompt = this.buildPrompt(COSMOS_SYSTEM_PROMPT);
    this.cosmos = new Agent(
      "./models/cosmos.glb",
      this.scene,
      this.camera,
      this.controls,
      prompt,
    );
    this.cosmos.load();
  }
}
