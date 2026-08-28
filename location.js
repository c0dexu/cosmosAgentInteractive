import * as THREE from "three";

export class Location {
  id;
  name;
  description;
  scene;
  spawnPoints = {
    user: new THREE.Vector3(),
    cosmos: new THREE.Vector3(),
  };
}
