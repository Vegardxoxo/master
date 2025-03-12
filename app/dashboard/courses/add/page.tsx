import { getDummyRepoData } from "@/app/lib/placeholder-data";
import { AddCourse } from "@/app/ui/courses/add/add-course";
import {getCourseCatalog, getUserCourses} from "@/app/lib/database-functions";

export default async function Page() {
  const result = await getCourseCatalog();
  const res = await getUserCourses();
  console.log("enrolled courses:", res.enrolledCourses)
  if (!result.success) return <div>Error</div>;
  return (
    <div className={"flex justify-center"}>
      <AddCourse courses={result.courses} enrolledCourses={res.enrolledCourses} />
    </div>
  );
}
