// src/utils/number.ts
export const format = (n: number | string) => {
  const x = typeof n === 'number' ? n : Number(n || 0)
  return x.toLocaleString('zh-CN')
}
