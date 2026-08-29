import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export class Avatar {
  initPosition = new THREE.Vector3();
  velocity = new THREE.Vector3();
  gravityScale = 1;
  gravity = 0.01;
  ref;
  scene;
  camera;
  controls;
  mix;
  clipsMap = new Map();
  head;
  modelPath;
  tween;

  constructor(
    modelPath,
    scene,
    camera,
    controls,
    initPosition = new THREE.Vector3(),
  ) {
    this.scene = scene;
    this.camera = camera;
    this.controls = controls;
    this.modelPath = modelPath;
    this.initPosition.copy(initPosition);
  }

  load() {
    const loader = new GLTFLoader();
    const thisRef = this;
    loader.load(
      this.modelPath,
      function (gltf) {
        thisRef.ref = gltf;
        thisRef.head = gltf.scene.children[0].children[0].children[5];
        thisRef.ref.scene.position.copy(thisRef.initPosition);
        thisRef.scene.add(thisRef.ref.scene);
        if (thisRef.controls) {
          thisRef.camera.position.set(10, 5, 0);
          thisRef.controls.target = thisRef.head.position;
        }
        thisRef.mix = new THREE.AnimationMixer(gltf.scene);
        gltf.animations.forEach((clip) => {
          const action = thisRef.mix.clipAction(clip);
          thisRef.clipsMap.set(clip.name, action);
        });
      },
      undefined,
      function (error) {
        console.error(error);
      },
    );
  }

  playAnimation(clipName) {
    const action = this.clipsMap.get(clipName);
    if (action) {
      action.play();
    }
  }

  setLoopMode(clipName, loop) {
    const action = this.clipsMap.get(clipName);
    if (action) {
      action.loop = loop;
      this.clipsMap.set(clipName, action);
    }
  }

  stopAnimation(clipName) {
    const action = this.clipsMap.get(clipName);
    if (action) {
      action.stop();
    }
  }

  stopAllAnimations() {
    this.clipsMap.forEach((clip) => {
      clip.stop();
    });
  }

  setClampWhenFinished(clipName, flag) {
    const action = this.clipsMap.get(clipName);
    if (!action) return;
    action.clampWhenFinished = flag;
  }
}
