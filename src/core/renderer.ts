import {
  ACESFilmicToneMapping,
  AxesHelper,
  Color,
  PCFShadowMap,
  Scene,
  WebGLRenderer,
} from 'three'
import { gui } from './gui'

export const scene = new Scene()
scene.background = new Color('#1f4ca4')

const canvas: HTMLElement = document.querySelector('#webgl') as HTMLElement

export const sizes = getSizes()

function getSizes() {
  return {
    width: canvas.clientWidth,
    height: canvas.clientHeight,
  }
}

// Renderer
export const renderer = new WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
})

renderer.setClearColor( 0x000000, 0 );

// More realistic shadows
renderer.shadowMap.enabled = true
renderer.shadowMap.type = PCFShadowMap

renderer.toneMapping = ACESFilmicToneMapping
renderer.toneMappingExposure = 1

// Axes Helper
const axesHelper = new AxesHelper()
scene.add(axesHelper)

gui.addBinding(axesHelper, 'visible', {
  label: 'AxesHelper',
})

function updateRenderer() {
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) // To avoid performance problems on devices with higher pixel ratio
}

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight
  updateRenderer()
})

updateRenderer()

export default {
  renderer,
  gui,
}
