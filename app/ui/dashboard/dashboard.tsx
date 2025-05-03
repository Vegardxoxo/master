"use client";

import type React from "react";
import {useEffect, useState} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {DashboardNavigation} from "@/app/ui/dashboard/dashboard-navigation";
import type {VisibleSections} from "@/app/lib/definitions/definitions";
import {Check, GitBranch, GitCommit, GitMerge, GitPullRequest, LayoutDashboard, Loader2, Upload,} from "lucide-react";
import GenerateReport from "@/app/ui/dashboard/report/generate-report";
import {useReport} from "@/app/contexts/report-context";
import {Button} from "@/app/ui/button";
import {useToast} from "@/hooks/use-toast";
import {loadDashboardPreferences, saveDashboardPreferences,} from "@/app/lib/server-actions/dashboard-actions";
import {defaultVisibleSections} from "@/app/lib/placeholder-data";

// Define the order of sections (same as in dashboard-navigation.tsx)
const SECTION_ORDER: (keyof VisibleSections)[] = [
    "overview",
    "commits",
    "branches",
    "pipelines",
    "pullRequests",
];

type DashboardProps = {
    owner: string;
    repo: string;
    children: {
        contributorsList: React.ReactNode;
        projectInfo: React.ReactNode;
        languageDistribution: React.ReactNode;
        milestones: React.ReactNode;
        files: React.ReactNode;
        coverage: React.ReactNode;
        commitQuality: React.ReactNode;
        commitFrequency: React.ReactNode;
        commitContribution: React.ReactNode;
        commitSize: React.ReactNode;
        branch: React.ReactNode;
        branchingStrategy: React.ReactNode;
        issuesVsPrs: React.ReactNode;
        pipeline: React.ReactNode;
        pullRequestOverview: React.ReactNode;
        pullRequestMembers: React.ReactNode;
        pullRequestComments: React.ReactNode;
        pullRequestReviews: React.ReactNode;
    };
};

export default function Dashboard({owner, repo, children}: DashboardProps) {
    const [visibleSections, setVisibleSections] = useState<VisibleSections>(
        defaultVisibleSections,
    );
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [saved, setSaved] = useState<boolean>(false);
    const {setRepositoryInfo} = useReport();
    const {toast} = useToast();

    // Load preferences when component mounts
    useEffect(() => {
        const fetchPreferences = async () => {
            try {
                setLoading(true);
                const result = await loadDashboardPreferences();

                if (result.success && result.preferences) {
                    setVisibleSections(result.preferences as VisibleSections);
                }
            } catch (error) {
                console.error("Failed to load dashboard preferences:", error);
                toast({
                    title: "Failed to load preferences",
                    description: "Your default dashboard settings were loaded instead.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchPreferences();
    }, [toast]);

    // Save preferences
    const savePreferences = async () => {
        try {
            setSaving(true);
            setSaved(false);
            const result = await saveDashboardPreferences({
                preferences: visibleSections,
            });

            if (result.success) {
                toast({
                    title: "Preferences saved",
                    description: "Your dashboard preferences have been saved.",
                });
                setSaved(true);
                setTimeout(() => {
                    setSaved(false);
                }, 2000);
            }
        } catch (error) {
            console.error("Failed to save preferences:", error);
            toast({
                title: "Failed to save preferences",
                description: "Please try again later.",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    // Simple toggle function for any section or subsection
    const toggleVisibility = (path: string[]) => {
        setVisibleSections((prev) => {
            // Create a deep copy to avoid mutating the state directly
            const newState = JSON.parse(JSON.stringify(prev));

            // Navigate to the target object
            let target = newState;
            for (let i = 0; i < path.length - 1; i++) {
                target = target[path[i]];
            }

            // Toggle the visible property
            const lastKey = path[path.length - 1];
            if (typeof target[lastKey] === "object") {
                target[lastKey].visible = !target[lastKey].visible;
            } else {
                target[lastKey] = !target[lastKey];
            }

            return newState;
        });
    };

    // Simplified toggle functions that use the generic toggleVisibility
    const toggleSection = (section: keyof VisibleSections) => {
        toggleVisibility([section]);
    };

    const toggleSubsection = (
        section: keyof VisibleSections,
        subsection: string,
    ) => {
        toggleVisibility([section, subsection]);
    };


    useEffect(() => {
        if (owner && repo) {
            setRepositoryInfo({owner, repo});
        }
    }, [owner, repo, setRepositoryInfo]);


    // Helper function to check if a section or subsection is visible
    const isVisible = (path: (string | keyof VisibleSections)[]) => {
        if (path.length === 0) return true;

        // For main sections
        const section = visibleSections[path[0] as keyof VisibleSections];
        if (!section) return false;

        // Check main section visibility
        const isMainSectionVisible =
            typeof section === "boolean" ? section : section.visible;

        if (!isMainSectionVisible || path.length === 1) return isMainSectionVisible;

        // For subsections
        const subsection = section[path[1]];
        return typeof subsection === "boolean"
            ? subsection
            : (subsection?.visible ?? false);
    };

    // Helper function to get the icon for a section
    const getSectionIcon = (section: keyof VisibleSections) => {
        switch (section) {
            case "overview":
                return <LayoutDashboard className="h-5 w-5"/>;
            case "commits":
                return <GitCommit className="h-5 w-5"/>;
            case "branches":
                return <GitBranch className="h-5 w-5"/>;
            case "pipelines":
                return <GitMerge className="h-5 w-5"/>;
            case "pullRequests":
                return <GitPullRequest className="h-5 w-5"/>;
            default:
                return null;
        }
    };

    // Helper function to get the text for a section
    const getSectionText = (section: keyof VisibleSections) => {
        const sectionData = visibleSections[section];
        if (typeof sectionData === "object" && "text" in sectionData) {
            return sectionData.text;
        }
        return section; // Fallback to the key name
    };

    if (loading) {
        return (
            <div></div>
        );
    }

    // Render section content based on the section key
    const renderSectionContent = (section: keyof VisibleSections) => {
        switch (section) {
            case "overview":
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                                {getSectionIcon(section)}
                                {getSectionText(section)}
                            </CardTitle>
                            <CardDescription>
                                General information and contributors
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6">
                            <div className={"grid grid-cols-2 gap-6"}>
                                {isVisible(["overview", "contributors"]) &&
                                    children.contributorsList}
                                {isVisible(["overview", "info"]) && children.projectInfo}
                            </div>
                            <div className={"grid grid-cols-1 gap-6"}>
                                {isVisible(["overview", "distribution"]) && children.languageDistribution}
                            </div>
                            <div className={"grid grid-cols-1 gap-6"}>
                                {isVisible(["overview", "milestones"]) && children.milestones}
                                {isVisible(["overview", "files"]) && children.files}
                                {isVisible(["overview", "coverage"]) && children.coverage}
                            </div>
                        </CardContent>
                    </Card>
                );
            case "commits":
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                                {getSectionIcon(section)}
                                {getSectionText(section)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {isVisible(["commits", "quality"]) && (
                                <div>{children.commitQuality}</div>
                            )}
                            {isVisible(["commits", "frequency"]) && (
                                <div>{children.commitFrequency}</div>
                            )}
                            {isVisible(["commits", "size"]) && (
                                <div>{children.commitSize}</div>
                            )}
                            {isVisible(["commits", "contributions"]) && (
                                <div>{children.commitContribution}</div>
                            )}
                        </CardContent>
                    </Card>
                );
            case "branches":
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                                {getSectionIcon(section)}
                                {getSectionText(section)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={"grid gap-6"}>
                                {isVisible(["branches", "to_main"]) && children.branch}
                                {isVisible(["branches", "strategy"]) &&
                                    children.branchingStrategy}
                                {isVisible(["branches", "issuesVsPrs"]) && children.issuesVsPrs}
                            </div>
                        </CardContent>
                    </Card>
                );
            case "pipelines":
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                                {getSectionIcon(section)}
                                {getSectionText(section)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>{children.pipeline}</CardContent>
                    </Card>
                );
            case "pullRequests":
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                                {getSectionIcon(section)}
                                {getSectionText(section)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {isVisible(["pullRequests", "overview"]) && (
                                <div>{children.pullRequestOverview}</div>
                            )}
                            {isVisible(["pullRequests", "members"]) && (
                                <div>{children.pullRequestMembers}</div>
                            )}
                            {isVisible(["pullRequests", "comments"]) && (
                                <div>{children.pullRequestComments}</div>
                            )}
                            {isVisible(["pullRequests", "reviews"]) && (
                                <div>{children.pullRequestReviews}</div>
                            )}
                        </CardContent>
                    </Card>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen">
            <main className="py-6">
                <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
                    <Tabs defaultValue="overview" className="w-full">
                        <div className="flex justify-between items-center mb-6">
                            <TabsList className="bg-white border border-gray-200 rounded-lg p-0 w-fit">
                                <TabsTrigger
                                    value="overview"
                                    className="text-sm font-medium px-4 py-2 data-[state=active]:bg-sky-500 data-[state=active]:text-white rounded-md transition-all"
                                >
                                    Repository Overview
                                </TabsTrigger>
                                <TabsTrigger
                                    value="report"
                                    className="text-sm font-medium px-4 py-2 data-[state=active]:bg-sky-500 data-[state=active]:text-white rounded-md transition-all"
                                >
                                    Generate Report
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="overview">
                            <div className="flex flex-col lg:flex-row lg:space-x-4">
                                {/*Sticky navigation*/}
                                <div className="lg:min-w-fit mb-6 lg:mb-0">
                                    <div className="sticky top-6 space-y-4">
                                        <DashboardNavigation
                                            onToggle={toggleSection}
                                            onToggleSubsection={toggleSubsection}
                                            visibleSections={visibleSections}
                                        />
                                        <div className="px-4 py-3 bg-white rounded-lg ">
                                            <Button
                                                onClick={savePreferences}
                                                disabled={saving}
                                                className="w-full transition-colors duration-200"
                                            >
                                                {saving ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                                        Saving
                                                    </>
                                                ) : saved ? (
                                                    <>
                                                        <Check className="mr-2 h-4 w-4"/>
                                                        Saved
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="mr-2 h-4 w-4"/>
                                                        Save your preferences
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/*Card container*/}
                                <div className="flex-grow space-y-6">
                                    {/* Render sections in the specified order */}
                                    {SECTION_ORDER.map(
                                        (section) => isVisible([section]) &&
                                            <div key={section}>{renderSectionContent(section)}</div>,
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="report">
                            <div className="flex-grow space-y-6 w-full">
                                <GenerateReport owner={owner} repo={repo}/>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </div>
    )
}
