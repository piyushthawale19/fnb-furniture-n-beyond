/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from "three";

/**
 * Procedurally generates a beautiful, premium luxury lounge chair model.
 * This acts as an exceptional production-ready fallback when a GLB file
 * cannot be downloaded, making the AR experience instantly functional.
 * 
 * @param color Hex string or color name for the upholstery
 * @param woodType Hex or wood color for legs
 */
export function generateProceduralFurniture(color: string = "#C8B195", woodType: string = "#5C4033"): THREE.Group {
  const group = new THREE.Group();
  group.name = "procedural-luxury-chair";

  // Convert string colors to THREE.Color
  const upholsteryColor = new THREE.Color(color);
  const woodColor = new THREE.Color(woodType);
  const goldColor = new THREE.Color("#D4AF37"); // Gold accents for brass caps

  // --- MATERIALS ---
  // Upholstery: Soft velvet look
  const upholsteryMat = new THREE.MeshStandardMaterial({
    color: upholsteryColor,
    roughness: 0.65,
    metalness: 0.1,
    bumpScale: 0.05,
  });

  // Leg wood: Matte polished wood
  const woodMat = new THREE.MeshStandardMaterial({
    color: woodColor,
    roughness: 0.5,
    metalness: 0.05,
  });

  // Brass caps
  const brassMat = new THREE.MeshStandardMaterial({
    color: goldColor,
    roughness: 0.2,
    metalness: 0.9,
  });

  // --- GEOMETRY PARTS ---
  
  // 1. Cushion Seat (Rounded/Thick)
  const seatGeo = new THREE.BoxGeometry(0.8, 0.16, 0.8);
  const seatMesh = new THREE.Mesh(seatGeo, upholsteryMat);
  seatMesh.position.y = 0.35; // height above floor
  seatMesh.castShadow = true;
  seatMesh.receiveShadow = true;
  group.add(seatMesh);

  // 2. Thick Backrest (Curved/Luxury profile)
  const backGeo = new THREE.BoxGeometry(0.8, 0.6, 0.18);
  const backMesh = new THREE.Mesh(backGeo, upholsteryMat);
  backMesh.position.set(0, 0.65, -0.31);
  backMesh.rotation.x = -0.08; // slightly reclined
  backMesh.castShadow = true;
  backMesh.receiveShadow = true;
  group.add(backMesh);

  // 3. Side Armrests
  const armWidth = 0.15;
  const armHeight = 0.35;
  const armLength = 0.74;
  const armGeo = new THREE.BoxGeometry(armWidth, armHeight, armLength);

  const leftArm = new THREE.Mesh(armGeo, upholsteryMat);
  leftArm.position.set(-0.47, 0.45, 0.03);
  leftArm.castShadow = true;
  leftArm.receiveShadow = true;
  group.add(leftArm);

  const rightArm = new THREE.Mesh(armGeo, upholsteryMat);
  rightArm.position.set(0.47, 0.45, 0.03);
  rightArm.castShadow = true;
  rightArm.receiveShadow = true;
  group.add(rightArm);

  // 4. Four Elegant Splayed Legs with Brass Caps
  const legRadius = 0.03;
  const legHeight = 0.35;
  const legGeo = new THREE.CylinderGeometry(legRadius * 0.75, legRadius, legHeight, 12);
  const capGeo = new THREE.CylinderGeometry(legRadius * 0.75 * 1.05, legRadius * 0.82, 0.05, 12);

  const legPositions = [
    { x: -0.35, z: 0.33, rotX: 0.1, rotZ: -0.1 },  // Front Left
    { x: 0.35, z: 0.33, rotX: 0.1, rotZ: 0.1 },    // Front Right
    { x: -0.32, z: -0.33, rotX: -0.1, rotZ: -0.1 }, // Back Left
    { x: 0.32, z: -0.33, rotX: -0.1, rotZ: 0.1 },   // Back Right
  ];

  legPositions.forEach((pos) => {
    const legGroup = new THREE.Group();
    legGroup.position.set(pos.x, legHeight / 2, pos.z);

    const leg = new THREE.Mesh(legGeo, woodMat);
    leg.castShadow = true;
    legGroup.add(leg);

    // Brass cap at the bottom
    const cap = new THREE.Mesh(capGeo, brassMat);
    cap.position.y = -legHeight / 2 + 0.025;
    cap.castShadow = true;
    legGroup.add(cap);

    // Splay the leg slightly
    legGroup.rotation.x = pos.rotX;
    legGroup.rotation.z = pos.rotZ;

    group.add(legGroup);
  });

  // Scale group to standard human size (around 0.9m tall, 1m wide)
  group.scale.set(1, 1, 1);

  return group;
}

/**
 * Loads a GLB model dynamically, using the procedural generator as an automatic fallback.
 */
export async function loadGLBModel(
  url?: string,
  color: string = "#C8B195",
  onProgress?: (percent: number) => void
): Promise<THREE.Group> {
  if (!url) {
    // Return gorgeous fallback instantly if no model URL is provided
    return generateProceduralFurniture(color);
  }

  // Inside browser sandbox, we dynamically load GLTFLoader to keep dependencies lightweight
  try {
    const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
    const loader = new GLTFLoader();

    // Setup Draco decoder if needed (fallback uses standard loading)
    return new Promise((resolve) => {
      loader.load(
        url,
        (gltf) => {
          const model = gltf.scene;
          
          // Apply proper shadow casting and materials
          model.traverse((node: any) => {
            if (node.isMesh) {
              node.castShadow = true;
              node.receiveShadow = true;
              
              // If model has default colors, allow slight tinting or respect textures
              if (node.material) {
                node.material.depthWrite = true;
              }
            }
          });
          
          resolve(model);
        },
        (xhr) => {
          if (onProgress && xhr.total > 0) {
            const percent = Math.round((xhr.loaded / xhr.total) * 100);
            onProgress(percent);
          }
        },
        (error) => {
          console.warn("Could not load GLB file, compiling procedural luxury design:", error);
          // Return the high quality procedural fallback
          resolve(generateProceduralFurniture(color));
        }
      );
    });
  } catch (err) {
    console.warn("GLTFLoader import failed, compiling procedural luxury design:", err);
    return generateProceduralFurniture(color);
  }
}
