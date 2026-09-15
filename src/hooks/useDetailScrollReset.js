import { useLayoutEffect } from "react";

// 목록의 스크롤 위치를 상세 화면으로 가져오지 않는다.
const useDetailScrollReset = (id) => {
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [id]);
};

export default useDetailScrollReset;
