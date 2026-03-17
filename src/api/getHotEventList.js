import instance from "@/api/axios";

export async function getHotEventList() {
  try {
    const res = await instance.get("/api/v1/school_articles/hot");
    return res.data;
  } catch (error) {
    console.error("[API] 에러 발생:", error);
    throw error;
  }
}
