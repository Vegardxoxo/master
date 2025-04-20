import {getCourseCatalog, getUserCourses} from "@/app/lib/database-functions";
import {ModifyCourse} from "@/app/ui/courses/modify/modify-course";

export default async function Page() {
  const {error, courses} = await getCourseCatalog();
  const {enrolledCourses} = await getUserCourses();
  if (error) return <div>{error}</div>;
   return (
    <div className="flex flex-col items-center justify-center p-4">
      <ModifyCourse courses={courses || []} enrolledCourses={enrolledCourses} />
    </div>
  );
}
