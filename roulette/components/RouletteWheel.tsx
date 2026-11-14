import { useState, useRef, useEffect, useCallback } from 'react';

interface RouletteItem {
  id: string;
  text: string;
  color: string;
}

interface RouletteWheelProps {
  items: RouletteItem[];
  isSpinning: boolean;
  onSpinComplete: (winner: RouletteItem) => void;
}

export function RouletteWheel({ items, isSpinning, onSpinComplete }: RouletteWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState(0);
  const [canvasSize, setCanvasSize] = useState(301);
  const animationRef = useRef<number>();
  const spinStartTimeRef = useRef<number>();
  const initialRotationRef = useRef<number>();

  // 캔버스 크기 조정
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight;
        const size = Math.min(containerWidth, containerHeight, 320); // 최대 320px
        setCanvasSize(size);
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    window.addEventListener('orientationchange', updateCanvasSize);
    
    // Intersection Observer로 컨테이너 크기 변화 감지
    const resizeObserver = new ResizeObserver(updateCanvasSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      window.removeEventListener('orientationchange', updateCanvasSize);
      resizeObserver.disconnect();
    };
  }, []);

  // 스핀 애니메이션 로직
  useEffect(() => {
    // 애니메이션이 이미 실행 중이면 중복 실행 방지
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = undefined;
    }

    if (isSpinning && items.length > 0) {
      spinStartTimeRef.current = Date.now();
      initialRotationRef.current = rotation;
      
      const spinDuration = 3000; // 3초
      const extraSpins = 5; // 5바퀴 더 돌기
      const randomAngle = Math.random() * 360;
      const totalRotation = extraSpins * 360 + randomAngle;
      
      const animate = () => {
        if (!spinStartTimeRef.current) return; // 안전 체크
        
        const elapsed = Date.now() - spinStartTimeRef.current;
        const progress = Math.min(elapsed / spinDuration, 1);
        
        // easeOut 효과
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentRotation = initialRotationRef.current! + totalRotation * easeOut;
        
        setRotation(currentRotation);
        
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          // 애니메이션 완료 - 정리
          animationRef.current = undefined;
          
          // 스핀 완료 - 결과 계산
          // 포인터는 12시 방향(0도)에 고정
          // 룰렛이 시계방향으로 회전하므로, 실제로는 세그먼트가 반시계방향으로 지나감
          
          // 현재 회전 각도를 0-360도 범위로 정규화
          const normalizedRotation = ((currentRotation % 360) + 360) % 360;
          
          // 각 세그먼트의 각도 크기
          const segmentAngleDegrees = 360 / items.length;
          
          // 포인터가 가리키는 세그먼트 계산
          // 12시 방향(0도)에서 시작하여 시계방향으로 세그먼트가 배치됨
          // 회전으로 인해 세그먼트들이 반시계방향으로 이동하므로 음수 방향으로 계산
          const adjustedAngle = (360 - normalizedRotation) % 360;
          
          // 세그먼트 인덱스 계산 (0번 세그먼트가 12시 방향에서 시작)
          let winnerIndex = Math.floor(adjustedAngle / segmentAngleDegrees);
          
          // 인덱스 범위 보정
          if (winnerIndex >= items.length) {
            winnerIndex = 0;
          }
          if (winnerIndex < 0) {
            winnerIndex = items.length - 1;
          }
          
          // 디버깅용 로그 (배포 시 제거 가능)
          console.log({
            currentRotation,
            normalizedRotation,
            adjustedAngle,
            segmentAngleDegrees,
            winnerIndex,
            winnerText: items[winnerIndex]?.text
          });
          
          onSpinComplete(items[winnerIndex] || items[0]);
        }
      };
      
      animationRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
    };
  }, [isSpinning, items.length]); // rotation과 onSpinComplete 의존성 제거

  // 캔버스 렌더링 로직
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 고해상도 디스플레이 지원
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = canvasSize * dpr;
    canvas.height = canvasSize * dpr;
    canvas.style.width = canvasSize + 'px';
    canvas.style.height = canvasSize + 'px';
    
    ctx.scale(dpr, dpr);
    
    const centerX = canvasSize / 2;
    const centerY = canvasSize / 2;
    
    // 포인터 크기를 미리 계산 (적절한 크기로 조정)
    const pointerSize = Math.max(18, canvasSize * 0.08);
    const pointerOffset = -8; // 8px 겹치도록 음수 값 설정
    const pointerSpace = pointerSize + 8; // 여백 8px (offset 제외)
    
    // 포인터 공간을 확보한 radius 계산
    const radius = Math.min(centerX, centerY) - pointerSpace;
    
    // 캔버스 클리어
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    
    if (items.length === 0) {
      // 항목이 없을 때 기본 원
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = '#E5E5E5';
      ctx.fill();
      ctx.strokeStyle = '#CCCCCC';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // 안내 텍스트
      ctx.fillStyle = '#666666';
      ctx.font = `${Math.max(10, canvasSize * 0.035)}px Pretendard, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('항목을 추가해주세요', centerX, centerY);
    } else {
      // 룰렛 세그먼트 그리기
      const segmentAngleDegrees = 360 / items.length;
      const segmentAngleRadians = (2 * Math.PI) / items.length;
      
      ctx.save();
      ctx.translate(centerX, centerY);
      // 회전 적용 (도를 라디안으로 변환)
      ctx.rotate((rotation * Math.PI) / 180);
      
      items.forEach((item, index) => {
        // 12시 방향(270도 또는 -90도)에서 시작하여 시계방향으로 배치
        const startAngleDegrees = (index * segmentAngleDegrees) - 90;
        const endAngleDegrees = ((index + 1) * segmentAngleDegrees) - 90;
        
        // 도를 라디안으로 변환
        const startAngle = (startAngleDegrees * Math.PI) / 180;
        const endAngle = (endAngleDegrees * Math.PI) / 180;
        
        // 세그먼트 그리기
        ctx.beginPath();
        ctx.arc(0, 0, radius, startAngle, endAngle);
        ctx.lineTo(0, 0);
        ctx.fillStyle = item.color;
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 텍스트 그리기
        ctx.save();
        const textAngle = startAngle + segmentAngleRadians / 2;
        ctx.rotate(textAngle);
        ctx.fillStyle = '#FFFFFF';
        
        // 화면 크기에 따른 폰트 사이즈 조정 (12px 정도로 증가)
        const fontSize = Math.max(12, canvasSize * 0.042);
        ctx.font = `bold ${fontSize}px Pretendard, sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        
        // 텍스트 위치 조정 (외곽으로 이동)
        const textRadius = radius * 0.75;
        const textX = textRadius * 0.5;
        
        // 긴 텍스트 처리 - 화면 크기에 따라 조정 (더 넓은 영역 사용)
        const maxWidth = radius * 0.45;
        const maxLength = canvasSize < 200 ? 7 : canvasSize < 260 ? 9 : 10;
        const text = item.text.length > maxLength ? item.text.substring(0, maxLength - 1) + '...' : item.text;
        
        ctx.fillText(text, textX, 0, maxWidth);
        ctx.restore();
      });
      
      ctx.restore();
    }
    
    // 포인터 그리기 (중요: 항목이 있든 없든 항상 그림)
    const pointerWidth = Math.max(15, canvasSize * 0.07);
    
    // 포인터 위치 계산 (12시 방향에 고정)
    const pointerTipY = centerY - radius - pointerOffset;
    const pointerBaseY = pointerTipY - pointerSize;
    
    ctx.beginPath();
    ctx.moveTo(centerX, pointerTipY);
    ctx.lineTo(centerX - pointerWidth / 2, pointerBaseY);
    ctx.lineTo(centerX + pointerWidth / 2, pointerBaseY);
    ctx.closePath();
    ctx.fillStyle = '#FF6B6B';
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = Math.max(2, canvasSize * 0.008);
    ctx.stroke();
    
  }, [items, rotation, canvasSize]);

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="max-w-full h-auto"
      />
    </div>
  );
}