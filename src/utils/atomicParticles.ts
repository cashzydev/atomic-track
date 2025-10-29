import confetti from 'canvas-confetti';

/**
 * Animação de partículas atômicas (elétrons orbitando)
 * Inspirada na estrutura do átomo - marca atomicTrack
 */
export const triggerAtomicAnimation = (x = 0.5, y = 0.6) => {
  const colors = ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE', '#F3E8FF'];
  
  // Núcleo central (burst)
  confetti({
    particleCount: 15,
    spread: 360,
    startVelocity: 10,
    decay: 0.9,
    origin: { x, y },
    colors: ['#8B5CF6', '#7C3AED'],
    shapes: ['circle'],
    scalar: 0.6,
    ticks: 100,
  });
  
  // Elétrons orbitando (3 camadas)
  [60, 120, 180].forEach((angle, index) => {
    setTimeout(() => {
      confetti({
        particleCount: 5,
        angle,
        spread: 30,
        startVelocity: 25 + (index * 5),
        decay: 0.92,
        origin: { x, y },
        colors: [colors[index % colors.length]],
        shapes: ['circle'],
        scalar: 0.5,
        ticks: 120,
        gravity: 0.8,
      });
    }, index * 50);
  });
};

/**
 * Mini animação atômica (para Kanban)
 */
export const triggerMiniAtomicAnimation = () => {
  confetti({
    particleCount: 8,
    angle: 90,
    spread: 45,
    startVelocity: 15,
    origin: { x: 0.5, y: 0.5 },
    colors: ['#8B5CF6', '#A78BFA'],
    shapes: ['circle'],
    scalar: 0.4,
    ticks: 80,
  });
};
