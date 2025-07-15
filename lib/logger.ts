export const logger = {
  debug: (...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(...args)
    }
  },
  error: (...args: any[]) => console.error(...args),
  info: (...args: any[]) => console.info(...args),
}
