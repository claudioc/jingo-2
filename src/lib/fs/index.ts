import * as fs_ from 'fs'

// About returning promises inside an async ts method
// https://github.com/Microsoft/TypeScript/issues/5254

const stat = async (useFs, filename: fs_.PathLike): Promise<fs_.Stats> => {
  const fs = useFs || fs_
  return new Promise<fs_.Stats>((resolve, reject) => {
    fs.stat(filename, (err, stats) => {
      if (err) {
        return reject(err)
      }
      resolve(stats)
    })
  })
}

const writeFile = async (useFs, filename: fs_.PathLike, content: string): Promise<void> => {
  const fs = useFs || fs_
  return new Promise<void>((resolve, reject) => {
    fs.writeFile(filename, content, 'utf8', (err) => {
      if (err) {
        return reject(err)
      }
      resolve()
    })
  })
}

const readFile = async (useFs, filename: fs_.PathLike): Promise<string> => {
  const fs = useFs || fs_
  return new Promise<string>((resolve, reject) => {
    fs.readFile(filename, 'utf8', (err, data) => {
      if (err) {
        return reject(err)
      }
      resolve(data.toString())
    })
  })
}

const access = async (useFs, filename: fs_.PathLike, mode: number): Promise<boolean> => {
  const fs = useFs || fs_
  return new Promise<boolean>((resolve, reject) => {
    fs.access(filename, mode, err => {
      resolve(err === null)
    })
  })
}

export default {
  access,
  constants: fs_.constants,
  readFile,
  stat,
  writeFile
}
