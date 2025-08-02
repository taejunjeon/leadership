/**
 * AI Leadership 4Dx - 3D 리더십 시각화 컴포넌트
 */

'use client';

import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  Grid, 
  Text, 
  Box, 
  Sphere,
  Line,
  Html,
  PerspectiveCamera
} from '@react-three/drei';
import * as THREE from 'three';

interface LeadershipData {
  id: string;
  name: string;
  people: number;      // X축 (1-7)
  production: number;  // Y축 (1-7)
  candor: number;      // Z축 (1-7)
  lmx: number;         // 색상 (1-7)
  influence: number;   // 크기 (1-5)
  riskLevel?: 'low' | 'medium' | 'high';
}

interface Leadership3DVisualizationProps {
  data: LeadershipData[];
  selectedId?: string;
  onSelect?: (id: string) => void;
}

// 축 레이블 컴포넌트
const AxisLabel: React.FC<{
  text: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
}> = ({ text, position, rotation = [0, 0, 0], color = '#000000' }) => {
  return (
    <Text
      position={position}
      rotation={rotation}
      fontSize={0.3}
      color={color}
      anchorX="center"
      anchorY="middle"
    >
      {text}
    </Text>
  );
};

// 리더십 포인트 컴포넌트
const LeadershipPoint: React.FC<{
  data: LeadershipData;
  isSelected: boolean;
  onClick: () => void;
}> = ({ data, isSelected, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // 애니메이션
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      if (isSelected || hovered) {
        const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
        meshRef.current.scale.setScalar(scale);
      }
    }
  });

  // 위치 계산 (1-7 범위를 -3~3으로 매핑)
  const position: [number, number, number] = [
    (data.people - 4) * 0.8,      // X: People
    (data.production - 4) * 0.8,   // Y: Production
    (data.candor - 4) * 0.8        // Z: Candor
  ];

  // LMX 점수에 따른 색상 (1-7)
  const color = useMemo(() => {
    const hue = (data.lmx - 1) / 6 * 120; // 0(빨강) ~ 120(초록)
    return new THREE.Color().setHSL(hue / 360, 0.8, 0.5);
  }, [data.lmx]);

  // Influence에 따른 크기 (1-5)
  const size = 0.1 + (data.influence - 1) / 4 * 0.3;

  // 위험도에 따른 발광
  const emissiveIntensity = data.riskLevel === 'high' ? 0.5 : 
                           data.riskLevel === 'medium' ? 0.3 : 0.1;

  return (
    <group position={position}>
      <Sphere
        ref={meshRef}
        args={[size, 32, 32]}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={color}
          emissive={data.riskLevel === 'high' ? '#ff0000' : color}
          emissiveIntensity={emissiveIntensity}
          metalness={0.5}
          roughness={0.3}
          transparent
          opacity={isSelected ? 1 : 0.8}
        />
      </Sphere>

      {/* 호버/선택 시 정보 표시 */}
      {(hovered || isSelected) && (
        <Html distanceFactor={10}>
          <div className="bg-white rounded-lg shadow-lg p-3 pointer-events-none">
            <h4 className="font-semibold text-sm">{data.name}</h4>
            <div className="text-xs space-y-1 mt-2">
              <div>People: {data.people.toFixed(1)}</div>
              <div>Production: {data.production.toFixed(1)}</div>
              <div>Candor: {data.candor.toFixed(1)}</div>
              <div>LMX: {data.lmx.toFixed(1)}</div>
              <div>Influence: {data.influence.toFixed(1)}</div>
              {data.riskLevel && (
                <div className={`font-semibold ${
                  data.riskLevel === 'high' ? 'text-red-600' :
                  data.riskLevel === 'medium' ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  Risk: {data.riskLevel}
                </div>
              )}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

// 3D 씬 컴포넌트
const Scene: React.FC<Leadership3DVisualizationProps> = ({ 
  data, 
  selectedId, 
  onSelect 
}) => {
  const { camera } = useThree();

  // 그리드 헬퍼
  const gridConfig = {
    cellSize: 0.8,
    cellThickness: 0.5,
    cellColor: '#6b7280',
    sectionSize: 4,
    sectionThickness: 1,
    sectionColor: '#374151',
    fadeDistance: 25,
    fadeStrength: 1,
    followCamera: false,
    infiniteGrid: true
  };

  return (
    <>
      {/* 조명 설정 */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />

      {/* 카메라 컨트롤 */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={20}
      />

      {/* 좌표 축 */}
      {/* X축 (People) - 빨강 */}
      <Line
        points={[[-3, 0, 0], [3, 0, 0]]}
        color="red"
        lineWidth={2}
      />
      <AxisLabel text="People →" position={[3.5, 0, 0]} color="red" />

      {/* Y축 (Production) - 초록 */}
      <Line
        points={[[0, -3, 0], [0, 3, 0]]}
        color="green"
        lineWidth={2}
      />
      <AxisLabel text="Production ↑" position={[0, 3.5, 0]} color="green" />

      {/* Z축 (Candor) - 파랑 */}
      <Line
        points={[[0, 0, -3], [0, 0, 3]]}
        color="blue"
        lineWidth={2}
      />
      <AxisLabel text="Candor" position={[0, 0, 3.5]} color="blue" />

      {/* 그리드 (XZ 평면) */}
      <Grid args={[10, 10]} {...gridConfig} position={[0, -3, 0]} />

      {/* 원점 표시 */}
      <Sphere args={[0.05, 16, 16]} position={[0, 0, 0]}>
        <meshBasicMaterial color="black" />
      </Sphere>

      {/* 리더십 데이터 포인트 */}
      {data.map((item) => (
        <LeadershipPoint
          key={item.id}
          data={item}
          isSelected={selectedId === item.id}
          onClick={() => onSelect?.(item.id)}
        />
      ))}

      {/* 참조 큐브 (각 모서리) */}
      {/* 9,9,9 스타일 (Team Leader) */}
      <Box args={[0.1, 0.1, 0.1]} position={[2.4, 2.4, 2.4]}>
        <meshBasicMaterial color="#10b981" opacity={0.3} transparent />
      </Box>
      <AxisLabel 
        text="Team Leader" 
        position={[2.4, 2.8, 2.4]} 
        color="#10b981" 
      />

      {/* 1,1,1 스타일 (Impoverished) */}
      <Box args={[0.1, 0.1, 0.1]} position={[-2.4, -2.4, -2.4]}>
        <meshBasicMaterial color="#ef4444" opacity={0.3} transparent />
      </Box>
      <AxisLabel 
        text="Impoverished" 
        position={[-2.4, -2.8, -2.4]} 
        color="#ef4444" 
      />
    </>
  );
};

// 메인 시각화 컴포넌트
export const Leadership3DVisualization: React.FC<Leadership3DVisualizationProps> = ({
  data,
  selectedId,
  onSelect
}) => {
  return (
    <div className="w-full h-full bg-gray-100 rounded-lg">
      <Canvas
        camera={{ position: [8, 6, 8], fov: 45 }}
        gl={{ antialias: true }}
      >
        <Scene data={data} selectedId={selectedId} onSelect={onSelect} />
      </Canvas>

      {/* 범례 */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4">
        <h4 className="font-semibold text-sm mb-2">차원 설명</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500"></div>
            <span>X축: People (사람 관심도)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500"></div>
            <span>Y축: Production (성과 관심도)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500"></div>
            <span>Z축: Candor (피드백 강도)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-green-500"></div>
            <span>색상: LMX (관계 품질)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
            </div>
            <span>크기: Influence (영향력)</span>
          </div>
        </div>
      </div>
    </div>
  );
};