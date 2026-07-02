/**
 * Build an SVG path string for a sparkline.
 * @param values - numeric series
 * @param w - width in viewBox units
 * @param h - height in viewBox units
 */
export function sparkline(values: number[], w: number, h: number): string {
  if (values.length === 0) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = w / (values.length - 1 || 1);
  const padY = 2;
  const innerH = h - padY * 2;
  return values
    .map((v, i) => {
      const x = i * stepX;
      const y = padY + (1 - (v - min) / range) * innerH;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}
