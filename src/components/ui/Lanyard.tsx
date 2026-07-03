/* eslint-disable react/no-unknown-property */
/**
 * Lanyard – physics-engine-free implementation
 *
 * Uses a custom spring-pendulum (damped harmonic oscillator) simulated inside
 * useFrame. No @react-three/rapier required – just @react-three/fiber + drei +
 * meshline. The card hangs from an invisible ceiling anchor, swings once on
 * mount, and decays to a complete stop thanks to the DAMPING_C constant.
 * The user can grab and fling the card; angular velocity is preserved on release.
 */
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, extend, useFrame } from '@react-three/fiber';
import { useGLTF, useTexture, Environment, Lightformer } from '@react-three/drei';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';

import cardGLB       from '@/assets/lanyard/card.glb';
import lanyardBand   from '@/assets/lanyard/lanyard.png';
import profilePhoto  from '@/assets/lanyard/profile.jpg';

import * as THREE from 'three';
import './Lanyard.css';

extend({ MeshLineGeometry, MeshLineMaterial });

// ─────────────────────────────────────────────────────────────────────────────
// Shared constants
// ─────────────────────────────────────────────────────────────────────────────
const BLANK_PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

const FRONT_UV_RECT = { x: 0,   y: 0, w: 0.5, h: 0.755 };
const BACK_UV_RECT  = { x: 0.5, y: 0, w: 0.5, h: 0.757 };

// ─────────────────────────────────────────────────────────────────────────────
// Spring-pendulum physics constants
//
//   Equation of motion:  θ'' = -K·θ - C·θ'
//   Critical damping   :  C  = 2·√K  (≈ 3.46 for K=3)
//   We use C < critical → slight oscillation → card swings and settles.
// ─────────────────────────────────────────────────────────────────────────────
const SPRING_K   = 3.0;   // spring stiffness
const DAMPING_C  = 2.2;   // damping coefficient  (< 2√3 ≈ 3.46 → underdamped)
const ROPE_LEN   = 4.2;   // rope length (scene units)
const INIT_THETA = 0.28;  // initial swing angle (≈ 16°) – card appears to "settle"
const MAX_THETA  = 1.3;   // maximum drag angle (radians)

// Anchor = invisible ceiling hook. Y is above the canvas visible area so the
// rope appears to extend off the top of the frame (natural hanging look).
const ANCHOR = new THREE.Vector3(-0.4, 4.2, 0);

// ─────────────────────────────────────────────────────────────────────────────
// PendulumScene – 3D inner component (suspense boundary inside Canvas)
// ─────────────────────────────────────────────────────────────────────────────
interface SceneProps {
  isMobile    : boolean;
  frontDataUrl: string;
  backDataUrl : string;
  lanyardWidth: number;
}

function PendulumScene({ isMobile, frontDataUrl, backDataUrl, lanyardWidth }: SceneProps) {
  /* ── Asset loading ─────────────────────────────────────────────── */
  const { nodes, materials } = useGLTF(cardGLB) as any;
  const bandTex  = useTexture(lanyardBand);
  const frontTex = useTexture(frontDataUrl);
  const backTex  = useTexture(backDataUrl);

  /* ── Composite front/back textures onto the GLB atlas ─────────── */
  const cardMap = useMemo(() => {
    const baseMap = materials.base.map;
    if (!frontTex.image && !backTex.image) return baseMap;

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
    tex.colorSpace   = THREE.SRGBColorSpace;
    tex.flipY        = baseMap.flipY;
    tex.anisotropy   = 16;
    tex.needsUpdate  = true;
    return tex;
  }, [frontTex, backTex, materials.base.map]);

  bandTex.wrapS = bandTex.wrapT = THREE.RepeatWrapping;

  /* ── Pendulum state (refs → no re-renders per frame) ───────────── */
  const theta       = useRef(INIT_THETA); // current angle  (rad)
  const omega       = useRef(0.0);        // angular velocity (rad/s)
  const dragging    = useRef(false);
  const prevDrag    = useRef({ theta: INIT_THETA, ms: 0 });

  /* ── Three.js refs ─────────────────────────────────────────────── */
  const cardRef = useRef<THREE.Group>(null);
  const ropeRef = useRef<THREE.Mesh>(null);

  const curve = useMemo(
    () => new THREE.CatmullRomCurve3([
      ANCHOR.clone(),
      new THREE.Vector3(),
      new THREE.Vector3(),
    ]),
    []
  );

  /* ── Per-frame physics + rendering ─────────────────────────────── */
  useFrame((_state, delta) => {
    if (!cardRef.current || !ropeRef.current) return;

    // Clamp delta to avoid huge steps after tab switches
    const dt = Math.min(delta, 1 / 30);

    if (!dragging.current) {
      // Damped spring-pendulum:  θ'' = -K·θ  -  C·θ'
      omega.current += (-SPRING_K * theta.current - DAMPING_C * omega.current) * dt;
      theta.current += omega.current * dt;

      // Snap to rest once negligible
      if (Math.abs(theta.current) < 0.0003 && Math.abs(omega.current) < 0.0003) {
        theta.current = 0;
        omega.current = 0;
      }
    }

    // Card world position (pendulum tip)
    const cx = ANCHOR.x + Math.sin(theta.current) * ROPE_LEN;
    const cy = ANCHOR.y - Math.cos(theta.current) * ROPE_LEN;

    cardRef.current.position.set(cx, cy, 0);
    // Card tilts naturally with swing direction
    cardRef.current.rotation.z = theta.current * 0.25;

    // ── Rope catenary curve ────────────────────────────────────────
    // Top attachment point is on the card's clip (slightly above card center)
    const cardTop = new THREE.Vector3(cx, cy + 1.25, 0);
    // Rope sag increases with swing amplitude (realistic physics look)
    const sag = Math.abs(theta.current) * 0.22 + 0.10;
    curve.points[0].copy(ANCHOR);
    curve.points[1].set(
      (ANCHOR.x + cardTop.x) * 0.5,
      (ANCHOR.y + cardTop.y) * 0.5 - sag,
      0
    );
    curve.points[2].copy(cardTop);
    (ropeRef.current as any).geometry.setPoints(
      curve.getPoints(isMobile ? 12 : 28)
    );
  });

  /* ── Drag interaction ──────────────────────────────────────────── */
  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragging.current = true;
    omega.current    = 0;
    const t = Math.atan2(e.point.x - ANCHOR.x, Math.max(ANCHOR.y - e.point.y, 0.1));
    prevDrag.current = { theta: t, ms: performance.now() };
  };

  const handlePointerMove = (e: any) => {
    if (!dragging.current) return;
    const dx = e.point.x - ANCHOR.x;
    const dy = Math.max(ANCHOR.y - e.point.y, 0.1);
    const newTheta = Math.max(-MAX_THETA, Math.min(MAX_THETA, Math.atan2(dx, dy)));
    const now = performance.now();
    const elapsed = (now - prevDrag.current.ms) / 1000;
    // Track angular velocity so release feels natural
    if (elapsed > 0) {
      omega.current = (newTheta - prevDrag.current.theta) / elapsed;
    }
    theta.current    = newTheta;
    prevDrag.current = { theta: newTheta, ms: now };
  };

  const handlePointerUp = (e: any) => {
    if (!dragging.current) return;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
    dragging.current = false;
    // Clamp release velocity to a safe range
    omega.current = Math.max(-7, Math.min(7, omega.current));
  };

  /* ── JSX ────────────────────────────────────────────────────────── */
  return (
    <>
      {/* Lanyard band / rope */}
      <mesh ref={ropeRef}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={isMobile ? [500, 1000] : [1000, 1000]}
          useMap
          map={bandTex}
          repeat={[-4, 1]}
          lineWidth={lanyardWidth}
        />
      </mesh>

      {/* ID Card */}
      <group
        ref={cardRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <group scale={2.25} position={[0, -1.2, -0.05]}>
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
      </group>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LanyardProps
// ─────────────────────────────────────────────────────────────────────────────
interface LanyardProps {
  /** Camera Z position – controls card apparent size */
  position?   : [number, number, number];
  fov?        : number;
  transparent?: boolean;
  lanyardWidth?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Lanyard – public component
// ─────────────────────────────────────────────────────────────────────────────
export default function Lanyard({
  position    = [0, 0, 20],
  fov         = 20,
  transparent = true,
  lanyardWidth = 1.2,
}: LanyardProps) {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 768
  );
  const [frontDataUrl, setFrontDataUrl] = useState<string | null>(null);
  const [backDataUrl,  setBackDataUrl]  = useState<string | null>(null);

  /* ── Canvas-based dynamic ID card texture generation ─────────── */
  useEffect(() => {
    const img = new Image();
    img.src = profilePhoto;
    img.onload = () => {
      // ── Front face ──────────────────────────────────────────────
      const canvasFront = document.createElement('canvas');
      canvasFront.width  = 512;
      canvasFront.height = 768;
      const ctxFront = canvasFront.getContext('2d');
      if (ctxFront) {
        // Futuristic Dark Background Gradient
        const grad = ctxFront.createLinearGradient(0, 0, 0, 768);
        grad.addColorStop(0,   '#0a101d');
        grad.addColorStop(0.5, '#050a12');
        grad.addColorStop(1,   '#02050a');
        ctxFront.fillStyle = grad;
        ctxFront.fillRect(0, 0, 512, 768);

        // Tech Circuit Aesthetics / Cyber Lines
        ctxFront.strokeStyle = 'rgba(0, 208, 255, 0.15)';
        ctxFront.lineWidth = 2;
        ctxFront.beginPath();
        ctxFront.moveTo(30, 30);  ctxFront.lineTo(120, 30);  ctxFront.lineTo(150, 60);
        ctxFront.moveTo(482, 30); ctxFront.lineTo(392, 30);  ctxFront.lineTo(362, 60);
        ctxFront.moveTo(30, 738); ctxFront.lineTo(120, 738); ctxFront.lineTo(150, 708);
        ctxFront.moveTo(482, 738);ctxFront.lineTo(392, 738); ctxFront.lineTo(362, 708);
        ctxFront.stroke();

        // Header Title
        ctxFront.fillStyle = '#00d0ff';
        ctxFront.font = 'bold 24px sans-serif';
        ctxFront.textAlign = 'center';
        ctxFront.fillText('WCE IT PORTAL', 256, 70);

        // Holographic Microchip Graphic
        ctxFront.strokeStyle = 'rgba(0, 208, 255, 0.4)';
        ctxFront.lineWidth = 1.5;
        ctxFront.strokeRect(236, 100, 40, 30);
        ctxFront.fillStyle = 'rgba(0, 208, 255, 0.1)';
        ctxFront.fillRect(236, 100, 40, 30);
        ctxFront.beginPath();
        ctxFront.moveTo(246, 100); ctxFront.lineTo(246, 130);
        ctxFront.moveTo(256, 100); ctxFront.lineTo(256, 130);
        ctxFront.moveTo(266, 100); ctxFront.lineTo(266, 130);
        ctxFront.moveTo(236, 110); ctxFront.lineTo(276, 110);
        ctxFront.moveTo(236, 120); ctxFront.lineTo(276, 120);
        ctxFront.stroke();

        // Profile Photo (Circular Crop)
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

        // Glowing ring
        ctxFront.strokeStyle  = '#00d0ff';
        ctxFront.lineWidth    = 4;
        ctxFront.shadowColor  = '#00d0ff';
        ctxFront.shadowBlur   = 12;
        ctxFront.beginPath();
        ctxFront.arc(pcx, pcy, radius, 0, Math.PI * 2);
        ctxFront.stroke();
        ctxFront.shadowBlur = 0;

        // Name & Role
        ctxFront.fillStyle = '#ffffff';
        ctxFront.font      = 'bold 30px sans-serif';
        ctxFront.fillText('VARADRAJ JAGTAP', 256, 450);
        ctxFront.fillStyle = '#00d0ff';
        ctxFront.font      = '600 18px sans-serif';
        ctxFront.fillText('FULL STACK DEVELOPER', 256, 485);

        // Details box
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
        ctxFront.fillText('VJ-17-WCE-IT',        210, 570);
        ctxFront.fillText('ENGINEERING STUDENT',  210, 605);
        ctxFront.fillText('WCE SANGLI',           210, 640);

        // Active badge
        ctxFront.fillStyle   = 'rgba(0,208,255,0.15)';
        ctxFront.fillRect(340, 555, 80, 22);
        ctxFront.strokeStyle = '#00d0ff';
        ctxFront.strokeRect(340, 555, 80, 22);
        ctxFront.fillStyle   = '#00d0ff';
        ctxFront.font        = 'bold 11px sans-serif';
        ctxFront.textAlign   = 'center';
        ctxFront.fillText('ACTIVE', 380, 571);

        // Bottom bar
        ctxFront.fillStyle = '#00d0ff';
        ctxFront.fillRect(0, 758, 512, 10);

        setFrontDataUrl(canvasFront.toDataURL());
      }

      // ── Back face ───────────────────────────────────────────────
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
        ctxBack.fillText('WCE SANGLI, MAHARASHTRA, INDIA',       256, 420);

        // Barcode
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
        <Suspense fallback={null}>
          <PendulumScene
            isMobile={isMobile}
            frontDataUrl={frontDataUrl}
            backDataUrl={backDataUrl}
            lanyardWidth={lanyardWidth}
          />
        </Suspense>
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
