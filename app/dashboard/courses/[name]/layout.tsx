import ReactTable from "@/app/ui/courses/table";

export default function Layout({children}: { children: React.ReactNode }) {
    return (
        <>
            {children}
            <ReactTable/>

        </>

    )
}
