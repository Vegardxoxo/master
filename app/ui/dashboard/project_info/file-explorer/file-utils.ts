type FileNode = {
  id: string;
  name: string;
  path: string;
  extension?: string;
  children: Record<string, FileNode>;
  isDirectory: boolean;
};

type RepoFile = {
  id: string;
  path: string;
  extension: string;
};

export function buildFileTree(files: RepoFile[]): FileNode {
  const root: FileNode = {
    id: "root",
    name: "root",
    path: "",
    children: {},
    isDirectory: true,
  };

  files.forEach((file) => {
    const pathParts = file.path.split("/");
    let currentNode = root;

    pathParts.forEach((part, index) => {
      const isLastPart = index === pathParts.length - 1;
      const currentPath = pathParts.slice(0, index + 1).join("/");

      if (isLastPart) {
        currentNode.children[part] = {
          id: file.id,
          name: part,
          path: file.path,
          extension: file.extension,
          children: {},
          isDirectory: false,
        };
      } else {
        if (!currentNode.children[part]) {
          currentNode.children[part] = {
            id: `dir-${currentPath}`,
            name: part,
            path: currentPath,
            children: {},
            isDirectory: true,
          };
        }
        currentNode = currentNode.children[part];
      }
    });
  });

  return root;
}

export function sortFileTree(node: FileNode): FileNode {
  const sortedChildren: Record<string, FileNode> = {};
  const childrenArray = Object.values(node.children);

  childrenArray.sort((a, b) => {
    if (a.isDirectory && !b.isDirectory) return -1;
    if (!a.isDirectory && b.isDirectory) return 1;
    return a.name.localeCompare(b.name);
  });

  childrenArray.forEach((child) => {
    if (child.isDirectory) {
      sortedChildren[child.name] = sortFileTree(child);
    } else {
      sortedChildren[child.name] = child;
    }
  });

  return {
    ...node,
    children: sortedChildren,
  };
}

export function cn(...classes: (string | undefined | boolean)[]) {
  return classes.filter(Boolean).join(" ");
}
