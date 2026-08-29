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
  obj3d;
  constructor(id, name, position, obj3d) {
    this.id = id;
    this.name = name;
    this.position = position;
    this.obj3d = obj3d;
  }
}

export class World {
  map3d;
  camera;
  cosmos;
  controls;
  scene = new THREE.Scene();
  objects = [];
  interactables = [];
  locations = [
    {
      id: "location.default",
      name: "default",
      description:
        "A starter location consisting of one baseplate Cosmos can stand on",
      spawnPoint: new THREE.Vector3(0, 0, 0),
      filePath: "./scenes/baseplate.glb",
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
    const prompt = this.buildPrompt(COSMOS_SYSTEM_PROMPT);
    console.log("PROMPT", prompt);
    this.cosmos = new Agent(
      "./models/cosmos.glb",
      this.scene,
      camera,
      controls,
      prompt,
    );
    this.cosmos.load();
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
          ? this.interactables.map((y) => y.name).join(",")
          : "None",
      );
    return p;
  }

  loadMap() {
    const loader = new GLTFLoader();
    const thisRef = this;
    const currLocationPath = this.currentLocation.filePath;
    loader.load(currLocationPath, (gltf) => {
      console.log(gltf);
      thisRef.map3d = gltf.scene;
      thisRef.scene.add(gltf.scene);
    });
  }
}
