import React from "react";
import Imminent from "./Imminent";

const ImminentSidebar = ({
  imminentLoading,
  imminentError,
  imminentEvents,
  onEventClick,
  emptyMessage = "표시할 마감 임박 행사가 없습니다.",
}) => {
  return (
    <div className="p-4 max-w-100 rounded-3xl bg-white shadow-md flex flex-col items-center">
      <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
        🔥 마감 임박
      </h3>
      <div className="space-y-1 w-full">
        {imminentLoading && (
          <p className="text-sm text-gray-400 text-center">불러오는 중...</p>
        )}
        {imminentError && (
          <p className="text-sm text-red-400 text-center">{imminentError}</p>
        )}
        {!imminentLoading &&
          !imminentError &&
          imminentEvents.map((imminentEvent) => (
            <Imminent
              key={imminentEvent.article_id}
              title={imminentEvent.title}
              date={imminentEvent.due_date}
              onClick={() => onEventClick(imminentEvent.article_id)}
            />
          ))}
        {!imminentLoading &&
          !imminentError &&
          imminentEvents.length === 0 && (
            <p className="text-sm text-gray-400 text-center">{emptyMessage}</p>
          )}
      </div>
    </div>
  );
};

export default ImminentSidebar;
