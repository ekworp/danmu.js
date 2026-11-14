declare const __VERSION__: string

declare module '*.scss' {
  const styles: Record<string, string>
  export default styles
}
