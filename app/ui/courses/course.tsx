import Link from "next/link";
import clsx from "clsx";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import {Course} from "@/app/lib/definitions";

/**
 * Collapsable links to be rendered in side-nav.
 * @constructor
 */
export default function Courses({
  pathName,
  courses,
}: {
  pathName: string;
  courses: Course[];
}) {
  console.log(courses);
  return (
    <>
      {courses.courses.map((course) => {
        const linkPath = `/dashboard/courses/${course.id}`;
        return (
          <SidebarMenuItem key={course.id}>
            <SidebarMenuButton asChild>
              <Link
                href={linkPath}
                className={clsx(
                  "flex h-[48px] grow items-center justify-middle pl-5 gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:pl-5 md:p-2 md:px-3",
                  {
                    "bg-sky-100 text-blue-600": pathName === linkPath,
                  },
                )}
              >
                <p className="text-center">{course.name}</p>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </>
  );
}
