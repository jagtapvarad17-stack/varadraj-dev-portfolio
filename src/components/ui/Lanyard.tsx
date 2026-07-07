/* eslint-disable react/no-unknown-property */
/**
 * Lanyard – Rapier physics implementation (matches original React Bits demo)
 *
 * Physics:  @react-three/rapier  (RigidBody + rope joints + spherical joint)
 * Rope:     meshline (MeshLineGeometry / MeshLineMaterial)
 * Card:     custom canvas-generated front/back texture composited onto card.glb atlas
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, extend, useFrame } from '@react-three/fiber';
import { useGLTF, useTexture, Environment, Lightformer } from '@react-three/drei';
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
} from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';

import cardGLB      from '@/assets/lanyard/card.glb';
import lanyardBand  from '@/assets/lanyard/lanyard.png';
import profilePhoto from '@/assets/lanyard/profile.jpg';

import * as THREE from 'three';
import './Lanyard.css';

extend({ MeshLineGeometry, MeshLineMaterial });

// ─── Constants ───────────────────────────────────────────────────────────────
const BLANK_PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

const FRONT_UV_RECT = { x: 0,   y: 0, w: 0.5,  h: 0.755 };
const BACK_UV_RECT  = { x: 0.5, y: 0, w: 0.5,  h: 0.757 };

// ─── Band (inner physics component) ─────────────────────────────────────────
interface BandProps {
  isMobile    : boolean;
  frontDataUrl: string;
  backDataUrl : string;
  lanyardWidth: number;
  maxSpeed?   : number;
  minSpeed?   : number;
}

function Band({
  isMobile,
  frontDataUrl,
  backDataUrl,
  lanyardWidth,
  maxSpeed = 50,
  minSpeed = 0,
}: BandProps) {
  // Refs for rope rigid-body segments + card
  const band  = useRef<THREE.Mesh>(null);
  const fixed = useRef<any>(null);
  const j1    = useRef<any>(null);
  const j2    = useRef<any>(null);
  const j3    = useRef<any>(null);
  const card  = useRef<any>(null);

  // Scratch vectors (stable across frames — no allocation in useFrame)
  const vec = new THREE.Vector3();
  const ang = new THREE.Vector3();
  const rot = new THREE.Vector3();
  const dir = new THREE.Vector3();

  const segmentProps = {
    type        : 'dynamic' as const,
    canSleep    : true,
    colliders   : false,
    angularDamping : 4,
    linearDamping  : 4,
  };

  // ── Assets ─────────────────────────────────────────────────────────────────
  const { nodes, materials } = useGLTF(cardGLB) as any;
  const bandTex  = useTexture(lanyardBand);
  const frontTex = useTexture(frontDataUrl || BLANK_PIXEL);
  const backTex  = useTexture(backDataUrl  || BLANK_PIXEL);

  // Composite front/back canvas textures onto the GLB atlas
  const cardMap = useMemo(() => {
    const baseMap = materials.base.map;
    if (!frontDataUrl && !backDataUrl) return baseMap;

    const baseImg = baseMap.image as HTMLImageElement;
    const W = baseImg.width;
    const H = baseImg.height;
    const offscreen = document.createElement('canvas');
    offscreen.width  = W;
    offscreen.height = H;
    const ctx = offscreen.getContext('2d');
    if (!ctx) return baseMap;

    ctx.drawImage(baseImg, 0, 0, W, H);

    const drawFitted = (img: HTMLImageElement, rect: typeof FRONT_UV_RECT) => {
      const rx = rect.x * W, ry = rect.y * H, rw = rect.w * W, rh = rect.h * H;
      const scale = Math.max(rw / img.width, rh / img.height);
      const dw = img.width * scale, dh = img.height * scale;
      const dx = rx + (rw - dw) / 2, dy = ry + (rh - dh) / 2;
      ctx.save();
      ctx.beginPath(); ctx.rect(rx, ry, rw, rh); ctx.clip();
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.restore();
    };

    if (frontTex.image) drawFitted(frontTex.image as HTMLImageElement, FRONT_UV_RECT);
    if (backTex.image)  drawFitted(backTex.image  as HTMLImageElement, BACK_UV_RECT);

    const tex = new THREE.CanvasTexture(offscreen);
    tex.colorSpace  = THREE.SRGBColorSpace;
    tex.flipY       = baseMap.flipY;
    tex.anisotropy  = 16;
    tex.needsUpdate = true;
    return tex;
  }, [frontDataUrl, backDataUrl, frontTex, backTex, materials.base.map]);

  bandTex.wrapS = bandTex.wrapT = THREE.RepeatWrapping;

  // ── Rope joints (chain: fixed → j1 → j2 → j3 →[spherical]→ card) ──────────
  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1,    j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2,    j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.5, 0]]);

  // ── Drag state ─────────────────────────────────────────────────────────────
  const [dragged, drag]   = useState<THREE.Vector3 | false>(false);
  const [hovered, hover]  = useState(false);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => void (document.body.style.cursor = 'auto');
    }
  }, [hovered, dragged]);

  // ── Catmull-Rom curve for the rope band ────────────────────────────────────
  const [curve] = useState(
    () => new THREE.CatmullRomCurve3([
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3(),
    ])
  );
  curve.curveType = 'chordal';

  // ── Per-frame physics update ───────────────────────────────────────────────
  useFrame((state, delta) => {
    if (dragged) {
      // Unproject pointer into world space and move card (kinematic)
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach(ref => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({
        x: vec.x - (dragged as THREE.Vector3).x,
        y: vec.y - (dragged as THREE.Vector3).y,
        z: vec.z - (dragged as THREE.Vector3).z,
      });
    }

    if (fixed.current) {
      // Lerp intermediate joints toward their physical position (smooth rope)
      [j1, j2].forEach(ref => {
        if (!ref.current.lerped)
          ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
        const dist = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())));
        ref.current.lerped.lerp(ref.current.translation(), delta * (minSpeed + dist * (maxSpeed - minSpeed)));
      });

      // Update catmull-rom curve control points
      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.lerped);
      curve.points[2].copy(j1.current.lerped);
      curve.points[3].copy(fixed.current.translation());
      (band.current as any).geometry.setPoints(curve.getPoints(isMobile ? 16 : 32));

      // Damp card's y-axis spin so it doesn't spin forever
      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
    }
  });

  // ── JSX ────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Anchor + 3 rope joints + card rigid bodies */}
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody ref={j1} position={[0.5, 0, 0]} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody ref={j2} position={[1, 0, 0]} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody ref={j3} position={[1.5, 0, 0]} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          ref={card}
          position={[2, 0, 0]}
          {...segmentProps}
          type={dragged ? 'kinematicPosition' : 'dynamic'}
        >
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={e => {
              e.target.releasePointerCapture(e.pointerId);
              drag(false);
            }}
            onPointerDown={e => {
              e.target.setPointerCapture(e.pointerId);
              drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())));
            }}
          >
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                map={cardMap}
                map-anisotropy={16}
                clearcoat={isMobile ? 0 : 1}
                clearcoatRoughness={0.15}
                roughness={0.9}
                metalness={0.8}
              />
            </mesh>
            <mesh geometry={nodes.clip.geometry}  material={materials.metal} material-roughness={0.3} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>

      {/* Rope / lanyard band */}
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={isMobile ? [1000, 2000] : [1000, 1000]}
          useMap
          map={bandTex}
          repeat={[-4, 1]}
          lineWidth={lanyardWidth}
        />
      </mesh>
    </>
  );
}

// ─── Public Lanyard component ─────────────────────────────────────────────────
interface LanyardProps {
  position?    : [number, number, number];
  gravity?     : [number, number, number];
  fov?         : number;
  transparent? : boolean;
  lanyardWidth?: number;
}

export default function Lanyard({
  position     = [0, 0, 30],
  gravity      = [0, -40, 0],
  fov          = 20,
  transparent  = true,
  lanyardWidth = 1,
}: LanyardProps) {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 768
  );
  const [frontDataUrl, setFrontDataUrl] = useState<string | null>(null);
  const [backDataUrl,  setBackDataUrl]  = useState<string | null>(null);

  // ── Canvas-based dynamic ID card texture generation ───────────────────────
  useEffect(() => {
    const img = new Image();
    img.src = profilePhoto;
    img.onload = () => {
      // ── Front face ────────────────────────────────────────────────────────
      const canvasFront = document.createElement('canvas');
      canvasFront.width  = 512;
      canvasFront.height = 768;
      const ctxFront = canvasFront.getContext('2d');
      if (ctxFront) {
        const grad = ctxFront.createLinearGradient(0, 0, 0, 768);
        grad.addColorStop(0,   '#0a101d');
        grad.addColorStop(0.5, '#050a12');
        grad.addColorStop(1,   '#02050a');
        ctxFront.fillStyle = grad;
        ctxFront.fillRect(0, 0, 512, 768);

        ctxFront.strokeStyle = 'rgba(0, 208, 255, 0.15)';
        ctxFront.lineWidth = 2;
        ctxFront.beginPath();
        ctxFront.moveTo(30, 30);   ctxFront.lineTo(120, 30);  ctxFront.lineTo(150, 60);
        ctxFront.moveTo(482, 30);  ctxFront.lineTo(392, 30);  ctxFront.lineTo(362, 60);
        ctxFront.moveTo(30, 738);  ctxFront.lineTo(120, 738); ctxFront.lineTo(150, 708);
        ctxFront.moveTo(482, 738); ctxFront.lineTo(392, 738); ctxFront.lineTo(362, 708);
        ctxFront.stroke();

        ctxFront.fillStyle = '#00d0ff';
        ctxFront.font      = 'bold 24px sans-serif';
        ctxFront.textAlign = 'center';
        ctxFront.fillText('WCE IT PORTAL', 256, 70);

        ctxFront.strokeStyle = 'rgba(0, 208, 255, 0.4)';
        ctxFront.lineWidth   = 1.5;
        ctxFront.strokeRect(236, 100, 40, 30);
        ctxFront.fillStyle   = 'rgba(0, 208, 255, 0.1)';
        ctxFront.fillRect(236, 100, 40, 30);
        ctxFront.beginPath();
        ctxFront.moveTo(246, 100); ctxFront.lineTo(246, 130);
        ctxFront.moveTo(256, 100); ctxFront.lineTo(256, 130);
        ctxFront.moveTo(266, 100); ctxFront.lineTo(266, 130);
        ctxFront.moveTo(236, 110); ctxFront.lineTo(276, 110);
        ctxFront.moveTo(236, 120); ctxFront.lineTo(276, 120);
        ctxFront.stroke();

        const pcx = 256, pcy = 290, radius = 100;
        ctxFront.save();
        ctxFront.beginPath();
        ctxFront.arc(pcx, pcy, radius, 0, Math.PI * 2);
        ctxFront.closePath();
        ctxFront.clip();
        const size = Math.min(img.width, img.height);
        const sx = (img.width  - size) / 2;
        const sy = (img.height - size) / 2;
        ctxFront.drawImage(img, sx, sy, size, size, pcx - radius, pcy - radius, radius * 2, radius * 2);
        ctxFront.restore();

        ctxFront.strokeStyle = '#00d0ff';
        ctxFront.lineWidth   = 4;
        ctxFront.shadowColor = '#00d0ff';
        ctxFront.shadowBlur  = 12;
        ctxFront.beginPath();
        ctxFront.arc(pcx, pcy, radius, 0, Math.PI * 2);
        ctxFront.stroke();
        ctxFront.shadowBlur = 0;

        ctxFront.fillStyle = '#ffffff';
        ctxFront.font      = 'bold 30px sans-serif';
        ctxFront.fillText('VARADRAJ JAGTAP', 256, 450);
        ctxFront.fillStyle = '#00d0ff';
        ctxFront.font      = '600 18px sans-serif';
        ctxFront.fillText('FULL STACK DEVELOPER', 256, 485);

        ctxFront.fillStyle   = 'rgba(255,255,255,0.03)';
        ctxFront.fillRect(60, 530, 392, 130);
        ctxFront.strokeStyle = 'rgba(0,208,255,0.2)';
        ctxFront.strokeRect(60, 530, 392, 130);
        ctxFront.textAlign   = 'left';
        ctxFront.font        = 'bold 14px monospace';
        ctxFront.fillStyle   = '#8892b0';
        ctxFront.fillText('MEMBER ID:',   90, 570);
        ctxFront.fillText('ROLE TYPE:',   90, 605);
        ctxFront.fillText('INSTITUTION:', 90, 640);
        ctxFront.fillStyle = '#ffffff';
        ctxFront.fillText('VJ-17-WCE-IT',       210, 570);
        ctxFront.fillText('ENGINEERING STUDENT', 210, 605);
        ctxFront.fillText('WCE SANGLI',          210, 640);

        ctxFront.fillStyle   = 'rgba(0,208,255,0.15)';
        ctxFront.fillRect(340, 555, 80, 22);
        ctxFront.strokeStyle = '#00d0ff';
        ctxFront.strokeRect(340, 555, 80, 22);
        ctxFront.fillStyle   = '#00d0ff';
        ctxFront.font        = 'bold 11px sans-serif';
        ctxFront.textAlign   = 'center';
        ctxFront.fillText('ACTIVE', 380, 571);

        ctxFront.fillStyle = '#00d0ff';
        ctxFront.fillRect(0, 758, 512, 10);

        setFrontDataUrl(canvasFront.toDataURL());
      }

      // ── Back face ─────────────────────────────────────────────────────────
      const canvasBack = document.createElement('canvas');
      canvasBack.width  = 512;
      canvasBack.height = 768;
      const ctxBack = canvasBack.getContext('2d');
      if (ctxBack) {
        const grad = ctxBack.createLinearGradient(0, 0, 0, 768);
        grad.addColorStop(0, '#02050a');
        grad.addColorStop(1, '#0a101d');
        ctxBack.fillStyle = grad;
        ctxBack.fillRect(0, 0, 512, 768);

        ctxBack.fillStyle  = '#00d0ff';
        ctxBack.font       = 'bold 32px sans-serif';
        ctxBack.textAlign  = 'center';
        ctxBack.fillText('WALCHAND COLLEGE', 256, 120);
        ctxBack.font       = '16px sans-serif';
        ctxBack.fillStyle  = '#8892b0';
        ctxBack.fillText('OF ENGINEERING, SANGLI', 256, 150);

        ctxBack.strokeStyle = 'rgba(0,208,255,0.25)';
        ctxBack.strokeRect(206, 210, 100, 70);
        ctxBack.fillStyle   = 'rgba(0,208,255,0.04)';
        ctxBack.fillRect(206, 210, 100, 70);

        ctxBack.fillStyle  = '#ffffff';
        ctxBack.font       = 'bold 14px monospace';
        ctxBack.fillText('IF FOUND, PLEASE RETURN TO:', 256, 360);
        ctxBack.fillStyle  = '#8892b0';
        ctxBack.font       = '13px monospace';
        ctxBack.fillText('DEPARTMENT OF INFORMATION TECHNOLOGY', 256, 395);
        ctxBack.fillText('WCE SANGLI, MAHARASHTRA, INDIA', 256, 420);

        ctxBack.fillStyle = '#ffffff';
        ctxBack.fillRect(106, 490, 300, 80);
        ctxBack.fillStyle = '#000000';
        let bx = 116;
        while (bx < 396) {
          const w = Math.floor(Math.random() * 4) + 1;
          ctxBack.fillRect(bx, 495, w, 70);
          bx += w + Math.floor(Math.random() * 4) + 1;
        }
        ctxBack.fillStyle  = '#ffffff';
        ctxBack.font       = 'bold 14px monospace';
        ctxBack.fillText('jagtapvarad17-stack', 256, 600);

        ctxBack.fillStyle = 'rgba(0,208,255,0.1)';
        ctxBack.fillRect(0, 758, 512, 10);

        setBackDataUrl(canvasBack.toDataURL());
      }
    };
  }, []);

  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);

  if (!frontDataUrl || !backDataUrl) {
    return (
      <div className="lanyard-wrapper flex items-center justify-center">
        <div className="text-primary text-sm animate-pulse">Preparing ID card…</div>
      </div>
    );
  }

  return (
    <div className="lanyard-wrapper">
      <Canvas
        camera={{ position, fov }}
        dpr={[1, isMobile ? 1.5 : 2]}
        gl={{ alpha: transparent }}
        onCreated={({ gl }) =>
          gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)
        }
      >
        <ambientLight intensity={Math.PI} />
        <Physics gravity={gravity} timeStep={isMobile ? 1 / 30 : 1 / 60}>
          <Band
            isMobile={isMobile}
            frontDataUrl={frontDataUrl}
            backDataUrl={backDataUrl}
            lanyardWidth={lanyardWidth}
          />
        </Physics>
        <Environment blur={0.75}>
          <Lightformer intensity={2}  color="white" position={[0,  -1,  5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3}  color="white" position={[-1, -1,  1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3}  color="white" position={[1,   1,  1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={10} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
        </Environment>
      </Canvas>
    </div>
  );
}
