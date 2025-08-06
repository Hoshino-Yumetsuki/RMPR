import fs from 'node:fs'
import path from 'node:path'
import gotx from 'got'
import crypto from 'node:crypto'
import archiver from 'archiver'
const got = gotx.extend({
  headers: {
    'user-agent':
      'RMPR/1.0.0 Mozilla/5.0 AppleWebKit/537.36 Chrome/63.0.3239.132 Safari/537.36'
  }
})

//console.log((await got.get('https://api.modrinth.com/v2/version_file/80520a596f3d2e7dc744591dae257dc87aaa204e')).body)

export async function modrinth(
  mcv: string,
  modloader: string,
  mlver: string,
  mpver: string,
  sf: string | any[],
  pathx: string,
  mpname: string,
  mpdes: string
) {
  const zipfile = fs.createWriteStream(
    `${mpname}-${mlver}[${mcv}-${modloader}].mrpack`
  )
  const archive = archiver('zip', {
    zlib: { level: 0 }
  })
  const mload = (() => {
    switch (modloader) {
      case 'Forge':
        return 'forge'
      case 'Fabric':
        return 'fabric-loader'
      case 'Neoforge':
        return 'neoforge'
      default:
        return 'forge'
    }
  })()
  const tmp: Array<{
    path: string
    hashes: { sha512: string; sha1: string }
    env: { client: string; server: string }
    downloads: string[]
    fileSize: number
  }> = []
  for (let a = 0; a < fs.readdirSync(`${pathx}\\mods`).length; a++) {
    if (
      fs
        .statSync(`${`${pathx}\\mods`}\\${fs.readdirSync(`${pathx}\\mods`)[a]}`)
        .isFile()
    ) {
      const fvv = fs.readdirSync(`${pathx}\\mods`)[a]
      const hash = crypto
        .createHash('sha1')
        .update(fs.readFileSync(`${pathx}\\mods\\${fvv}`))
        .digest('hex')
      try {
        const res = await got.get(
          `https://api.modrinth.com/v2/version_file/${hash}`
        )
        const jtmp = JSON.parse(res.body)
        for (let b = 0; b < jtmp.files.length; b++) {
          const e = jtmp.files[b]
          const sha512 = e.hashes.sha512
          const sha1 = e.hashes.sha1
          const downloadurl = e.url
          const size = e.size
          const json = {
            path: `mods/${fvv}`,
            hashes: { sha512: sha512, sha1: sha1 },
            env: { client: 'required', server: 'required' },
            downloads: [downloadurl],
            fileSize: size
          }
          tmp.push(json)
        }
      } catch (_e) {
        try {
          console.log(`${pathx}\\mods\\${fvv}`)
          archive.append(fs.createReadStream(`${pathx}\\mods\\${fvv}`), {
            name: `overrides/mods/${fvv}`
          })
        } catch (_e) {}
      }
    }
  }
  const lastjson = JSON.stringify({
    game: 'minecraft',
    formatVersion: 1,
    versionId: `${mpver}`,
    name: mpname,
    summary: `${mpdes}`,
    files: tmp,
    dependencies: { [mload]: mlver, minecraft: mcv }
  })

  zipfile.on('close', () => {
    console.log(`${archive.pointer()} total bytes`)
  })
  archive.pipe(zipfile)
  for (let i = 0; i < sf.length; i++) {
    if (fs.statSync(sf[i]).isFile()) {
      archive.append(fs.createReadStream(sf[i]), {
        name: `overrides/${path.basename(sf[i])}`
      })
    } else if (fs.statSync(sf[i]).isDirectory()) {
      archive.directory(sf[i], `overrides/${path.basename(sf[i])}`)
    }
  }
  archive.append(lastjson, {
    name: `modrinth.index.json`
  })
  await archive.finalize()
}
//modrinth(['C:\\PCL2\\mymodpack\\versions\\hsys2.0\\config','C:\\PCL2\\mymodpack\\versions\\hsys2.0\\kubejs'],"C:\PCL2\mymodpack\versions\hsys2.0\kubejs")
