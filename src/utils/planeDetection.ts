/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from "three";

/**
 * Calculates the point on a virtual horizontal floor plane (y = 0) 
 * where the user's touch or pointer ray intersects.
 * This is crucial for room snapping and drag gestures.
 * 
 * @param ndcX Normalized Device Coordinate X (-1 to +1)
 * @param ndcY Normalized Device Coordinate Y (-1 to +1)
 * @param camera Three.js camera
 * @param targetPosition Vector3 where the computed floor position will be stored
 */
export function getFloorIntersectionPoint(
  ndcX: number,
  ndcY: number,
  camera: THREE.Camera,
  targetPosition: THREE.Vector3 = new THREE.Vector3()
): THREE.Vector3 | null {
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);

  // Create infinite horizontal plane representing the floor (y = 0)
  const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  
  const intersectionPoint = new THREE.Vector3();
  const rayResult = raycaster.ray.intersectPlane(floorPlane, intersectionPoint);

  if (rayResult) {
    targetPosition.copy(intersectionPoint);
    return targetPosition;
  }

  return null;
}

/**
 * Ensures a 3D model is perfectly sitting on the ground (y = 0) 
 * by computing its local bounding box and offsetting its root position.
 * 
 * @param group The THREE.Group containing the model
 */
export function snapToGround(group: THREE.Group): void {
  const box = new THREE.Box3().setFromObject(group);
  const minY = box.min.y;

  // If the bottom is below or above y = 0, offset the position so bottom sits perfectly at 0
  if (Math.abs(minY) > 0.001) {
    group.position.y -= minY;
  }
}
