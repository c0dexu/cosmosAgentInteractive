import * as THREE from "three";

export class Skybox {
  texturePath;
  scene;
  constructor(scene, texturePath) {
    this.texturePath = texturePath;
    this.scene = scene;
  }

  load() {
    const loader = new THREE.TextureLoader();
    const texture = loader.load(this.texturePath, () => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      texture.colorSpace = THREE.SRGBColorSpace;
      this.scene.background = texture;
    });
  }
}
