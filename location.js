import * as THREE from "three";

export const locationsTypes = ["default", "garden", "moonbase"];

export class Location {
  id;
  name;
  description;
  spawnPoint = new THREE.Vector3();
  filePath;
}
