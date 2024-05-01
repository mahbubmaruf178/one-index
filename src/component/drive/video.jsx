export function VideoView({ item, path }) {
  const Origin = window.location.origin;
  return (
    <div className="relative w-full bg-gray-600">
      <div className="flex flex-col justify-between items-center gap-4 p-4 rounded-b-md">
        {item.thumbnail && (
          <img
            src={item.thumbnail}
            alt={item.name}
            className="w-22 h-22 rounded-md object-cover mb-4"
          />
        )}
        <span className="absolute bottom-0 left-2 text-lg line-clamp-2 max-w-72 truncate">
          {item.name}
        </span>
        <div className="flex flex-row items-center justify-center absolute bottom-0 right-0 gap-2">
          <a
            href={`intent:${Origin}/api/download?path=${path}&id=${item.id}#Intent;type=video/mp4;end`}
            className="border  lg:hidden rounded-md p-1 bg-blue-500 text-white hover:bg-blue-600 transition duration-300 ease-in-out intent"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fas fa-play-circle"></i>
          </a>

          <a
            href={`/api/download?path=${path}&id=${item.id}`}
            className="border rounded-md p-1 bg-blue-500 text-white hover:bg-blue-600 transition duration-300 ease-in-out"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fas fa-download"></i>
          </a>

          <a
            href={`Potplayer://${Origin}/api/download?path=${path}&id=${item.id}`}
            className="lg:inline-block text-center border hidden rounded-md px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 potplayer "
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fas fa-play-circle"></i>
          </a>
        </div>
      </div>
    </div>
  );
}
