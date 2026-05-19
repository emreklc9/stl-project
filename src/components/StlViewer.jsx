import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import spidermanStl from '../assets/file/Spiderman.stl?url'
import './StlViewer.css'

function formatCoord(value) {
  return value.toFixed(3)
}

export default function StlViewer() {
  const containerRef = useRef(null)
  const markersGroupRef = useRef(null)
  const [points, setPoints] = useState([])
  const [meshReady, setMeshReady] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x1a1b26)

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      10000,
    )
    camera.position.set(0, 0, 200)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(container.clientWidth, container.clientHeight)
    container.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05

    scene.add(new THREE.AmbientLight(0xffffff, 0.5))
    const keyLight = new THREE.DirectionalLight(0xffffff, 1)
    keyLight.position.set(1, 1, 2)
    scene.add(keyLight)
    const fillLight = new THREE.DirectionalLight(0x8899ff, 0.4)
    fillLight.position.set(-2, 0, -1)
    scene.add(fillLight)

    scene.add(new THREE.GridHelper(200, 20, 0x444466, 0x2a2a3a))

    const markersGroup = new THREE.Group()
    markersGroupRef.current = markersGroup
    scene.add(markersGroup)

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    let mesh = null
    let markerRadius = 1
    let pointId = 0

    const addMarker = (position) => {
      const marker = new THREE.Mesh(
        new THREE.SphereGeometry(markerRadius, 20, 20),
        new THREE.MeshBasicMaterial({ color: 0xffdd00 }),
      )
      marker.position.copy(position)
      markersGroup.add(marker)
    }

    const onPointerDown = (event) => {
      if (!mesh || !event.shiftKey) return

      const rect = renderer.domElement.getBoundingClientRect()
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(pointer, camera)
      const hits = raycaster.intersectObject(mesh, false)
      if (hits.length === 0) return

      const { x, y, z } = hits[0].point
      addMarker(hits[0].point)

      pointId += 1
      setPoints((prev) => [...prev, { id: pointId, x, y, z }])
    }

    renderer.domElement.addEventListener('pointerdown', onPointerDown)

    const loader = new STLLoader()
    loader.load(
      spidermanStl,
      (geometry) => {
        geometry.computeVertexNormals()
        geometry.center()

        mesh = new THREE.Mesh(
          geometry,
          new THREE.MeshStandardMaterial({
            color: 0xe63946,
            metalness: 0.15,
            roughness: 0.45,
          }),
        )
        scene.add(mesh)

        const box = new THREE.Box3().setFromObject(mesh)
        const size = box.getSize(new THREE.Vector3())
        const maxDim = Math.max(size.x, size.y, size.z)
        markerRadius = maxDim * 0.006

        const fitDistance = maxDim / (2 * Math.tan((camera.fov * Math.PI) / 360))
        camera.position.set(fitDistance, fitDistance * 0.6, fitDistance)
        camera.near = maxDim / 100
        camera.far = maxDim * 100
        camera.updateProjectionMatrix()
        controls.target.set(0, size.y * 0.1, 0)
        controls.update()
        setMeshReady(true)
      },
      undefined,
      (error) => {
        console.error('STL yüklenemedi:', error)
      },
    )

    const onResize = () => {
      const { clientWidth, clientHeight } = container
      if (clientWidth === 0 || clientHeight === 0) return
      camera.aspect = clientWidth / clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(clientWidth, clientHeight)
    }

    const resizeObserver = new ResizeObserver(onResize)
    resizeObserver.observe(container)

    let frameId
    const animate = () => {
      frameId = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(frameId)
      resizeObserver.disconnect()
      renderer.domElement.removeEventListener('pointerdown', onPointerDown)
      controls.dispose()
      markersGroup.children.forEach((child) => {
        child.geometry.dispose()
        child.material.dispose()
      })
      markersGroupRef.current = null
      if (mesh) {
        mesh.geometry.dispose()
        mesh.material.dispose()
      }
      renderer.dispose()
      container.removeChild(renderer.domElement)
      setMeshReady(false)
    }
  }, [])

  const clearPoints = () => {
    const markersGroup = markersGroupRef.current
    if (markersGroup) {
      markersGroup.children.forEach((child) => {
        child.geometry.dispose()
        child.material.dispose()
      })
      markersGroup.clear()
    }
    setPoints([])
  }

  return (
    <div className="stl-viewer-layout">
      <div className="stl-viewer-wrap">
        <div className="stl-viewer" ref={containerRef} />
        <p className="stl-viewer-hint">
          {meshReady
            ? 'Shift + sol tık: nokta seç · Sol sürükle: döndür · Tekerlek: zoom'
            : 'Model yükleniyor…'}
        </p>
      </div>

      <aside className="stl-points-panel">
        <div className="stl-points-panel-header">
          <h2>Seçilen noktalar</h2>
          {points.length > 0 && (
            <button type="button" className="stl-clear-btn" onClick={clearPoints}>
              Temizle
            </button>
          )}
        </div>
        {points.length === 0 ? (
          <p className="stl-points-empty">
            Model yüzeyinde bir noktaya <strong>Shift + sol tık</strong> yapın.
            Koordinatlar model merkezine göredir (STL birimine bağlı).
          </p>
        ) : (
          <ul className="stl-points-list">
            {points.map((p, index) => (
              <li key={p.id} className="stl-point-item">
                <span className="stl-point-index">#{index + 1}</span>
                <div className="stl-point-coords">
                  <span>
                    X: <code>{formatCoord(p.x)}</code>
                  </span>
                  <span>
                    Y: <code>{formatCoord(p.y)}</code>
                  </span>
                  <span>
                    Z: <code>{formatCoord(p.z)}</code>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  )
}
