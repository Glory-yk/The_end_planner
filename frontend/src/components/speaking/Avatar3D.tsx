'use client';

import { Suspense, useEffect, useMemo, useRef, useState, Component, ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Volume2 } from 'lucide-react';

const DEFAULT_AVATAR_URL =
  'https://models.readyplayer.me/64bfa15f0e72c63d7c3934a6.glb?morphTargets=ARKit,Oculus+Visemes&textureAtlas=1024';

function detectWebGL(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

class AvatarErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error) {
    console.warn('Avatar3D failed to render:', error.message);
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

function AvatarFallback({ isSpeaking, isListening }: { isSpeaking: boolean; isListening: boolean }) {
  return (
    <div className="w-full h-full bg-gradient-to-b from-blue-100 to-purple-100 dark:from-slate-700 dark:to-slate-800 rounded-2xl flex flex-col items-center justify-center gap-3">
      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-xl">
        <Volume2 className={`w-16 h-16 text-white ${isSpeaking ? 'animate-pulse' : ''}`} />
      </div>
      <p className="text-sm font-semibold text-gray-700 dark:text-slate-300">Aria</p>
      <p className="text-xs text-gray-500 dark:text-slate-400">
        {isSpeaking ? 'Speaking...' : isListening ? 'Listening...' : 'Your AI tutor'}
      </p>
    </div>
  );
}

interface AvatarModelProps {
  url: string;
  isSpeaking: boolean;
  isListening: boolean;
}

function AvatarModel({ url, isSpeaking, isListening }: AvatarModelProps) {
  const { scene } = useGLTF(url);
  const groupRef = useRef<THREE.Group>(null);
  const blinkTimerRef = useRef(0);
  const blinkValueRef = useRef(0);

  const morphTargets = useMemo(() => {
    const targets: {
      mesh: THREE.Mesh;
      mouthOpen?: number;
      mouthSmile?: number;
      eyeBlinkLeft?: number;
      eyeBlinkRight?: number;
      jawOpen?: number;
      visemeAA?: number;
    }[] = [];

    scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        const dict = mesh.morphTargetDictionary;
        if (dict) {
          targets.push({
            mesh,
            mouthOpen: dict.mouthOpen,
            mouthSmile: dict.mouthSmile,
            eyeBlinkLeft: dict.eyeBlinkLeft,
            eyeBlinkRight: dict.eyeBlinkRight,
            jawOpen: dict.jawOpen,
            visemeAA: dict.viseme_aa,
          });
        }
      }
    });

    return targets;
  }, [scene]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    blinkTimerRef.current -= delta;
    if (blinkTimerRef.current <= 0) {
      blinkValueRef.current = 1;
      blinkTimerRef.current = 3 + Math.random() * 3;
    }
    blinkValueRef.current = Math.max(0, blinkValueRef.current - delta * 8);

    let mouthAmount = 0;
    if (isSpeaking) {
      const fast = Math.sin(t * 18) * 0.5 + 0.5;
      const slow = Math.sin(t * 5.3) * 0.5 + 0.5;
      mouthAmount = (fast * 0.6 + slow * 0.4) * 0.45;
    }

    const smileAmount = isListening ? 0.25 : 0.1;

    morphTargets.forEach((target) => {
      const influences = target.mesh.morphTargetInfluences;
      if (!influences) return;

      if (target.mouthOpen !== undefined) {
        influences[target.mouthOpen] = mouthAmount;
      }
      if (target.jawOpen !== undefined) {
        influences[target.jawOpen] = mouthAmount * 0.6;
      }
      if (target.visemeAA !== undefined) {
        influences[target.visemeAA] = mouthAmount * 0.7;
      }
      if (target.mouthSmile !== undefined) {
        influences[target.mouthSmile] = smileAmount;
      }
      if (target.eyeBlinkLeft !== undefined) {
        influences[target.eyeBlinkLeft] = blinkValueRef.current;
      }
      if (target.eyeBlinkRight !== undefined) {
        influences[target.eyeBlinkRight] = blinkValueRef.current;
      }
    });

    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.6) * 0.05;
      groupRef.current.position.y = Math.sin(t * 1.2) * 0.01 - 1.5;
    }
  });

  useEffect(() => {
    scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        (obj as THREE.Mesh).frustumCulled = false;
      }
    });
  }, [scene]);

  return (
    <group ref={groupRef} position={[0, -1.5, 0]}>
      <primitive object={scene} />
    </group>
  );
}

interface Avatar3DProps {
  isSpeaking: boolean;
  isListening: boolean;
  avatarUrl?: string;
}

export function Avatar3D({
  isSpeaking,
  isListening,
  avatarUrl = DEFAULT_AVATAR_URL,
}: Avatar3DProps) {
  const [webglOk, setWebglOk] = useState<boolean | null>(null);

  useEffect(() => {
    setWebglOk(detectWebGL());
  }, []);

  if (webglOk === null) {
    return <AvatarFallback isSpeaking={isSpeaking} isListening={isListening} />;
  }

  if (!webglOk) {
    return <AvatarFallback isSpeaking={isSpeaking} isListening={isListening} />;
  }

  return (
    <AvatarErrorBoundary fallback={<AvatarFallback isSpeaking={isSpeaking} isListening={isListening} />}>
      <div className="w-full h-full bg-gradient-to-b from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl overflow-hidden">
        <Canvas
          camera={{ position: [0, 0.05, 0.7], fov: 35 }}
          gl={{ antialias: true, preserveDrawingBuffer: false, failIfMajorPerformanceCaveat: false }}
          onCreated={({ gl }) => {
            gl.domElement.addEventListener('webglcontextlost', (e) => {
              e.preventDefault();
              console.warn('WebGL context lost on avatar canvas');
            });
          }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[2, 2, 2]} intensity={1.2} />
          <directionalLight position={[-2, 1, 1]} intensity={0.4} />

          <Suspense fallback={null}>
            <AvatarModel
              url={avatarUrl}
              isSpeaking={isSpeaking}
              isListening={isListening}
            />
            <Environment preset="studio" />
          </Suspense>

          <OrbitControls
            enablePan={false}
            enableZoom={false}
            minPolarAngle={Math.PI / 2.4}
            maxPolarAngle={Math.PI / 2}
            minAzimuthAngle={-Math.PI / 6}
            maxAzimuthAngle={Math.PI / 6}
            target={[0, 0, 0]}
          />
        </Canvas>
      </div>
    </AvatarErrorBoundary>
  );
}

if (typeof window !== 'undefined' && detectWebGL()) {
  useGLTF.preload(DEFAULT_AVATAR_URL);
}
