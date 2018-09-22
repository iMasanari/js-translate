let keyIndex = 0

export const createWorkPromise = <Result>(worker: Worker) => {
  const keys = {} as Record<number, ((value: Result) => void) | undefined>
  const listener = ({ data }: MessageEvent) => {
    const resolve = keys[data.key]

    if (resolve) {
      resolve(data.payload)
      keys[data.key] = undefined
      delete keys[data.key]
    }
  }

  worker.addEventListener('message', listener, false)

  return (type: string, payload: any) => {
    const key = keyIndex++
    worker.postMessage({ key, type, payload })

    return new Promise<Result>((resolve) => {
      keys[key] = resolve
    })
  }
}
