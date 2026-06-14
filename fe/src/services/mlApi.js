const ML_BASE = import.meta.env.VITE_ML_URL || "http://localhost:8000";

export const mlApi = {
  /** Kiểm tra ML server còn sống không */
  health: async () => {
    const res = await fetch(`${ML_BASE}/health`);
    if (!res.ok) throw new Error("ML server không phản hồi");
    return res.json();
  },

  /**
   * Dự đoán số vé bán cho một suất chiếu
   * @param {{ start_time: string, base_price: number, duration_min: number, genres: string[], avg_rating: number, review_count: number }} payload
   */
  predict: async (payload) => {
    const res = await fetch(`${ML_BASE}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Dự đoán thất bại");
    }
    return res.json();
  },

  /** Lấy thống kê tổng quan từ DB */
  analytics: async () => {
    const res = await fetch(`${ML_BASE}/analytics`);
    if (!res.ok) throw new Error("Không lấy được analytics");
    return res.json();
  },

  /** Xem mức độ quan trọng của từng feature */
  featureImportance: async () => {
    const res = await fetch(`${ML_BASE}/feature-importance`);
    if (!res.ok) throw new Error("Không lấy được feature importance");
    return res.json();
  },
};
