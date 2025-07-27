import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import * as CANNON from "cannon-es";

// 画像URL
const IMAGE_URLS = [
  "https://upload.wikimedia.org/wikipedia/commons/c/cb/The_Blue_Marble_%28remastered%29.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/d/dd/Full_Moon_Luc_Viatour.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/c/c7/Solar_eclipse_1999_4.jpg"
];

const DiceWithPhysics = () => {
  const mountRef = useRef();
  const resultRef = useRef();
  const clickmeRef = useRef();

  useEffect(() => {
    // ------ 初期設定 ------
    let width = mountRef.current.clientWidth;
    let height = mountRef.current.clientHeight;

    // シーン・カメラ・レンダラー
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);

    // 初期カメラ設定
    const INIT_CAM_POS = new THREE.Vector3(5, 7, 10);
    const INIT_TARGET = new THREE.Vector3(2, 1, 2);
    const INIT_UP = new THREE.Vector3(0, 1, 0);

    camera.position.copy(INIT_CAM_POS);
    camera.up.copy(INIT_UP);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // コントロール
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(INIT_TARGET);
    controls.update();

    // ライト
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(8, 12, 10);
    scene.add(dirLight);

    // Cannon物理世界
    const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.82, 0) });
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 12;

    // 地面
    const groundBody = new CANNON.Body({
      type: CANNON.Body.STATIC,
      shape: new CANNON.Plane(),
    });
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    world.addBody(groundBody);

    const groundMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.MeshPhongMaterial({ color: 0xffffff, opacity: 0.4, transparent: true })
    );
    groundMesh.position.y = 0;
    groundMesh.rotation.x = -Math.PI / 2;
    scene.add(groundMesh);

    // 画像テクスチャ生成
    const loader = new THREE.TextureLoader();
    const textures = IMAGE_URLS.map(url => loader.load(url));

    // サイコロのマテリアル配列 (3画像×2面ずつ)
    const faceImages = [
      0, // +X
      0, // -X
      1, // +Y
      1, // -Y
      2, // +Z
      2  // -Z
    ];
    const diceMaterials = faceImages.map(i =>
      new THREE.MeshPhongMaterial({ map: textures[i], color: 0xffffff })
    );

    // サイコロ（物理・見た目）生成（角丸！）
    const diceSize = 1;
    const diceRadius = 0.2;
    const diceGeometry = new RoundedBoxGeometry(diceSize, diceSize, diceSize, 8, diceRadius);
    const diceMesh = new THREE.Mesh(diceGeometry, diceMaterials);
    diceMesh.castShadow = true;
    scene.add(diceMesh);

    // Cannon-esには角丸はないので通常のBoxで近似
    const diceShape = new CANNON.Box(new CANNON.Vec3(diceSize / 2, diceSize / 2, diceSize / 2));
    const diceBody = new CANNON.Body({
      mass: 1,
      position: new CANNON.Vec3(3, 1, 3),
      shape: diceShape,
      angularDamping: 0.35,
      linearDamping: 0.18,
    });
    world.addBody(diceBody);

    // restitution 追加ここから
    const diceMaterial = new CANNON.Material("diceMat");
    diceMaterial.restitution = 0.7;
    const groundMaterial = new CANNON.Material("groundMat");
    groundMaterial.restitution = 0.7;
    diceBody.material = diceMaterial;
    groundBody.material = groundMaterial;
    const contactMaterial = new CANNON.ContactMaterial(diceMaterial, groundMaterial, {
      restitution: 0.7
    });
    world.addContactMaterial(contactMaterial);
    // restitution 追加ここまで

    // カメラの補間目標を先に宣言
    let camTargetPos = INIT_CAM_POS.clone();
    let camTargetLook = INIT_TARGET.clone();
    let camTargetUp = INIT_UP.clone();
    const camLerpAlpha = 0.10;

    // ぐるぐる回転用
    let spinningAngle = 0;
    function getSpinningQuaternion(angle) {
      const qy = new CANNON.Quaternion();
      qy.setFromAxisAngle(new CANNON.Vec3(0,1,0), angle);
      const qx = new CANNON.Quaternion();
      qx.setFromAxisAngle(new CANNON.Vec3(1,0,0), angle*1.6);
      return qy.mult(qx);
    }

    // サイコロを右下でぐるぐる回す
    function setSpinning() {
      diceBody.type = CANNON.Body.KINEMATIC;
      diceBody.velocity.setZero();
      diceBody.angularVelocity.setZero();
      diceBody.position.set(3, 1, 3);
      diceBody.quaternion = getSpinningQuaternion(spinningAngle);
      camTargetPos.copy(INIT_CAM_POS);
      camTargetLook.copy(INIT_TARGET);
      camTargetUp.copy(INIT_UP);
    }
    setSpinning();

    // サイコロを投げ出す
    function throwDice() {
      diceBody.quaternion = getSpinningQuaternion(spinningAngle);
      diceBody.type = CANNON.Body.DYNAMIC;
      diceBody.position.set(3, 1, 3);
      diceBody.velocity.set(3, 7, -5);
      diceBody.angularVelocity.set(
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 12
      );
      if (resultRef.current) resultRef.current.innerText = "上面：-";
      camTargetPos.copy(INIT_CAM_POS);
      camTargetLook.copy(INIT_TARGET);
      camTargetUp.copy(INIT_UP);
    }

    if (clickmeRef.current) clickmeRef.current.onclick = throwDice;

    // サイコロの上面画像インデックスを取得
    const faceNormals = [
      new THREE.Vector3(1, 0, 0),   // +X
      new THREE.Vector3(-1, 0, 0),  // -X
      new THREE.Vector3(0, 1, 0),   // +Y
      new THREE.Vector3(0, -1, 0),  // -Y
      new THREE.Vector3(0, 0, 1),   // +Z
      new THREE.Vector3(0, 0, -1),  // -Z
    ];
    const faceUps = [
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, 0, -1),
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, 1, 0),
    ];
    function getUpFaceIndex(mesh) {
      let maxY = -Infinity, upIdx = 0;
      for (let i = 0; i < 6; i++) {
        const worldNormal = faceNormals[i].clone().applyQuaternion(mesh.quaternion);
        if (worldNormal.y > maxY) {
          maxY = worldNormal.y;
          upIdx = i;
        }
      }
      return upIdx;
    }

    let lastUpIdx = null;
    let cameraOnTop = false;
    let animId;
    let timeoutId = null;

    function animate() {
      animId = requestAnimationFrame(animate);

      if (diceBody.type === CANNON.Body.KINEMATIC) {
        spinningAngle += 0.14;
        diceBody.quaternion = getSpinningQuaternion(spinningAngle);
      }

      world.step(1 / 60);

      // 物理→見た目へ同期
      diceMesh.position.copy(diceBody.position);
      diceMesh.quaternion.copy(diceBody.quaternion);

      // サイコロ停止判定
      if (diceBody.type === CANNON.Body.DYNAMIC) {
        const v = diceBody.velocity, w = diceBody.angularVelocity;
        if (v.length() < 0.05 && w.length() < 0.05 && diceBody.position.y < 1.05) {
          if (!cameraOnTop) {
            const upIdx = getUpFaceIndex(diceMesh);
            const center = diceMesh.position.clone();
            const quat = diceMesh.quaternion;
            const normal = faceNormals[upIdx].clone().applyQuaternion(quat);
            const upVec = faceUps[upIdx].clone().applyQuaternion(quat);
            const camDist = 3.1;
            const camPos = center.clone().add(normal.clone().multiplyScalar(camDist));
            camTargetPos.copy(camPos);
            camTargetLook.copy(center);
            camTargetUp.copy(upVec);
            cameraOnTop = true;
          }
          if (!timeoutId) {
            timeoutId = setTimeout(() => {
              setSpinning();
              cameraOnTop = false;
              timeoutId = null;
            }, 1400);
          }
        }
      } else {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
      }

      // 上面判定＆表示
      const upIdx = getUpFaceIndex(diceMesh);
      if (upIdx !== lastUpIdx) {
        lastUpIdx = upIdx;
        const imgIdx = faceImages[upIdx];
        if (resultRef.current) {
          resultRef.current.innerText =
            "上面: 画像" + (imgIdx + 1) + "（面 " + upIdx + "）";
        }
      }

      // カメラを滑らかに目標位置へ
      camera.position.lerp(camTargetPos, camLerpAlpha);
      camera.up.lerp(camTargetUp, camLerpAlpha);
      controls.target.lerp(camTargetLook, camLerpAlpha);
      controls.update();
      camera.lookAt(controls.target);

      renderer.render(scene, camera);
    }
    animate();

    function handleResize() {
      if (!mountRef.current) return;
      width = mountRef.current.clientWidth;
      height = mountRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
    window.addEventListener("resize", handleResize);

    // クリーンアップ
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      renderer.domElement.remove();
      textures.forEach(tex => tex.dispose());
      diceGeometry.dispose();
      diceMaterials.forEach(mat => mat.dispose());
      groundMesh.geometry.dispose();
      groundMesh.material.dispose();
    };
  }, []);

  // --- レンダリング部分 ---
  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", background: "#eee" }}>
      <div
        ref={mountRef}
        style={{ width: "100vw", height: "100vh", overflow: "hidden" }}
      />
      <div
        ref={resultRef}
        style={{
          position: "absolute",
          top: 10, left: 10, fontSize: 18,
          background: "#fff", padding: "7px 13px", borderRadius: 7,
          boxShadow: "0 2px 8px #aaa", zIndex: 10
        }}
      >上面：-</div>
      <div
        ref={clickmeRef}
        style={{
          position: "absolute",
          right: 40, bottom: 40, fontSize: 26,
          padding: "18px 32px", background: "#fffb",
          borderRadius: 18, boxShadow: "0 2px 8px #aaa",
          cursor: "pointer", userSelect: "none", zIndex: 20,
          transition: "background 0.2s"
        }}
        onMouseOver={e => e.currentTarget.style.background = "#ffd"}
        onMouseOut={e => e.currentTarget.style.background = "#fffb"}
      >click me</div>
    </div>
  );
};

export default DiceWithPhysics;