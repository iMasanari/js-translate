// @ts-ignore
import Babel from '@babel/standalone'

export const transform = (code: string, option: {}) => {
  try {
    return Babel.transform(code, option)
  }
  catch (e) {
    return { error: e.toString() }
  }
}
