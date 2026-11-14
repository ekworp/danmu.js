const DEBUG =
  typeof window !== 'undefined' &&
  window.location.href.indexOf('danmu-debug') > -1

class Logger {
  [key: string]: any

  constructor(constructorName = '') {
    this.constructorName = constructorName || ''
  }
  info(message: unknown, ...optionalParams: unknown[]): void {
    DEBUG &&
      console.log(
        `[Danmu Log][${this.constructorName}]`,
        message,
        ...optionalParams
      )
  }
}

export default Logger
