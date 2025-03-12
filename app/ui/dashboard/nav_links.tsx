"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import clsx from "clsx"
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { BookOpen, Calendar, ChevronRight, Clock, LayoutDashboard, Settings, Users } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import {Collapsible, CollapsibleContent} from "@radix-ui/react-collapsible";

export const links = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Students", href: "/dashboard/students", icon: Users },
  { name: "Schedule", href: "/dashboard/schedule", icon: Calendar },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export const dummyCourses = {
  courses: [
    {
      id: "1",
      name: "Web Development",
      years: ["2023", "2024", "2025"],
    },
    {
      id: "2",
      name: "Data Science",
      years: ["2022", "2023", "2024"],
    },
    {
      id: "3",
      name: "Mobile App Development",
      years: ["2023", "2024"],
    },
  ],
}

/**
 * Non-collapsable links to be rendered in side-nav.-
 */
export function NavLinks() {
  const pathname = usePathname()
  return (
    <>
      {links.map((link) => {
        return (
          <SidebarMenuItem key={link.name}>
            <SidebarMenuButton asChild>
              <Link
                href={link.href}
                className={clsx(
                  "flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3",
                  {
                    "bg-sky-100 text-blue-600": link.href === pathname,
                  },
                )}
              >
                <link.icon />
                <p className="hidden md:block">{link.name}</p>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </>
  )
}

/**
 * Helper function to normalize paths for comparison
 */
function normalizePath(path: string): string {
  // Convert to lowercase, replace spaces with hyphens, and ensure no trailing slash
  return path.toLowerCase().replace(/\s+/g, "-").replace(/\/$/, "")
}

/**
 * Course item with collapsible years
 */
function CourseItem({ course, pathName }: { course: any; pathName: string }) {
  // Normalize the course name for URL paths
  const normalizedCourseName = normalizePath(course.name)
  const basePath = `/dashboard/courses/${normalizedCourseName}`

  // Check if any year of this course is active
  const isCourseActive = pathName.toLowerCase().includes(normalizedCourseName.toLowerCase())

  // Track if this is the initial render
  const initialRender = useRef(true)

  // State for dropdown - only auto-open on initial render if course is active
  const [isOpen, setIsOpen] = useState(() => {
    return initialRender.current && isCourseActive
  })

  // Set initial state only once on mount
  useEffect(() => {
    if (initialRender.current) {
      setIsOpen(isCourseActive)
      initialRender.current = false
    }
  }, [isCourseActive])

  // Toggle function that allows explicit control
  const toggleDropdown = () => {
    setIsOpen((prev) => !prev)
  }

  return (
    <SidebarMenuItem className={"mb-2"}>
      <div className="w-full">
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
          <div className="w-full">
            <SidebarMenuButton isActive={isCourseActive} className="w-full" onClick={toggleDropdown}>
              <div className="flex w-full items-center">
                <BookOpen className="h-5 w-5" />
                <p className="ml-2">{course.name}</p>
                <ChevronRight
                  className={`ml-auto h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
                />
              </div>
            </SidebarMenuButton>
          </div>

          <CollapsibleContent className="pl-6">
            {course.years.map((year: string) => {
              const yearPath = `${basePath}/${year}`
              const normalizedPathName = normalizePath(pathName)
              const normalizedYearPath = normalizePath(yearPath)

              // Check if this specific year is active
              const isYearActive = normalizedPathName === normalizedYearPath

              return (
                <div key={`${course.id}-${year}`} className="py-1">
                  <Link
                    href={yearPath}
                    className={clsx(
                      "flex items-center gap-2 text-sm rounded-md p-2 hover:bg-sky-100 hover:text-blue-600",
                      {
                        "bg-sky-100 text-blue-600": isYearActive,
                      },
                    )}
                  >
                    <Clock className="h-4 w-4" />
                    <span>{year}</span>
                  </Link>
                </div>
              )
            })}
          </CollapsibleContent>
        </Collapsible>
      </div>
    </SidebarMenuItem>
  )
}

/**
 * Courses component with nested collapsible years
 */
export function Courses({
  pathName,
  courses = dummyCourses,
}: {
  pathName: string
  courses?: any
}) {
  return (
    <>
      {dummyCourses.courses.map((course: any) => (
        <CourseItem key={course.id} course={course} pathName={pathName} />
      ))}
    </>
  )
}

