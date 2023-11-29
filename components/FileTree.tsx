import { FileTree } from '@/types';
import { useCallback, useEffect, useState } from 'react';

export function FileTreeComponent() {
    const [fileTree, setFileTree] = useState<FileTree[]>();
    const [openDirectories, setOpenDirectories] = useState<string[]>([]);
    const [openFiles, setOpenFiles] = useState<string>("");

    const GetFileTree = useCallback(async () => {
        const files = await fetch('./api/files');
        const fileTree = await files.json();

        setFileTree(fileTree);
    }, []);

    useEffect(() => {
        GetFileTree()
    }, [GetFileTree]);

    function toggleDirectory(event: React.MouseEvent, name: string | undefined) {
        event.stopPropagation();

        if (!name) return;

        setOpenDirectories(prev => {
            if (prev?.includes(name)) {
                return prev.filter(dir => dir !== name);
            } else {
                return [...prev, name];
            }
        });
    }

    async function OpenFile(child: FileTree) {
        if (!child) return;

        console.log(child.path);

        const data = await fetch(`./api/files`, { method: 'POST', body: JSON.stringify({ path: child.path }) });

        const file = await data.text();

        setOpenFiles(file);
    }

    function RenderTree(fileTree: FileTree[] | undefined) {
        return (
            <ul className="list-none list-inside first:ml-0 border-l-2 border-gray-800 pl-2">
                {fileTree?.map((child) => {
                    if (child.type === 'directory') {
                        return (
                            <li key={child.name} className="font-bold" onClick={(event) => toggleDirectory(event, child.name)}>
                                {child.name}
                                {openDirectories.includes(child.name!) && RenderTree(child.children)}
                            </li>
                        );
                    }
                    if (child.type === 'file') {
                        return <li key={child.name} onClick={() => OpenFile(child)} className="text-blue-500 hover:cursor-pointer">{child.name}</li>
                    }
                })}
            </ul>
        )
    }

    return (
        <div className='flex justify-start w-full'>
            <div className='w-64 pr-20'>
                <h1>File Tree</h1>
                {RenderTree(fileTree)}
            </div>
            <div className='w-fit whitespace-pre-line'>
                {openFiles}
            </div>
        </div>
    )
}