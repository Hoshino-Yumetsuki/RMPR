import inquirer from "inquirer";
import fs from "node:fs";
import path from "node:path";
import { modrinth } from "./platforms/modrinth";
import { i18ns } from "./i18n/i18n";

//#region src/main.ts
const i18n = i18ns();
const questions = [
	{
		type: "list",
		name: "type",
		message: i18n.qs_type,
		choices: [
			"Curseforge",
			"Modrinth",
			"MCBBS"
		],
		pageSize: 4,
		loop: false
	},
	{
		type: "input",
		name: "version",
		message: i18n.qs_version,
		loop: false
	},
	{
		type: "input",
		name: "mpname",
		message: i18n.qs_mpname,
		loop: false
	},
	{
		type: "input",
		name: "mpdes",
		message: i18n.qs_mpdes,
		loop: false
	},
	{
		type: "input",
		name: "mpversion",
		message: i18n.qs_mpversion,
		pageSize: 4,
		loop: false
	},
	{
		type: "list",
		name: "modloader",
		message: i18n.qs_modloader,
		choices: [
			"Forge",
			"Neoforge",
			"Fabric"
		],
		pageSize: 4,
		loop: false
	},
	{
		type: "input",
		name: "modloaderver",
		message: i18n.qs_modloaderver,
		loop: false
	},
	{
		type: "input",
		name: "filepath",
		message: i18n.qs_filepath,
		pageSize: 4,
		loop: false
	},
	{
		type: "checkbox",
		name: "selectedFile",
		message: i18n.qs_selectedFile,
		pageSize: 20,
		loop: false,
		choices: (answers) => generateMultiSelectList(readRootDirSync(answers.filepath))
	}
];
await inquirer.prompt(questions).then(async (answers) => {
	await makemodpack(answers.type, answers.version, answers.modloader, answers.modloaderver, answers.mpversion, answers.selectedFile, answers.filepath, answers.mpname, answers.mpdes);
});
async function makemodpack(type, version, modloader, modloaderver, mpversion, selectedFile, filepath, mpname, mpdes) {
	switch (type) {
		case "Curseforge":
			console.log(`\x1B[31m${i18n.unsupported_CURSEFORGE}\x1B[0m`);
			break;
		case "Modrinth":
			await modrinth(version, modloader, modloaderver, mpversion, selectedFile, filepath, mpname, mpdes);
			break;
		case "MCBBS":
			console.log(`\x1B[31m${i18n.unsupported_MCBBS}\x1B[0m`);
			break;
	}
}
function readRootDirSync(dir) {
	const stats = fs.statSync(dir);
	const node = {
		name: path.basename(dir.toString()),
		path: dir,
		children: []
	};
	if (stats.isDirectory()) {
		const files = fs.readdirSync(dir);
		for (const file of files) {
			const filePath = path.join(dir.toString(), file);
			const fileStats = fs.statSync(filePath);
			if (file !== ".mixin.out" && file !== ".vscode" && file !== "mods" && file !== ".vscode" && file !== "crash-reports" && file !== "logs" && !file.endsWith(".jar") && file !== "PCL") if (fileStats.isDirectory()) node.children.push({
				name: file,
				path: filePath,
				isDirectory: true
			});
			else node.children.push({
				name: file,
				path: filePath,
				isDirectory: false
			});
		}
	}
	return node;
}
function generateMultiSelectList(node, prefix = "") {
	let list = [];
	if (node.children) for (const child of node.children) {
		list.push({
			name: prefix + (child.isDirectory ? "📁 " : "📄 ") + child.name,
			value: child.path,
			short: child.name
		});
		if (child.isDirectory) {
			const dirChild = {
				name: child.name,
				path: child.path,
				children: []
			};
			list = list.concat(generateMultiSelectList(dirChild, `${prefix}  `));
		}
	}
	return list;
}

//#endregion