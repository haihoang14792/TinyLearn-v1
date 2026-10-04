import confetti from 'canvas-confetti';

export function fireToddlerCelebration() {
  // Center joyful burst
  confetti({
    particleCount: 60,
    spread: 80,
    origin: { y: 0.6 },
    colors: ['#FFD166', '#EF476F', '#06D6A0', '#118AB2', '#9B5DE5', '#F15BB5'],
    ticks: 200,
    gravity: 0.8,
    scalar: 1.3
  });

  // Left & right star bursts
  setTimeout(() => {
    confetti({
      particleCount: 30,
      angle: 60,
      spread: 55,
      origin: { x: 0.1, y: 0.65 },
      colors: ['#FFD700', '#FF6B6B', '#4ECDC4'],
      shapes: ['star', 'circle'],
      scalar: 1.2
    });
    confetti({
      particleCount: 30,
      angle: 120,
      spread: 55,
      origin: { x: 0.9, y: 0.65 },
      colors: ['#FFD700', '#FF6B6B', '#4ECDC4'],
      shapes: ['star', 'circle'],
      scalar: 1.2
    });
  }, 150);
}

export function fireBigVictoryCelebration() {
  const duration = 2500;
  const animationEnd = Date.now() + duration;

  const interval: ReturnType<typeof setInterval> = setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) {
      return clearInterval(interval);
    }
    const particleCount = 40 * (timeLeft / duration);
    confetti({
      particleCount,
      origin: { x: Math.random() * 0.6 + 0.2, y: Math.random() - 0.2 },
      spread: 360,
      startVelocity: 30,
      colors: ['#FFE600', '#FF5E7E', '#00F0FF', '#7000FF', '#00FF66'],
      shapes: ['circle', 'star'],
      scalar: 1.4
    });
  }, 250);
}
