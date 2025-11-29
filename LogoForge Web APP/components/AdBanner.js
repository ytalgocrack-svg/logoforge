export default function AdBanner({ code }) {
  if (!code) return null;

  return (
    <div className="w-full flex justify-center my-6">
      <div 
        className="overflow-hidden rounded-lg shadow-sm"
        dangerouslySetInnerHTML={{ __html: code }} 
      />
    </div>
  );
}
