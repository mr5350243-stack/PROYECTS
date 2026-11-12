// ESCENA 03b — El sistema de protección: el bosque (23.9–30.3 s)
// Reutiliza el bosque al atardecer del proyecto anterior (camina, oye un ruido, se detiene, sale un conejo,
// se relaja), reajustado al ritmo de esta locución. Al final una hoja gira hacia la cámara y llena el encuadre
// (se convierte en la tarjeta del laboratorio en la escena 04).
import * as THREE from 'three';
import { create as forest } from '../../../video/src/scenes/s05.js';
import { ramp, lerp, easeIn, smoother } from '../shared.js';

// tiempo local → tiempo de la escena original (comprime la acción para que el conejo salga con "amenazas")
const SPEED = 1.42;

export function create() {
  const f = forest();
  const { scene, camera } = f;
  // hoja que cae y gira hacia la cámara
  const leafShape = new THREE.Shape();
  leafShape.moveTo(0, -0.5); leafShape.bezierCurveTo(0.42, -0.25, 0.38, 0.25, 0, 0.55); leafShape.bezierCurveTo(-0.38, 0.25, -0.42, -0.25, 0, -0.5);
  const leafGeo = new THREE.ShapeGeometry(leafShape, 24);
  const leaf = new THREE.Mesh(leafGeo, new THREE.MeshStandardMaterial({ color: 0xe0902a, roughness: 0.55, side: THREE.DoubleSide, emissive: 0x6a2a00, emissiveIntensity: 0.25 }));
  const vein = new THREE.Mesh(new THREE.PlaneGeometry(0.02, 1.0), new THREE.MeshBasicMaterial({ color: 0xffd38a, side: THREE.DoubleSide })); vein.position.z = 0.002; leaf.add(vein);
  leaf.scale.setScalar(0.06); scene.add(leaf);
  const fwd = new THREE.Vector3(), upV = new THREE.Vector3(), rightV = new THREE.Vector3();

  return {
    scene, camera,
    update(t) {
      const post = f.update(Math.min(t * SPEED, 9.4));
      // hoja: entra desde arriba a la izquierda, gira y se acerca hasta cubrir el plano (5.4–6.6 s)
      const k = ramp(t, 5.0, 6.7, easeIn);
      camera.updateMatrixWorld(true);
      camera.getWorldDirection(fwd);
      upV.set(0, 1, 0).applyQuaternion(camera.quaternion); rightV.crossVectors(fwd, upV);
      const dist = lerp(1.6, 0.05, k);
      leaf.position.copy(camera.position).addScaledVector(fwd, dist).addScaledVector(upV, lerp(0.28, 0.0, smoother(Math.min(1, k * 1.3))) * dist).addScaledVector(rightV, lerp(-0.2, 0.0, k) * dist);
      leaf.quaternion.copy(camera.quaternion);
      leaf.rotateZ(lerp(2.4, 0, k) + Math.sin(t * 5) * 0.2 * (1 - k)); leaf.rotateY(lerp(1.3, 0, smoother(k)) + Math.sin(t * 3) * 0.4 * (1 - k));
      leaf.visible = t > 5.0;
      leaf.scale.setScalar(0.12);
      return post;
    },
  };
}
