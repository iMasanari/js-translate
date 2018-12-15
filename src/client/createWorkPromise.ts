let keyIndex = 0

export const createWorkPromise = <Result>(worker: Worker) =>
  (type: string, payload: any) => {
    const key = keyIndex++
    worker.postMessage({ key, type, payload })

    return new Promise<Result>((resolve) => {
      const listener = ({ data }: MessageEvent) => {
        if (data.key !== key) return

        resolve(data.payload)
        worker.removeEventListener('message', listener)
      }

      worker.addEventListener('message', listener)
    })
  }
