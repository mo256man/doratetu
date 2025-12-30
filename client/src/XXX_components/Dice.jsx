// Dice.jsx
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import * as CANNON from "cannon-es";
import sleep from "./sleep";
import "../styles.css";

const IMAGE_URLS = ["./dice_dr.png", "./dice_tetu.png", "./dice_guessr.png"];
const faceNormals = [
  new THREE.Vector3(1, 0, 0),
  new THREE.Vector3(-1, 0, 0),
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, -1, 0),
  new THREE.Vector3(0, 0, 1),
  new THREE.Vector3(0, 0, -1),
];
const faceUps = [
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, 0, -1),
  new THREE.Vector3(0, 0, 1),
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, 1, 0),
];
const faceImages = [0, 0, 1, 1, 2, 2];

function Dice({ setDiceIndex }) {
  const mountRef = useRef();
  const diceMeshRef = useRef();
  const diceBodyRef = useRef();
  const spinningAngleRef = useRef(0);
  const hasThrownRef = useRef(false);
  const timeoutId = useRef(null);
  const animId = useRef(null);
  const [clicked, setClicked] = useState(false);

  const camTargetPos = useRef(new THREE.Vector3(-7, 5, 10));
  const camTargetLook = useRef(new THREE.Vector3(2, 1, 2));
  const camTargetUp = useRef(new THREE.Vector3(0, 1, 0));
  const camLerpAlpha = 0.10;

  const throwDice = () => {
    if (hasThrownRef.current) return;
    hasThrownRef.current = true;

    const body = diceBodyRef.current;
    body.type = CANNON.Body.DYNAMIC;
    body.position.set(3, 1, 3);
    body.velocity.set(3, 7, -5);
    body.angularVelocity.set(
      (Math.random() - 0.5) * 12,
      (Math.random() - 0.5) * 12,
      (Math.random() - 0.5) * 12
    );
  };

  const getUpFaceIndex = (mesh) => {
    let maxY = -Infinity, upIdx = 0;
    for (let i = 0; i < 6; i++) {
      const worldNormal = faceNormals[i].clone().applyQuaternion(mesh.quaternion);
      if (worldNormal.y > maxY) {
        maxY = worldNormal.y;
        upIdx = i;
      }
    }
    return upIdx;
  };

  const getSpinningQuaternion = (angle) => {
    const qy = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, 1, 0), angle);
    const qx = new CANNON.Quaternion().setFromAxisAngle(new CANNON.Vec3(1, 0, 0), angle * 1.6);
    return qy.mult(qx);
  };

  const setSpinning = () => {
    const body = diceBodyRef.current;
    body.type = CANNON.Body.KINEMATIC;
    body.velocity.setZero();
    body.angularVelocity.setZero();
    body.position.set(3, 1, 3);
    body.quaternion = getSpinningQuaternion(spinningAngleRef.current);
  };

  useEffect(() => {
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(5, 7, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(2, 1, 2);
    controls.update();

    scene.add(new THREE.AmbientLight(0xffffff, 1.2));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(8, 12, 10);
    scene.add(dirLight);

    const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.82, 0) });

    // 市松模様テクスチャ生成
    function createCheckerTexture(size = 512, squares = 8) {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = size;
      const ctx = canvas.getContext('2d');
      const squareSize = size / squares;
      for (let y = 0; y < squares; y++) {
        for (let x = 0; x < squares; x++) {
          ctx.fillStyle = (x + y) % 2 === 0 ? '#fff' : '#888';
          ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
        }
      }
      return new THREE.CanvasTexture(canvas);
    }

    // 地面メッシュ（市松模様）
    const groundGeo = new THREE.PlaneGeometry(20, 20);
    const groundMat = new THREE.MeshPhongMaterial({
      map: createCheckerTexture(512, 10),
      side: THREE.DoubleSide,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = 0;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    const ground = new CANNON.Body({ type: CANNON.Body.STATIC, shape: new CANNON.Plane() });
    ground.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    world.addBody(ground);

    const textures = IMAGE_URLS.map(url => new THREE.TextureLoader().load(url));
    const materials = faceImages.map(i =>
      new THREE.MeshPhongMaterial({
          color: 0xffffff,
          map: textures[i],
          // transparent: true,
          // alphaTest: 0.01,
      }),
    );

    const diceGeo = new RoundedBoxGeometry(1, 1, 1, 8, 0.2);
    const diceMesh = new THREE.Mesh(diceGeo, materials);
    diceMesh.castShadow = true;
    scene.add(diceMesh);
    diceMeshRef.current = diceMesh;
    diceMesh.castShadow = true;
    scene.add(diceMesh);
    diceMeshRef.current = diceMesh;

    const diceShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
    const diceBody = new CANNON.Body({
      mass: 1,
      shape: diceShape,
      angularDamping: 0.35,
      linearDamping: 0.18,
    });
    diceBody.material = new CANNON.Material();
    world.addBody(diceBody);
    diceBodyRef.current = diceBody;

    setSpinning();

    const animate = () => {
      animId.current = requestAnimationFrame(animate);

      if (diceBody.type === CANNON.Body.KINEMATIC) {
        spinningAngleRef.current += 0.14;
        diceBody.quaternion = getSpinningQuaternion(spinningAngleRef.current);
      }

      world.step(1 / 60);
      diceMesh.position.copy(diceBody.position);
      diceMesh.quaternion.copy(diceBody.quaternion);

      // 停止判定
      const v = diceBody.velocity;
      const w = diceBody.angularVelocity;
      const isStopped =
        diceBody.type === CANNON.Body.DYNAMIC &&
        v.length() < 0.01 &&
        w.length() < 0.01 &&
        diceBody.position.y < 1.02;

      if (isStopped && !timeoutId.current) {
        const upIdx = getUpFaceIndex(diceMesh);
        const center = diceMesh.position.clone();
        const quat = diceMesh.quaternion;
        const normal = faceNormals[upIdx].clone().applyQuaternion(quat);
        const upVec = faceUps[upIdx].clone().applyQuaternion(quat);
        const camDist = 3.1;
        const camPos = center.clone().add(normal.multiplyScalar(camDist));

        camTargetPos.current.copy(camPos);
        camTargetLook.current.copy(center);
        camTargetUp.current.copy(upVec);

        timeoutId.current = setTimeout(() => {
          const finalIdx = getUpFaceIndex(diceMesh);
          setDiceIndex(finalIdx+1);
          hasThrownRef.current = false;
          timeoutId.current = null;
          setSpinning();
        }, 2000);
      }

      // カメラ補間
      camera.position.lerp(camTargetPos.current, camLerpAlpha);
      camera.up.lerp(camTargetUp.current, camLerpAlpha);
      controls.target.lerp(camTargetLook.current, camLerpAlpha);
      controls.update();
      camera.lookAt(controls.target);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId.current);
      clearTimeout(timeoutId.current);
      renderer.domElement.remove();
      renderer.dispose();
      diceGeo.dispose();
      materials.forEach(mat => mat.dispose());
      textures.forEach(t => t.dispose());
    };
  }, [setDiceIndex]);

  useEffect(() => {
    let cancelled = false;
    async function autoRoll() {
      await sleep(3000);
      if (!cancelled) {
        setClicked(true);
        throwDice();
      }
    }
    autoRoll();
    return () => { cancelled = true; };
  }, []);

return (
  <div ref={mountRef} style={{ width: "100%", height: "100%", background: "#eee"}}>
    <>{!clicked && <div className="menu-button fs50 clickme" onClick={() => {throwDice(); setClicked(true);}}>click me</div>}</>
  </div>
);
}

export default Dice;
