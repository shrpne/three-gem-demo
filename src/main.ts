import * as THREE from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js';
import { EffectShader } from "./EffectShader.js";
import { renderer, scene, sizes } from './core/renderer'
import { fpsGraph, gui } from './core/gui'
import camera from './core/camera'
import { controls } from './core/orbit-control'
import {makeDiamond} from './make-diamond.js'

import './style.css'

// Shaders
// import vertexShader from '/@/shaders/vertex.glsl'
// import fragmentShader from '/@/shaders/fragment.glsl'

// Lights
// const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5)
// scene.add(ambientLight)
//
// const directionalLight = new THREE.DirectionalLight('#ffffff', 1)
// directionalLight.castShadow = true
// directionalLight.shadow.mapSize.set(1024, 1024)
// directionalLight.shadow.camera.far = 15
// directionalLight.shadow.normalBias = 0.05
// directionalLight.position.set(0.25, 2, 2.25)
// scene.add(directionalLight)

const ambientLight = new THREE.AmbientLight(new THREE.Color(1.0, 1.0, 1.0), 0.25);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight('0xffffff', 0.35);
directionalLight.position.set(150, 200, 50);

// Skybox
// const environment = await new THREE.CubeTextureLoader().loadAsync([
//   "skybox/Box_Right.bmp",
//   "skybox/Box_Left.bmp",
//   "skybox/Box_Top.bmp",
//   "skybox/Box_Bottom.bmp",
//   "skybox/Box_Front.bmp",
//   "skybox/Box_Back.bmp"
// ]);
// environment.encoding = THREE.sRGBEncoding;

const environment = await new RGBELoader().loadAsync('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/aerodynamics_workshop_1k.hdr');
// scene.background = environment;

// Objects
let diamondGeo = (await new OBJLoader().loadAsync("gem.obj")).children[0].geometry;
diamondGeo.scale(3, 3, 3);
diamondGeo.translate(0, 0, 0);
const diamond = makeDiamond(diamondGeo, { envMap: environment, sizes });
scene.add(diamond);


// Build postprocessing stack
// Render Targets
const defaultTexture = new THREE.WebGLRenderTarget(sizes.width, sizes.height, {
  minFilter: THREE.LinearFilter,
  magFilter: THREE.NearestFilter
});
defaultTexture.depthTexture = new THREE.DepthTexture(sizes.width, sizes.height, THREE.FloatType);
// Post Effects
const composer = new EffectComposer(renderer/*, defaultTexture*/);
const smaaPass = new SMAAPass(sizes.width, sizes.height);
const effectPass = new ShaderPass(EffectShader);
composer.addPass(effectPass);
composer.addPass(new ShaderPass(GammaCorrectionShader));
composer.addPass(smaaPass);


const DirectionalLightFolder = gui.addFolder({
  title: 'Directional Light',
})

Object.keys(directionalLight.position).forEach((key) => {
  DirectionalLightFolder.addBinding(
    directionalLight.position,
    key as keyof THREE.Vector3,
    {
      min: -100,
      max: 100,
      step: 1,
    },
  )
})


const clock = new THREE.Clock()

const loop = () => {
  // gui
  // diamond.material.uniforms.bounces.value = effectController.bounces;
  // diamond.material.uniforms.ior.value = effectController.ior;
  // diamond.material.uniforms.correctMips.value = effectController.correctMips;
  // // diamond.material.uniforms.chromaticAberration.value = effectController.chromaticAberration;
  // diamond.material.uniforms.aberrationStrength.value = effectController.aberrationStrength;
  diamond.rotation.y += 0.01;

  diamond.material.viewMatrixInverse = camera.matrixWorld
  diamond.material.projectionMatrixInverse = camera.projectionMatrixInverse

  diamond.material.uniforms.viewMatrixInverse.value = camera.matrixWorld
  diamond.material.uniforms.projectionMatrixInverse.value = camera.projectionMatrixInverse

  diamond.updateMatrix();
  diamond.updateMatrixWorld();
  renderer.setRenderTarget(defaultTexture);
  renderer.clear();
  renderer.render(scene, camera);
  effectPass.uniforms["sceneDiffuse"].value = defaultTexture.texture;
  composer.render();

  const elapsedTime = clock.getElapsedTime()

  // sphereMaterial.uniforms.uTime.value = elapsedTime

  fpsGraph.begin()

  controls.update()
  camera.lookAt(0, 6, 0)
  renderer.render(scene, camera)

  fpsGraph.end()
  requestAnimationFrame(loop)
}

loop()
