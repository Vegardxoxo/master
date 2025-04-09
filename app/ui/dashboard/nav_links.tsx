"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import {
  BookOpen,
  Calendar,
  ChevronRight,
  Clock,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { AddCourseInstance } from "@/app/ui/courses/add/add-course-instance";
import { UserCourse } from "@/app/lib/definitions/definitions";

// Define the navigation links
export const links = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Students", href: "/dashboard/students", icon: Users },
  { name: "Schedule", href: "/dashboard/schedule", icon: Calendar },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

/**
 * Non-collapsable links to be rendered in side-nav
 */
export function NavLinks() {
  const pathname = usePathname();
  return (
    <>
      {links.map((link) => {
        return (
          <SidebarMenuItem key={link.name}>
            <SidebarMenuButton asChild>
              <Link
                href={link.href}
                className={clsx(
                  "flex h-[40px] grow items-center gap-2 rounded-md p-2 text-sm font-medium hover:bg-sky-100 hover:text-blue-600",
                  {
                    "bg-sky-100 text-blue-600": link.href === pathname,
                  },
                )}
              >
                <link.icon className="h-4 w-4" />
                <span>{link.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </>
  );
}

/**
 * Helper function to normalize paths for comparison
 */
function normalizePath(path: string): string {
  // Convert to lowercase, replace spaces with hyphens, and ensure no trailing slash
  return path.toLowerCase().replace(/\s+/g, "-").replace(/\/$/, "");
}

/**
 * Course item with collapsible years
 */
function CourseItem({
  userCourse,
  pathName,
}: {
  userCourse: any;
  pathName: string;
}) {
  const { course, instances, id: userCourseId } = userCourse;

  // Normalize the course code for URL paths
  const normalizedCourseCode = course.code;
  const basePath = `/dashboard/courses/${normalizedCourseCode}`;

  // Check if any instance of this course is active
  const isCourseActive = pathName
    .toLowerCase()
    .includes(normalizedCourseCode.toLowerCase());

  // Track if this is the initial render
  const initialRender = useRef(true);

  // State for dropdown - only auto-open on initial render if course is active
  const [isOpen, setIsOpen] = useState(() => {
    return initialRender.current && isCourseActive;
  });

  // Set initial state only once on mount
  useEffect(() => {
    if (initialRender.current) {
      setIsOpen(isCourseActive);
      initialRender.current = false;
    }
  }, [isCourseActive]);

  return (
    <div className="w-full bg">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between text-sm font-medium mt-2">
          <SidebarMenuButton
            isActive={isCourseActive}
            className="flex-1 h-10"
            onClick={() => setIsOpen((prev) => !prev)}
          >
            {/*Course specific collapsible*/}
            <div className="flex items-center w-full">
              <BookOpen className="h-4 w-4 shrink-0" />
              <div className="ml-2 flex flex-col min-w-0">
                <span className="text-xs font-medium truncate">
                  {course.code}
                </span>
                <span className="text-sm truncate">{course.name}</span>
              </div>
              <ChevronRight
                className={`ml-auto h-4 w-4 shrink-0 transition-transform duration-200 ${
                  isOpen ? "rotate-90" : ""
                }`}
              />
            </div>
          </SidebarMenuButton>
          <AddCourseInstance
            userCourseId={userCourseId}
            courseName={course.name}
            courseCode={course.code}
          />
        </div>

        {/*Semester & Year for each course*/}
        <CollapsibleContent className=" ">
          {instances.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">
              No semesters added
            </div>
          ) : (
            instances.map((instance: any) => {
              // Create a unique path that includes both year and semester
              const semesterValue = instance.semester.toLowerCase();
              const instancePath = `${basePath}/${instance.year}/${semesterValue}`;

              // Check if the current path exactly matches this instance's path
              const currentPath = normalizePath(pathName);
              const normalizedInstancePath = normalizePath(instancePath);

              // An instance is active only if the exact path matches
              const isInstanceActive = currentPath === normalizedInstancePath;

              // Format semester and year for display
              const semesterLabel =
                instance.semester === "SPRING" ? "Spring" : "Autumn";
              const yearLabel = `${semesterLabel} ${instance.year}`;

              return (
                <Link
                  key={instance.id}
                  href={instancePath}
                  className={clsx(
                    "mt-2 pl-6  flex h-8 items-center gap-2 rounded-md px-2 text-sm hover:bg-sky-100 hover:text-blue-600",
                    {
                      "bg-sky-100 text-blue-600": isInstanceActive,
                    },
                  )}
                >
                  <Clock className="h-4 w-4 shrink-0" />
                  <span className="truncate">{yearLabel}</span>
                </Link>
              );
            })
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

/**
 * Courses component with nested collapsible years
 */
export function Courses({ courses }: { courses: UserCourse[] }) {
  const pathName = usePathname();
  return (
    <div className="w-full">
      {courses?.map((userCourse) => (
        <CourseItem
          key={userCourse.id}
          userCourse={userCourse}
          pathName={pathName}
        />
      ))}
    </div>
  );
}
