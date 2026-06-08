import { useCallback, useState } from "react";
import { toast } from "react-toastify";

const API_URL = window._env_?.VITE_API_URL || import.meta.env.VITE_API_URL;

export const useComments = (category, itemId) => {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadComments = useCallback(async () => {
    setIsLoading(true);

    try {
      const res = await fetch(
        `${API_URL}/comment?category=${category}&itemId=${itemId}`
      );

      if (!res.ok) throw new Error("Not found");

      const result = await res.json();
      setComments(Array.isArray(result) ? result : []);
    } catch (err) {
      console.log(err);
      toast.warning("Failed to load comments");
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  }, [category, itemId]);

  return {
    comments,
    isLoading,
    reload: loadComments,
  };
};