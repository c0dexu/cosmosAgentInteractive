import * as THREE from "three";
import { Agent } from "./agent";
import { COSMOS_SYSTEM_PROMPT } from "./prompts";
import { locationsTypes } from "./location";

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
    },
  ];
  currentLocation = locations[0];

  constructor(camera, controls) {
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
  }

  buildPrompt(prompt) {
    const p = COSMOS_SYSTEM_PROMPT.replace(
      "{{locationName}}",
      this.currentLocation.name,
    )
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
}
