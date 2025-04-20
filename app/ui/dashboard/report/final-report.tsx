import {useState} from "react";
import {Button} from "@/components/ui/button";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {useToast} from "@/hooks/use-toast";
import {
    Eye,
    FileText,
    Upload,
    Loader2,
    Check,
    ExternalLink,
    GitBranch,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {uploadReportToRepository} from "@/app/lib/data/github-api-functions";
import {Card, CardContent} from "@/components/ui/card";
import {setReportGenerated} from "@/app/lib/database-functions";

const MDEditor = dynamic(
    () => import("@uiw/react-md-editor").then((mod) => mod.default),
    {ssr: false},
);
const MDPreview = dynamic(
    () => import("@uiw/react-markdown-preview").then((mod) => mod.default),
    {ssr: false},
);

interface FinalReportProps {
    content: string;
    title: string;
    owner: string;
    repo: string;
    images: string[];
}

export default function FinalReport({
                                        content,
                                        title,
                                        owner,
                                        repo,
                                        images,
                                    }: FinalReportProps) {
    const [editableMarkdown, setEditableMarkdown] = useState(content);
    const [activeTab, setActiveTab] = useState<"preview" | "edit">("preview");
    const [isUploading, setIsUploading] = useState(false);
    const [isUploaded, setIsUploaded] = useState(false);
    const [uploadedUrl, setUploadedUrl] = useState<string | undefined>(undefined);
    const [uploadedBranch, setUploadedBranch] = useState<string | undefined>(
        undefined,
    );
    const {toast} = useToast();

    const handleCopy = () => {
        navigator.clipboard.writeText(editableMarkdown);
        toast({
            title: "Copied to clipboard",
            description: "The markdown content has been copied to your clipboard.",
        });
    };

    async function handleUpload() {
        if (!owner || !repo) {
            toast({
                title: "Repository information missing",
                description:
                    "Unable to upload the report without repository information.",
                variant: "destructive",
            });
            return;
        }
        setIsUploading(true);

        const filename = `${title.replace(/[^a-zA-Z0-9]/g, "-")}.md`;
        const filteredImages = images.filter((img) => img && img.trim() !== "");


        try {
            const result = await uploadReportToRepository(
                owner,
                repo,
                content,
                filename,
                filteredImages,
                "KEKW",
            );
            if (result.success) {
                setIsUploaded(true);
                setUploadedUrl(result.url);
                setUploadedBranch(result.branch);

                await setReportGenerated(owner, repo);

                toast({
                    title: "Report uploaded successfully",
                    description: `The report has been uploaded to the repository in branch "${result.branch}"`,
                });
            } else {
                throw new Error(result.error || "Unknown error occurred");
            }
        } catch (error) {
            toast({
                title: "Upload failed",
                description: `There was an error uploading the report: ${error instanceof Error ? error.message : "Unknown error"}`,
                variant: "destructive",
            });
        } finally {
            setIsUploading(false);
        }
    }

    return (
        <div className="container mx-auto p-4 flex flex-col space-y-2">
            <div className="flex items-center gap-2 justify-end">
                {isUploaded && uploadedUrl && (
                    <Link
                        href={uploadedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                    >
                        <ExternalLink className="h-4 w-4 mr-1"/>
                        View on GitHub
                    </Link>
                )}
                {isUploaded && uploadedBranch && (
                    <div className="flex items-center text-sm text-gray-600 mr-2">
                        <GitBranch className="h-4 w-4 mr-1"/>
                        {uploadedBranch}
                    </div>
                )}
                <Button
                    variant="default"
                    onClick={handleUpload}
                    disabled={isUploading || isUploaded}
                    className="bg-green-600 hover:bg-green-700"
                >
                    {isUploading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                            Uploading...
                        </>
                    ) : isUploaded ? (
                        <>
                            <Check className="mr-2 h-4 w-4"/>
                            Uploaded
                        </>
                    ) : (
                        <>
                            <Upload className="mr-2 h-4 w-4"/>
                            Upload to Repository
                        </>
                    )}
                </Button>
            </div>

            <Tabs
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as "preview" | "edit")}
                className="flex-1 flex flex-col overflow-hidden"
            >
                <div className="flex justify-between items-center mb-4">
                    <TabsList>
                        <TabsTrigger
                            value="preview"
                            className="flex-1 data-[state=active]:bg-sky-500 data-[state=active]:text-white"
                        >
                            <Eye className="mr-2 h-4 w-4"/>
                            Preview
                        </TabsTrigger>
                        <TabsTrigger
                            value="edit"
                            className="flex-1  data-[state=active]:bg-sky-500 data-[state=active]:text-white"
                        >
                            <FileText className="mr-2 h-4 w-4"/>
                            Edit
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleCopy}>
                            Copy Markdown
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditableMarkdown(content)}
                            disabled={editableMarkdown === content}
                        >
                            Reset Changes
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden">
                    <TabsContent
                        value="preview"
                        className="h-full mt-0 data-[state=active]:flex flex-col"
                    >
                        <Card className="rounded-md flex-1 overflow-auto p-4">
                            <CardContent>
                                <MDPreview source={editableMarkdown}/>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent
                        value="edit"
                        className="h-full mt-0 data-[state=active]:flex flex-col overflow-hidden"
                    >
                        <Card data-color-mode="light" className="flex-1">
                            <MDEditor
                                value={editableMarkdown}
                                onChange={(value) => setEditableMarkdown(value || "")}
                                height="100%"
                                preview="edit"
                            />
                        </Card>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
