export default function Page() {
  return (
    <div
      className={
        " md:flex border-2  border-indigo-600 h-52 justify-around items-center border-solid rounded-full "
      }
    >
      <div className={" flex h-2/6 border-4 border-b-lime-100 items-center"}>
        <p className={""}>Child1</p>
      </div>
      <div className={" flex items-center h-2/6 border-4 border-b-lime-100"}>
        {" "}
        Child 2
      </div>
      <div className={" h-2/6 border-4 border-b-lime-100"}> Child 3</div>
      <div className={" h-2/6 border-4 border-b-lime-100"}> Child 4</div>
    </div>
  );
}
