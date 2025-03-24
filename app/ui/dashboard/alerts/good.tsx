
interface GoodProps {
    message: string;

}
export default function Good({message}: GoodProps) {
  return (
    <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
      <h2 className="text-xl font-bold text-green-700 mb-2">
          {message}
      </h2>
    </div>
  );
}
