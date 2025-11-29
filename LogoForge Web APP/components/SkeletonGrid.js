export default function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
        <div key={item} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="h-48 bg-slate-200 rounded-xl animate-pulse mb-4"></div>
          <div className="h-6 bg-slate-200 rounded w-3/4 animate-pulse mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2 animate-pulse"></div>
        </div>
      ))}
    </div>
  );
}
