interface CoursePageProps {
    params: {
        name: string;
    };
}

export default function CoursePage({params}: CoursePageProps) {
    const {name} = params;

    return (
        <div>
            <h1 className={
                "text-2xl text-center"
            }>Course: {name}</h1>
            {/* Render content specific to {name} */}
        </div>
    );
}
