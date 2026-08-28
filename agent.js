import { OllamaApi } from "./api";
import * as THREE from "three";
import { Avatar } from "./avatar";

export class Agent {
  api;
  avatar;
  controller;
  scene;
  camera;
  controls;
  modelPath;
  constructor(modelPath, scene, camera, controls, sys_prompt) {
    this.api = new OllamaApi(sys_prompt);
    this.scene = scene;
    this.camera = camera;
    this.controls = controls;
    this.modelPath = modelPath;
  }

  attachController(controller) {
    this.controller = controller;
  }

  load() {
    this.avatar = new Avatar(
      this.modelPath,
      this.scene,
      this.camera,
      this.controls,
    );
    this.avatar.load();
  }

  async chat(message) {
    const response = await this.api.respond(message);
    this.avatar.stopAllAnimations();
    if (response.content.includes("waves")) {
      this.avatar.setLoopMode("wave", THREE.LoopOnce);
      this.avatar.playAnimation("wave");
    }

    if (response.content.includes("sits")) {
      this.avatar.setLoopMode("sit", THREE.LoopOnce);
      this.avatar.setClampWhenFinished("sit", true);
      this.avatar.playAnimation("sit");
    }

    if (response.content.includes("walks")) {
      this.avatar.playAnimation("walk2");
    }

    if (response.content.includes("nods")) {
      this.avatar.setLoopMode("nod", THREE.LoopOnce);
      this.avatar.playAnimation("nod");
    }

    const parsedResponse = response;
    return parsedResponse;
  }

  update(deltaTime) {
    if (this.avatar.mix) {
      this.avatar.mix.update(deltaTime);
    }
    if (!this.controller) return;
  }
}
