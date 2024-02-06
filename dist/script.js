import * as THREE from "three";
import { BloomEffect, EffectComposer, EffectPass, RenderPass } from "postprocessing"

function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const width = innerWidth;
  const height = innerHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}

function init() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  const renderer = new THREE.WebGLRenderer({ antialias: true });

  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Add a sphere and a plane
  const sphereGeometry = new THREE.SphereGeometry(2.6, 64, 64);

  // Add custom fragment shader to sphere
  const sphereMaterial = new THREE.ShaderMaterial({
    vertexShader: document.getElementById("vertexShader").textContent,
    fragmentShader: document.getElementById("fragmentShader").textContent
  });

  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere.position.set(0.27, -0.37, 0);
  scene.add(sphere);

  camera.position.z = 5;

  const video = document.getElementById("video");
  video.play();
  const texture = new THREE.VideoTexture(video);
  texture.colorSpace = THREE.SRGBColorSpace;
  const planeGeo = new THREE.PlaneGeometry(15.86, 8.92);
  const planeVidMat = new THREE.MeshBasicMaterial({ map: texture });
  const planeVideo = new THREE.Mesh(planeGeo, planeVidMat);
  scene.add(planeVideo);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(
    new EffectPass(
      camera,
      new BloomEffect({
        intensity: 2,
        radius: 0.8,
        luminanceThreshold: 0.1,
        luminanceSmoothing: 0.89,
        mipmapBlur: true
      })
    )
  );

  // Add time uniform
  sphereMaterial.uniforms.time = { type: "f", value: 0 };
  let time = 0;

  function animate() {
    // Resize canvas
    if (resizeRendererToDisplaySize(renderer)) {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
    }

    time += 0.01;
    sphere.rotation.y = (-0.3 * video.currentTime) / video.duration;

    // Update time uniform
    sphereMaterial.uniforms.time.value = time;
    composer.render();

    requestAnimationFrame(animate);
  }

  animate();
}

init()