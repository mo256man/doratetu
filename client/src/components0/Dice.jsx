import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import * as CANNON from "cannon-es";
import '../styles.css';

let cameraOnTop = false;
let timeoutId = null;
let lastUpIdx = null;

// 画像URL
const IMAGE_URLS = [
  "./dice_dr.png",
  "./dice_tetu.png",
  "./dice_guessr.png"
];

const DiceWithPhysics = ({ onResult }) => {
  const mountRef = useRef();
  const resultRef = useRef();
  const clickmeRef = useRef();
  const diceMeshRef = useRef();
  const diceBodyRef = useRef();
  const spinningAngleRef = useRef(0);

  const hasThrownRef = useRef(false);
  const camLerpAlpha = 0.10;
  const INIT_CAM_POS = new THREE.Vector3(-7, 5, 10);
  const INIT_TARGET = new THREE.Vector3(2, 1, 2);
  const INIT_UP = new THREE.Vector3(0, 1, 0);
  let camTargetPos = INIT_CAM_POS.clone();
  let camTargetLook = INIT_TARGET.clone();
  let camTargetUp = INIT_UP.clone();
  let cameraOnTop = false;
  let timeoutId = null;
  let lastUpIdx = null;
  let animId;

  useEffect(() => {
    let width = mountRef.current.clientWidth;
    let height = mountRef.current.clientHeight;

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

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(8, 12, 10);
    scene.add(dirLight);

    const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.82, 0) });

    const groundBody = new CANNON.Body({
      type: CANNON.Body.STATIC,
      shape: new CANNON.Plane(),
    });
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    world.addBody(groundBody);

    const loader = new THREE.TextureLoader();
    const textures = IMAGE_URLS.map(url => loader.load(url));
    // const faceImages = [0, 1, 2, 0, 1, 2];
    const faceImages = [0, 0, 1, 1, 2, 2];
    const materials = faceImages.map(i =>
      new THREE.MeshPhongMaterial({
        map: textures[i],
        transparent: true,
        color: 0xffffff,
        alphaTest: 0.01,
      })
    );

    const diceGeometry = new RoundedBoxGeometry(1, 1, 1, 8, 0.2);
    const diceMesh = new THREE.Mesh(diceGeometry, materials);
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
    world.addBody(diceBody);
    diceBodyRef.current = diceBody;

    const diceMat = new CANNON.Material();
    const groundMat = new CANNON.Material();
    world.addContactMaterial(
      new CANNON.ContactMaterial(diceMat, groundMat, { restitution: 0.7 })
    );
    diceBody.material = diceMat;
    groundBody.material = groundMat;

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
      diceBody.type = CANNON.Body.KINEMATIC;
      diceBody.velocity.setZero();
      diceBody.angularVelocity.setZero();
      diceBody.position.set(3, 1, 3);
      diceBody.quaternion = getSpinningQuaternion(spinningAngleRef.current);
    };

    const throwDice = () => {
      if (hasThrownRef.current) return;
      hasThrownRef.current = true;
      diceBody.type = CANNON.Body.DYNAMIC;
      diceBody.position.set(3, 1, 3);
      diceBody.velocity.set(3, 7, -5);
      diceBody.angularVelocity.set(
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 12
      );
    };

    if (clickmeRef.current) {
      clickmeRef.current.onclick = throwDice;
    }

    setSpinning();

    let lastResult = null;

    function animate() {
      animId = requestAnimationFrame(animate);

      // 回転更新
      if (diceBody.type === CANNON.Body.KINEMATIC) {
        spinningAngleRef.current += 0.14;
        diceBody.quaternion = getSpinningQuaternion(spinningAngleRef.current);
      }

      // 物理演算
      world.step(1 / 60);

      // 見た目反映
      diceMesh.position.copy(diceBody.position);
      diceMesh.quaternion.copy(diceBody.quaternion);

      // 停止判定
      const v = diceBody.velocity;
      const w = diceBody.angularVelocity;
      const isStopped =
        diceBody.type === CANNON.Body.DYNAMIC &&
        v.length() < 0.05 &&
        w.length() < 0.05 &&
        diceBody.position.y < 1.05;

      if (isStopped && !timeoutId) {
        const upIdx = getUpFaceIndex(diceMesh);
        const center = diceMesh.position.clone();
        const quat = diceMesh.quaternion;
        const normal = faceNormals[upIdx].clone().applyQuaternion(quat);
        const upVec = faceUps[upIdx].clone().applyQuaternion(quat);
        const camDist = 3.1;
        const camPos = center.clone().add(normal.multiplyScalar(camDist));

        camTargetPos.copy(camPos);
        camTargetLook.copy(center);
        camTargetUp.copy(upVec);

        timeoutId = setTimeout(() => {
          if (onResult) {
            const finalIdx = getUpFaceIndex(diceMesh); // 念のため再確認
            onResult(finalIdx);
          }
          cameraOnTop = false;
          timeoutId = null;
        }, 1400);

        cameraOnTop = true; // ← setTimeout を予約した後で true にする
      }

      // 出目更新表示
      const upIdx = getUpFaceIndex(diceMesh);
      if (upIdx !== lastUpIdx) {
        lastUpIdx = upIdx;
        const imgIdx = faceImages[upIdx];
        if (resultRef.current) {
          resultRef.current.innerText = `上面: 画像${imgIdx + 1}（面 ${upIdx}）`;
        }
      }

      // カメラ補間
      camera.position.lerp(camTargetPos, camLerpAlpha);
      camera.up.lerp(camTargetUp, camLerpAlpha);
      controls.target.lerp(camTargetLook, camLerpAlpha);
      controls.update();
      camera.lookAt(controls.target);

      renderer.render(scene, camera);
    }

    animate();

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(timeoutId);
      renderer.domElement.remove();
      renderer.dispose();
      diceGeometry.dispose();
      materials.forEach(m => m.dispose());
      textures.forEach(t => t.dispose());
    };
  }, [onResult]);

  return (
    <div ref={mountRef} style={{ width: "100vw", height: "100vh", background: "#eee" }}>
      <div ref={clickmeRef} className="clickme">click me</div>
    </div>
  );
};

export default DiceWithPhysics;