import React, { useEffect } from "react";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useUserCtx } from "../../contexts/UserContext";

const API_URL = import.meta.env.VITE_API_URL;

const protectedSchema = yup.object({
  email: yup
    .string()
    .email("Invalid email")
    .max(256, "Email cannot exceed 256 characters")
    .required("Email is required"),
  currentPassword: yup
    .string()
    .required("Current password is required to save any changes"),
  newPassword: yup
    .string()
    .transform((value) => (value === "" ? undefined : value))
    .nullable()
    .notRequired()
    .when([], {
      is: (val) => val && val.length > 0,
      then: (schema) =>
        schema
          .min(8, "Password must be at least 8 characters")
          .matches(/[a-z]/, "Must contain at least one lowercase letter")
          .matches(/[A-Z]/, "Must contain at least one uppercase letter")
          .matches(/[0-9]/, "Must contain at least one number")
          .matches(
            /[!@#$%^&*(),.?":{}|<>]/,
            "Must contain at least one special character"
          ),
    }),
  confirmPassword: yup.string().when("newPassword", {
    is: (val) => val && val.length > 0,
    then: (schema) =>
      schema
        .oneOf([yup.ref("newPassword")], "Passwords do not match")
        .required("Please confirm your new password"),
    otherwise: (schema) => schema.notRequired(),
  }),
});

export function LoginEditForm() {
  const { userId, email, clearUser } = useUserCtx();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(protectedSchema),
    mode: "onBlur",
    defaultValues: {
      email: email || "",
    },
  });

  useEffect(() => {
    if (email) {
      reset({ email });
    }
  }, [email, reset]);

  const onSubmit = async (data) => {
    try {
      const res = await fetch(`${API_URL}/user/login/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          currentPassword: data.currentPassword,
          newPassword: data.newPassword ? data.newPassword : "",
        }),
        credentials: "include",
      });

      const result = await res.json();

      if (!res.ok) {
        if (res.status === 403) {
          setError("currentPassword", {
            message: "Current password is incorrect",
          });
          return;
        }
        throw new Error(result.error || "Failed to update security data");
      }

      toast.success(
        "Login information updated. Please log in with your new credentials."
      );
      clearUser();
      navigate("/login");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h3>Change Email & Password</h3>

      <label>Email</label>
      <input {...register("email")} type="email" />
      <p>{errors.email?.message}</p>

      <label>Current Password (to confirm changes)</label>
      <input
        {...register("currentPassword")}
        type="password"
        autoComplete="new-password"
      />
      <p>{errors.currentPassword?.message}</p>

      <label>New Password</label>
      <input {...register("newPassword")} type="password" />
      <p>{errors.newPassword?.message}</p>

      <label>Confirm New Password</label>
      <input {...register("confirmPassword")} type="password" />
      <p>{errors.confirmPassword?.message}</p>

      <button type="submit">Update login credentials</button>
    </form>
  );
}
