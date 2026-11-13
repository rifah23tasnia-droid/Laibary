'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import type { BookRecord } from '@/lib/library-rules';

export type CameraPreset = 'lectern' | 'shelf' | 'rotunda' | 'top';
export type LightingPreset = 'study' | 'daylight' | 'archival';

interface Library3DSceneProps {
  books: BookRecord[];
  selectedBook: BookRecord;
  onSelectBook: (book: BookRecord) => void;
  cameraPreset: CameraPreset;
  lightingPreset: LightingPreset;
  explodedAmount: number; // 0 to 1
}

// Pre-allocated math helpers at module scope (zero GC in loop)
const _targetCamPos = new THREE.Vector3();
const _targetLookAt = new THREE.Vector3();
const _dummyObj = new THREE.Object3D();
const _color = new THREE.Color();

function createWoodGrainBumpTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 220; i++) {
    const y = (i / 220) * 512;
    const shade = 110 + Math.floor(Math.sin(i * 0.35) * 28);
    ctx.strokeStyle = `rgb(${shade},${shade},${shade})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(170, y + Math.sin(i) * 6, 340, y - Math.cos(i) * 6, 512, y);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  tex.anisotropy = maxAnisotropy;
  return tex;
}

function createRadialShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(128, 128, 12, 128, 128, 124);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
  grad.addColorStop(0.55, 'rgba(0, 0, 0, 0.28)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function drawOpenBookSpreadTexture(
  canvas: HTMLCanvasElement,
  book: BookRecord,
  side: 'left' | 'right'
) {
  const ctx = canvas.getContext('2d')!;
  const w = canvas.width;
  const h = canvas.height;

  // Warm archival parchment base
  const grad = ctx.createLinearGradient(0, 0, w, 0);
  if (side === 'left') {
    grad.addColorStop(0, '#efe4ce');
    grad.addColorStop(0.86, '#f7f0e2');
    grad.addColorStop(1, '#d8c7a8');
  } else {
    grad.addColorStop(0, '#d8c7a8');
    grad.addColorStop(0.14, '#f7f0e2');
    grad.addColorStop(1, '#efe4ce');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Decorative double illuminated border
  ctx.strokeStyle = book.coverColor || '#5c1d24';
  ctx.lineWidth = 4;
  ctx.strokeRect(28, 28, w - 56, h - 56);
  ctx.strokeStyle = '#b68d40';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(36, 36, w - 72, h - 72);

  ctx.fillStyle = '#1f1610';
  ctx.textAlign = 'center';

  if (side === 'left') {
    // Header Kicker
    ctx.fillStyle = '#7a5823';
    ctx.font = '600 16px sans-serif';
    ctx.fillText('গীতাঞ্জলি কলেজ গ্রন্থাগার · GRANTHAGAR ARCHIVE', w / 2, 76);

    // Ornamental divider
    ctx.strokeStyle = '#b68d40';
    ctx.beginPath();
    ctx.moveTo(90, 92);
    ctx.lineTo(w - 90, 92);
    ctx.stroke();

    // Bengali Book Title
    ctx.fillStyle = book.coverColor || '#5c1d24';
    ctx.font = 'bold 42px serif';
    ctx.fillText(book.titleBn, w / 2, 162, w - 96);

    // English Title
    ctx.fillStyle = '#382a1e';
    ctx.font = '600 20px sans-serif';
    ctx.fillText(book.titleEn, w / 2, 202, w - 96);

    // Bengali Author
    ctx.fillStyle = '#1f1610';
    ctx.font = '600 26px serif';
    ctx.fillText(book.authorBn, w / 2, 260, w - 96);

    ctx.fillStyle = '#5c4938';
    ctx.font = '500 18px sans-serif';
    ctx.fillText(book.authorEn, w / 2, 292, w - 96);

    // Archival Seal Stamp
    ctx.save();
    ctx.translate(w / 2, 395);
    ctx.strokeStyle = book.coverColor || '#5c1d24';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 54, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, 46, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = book.coverColor || '#5c1d24';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(book.shelfCode, 0, -4);
    ctx.font = '500 13px sans-serif';
    ctx.fillText(`প্রকাশকাল: ${book.publishYear}`, 0, 18);
    ctx.restore();

    // Footer metadata
    ctx.fillStyle = '#4a3a2a';
    ctx.font = '600 16px monospace';
    ctx.fillText(`ISBN: ${book.isbn}`, w / 2, h - 54);
  } else {
    // Right page: Category, Bengali Summary & Copy Status
    ctx.fillStyle = '#7a5823';
    ctx.font = '600 17px serif';
    ctx.fillText(book.category, w / 2, 76);

    ctx.strokeStyle = '#b68d40';
    ctx.beginPath();
    ctx.moveTo(90, 92);
    ctx.lineTo(w - 90, 92);
    ctx.stroke();

    // Wrap Bengali summary
    ctx.fillStyle = '#231911';
    ctx.font = '500 22px serif';
    ctx.textAlign = 'left';
    const wordsBn = book.summaryBn.split(' ');
    let line = '';
    let y = 142;
    for (const word of wordsBn) {
      const testLine = line + word + ' ';
      if (ctx.measureText(testLine).width > w - 110) {
        ctx.fillText(line, 56, y);
        line = word + ' ';
        y += 34;
      } else {
        line = testLine;
      }
    }
    if (line) {
      ctx.fillText(line, 56, y);
      y += 46;
    }

    // Wrap English summary
    ctx.fillStyle = '#4d3b2c';
    ctx.font = '400 18px sans-serif';
    const wordsEn = book.summaryEn.split(' ');
    let lineEn = '';
    for (const word of wordsEn) {
      const testLine = lineEn + word + ' ';
      if (ctx.measureText(testLine).width > w - 110) {
        ctx.fillText(lineEn, 56, y);
        lineEn = word + ' ';
        y += 28;
      } else {
        lineEn = testLine;
      }
    }
    if (lineEn) {
      ctx.fillText(lineEn, 56, y);
    }

    // Availability ledger box at bottom of right page
    ctx.fillStyle = 'rgba(182, 141, 64, 0.14)';
    ctx.fillRect(56, h - 135, w - 112, 72);
    ctx.strokeStyle = '#b68d40';
    ctx.strokeRect(56, h - 135, w - 112, 72);

    ctx.fillStyle = '#1f1610';
    ctx.textAlign = 'center';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(
      `উপলব্ধ কপি (Available): ${book.availableCopies} / ${book.totalCopies}`,
      w / 2,
      h - 102
    );
    ctx.fillStyle = '#6b533b';
    ctx.font = '500 15px monospace';
    ctx.fillText(`SHELF LOCATION: ${book.shelfCode}`, w / 2, h - 76);
  }
}

function createBookSpineTexture(
  book: BookRecord,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = book.coverColor || '#5c1d24';
  ctx.fillRect(0, 0, 128, 512);

  // Gold foil bands
  ctx.fillStyle = book.spineAccent || '#d4af37';
  const bands = [28, 44, 140, 390, 464, 480];
  for (const by of bands) {
    ctx.fillRect(8, by, 112, 6);
  }

  // Spine vertical title in Bengali
  ctx.save();
  ctx.translate(64, 265);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = '#fff6df';
  ctx.textAlign = 'center';
  ctx.font = 'bold 26px serif';
  ctx.fillText(book.titleBn, 0, 8, 220);
  ctx.restore();

  // Shelf number at bottom
  ctx.fillStyle = '#fff6df';
  ctx.textAlign = 'center';
  ctx.font = 'bold 16px monospace';
  ctx.fillText(book.shelfCode.split('-').pop() || '101', 64, 434);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export default function Library3DScene({
  books,
  selectedBook,
  onSelectBook,
  cameraPreset,
  lightingPreset,
  explodedAmount,
}: Library3DSceneProps) {
  const canvasMountRef = useRef<HTMLDivElement>(null);

  // Mutable refs for props so canvas never tears down on React state updates
  const onSelectBookRef = useRef(onSelectBook);
  const booksRef = useRef(books);
  const selectedBookRef = useRef(selectedBook);
  const cameraPresetRef = useRef<CameraPreset>(cameraPreset);
  const lightingPresetRef = useRef<LightingPreset>(lightingPreset);
  const explodedTargetRef = useRef<number>(explodedAmount);

  useEffect(() => {
    onSelectBookRef.current = onSelectBook;
  }, [onSelectBook]);

  // Scene imperative handles
  const requestRenderRef = useRef<(() => void) | null>(null);
  const updateHeroBookVisualsRef = useRef<((book: BookRecord) => void) | null>(null);
  const rebuildShowcaseShelfRef = useRef<((catalog: BookRecord[], activeId: string) => void) | null>(null);
  const applyLightingRef = useRef<((preset: LightingPreset) => void) | null>(null);
  const triggerCameraTransitionRef = useRef<((preset: CameraPreset) => void) | null>(null);

  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    // 1. Software-WebGL Guard (strictly per threejs skill)
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const maxAniso = renderer.capabilities.getMaxAnisotropy();

    // 2. Scene, Studio Environment Reflection (RoomEnvironment), Fog
    const scene = new THREE.Scene();
    const bgColor = new THREE.Color(0x100c09);
    scene.background = bgColor;
    scene.fog = new THREE.FogExp2(0x100c09, 0.032);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    pmremGenerator.dispose();

    // 3. Camera & OrbitControls
    const camera = new THREE.PerspectiveCamera(
      45,
      (container.clientWidth || window.innerWidth) / (container.clientHeight || window.innerHeight),
      0.1,
      120
    );
    camera.position.set(0, 3.6, 5.2);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.85, 0);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.minDistance = 2.0;
    controls.maxDistance = 14.0;
    controls.maxPolarAngle = Math.PI / 2 - 0.03;
    controls.update();

    // 4. Balanced Studio 3-Point Lighting + Warm/Cool Contrast
    const hemiLight = new THREE.HemisphereLight(0x88a4c4, 0x362214, 0.85);
    hemiLight.position.set(0, 15, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffe2b0, 2.3);
    keyLight.position.set(5.5, 9.5, 6.5);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    const d = 8.5;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 28;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xf3bd68, 1.0);
    rimLight.position.set(-5, 6, -5);
    scene.add(rimLight);

    const lampPointLight = new THREE.PointLight(0xffb84d, 2.4, 8, 1.8);
    lampPointLight.position.set(0, 2.85, -0.2);
    scene.add(lampPointLight);

    // 5. Shared Materials & Procedural Textures
    const woodBump = createWoodGrainBumpTexture(maxAniso);
    const shadowTex = createRadialShadowTexture();

    const mahoganyMat = new THREE.MeshStandardMaterial({
      color: 0x3b1d11,
      roughness: 0.32,
      metalness: 0.06,
      bumpMap: woodBump,
      bumpScale: 0.015,
    });

    const darkWalnutMat = new THREE.MeshStandardMaterial({
      color: 0x24120b,
      roughness: 0.62,
      metalness: 0.05,
      bumpMap: woodBump,
      bumpScale: 0.02,
    });

    const brushedBrassMat = new THREE.MeshPhysicalMaterial({
      color: 0xd4af37,
      metalness: 0.92,
      roughness: 0.18,
      clearcoat: 0.6,
      clearcoatRoughness: 0.15,
    });

    const travertineMat = new THREE.MeshStandardMaterial({
      color: 0x2a211b,
      roughness: 0.78,
      metalness: 0.04,
    });

    const emeraldShadeMat = new THREE.MeshPhysicalMaterial({
      color: 0x136f42,
      roughness: 0.15,
      metalness: 0.08,
      clearcoat: 1.0,
      emissive: 0x093b21,
      emissiveIntensity: 0.45,
    });

    // 6. Rotunda Floor & Contact Grounding (Disjoint Y offsets >= 0.02)
    const floorGroup = new THREE.Group();
    const mainFloor = new THREE.Mesh(
      new THREE.CylinderGeometry(14, 14, 0.2, 48),
      travertineMat
    );
    mainFloor.position.y = -0.1;
    mainFloor.receiveShadow = true;
    floorGroup.add(mainFloor);

    // inlaid wooden reading platform (y = 0.02)
    const readingPlatform = new THREE.Mesh(
      new THREE.CylinderGeometry(3.8, 4.0, 0.04, 36),
      darkWalnutMat
    );
    readingPlatform.position.y = 0.02;
    readingPlatform.receiveShadow = true;
    floorGroup.add(readingPlatform);

    // Brass inlaid ring (y = 0.042 with polygonOffset)
    const brassRingMat = brushedBrassMat.clone();
    brassRingMat.polygonOffset = true;
    brassRingMat.polygonOffsetFactor = -1;
    brassRingMat.polygonOffsetUnits = -1;
    const brassFloorRing = new THREE.Mesh(
      new THREE.RingGeometry(3.55, 3.68, 48),
      brassRingMat
    );
    brassFloorRing.rotation.x = -Math.PI / 2;
    brassFloorRing.position.y = 0.042;
    floorGroup.add(brassFloorRing);

    // Soft radial contact shadow under lectern (y = 0.045)
    const contactShadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    const lecternContactShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(3.2, 3.2),
      contactShadowMat
    );
    lecternContactShadow.rotation.x = -Math.PI / 2;
    lecternContactShadow.position.y = 0.045;
    floorGroup.add(lecternContactShadow);

    scene.add(floorGroup);

    // =========================================================================
    // 7. HERO SUBJECT: Composite 11-Part Reading Lectern & Open Bangla Tome
    // =========================================================================
    const heroGroup = new THREE.Group();
    heroGroup.position.set(0, 0.04, 0);
    scene.add(heroGroup);

    // Part 1: Stepped Octagonal Base Plinth (Primary Silhouette)
    const basePlinth = new THREE.Mesh(
      new THREE.CylinderGeometry(0.68, 0.82, 0.22, 8),
      darkWalnutMat
    );
    basePlinth.position.y = 0.11;
    basePlinth.castShadow = true;
    basePlinth.receiveShadow = true;
    heroGroup.add(basePlinth);

    // Part 2: Turned Baluster Pedestal Column via LatheGeometry (Primary Silhouette)
    const lathePoints = [
      new THREE.Vector2(0.54, 0.0),
      new THREE.Vector2(0.46, 0.12),
      new THREE.Vector2(0.24, 0.28),
      new THREE.Vector2(0.32, 0.52),
      new THREE.Vector2(0.18, 0.85),
      new THREE.Vector2(0.22, 1.15),
      new THREE.Vector2(0.38, 1.32),
    ];
    const pedestalGeo = new THREE.LatheGeometry(lathePoints, 24);
    const pedestalMesh = new THREE.Mesh(pedestalGeo, mahoganyMat);
    pedestalMesh.position.y = 0.22;
    pedestalMesh.castShadow = true;
    pedestalMesh.receiveShadow = true;
    heroGroup.add(pedestalMesh);

    // Part 3: Brushed Brass Collar & Gimbal Ring (Secondary Detail)
    const brassCollar = new THREE.Mesh(
      new THREE.TorusGeometry(0.28, 0.045, 14, 32),
      brushedBrassMat
    );
    brassCollar.rotation.x = Math.PI / 2;
    brassCollar.position.y = 1.54;
    heroGroup.add(brassCollar);

    // Part 4: Slanted Beveled Mahogany Reading Desk Cradle (Secondary Silhouette)
    const cradleGroup = new THREE.Group();
    cradleGroup.position.set(0, 1.66, 0);
    cradleGroup.rotation.x = 0.38; // Ergonomic reading tilt towards viewer
    heroGroup.add(cradleGroup);

    const deskShape = new THREE.Shape();
    deskShape.moveTo(-1.18, -0.78);
    deskShape.lineTo(1.18, -0.78);
    deskShape.lineTo(1.18, 0.78);
    deskShape.lineTo(-1.18, 0.78);
    deskShape.closePath();

    const deskGeo = new THREE.ExtrudeGeometry(deskShape, {
      depth: 0.06,
      bevelEnabled: true,
      bevelThickness: 0.025,
      bevelSize: 0.025,
      bevelSegments: 3,
    });
    deskGeo.center();
    const deskBoard = new THREE.Mesh(deskGeo, mahoganyMat);
    deskBoard.rotation.x = Math.PI / 2;
    deskBoard.castShadow = true;
    deskBoard.receiveShadow = true;
    cradleGroup.add(deskBoard);

    // Brass bottom lip ledge on reading desk
    const brassLedge = new THREE.Mesh(
      new THREE.BoxGeometry(2.36, 0.08, 0.09),
      brushedBrassMat
    );
    brassLedge.position.set(0, 0.05, 0.76);
    cradleGroup.add(brassLedge);

    // Part 5: Bankers' Brass Reading Lamp attached to top of lectern (Secondary + Accent)
    const lampGroup = new THREE.Group();
    lampGroup.position.set(0, 0.08, -0.82);
    const lampCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0.56, -0.14),
      new THREE.Vector3(0, 0.74, 0.08),
    ]);
    const lampArm = new THREE.Mesh(
      new THREE.TubeGeometry(lampCurve, 20, 0.026, 12, false),
      brushedBrassMat
    );
    lampGroup.add(lampArm);

    const lampHood = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.22, 0.15, 20, 1, false, 0, Math.PI),
      emeraldShadeMat
    );
    lampHood.rotation.z = Math.PI / 2;
    lampHood.rotation.y = Math.PI / 2;
    lampHood.position.set(0, 0.72, 0.12);
    lampGroup.add(lampHood);
    cradleGroup.add(lampGroup);

    // =========================================================================
    // Open Bangla Tome Assembly inside cradleGroup (Parts 6–11)
    // =========================================================================
    const tomeGroup = new THREE.Group();
    tomeGroup.position.set(0, 0.09, 0.04);
    cradleGroup.add(tomeGroup);

    const heroCoverMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(selectedBookRef.current.coverColor),
      roughness: 0.56,
      metalness: 0.12,
    });

    const heroSpineAccentMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(selectedBookRef.current.spineAccent),
      metalness: 0.9,
      roughness: 0.2,
      clearcoat: 0.5,
    });

    // Part 6: Leather Spine & 5 Raised Gold Hub Ribs
    const spineGroup = new THREE.Group();
    const spineCyl = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.11, 1.34, 20, 1, false, 0, Math.PI),
      heroCoverMat
    );
    spineCyl.rotation.x = Math.PI / 2;
    spineCyl.rotation.z = Math.PI;
    spineGroup.add(spineCyl);

    for (let i = -2; i <= 2; i++) {
      const hub = new THREE.Mesh(
        new THREE.TorusGeometry(0.115, 0.014, 10, 20, Math.PI),
        heroSpineAccentMat
      );
      hub.rotation.y = Math.PI;
      hub.position.z = i * 0.24;
      spineGroup.add(hub);
    }
    tomeGroup.add(spineGroup);

    // Part 7 & 8: Left & Right Hardcover Boards
    const leftWingGroup = new THREE.Group();
    const rightWingGroup = new THREE.Group();
    tomeGroup.add(leftWingGroup);
    tomeGroup.add(rightWingGroup);

    const coverGeo = new THREE.BoxGeometry(0.96, 0.035, 1.32);
    const leftCoverMesh = new THREE.Mesh(coverGeo, heroCoverMat);
    leftCoverMesh.position.set(-0.5, 0, 0);
    leftCoverMesh.castShadow = true;
    leftWingGroup.add(leftCoverMesh);

    const rightCoverMesh = new THREE.Mesh(coverGeo, heroCoverMat);
    rightCoverMesh.position.set(0.5, 0, 0);
    rightCoverMesh.castShadow = true;
    rightWingGroup.add(rightCoverMesh);

    // Part 9: Four Ornate Brass Corner Bosses
    const bossGeo = new THREE.BoxGeometry(0.14, 0.048, 0.14);
    const leftBossTop = new THREE.Mesh(bossGeo, heroSpineAccentMat);
    leftBossTop.position.set(-0.92, 0.005, -0.6);
    const leftBossBot = new THREE.Mesh(bossGeo, heroSpineAccentMat);
    leftBossBot.position.set(-0.92, 0.005, 0.6);
    leftWingGroup.add(leftBossTop, leftBossBot);

    const rightBossTop = new THREE.Mesh(bossGeo, heroSpineAccentMat);
    rightBossTop.position.set(0.92, 0.005, -0.6);
    const rightBossBot = new THREE.Mesh(bossGeo, heroSpineAccentMat);
    rightBossBot.position.set(0.92, 0.005, 0.6);
    rightWingGroup.add(rightBossTop, rightBossBot);

    // Part 10: Left & Right Curved Archival Page Blocks with Dynamic Bengali Calligraphy CanvasTexture
    const leftPageCanvas = document.createElement('canvas');
    leftPageCanvas.width = 512;
    leftPageCanvas.height = 640;
    const rightPageCanvas = document.createElement('canvas');
    rightPageCanvas.width = 512;
    rightPageCanvas.height = 640;

    drawOpenBookSpreadTexture(leftPageCanvas, selectedBookRef.current, 'left');
    drawOpenBookSpreadTexture(rightPageCanvas, selectedBookRef.current, 'right');

    const leftPageTex = new THREE.CanvasTexture(leftPageCanvas);
    leftPageTex.colorSpace = THREE.SRGBColorSpace;
    leftPageTex.anisotropy = maxAniso;

    const rightPageTex = new THREE.CanvasTexture(rightPageCanvas);
    rightPageTex.colorSpace = THREE.SRGBColorSpace;
    rightPageTex.anisotropy = maxAniso;

    const gildedEdgeMat = new THREE.MeshStandardMaterial({
      color: 0xe6cf9e,
      roughness: 0.45,
      metalness: 0.25,
    });

    const leftPageTopMat = new THREE.MeshStandardMaterial({
      color: 0xf4ead5,
      map: leftPageTex,
      roughness: 0.94,
      metalness: 0.0,
    });

    const rightPageTopMat = new THREE.MeshStandardMaterial({
      color: 0xf4ead5,
      map: rightPageTex,
      roughness: 0.94,
      metalness: 0.0,
    });

    const pageBlockGeo = new THREE.BoxGeometry(0.9, 0.085, 1.24);
    const leftPageBlock = new THREE.Mesh(pageBlockGeo, [
      gildedEdgeMat,
      gildedEdgeMat,
      leftPageTopMat,
      gildedEdgeMat,
      gildedEdgeMat,
      gildedEdgeMat,
    ]);
    leftPageBlock.position.set(-0.47, 0.06, 0);
    leftPageBlock.castShadow = true;
    leftWingGroup.add(leftPageBlock);

    const rightPageBlock = new THREE.Mesh(pageBlockGeo, [
      gildedEdgeMat,
      gildedEdgeMat,
      rightPageTopMat,
      gildedEdgeMat,
      gildedEdgeMat,
      gildedEdgeMat,
    ]);
    rightPageBlock.position.set(0.47, 0.06, 0);
    rightPageBlock.castShadow = true;
    rightWingGroup.add(rightPageBlock);

    // Part 11: Crimson & Gold Silk Ribbon Bookmark (TubeGeometry)
    const ribbonCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.105, -0.62),
      new THREE.Vector3(0.01, 0.115, 0.0),
      new THREE.Vector3(0.04, 0.105, 0.65),
      new THREE.Vector3(0.08, -0.05, 0.78),
    ]);
    const ribbonMesh = new THREE.Mesh(
      new THREE.TubeGeometry(ribbonCurve, 28, 0.012, 8, false),
      new THREE.MeshStandardMaterial({
        color: 0x9e1b24,
        roughness: 0.5,
        metalness: 0.1,
      })
    );
    tomeGroup.add(ribbonMesh);

    // =========================================================================
    // 8. Architectural Bookcase Wings & Interactive 3D Bangla Books Shelf
    // =========================================================================
    const clickables: THREE.Object3D[] = [];
    const showcaseBooksGroup = new THREE.Group();
    scene.add(showcaseBooksGroup);

    // Build 3 Grand Mahogany Bookcase Units in a Semi-Circular Arch behind the Lectern
    const wingConfigs = [
      { x: 0, z: -4.2, rotY: 0 },
      { x: -4.2, z: -2.4, rotY: Math.PI / 4 },
      { x: 4.2, z: -2.4, rotY: -Math.PI / 4 },
    ];

    wingConfigs.forEach((cfg) => {
      const caseGroup = new THREE.Group();
      caseGroup.position.set(cfg.x, 0, cfg.z);
      caseGroup.rotation.y = cfg.rotY;

      // Back panel
      const backPanel = new THREE.Mesh(
        new THREE.BoxGeometry(3.6, 4.4, 0.12),
        darkWalnutMat
      );
      backPanel.position.set(0, 2.2, -0.22);
      backPanel.receiveShadow = true;
      caseGroup.add(backPanel);

      // Left & Right Fluted Pilasters
      for (const sideX of [-1.74, 1.74]) {
        const pilaster = new THREE.Mesh(
          new THREE.BoxGeometry(0.18, 4.5, 0.56),
          mahoganyMat
        );
        pilaster.position.set(sideX, 2.25, 0);
        pilaster.castShadow = true;
        pilaster.receiveShadow = true;
        caseGroup.add(pilaster);
      }

      // Top Molded Cornice & Brass Plaque
      const cornice = new THREE.Mesh(
        new THREE.BoxGeometry(3.88, 0.28, 0.68),
        mahoganyMat
      );
      cornice.position.set(0, 4.52, 0.04);
      caseGroup.add(cornice);

      const brassTrim = new THREE.Mesh(
        new THREE.BoxGeometry(3.6, 0.05, 0.7),
        brushedBrassMat
      );
      brassTrim.position.set(0, 4.38, 0.05);
      caseGroup.add(brassTrim);

      // 5 Horizontal Shelf Tiers
      const shelfHeights = [0.25, 1.15, 2.05, 2.95, 3.85];
      for (const sy of shelfHeights) {
        const shelf = new THREE.Mesh(
          new THREE.BoxGeometry(3.48, 0.08, 0.52),
          mahoganyMat
        );
        shelf.position.set(0, sy, 0);
        shelf.receiveShadow = true;
        caseGroup.add(shelf);
      }

      scene.add(caseGroup);
    });

    // InstancedMesh of 144 Background Archival Volumes across the side wings & upper/lower shelves
    const bgBookCount = 144;
    const bgBookGeo = new THREE.BoxGeometry(0.11, 0.58, 0.36);
    const bgBookMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.55,
      metalness: 0.08,
    });
    const bgInstancedBooks = new THREE.InstancedMesh(
      bgBookGeo,
      bgBookMat,
      bgBookCount
    );

    const palette = [
      0x5c1d24, 0x1b3b2b, 0x1e2f4d, 0x4a2c18, 0x661c22, 0x2d3a24, 0x36233d,
      0x704214,
    ];
    let idx = 0;
    wingConfigs.forEach((cfg, wingIdx) => {
      const shelfTiers = wingIdx === 0 ? [0.25, 1.15, 2.95, 3.85] : [0.25, 1.15, 2.05, 2.95, 3.85];
      for (const sy of shelfTiers) {
        for (let b = 0; b < 10; b++) {
          if (idx >= bgBookCount) break;
          const localX = -1.35 + b * 0.29 + (idx % 3) * 0.015;
          const scaleY = 0.88 + ((idx * 7) % 24) * 0.01;
          const scaleX = 0.9 + ((idx * 5) % 20) * 0.01;

          _dummyObj.position.set(cfg.x, sy + 0.04 + (0.58 * scaleY) / 2, cfg.z);
          _dummyObj.rotation.set(0, cfg.rotY, 0);
          _dummyObj.translateX(localX);
          _dummyObj.scale.set(scaleX, scaleY, 1);
          _dummyObj.updateMatrix();
          bgInstancedBooks.setMatrixAt(idx, _dummyObj.matrix);

          _color.setHex(palette[idx % palette.length]);
          bgInstancedBooks.setColorAt(idx, _color);
          idx++;
        }
      }
    });
    bgInstancedBooks.instanceMatrix.needsUpdate = true;
    if (bgInstancedBooks.instanceColor) bgInstancedBooks.instanceColor.needsUpdate = true;
    bgInstancedBooks.computeBoundingSphere();
    scene.add(bgInstancedBooks);

    // Function to rebuild the interactive 3D Bangla Books on the Center Showcase Shelf (y = 2.05, z = -4.2)
    function rebuildShowcaseShelf(catalog: BookRecord[], activeBookId: string) {
      while (showcaseBooksGroup.children.length > 0) {
        const child = showcaseBooksGroup.children[0];
        showcaseBooksGroup.remove(child);
      }
      clickables.length = 0;

      const visibleBooks = catalog.slice(0, 12);
      const count = visibleBooks.length;
      const spacing = Math.min(0.26, 3.0 / Math.max(1, count));
      const startX = -((count - 1) * spacing) / 2;

      visibleBooks.forEach((book, i) => {
        const isSelected = book.id === activeBookId;
        const bookGroup = new THREE.Group();
        const xPos = startX + i * spacing;
        const zPull = isSelected ? -3.88 : -4.08;
        bookGroup.position.set(xPos, 2.09, zPull);

        const spineTex = createBookSpineTexture(book, maxAniso);
        const coverMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(book.coverColor || '#5c1d24'),
          roughness: 0.48,
          metalness: 0.12,
          emissive: isSelected ? new THREE.Color(book.spineAccent || '#d4af37') : new THREE.Color(0x000000),
          emissiveIntensity: isSelected ? 0.22 : 0,
        });

        const spineMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          map: spineTex,
          roughness: 0.42,
          metalness: 0.15,
        });

        // 1. Spine + Covers
        const bodyMesh = new THREE.Mesh(
          new THREE.BoxGeometry(0.16, 0.68, 0.44),
          [coverMat, coverMat, gildedEdgeMat, gildedEdgeMat, spineMat, coverMat]
        );
        bodyMesh.position.y = 0.34;
        bodyMesh.castShadow = true;
        bodyMesh.userData = { bookId: book.id };
        bookGroup.add(bodyMesh);

        // 2. Top Gold Crown Band
        const goldBand = new THREE.Mesh(
          new THREE.BoxGeometry(0.166, 0.03, 0.446),
          brushedBrassMat
        );
        goldBand.position.y = 0.62;
        bookGroup.add(goldBand);

        showcaseBooksGroup.add(bookGroup);
        clickables.push(bodyMesh);
      });
    }

    rebuildShowcaseShelf(booksRef.current, selectedBookRef.current.id);
    rebuildShowcaseShelfRef.current = rebuildShowcaseShelf;

    // Function to update Hero Open Book textures & cover colors when selectedBook changes
    function updateHeroBookVisuals(book: BookRecord) {
      heroCoverMat.color.set(book.coverColor || '#5c1d24');
      heroSpineAccentMat.color.set(book.spineAccent || '#d4af37');
      drawOpenBookSpreadTexture(leftPageCanvas, book, 'left');
      drawOpenBookSpreadTexture(rightPageCanvas, book, 'right');
      leftPageTex.needsUpdate = true;
      rightPageTex.needsUpdate = true;
    }
    updateHeroBookVisualsRef.current = updateHeroBookVisuals;

    // Function to apply lighting preset
    function applyLightingPreset(preset: LightingPreset) {
      if (preset === 'study') {
        bgColor.setHex(0x100c09);
        scene.fog = new THREE.FogExp2(0x100c09, 0.032);
        keyLight.color.setHex(0xffe2b0);
        keyLight.intensity = 2.3;
        hemiLight.color.setHex(0x88a4c4);
        hemiLight.groundColor.setHex(0x362214);
        hemiLight.intensity = 0.85;
        lampPointLight.intensity = 2.4;
      } else if (preset === 'daylight') {
        bgColor.setHex(0x1b222c);
        scene.fog = new THREE.FogExp2(0x1b222c, 0.025);
        keyLight.color.setHex(0xfff6e5);
        keyLight.intensity = 2.8;
        hemiLight.color.setHex(0xb8d4f2);
        hemiLight.groundColor.setHex(0x4a3828);
        hemiLight.intensity = 1.25;
        lampPointLight.intensity = 1.2;
      } else {
        bgColor.setHex(0x140d06);
        scene.fog = new THREE.FogExp2(0x140d06, 0.036);
        keyLight.color.setHex(0xffb85c);
        keyLight.intensity = 2.1;
        hemiLight.color.setHex(0x6e563a);
        hemiLight.groundColor.setHex(0x241409);
        hemiLight.intensity = 0.75;
        lampPointLight.intensity = 3.1;
      }
    }
    applyLightingRef.current = applyLightingPreset;

    // 9. Camera Transition Targets & Exponential Damping
    let isCameraTransitioning = false;
    function setCameraGoal(preset: CameraPreset) {
      if (preset === 'lectern') {
        _targetCamPos.set(0, 3.35, 3.6);
        _targetLookAt.set(0, 1.78, 0);
      } else if (preset === 'shelf') {
        _targetCamPos.set(0, 2.55, -1.1);
        _targetLookAt.set(0, 2.35, -4.1);
      } else if (preset === 'rotunda') {
        _targetCamPos.set(4.6, 4.2, 5.4);
        _targetLookAt.set(0, 1.9, -1.2);
      } else {
        _targetCamPos.set(0, 6.2, 0.8);
        _targetLookAt.set(0, 1.7, 0);
      }
      isCameraTransitioning = true;
    }
    triggerCameraTransitionRef.current = setCameraGoal;

    const onControlStart = () => {
      isCameraTransitioning = false;
    };
    controls.addEventListener('start', onControlStart);

    // 10. On-Demand & Software-WebGL Paced Render Loop
    let frameId = 0;
    let renderBusy = false;
    let renderDirty = false;
    let currentExploded = explodedTargetRef.current;
    let lastTime = performance.now();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
      gl.flush();
      if (!sync) {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const poll = () => {
        const state = gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function applyExplodedKinematics(val: number) {
      // Smoothly open/lift the book layers and spread angle
      const wingAngle = 0.08 + val * 0.22;
      leftWingGroup.rotation.z = wingAngle;
      rightWingGroup.rotation.z = -wingAngle;

      leftPageBlock.position.y = 0.06 + val * 0.22;
      rightPageBlock.position.y = 0.06 + val * 0.22;
      ribbonMesh.position.y = val * 0.36;

      leftBossTop.position.y = 0.005 + val * 0.32;
      leftBossBot.position.y = 0.005 + val * 0.32;
      rightBossTop.position.y = 0.005 + val * 0.32;
      rightBossBot.position.y = 0.005 + val * 0.32;
    }
    applyExplodedKinematics(currentExploded);

    function requestRender() {
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = requestAnimationFrame((now) => {
        renderDirty = false;
        const dt = Math.min(0.1, Math.max(0.001, (now - lastTime) / 1000));
        lastTime = now;

        const alpha = isSoftwareGl ? 1 : 1 - Math.exp(-8 * dt);

        // Damp exploded slider
        const expDiff = Math.abs(explodedTargetRef.current - currentExploded);
        if (expDiff > 0.002) {
          currentExploded = THREE.MathUtils.lerp(
            currentExploded,
            explodedTargetRef.current,
            alpha
          );
          applyExplodedKinematics(currentExploded);
          renderDirty = true;
        }

        // Damp camera transition
        if (isCameraTransitioning) {
          camera.position.lerp(_targetCamPos, alpha);
          controls.target.lerp(_targetLookAt, alpha);
          if (
            camera.position.distanceToSquared(_targetCamPos) < 0.002 &&
            controls.target.distanceToSquared(_targetLookAt) < 0.002
          ) {
            camera.position.copy(_targetCamPos);
            controls.target.copy(_targetLookAt);
            isCameraTransitioning = false;
          } else {
            renderDirty = true;
          }
        }

        controls.update();
        renderer.render(scene, camera);

        const done = () => {
          renderBusy = false;
          if (renderDirty) requestRender();
        };
        if (isSoftwareGl) afterDraw(done);
        else done();
      });
    }

    requestRenderRef.current = requestRender;
    controls.addEventListener('change', requestRender);

    // Pre-warm shaders on hardware GPUs and draw initial frame immediately
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }
    controls.update();
    renderer.render(scene, camera);
    requestRender();

    // 11. Raycasting for Clicking 3D Books on the Showcase Shelf
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };

    const onPointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      if (dist > 6) return; // Ignore orbit drags
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(clickables, false);
      if (hits.length > 0) {
        const bookId = hits[0].object.userData?.bookId;
        const found = booksRef.current.find((b) => b.id === bookId);
        if (found) {
          onSelectBookRef.current(found);
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    // 12. Resize Handler
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      controls.update();
      renderer.render(scene, camera);
      requestRender();
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      controls.removeEventListener('start', onControlStart);
      controls.removeEventListener('change', requestRender);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  // Synchronize React prop updates with the 3D scene via requestRender()
  useEffect(() => {
    booksRef.current = books;
    selectedBookRef.current = selectedBook;
    updateHeroBookVisualsRef.current?.(selectedBook);
    rebuildShowcaseShelfRef.current?.(books, selectedBook.id);
    requestRenderRef.current?.();
  }, [selectedBook, books]);

  useEffect(() => {
    cameraPresetRef.current = cameraPreset;
    triggerCameraTransitionRef.current?.(cameraPreset);
    requestRenderRef.current?.();
  }, [cameraPreset]);

  useEffect(() => {
    lightingPresetRef.current = lightingPreset;
    applyLightingRef.current?.(lightingPreset);
    requestRenderRef.current?.();
  }, [lightingPreset]);

  useEffect(() => {
    explodedTargetRef.current = explodedAmount;
    requestRenderRef.current?.();
  }, [explodedAmount]);

  return (
    <div
      ref={canvasMountRef}
      data-testid="library-3d-canvas"
      className="fixed inset-0 w-screen h-screen overflow-hidden z-0"
      aria-label="Interactive 3D College Library and Bangla Literature Lectern"
    />
  );
}
