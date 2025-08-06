import inquirer from 'inquirer'
import fs from 'node:fs'
import path from 'node:path'
import { modrinth } from './platforms/modrinth'
import { i18ns } from './i18n/i18n'

interface Answers {
  type: string
  version: string
  mpname: string
  mpdes: string
  mpversion: string
  modloader: string
  modloaderver: string
  filepath: string
  selectedFile: string[]
}

interface FileNode {
  name: string
  path: fs.PathLike
  isDirectory: boolean
}

interface DirNode {
  name: string
  path: fs.PathLike
  children: FileNode[]
}

interface ListItem {
  name: string
  value: fs.PathLike
  short: string
}

const i18n = i18ns()

const questions: any = [
  {
    type: 'list',
    name: 'type',
    message: i18n.qs_type,
    choices: ['Curseforge', 'Modrinth', 'MCBBS'],
    pageSize: 4,
    loop: false
  },
  {
    type: 'input',
    name: 'version',
    message: i18n.qs_version,
    loop: false
  },
  {
    type: 'input',
    name: 'mpname',
    message: i18n.qs_mpname,
    loop: false
  },
  {
    type: 'input',
    name: 'mpdes',
    message: i18n.qs_mpdes,
    loop: false
  },
  {
    type: 'input',
    name: 'mpversion',
    message: i18n.qs_mpversion,
    pageSize: 4,
    loop: false
  },
  {
    type: 'list',
    name: 'modloader',
    message: i18n.qs_modloader,
    choices: ['Forge', 'Neoforge', 'Fabric'],
    pageSize: 4,
    loop: false
  },
  {
    type: 'input',
    name: 'modloaderver',
    message: i18n.qs_modloaderver,
    loop: false
  },
  {
    type: 'input',
    name: 'filepath',
    message: i18n.qs_filepath,
    pageSize: 4,
    loop: false
  },
  {
    type: 'checkbox',
    name: 'selectedFile',
    message: i18n.qs_selectedFile,
    pageSize: 20,
    loop: false,
    choices: (answers: Answers) =>
      generateMultiSelectList(readRootDirSync(answers.filepath))
  }
]

await inquirer.prompt(questions).then(async (answers) => {
  //console.log(`你选择了: ${answers.selectedFile}`);
  await makemodpack(
    answers.type,
    answers.version,
    answers.modloader,
    answers.modloaderver,
    answers.mpversion,
    answers.selectedFile,
    answers.filepath,
    answers.mpname,
    answers.mpdes
  )
})

async function makemodpack(
  type: string,
  version: string,
  modloader: string,
  modloaderver: string,
  mpversion: string,
  selectedFile: string[],
  filepath: string,
  mpname: string,
  mpdes: string
) {
  switch (type) {
    case 'Curseforge':
      console.log(`\x1B[31m${i18n.unsupported_CURSEFORGE}\x1B[0m`)
      break
    case 'Modrinth':
      await modrinth(
        version,
        modloader,
        modloaderver,
        mpversion,
        selectedFile,
        filepath,
        mpname,
        mpdes
      )
      break

    case 'MCBBS':
      console.log(`\x1B[31m${i18n.unsupported_MCBBS}\x1B[0m`)
      break
  }
}

function readRootDirSync(dir: fs.PathLike): DirNode {
  const stats = fs.statSync(dir)
  const node: DirNode = {
    name: path.basename(dir.toString()),
    path: dir,
    children: []
  }
  if (stats.isDirectory()) {
    const files = fs.readdirSync(dir)
    for (const file of files) {
      const filePath = path.join(dir.toString(), file)
      const fileStats = fs.statSync(filePath)
      if (
        file !== '.mixin.out' &&
        file !== '.vscode' &&
        file !== 'mods' &&
        file !== '.vscode' &&
        file !== 'crash-reports' &&
        file !== 'logs' &&
        !file.endsWith('.jar') &&
        file !== 'PCL'
      )
        if (fileStats.isDirectory()) {
          node.children.push({
            name: file,
            path: filePath,
            isDirectory: true
          })
        } else {
          node.children.push({
            name: file,
            path: filePath,
            isDirectory: false
          })
        }
    }
  }
  return node
}
function generateMultiSelectList(node: DirNode, prefix = ''): ListItem[] {
  let list: ListItem[] = []
  if (node.children) {
    for (const child of node.children) {
      list.push({
        name: prefix + (child.isDirectory ? '📁 ' : '📄 ') + child.name,
        value: child.path,
        short: child.name
      })
      if (child.isDirectory) {
        const dirChild: DirNode = {
          name: child.name,
          path: child.path as fs.PathLike,
          children: []
        }
        list = list.concat(generateMultiSelectList(dirChild, `${prefix}  `))
      }
    }
  }
  return list
}
