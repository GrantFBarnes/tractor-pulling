function getRandomNumber(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function determineColor(subject: string, transparency: boolean): string {
  const ta = transparency ? getRandomNumber(0.5, 1) : 1;
  if (subject.includes('Allis')) return `rgba(255, 115, 0, ${ta})`;
  if (subject.includes('Case')) return `rgba(255, 70, 0, ${ta})`;
  if (subject.includes('Farmall')) return `rgba(255, 0, 0, ${ta})`;
  if (subject.includes('Ford')) return `rgba(200, 200, 200, ${ta})`;
  if (subject.includes('Deere')) return `rgba(54, 124, 43, ${ta})`;
  if (subject.includes('Massey')) return `rgba(220, 0, 0, ${ta})`;
  if (subject.includes('Moline')) return `rgba(255, 191, 0, ${ta})`;
  if (subject.includes('Oliver')) return `rgba(0, 151, 6, ${ta})`;

  const r = getRandomNumber(0, 255);
  const g = getRandomNumber(0, 255);
  const b = getRandomNumber(0, 255);
  const a = getRandomNumber(0.3, 1);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
