import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import './StlViewer.scss'

function formatCoord(value) {
  return value.toFixed(3)
}

export default function StlViewer({ model }) {
  const containerRef = useRef(null)
  const markersGroupRef = useRef(null)
  const [points, setPoints] = useState([])
  const [meshReady, setMeshReady] = useState(false)
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    setPoints([])
    setMeshReady(false)
    setLoadError(null)
  }, [model.url])

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

    const addMarker = (position, id) => {
      const marker = new THREE.Mesh(
        new THREE.SphereGeometry(markerRadius, 20, 20),
        new THREE.MeshBasicMaterial({ color: 0xffdd00 }),
      )
      marker.position.copy(position)
      marker.userData.pointId = id
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
      pointId += 1
      addMarker(hits[0].point, pointId)
      setPoints((prev) => [...prev, { id: pointId, x, y, z }])
    }

    renderer.domElement.addEventListener('pointerdown', onPointerDown)

    const fitMesh = (geometry) => {
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
      setLoadError(null)
    }

    const loader = new STLLoader()
    loader.load(
      model.url,
      fitMesh,
      undefined,
      (error) => {
        console.error('STL yüklenemedi:', error)
        setLoadError('Model yüklenemedi. Geçerli bir STL dosyası seçin.')
        setMeshReady(false)
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
  }, [model.url])

  const disposeMarker = (marker) => {
    marker.geometry.dispose()
    marker.material.dispose()
  }

  const removePoint = (id) => {
    const markersGroup = markersGroupRef.current
    if (markersGroup) {
      const marker = markersGroup.children.find((child) => child.userData.pointId === id)
      if (marker) {
        disposeMarker(marker)
        markersGroup.remove(marker)
      }
    }
    setPoints((prev) => prev.filter((p) => p.id !== id))
  }

  const clearPoints = () => {
    const markersGroup = markersGroupRef.current
    if (markersGroup) {
      markersGroup.children.forEach(disposeMarker)
      markersGroup.clear()
    }
    setPoints([])
  }

  return (
    <div className="stl-viewer-layout">
      <div className="stl-viewer-wrap">
        <div className="stl-viewer" ref={containerRef} />
        <p className={`stl-viewer-hint${loadError ? ' stl-viewer-hint--error' : ''}`}>
          {loadError
            ? loadError
            : meshReady
              ? `${model.label} · Shift + sol tık: nokta seç · Sol sürükle: döndür · Tekerlek: zoom`
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
                <div className="stl-point-meta">
                  <span className="stl-point-index">#{index + 1}</span>
                  <button
                    type="button"
                    className="stl-point-delete"
                    onClick={() => removePoint(p.id)}
                    aria-label={`${index + 1}. noktayı sil`}
                    title="Bu noktayı sil"
                  >
                    Sil
                  </button>
                </div>
                <div className="stl-point-coords">
                  <span className="stl-coord stl-coord--x">
                    <span className="stl-coord-label">X</span>
                    <code>{formatCoord(p.x)}</code>
                  </span>
                  <span className="stl-coord stl-coord--y">
                    <span className="stl-coord-label">Y</span>
                    <code>{formatCoord(p.y)}</code>
                  </span>
                  <span className="stl-coord stl-coord--z">
                    <span className="stl-coord-label">Z</span>
                    <code>{formatCoord(p.z)}</code>
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
