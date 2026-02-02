import React, { useEffect } from "react";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "react-toastify";
import { useUserCtx } from "../../contexts/UserContext";

const API_URL = import.meta.env.VITE_API_URL;

const usernameSchema = (currentUsername) =>
  yup.object({
    username: yup
      .string()
      .matches(
        /^[a-zA-Z0-9]*$/,
        "Username can not contain any special characters",
      )
      .max(16, "Username can not exceed 16 chracters")
      .not([currentUsername], "This is already your current username")
      .required("Username is required"),
  });

export function UsernameEditForm() {
  const { username, userId, setUser } = useUserCtx();

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(usernameSchema(username)),
    mode: "onBlur",
    defaultValues: {
      username: username || "",
    },
  });

  useEffect(() => {
    if (username) {
      reset({ username });
    }
  }, [username, reset]);

  const onSubmit = async ({ username: newUsername }) => {
    try {
      const res = await fetch(`${API_URL}/user/username/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username: newUsername,
        }),
      });
      if (!res.ok) throw new Error("Failed to change username");
      setUser((prev) => ({ ...prev, username: newUsername }));
      toast.success(`Changed username to ${newUsername}`);
    } catch (err) {
      toast.error("Failed to change username");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <label>Change username</label>
      <label>Username</label>
      <input {...register("username")} type="text" autoComplete="username" />
      <p>{errors.username?.message}</p>
      <div>
        <button type="submit">Change username</button>
      </div>
    </form>
  );
}
