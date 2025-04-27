"use client"

import {useState, useEffect} from "react"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import type {Course, UserCourse} from "@/app/lib/definitions/definitions"
import {AddCourse} from "./add-course"
import {RemoveCourse} from "./remove-course"
import {Button as Button2} from "@/components/ui/button";
import {ArrowLeft} from "lucide-react";
import {usePathname, useRouter} from "next/navigation";

interface ModifyCourseProps {
    courses: Course[]
    enrolledCourses: UserCourse[]
}

export function ModifyCourse({courses, enrolledCourses: initialEnrolledCourses}: ModifyCourseProps) {
    const [enrolledCourses, setEnrolledCourses] = useState<UserCourse[]>(initialEnrolledCourses)
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        setEnrolledCourses(initialEnrolledCourses)
    }, [initialEnrolledCourses])

    const handleCourseAdded = (newCourse: UserCourse) => {
        const isDuplicate = enrolledCourses.some((course) => course.id === newCourse.id)
        if (!isDuplicate) {
            setEnrolledCourses((prev) => [...prev, newCourse])
        }
    }

    // Handler for when a course is removed
    const handleCourseRemoved = (removedCourseId: string) => {
        setEnrolledCourses((prev) => prev.filter((course) => course.id !== removedCourseId))
    }
    const handleBackClick = () => {
        const parentPath = pathname.replace(/\/add$/, "");
        router.push(parentPath);
    };


    return (
        <div className="space-y-4">
            <Button2 variant="ghost" onClick={handleBackClick} className="flex items-center mb-2">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to dashboard
            </Button2>
        <Card className="w-full max-w-[600px]">
            <CardHeader>
                <CardTitle className={"text-2xl font-bold mb-6"}>Course Management</CardTitle>
                <CardDescription>Browse available courses and manage your enrolled courses</CardDescription>
            </CardHeader>

            <CardContent>
                <Tabs defaultValue="available" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="available">Available Courses</TabsTrigger>
                        <TabsTrigger value="enrolled">My Courses</TabsTrigger>
                    </TabsList>

                    <TabsContent value="available" className="mt-4">
                        <AddCourse
                            courses={courses}
                            enrolledCourseIds={enrolledCourses.map((ec) => ec.course.id)}
                            onCourseAdded={handleCourseAdded}
                        />
                    </TabsContent>

                    <TabsContent value="enrolled" className="mt-4">
                        <RemoveCourse enrolledCourses={enrolledCourses} onCourseRemoved={handleCourseRemoved}/>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
            </div>
    )
}

