import fs from "node:fs";
import path from "node:path";

function copyFile(src, dest) {
	fs.mkdirSync(path.dirname(dest), { recursive: true });
	fs.copyFileSync(src, dest);
}

function copyFolder(src, dest) {
	fs.mkdirSync(dest, { recursive: true });
	const entries = fs.readdirSync(src, { withFileTypes: true });

	for (const entry of entries) {
		const srcPath = path.join(src, entry.name);
		const destPath = path.join(dest, entry.name);

		if (entry.isDirectory()) {
			copyFolder(srcPath, destPath);
		} else {
			copyFile(srcPath, destPath);
		}
	}
}

copyFile("src/manifest.json", "dist/manifest.json");
copyFile("src/popup.html", "dist/popup.html");
copyFile("src/popup.css", "dist/popup.css");
copyFolder("src/icons", "dist/icons");

console.log("Assets copied successfully!");
