import { FileTree } from '@/types';
import { Dirent } from 'fs';
import { readFile, readdir } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

export async function GET() {
	const ignore = [
		'node_modules',
		'.next',
		'.vscode',
		'.git',
		'.gitignore',
		'package-lock.json',
		'package.json',
		'tsconfig.json',
		'next-env.d.ts',
		'bun.lockb',
	];

	const fileTree = await readDirectory(process.cwd(), ignore);

	return new Response(JSON.stringify(fileTree));
}

async function readDirectory(
	dir: string,
	ignore: string[]
): Promise<FileTree[]> {
	const dirents = await readdir(dir, { withFileTypes: true });
	const promises = dirents.map(async (dirent: Dirent) => {
		const res = path.resolve(dir, dirent.name);
		if (ignore.includes(dirent.name)) return null;
		if (dirent.isDirectory()) {
			return {
				name: dirent.name,
				type: "directory",
				children: await readDirectory(res, ignore),
			};
		}
		return {
			name: dirent.name,
			type: "file",
			path: res,
		};
	});

	const files: (FileTree | null)[] = await Promise.all(promises);

	return files
		.filter((x): x is FileTree => x !== null)
		.sort((a, b) => (a.type === 'directory' && b.type === 'file' ? -1 : 1));
}

export async function POST(
	req: NextRequest,
	res: NextResponse
): Promise<NextResponse> {
	const { path }: { path: string } = await req.json();

	if (!path) return new NextResponse(null, { status: 400 });

	const file = await readFile(path);

	return new NextResponse(file);
}
