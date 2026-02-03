import React from "react";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "react-toastify";
import { useUserCtx } from "../../contexts/UserContext";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const deleteSchema = yup.object({
  password: yup.string().required("Password is required"),
});

export function DeleteEditForm() {
  const { userId, clearUser } = useUserCtx();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(deleteSchema),
    mode: "onBlur",
  });

  const onSubmit = async ({ password }) => {
    try {
      const res = await fetch(`${API_URL}/user/${userId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete account");
      }
      clearUser();
      toast.info("Account deleted successfully");
      navigate("/");
    } catch (err) {
      toast.error("Failed to delete account");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h3>To delete account type current password below</h3>
      <label>Current password</label>
      <input
        {...register("password")}
        type="password"
        autoComplete="new-password"
      />
      <p>{errors.password?.message}</p>
      <button type="submit">Delete Account</button>
    </form>
  );
}
