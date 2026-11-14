declare const __VERSION__: string

declare module '*.scss' {
  const styles: Record<string, string>
  export default styles
}

declare module 'event-emitter' {
  type EventHandler = (...args: any[]) => void

  interface EventEmitterInstance {
    on(event: string, handler: EventHandler): this
    once(event: string, handler: EventHandler): this
    off(event: string, handler: EventHandler): this
    emit(event: string, ...args: any[]): boolean
  }

  function EventEmitter<T extends object>(target: T): T & EventEmitterInstance
  export default EventEmitter
}
