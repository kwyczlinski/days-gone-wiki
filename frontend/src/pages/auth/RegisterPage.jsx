import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { hashPassword } from "../../lib/auth";
import { GuestGuard } from "../../components/guard/GuestGuard";

const API_URL = import.meta.env.VITE_API_URL;

const schema = yup.object({
  username: yup
    .string()
    .matches(
      /^[a-zA-Z0-9]*$/,
      "Username can not contain any special characters"
    )
    .max(16, "Username can not exceed 16 chracters")
    .required("Username is required"),
  email: yup
    .string()
    .email("Invalid email")
    .max(256, "Email can not exceed 256 characters")
    .required("Email is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(256, "Password can not exceed 256 characters")
    .matches(/[a-z]/, "Passowrd must contain at least one lower letter")
    .matches(/[A-Z]/, "Passowrd must contain at least one capital letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Password must contain at least one special character"
    )
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords do not match"),
});

export const RegisterPage = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onBlur",
  });

  const onSubmit = async ({ username, email, password }) => {
    const clientHashedPassword = await hashPassword(password);

    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password: clientHashedPassword,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        if (result.error && result.error.includes("Email")) {
          setError("email", {
            type: "manual",
            message: "Email is already used",
          });
        }
        throw new Error(result.error || "Registration failed");
      }

      toast.success("Registered successfully");
      navigate("/login");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <GuestGuard>
      <form onSubmit={handleSubmit(onSubmit)}>
        <h2>Create Account</h2>

        <label>Email</label>
        <input {...register("email")} autoFocus type="text" />
        <p>{errors.email?.message}</p>

        <label>Username</label>
        <input {...register("username")} type="text" />
        <p>{errors.username?.message}</p>

        <label>Password</label>
        <input {...register("password")} type="password" />
        <p>{errors.password?.message}</p>

        <label>Confirm Password</label>
        <input {...register("confirmPassword")} type="password" />
        <p>{errors.confirmPassword?.message}</p>

        <div>
          <button type="submit">Complete</button>
        </div>

        <Link to="/login">Already have an account? Log in</Link>
      </form>
    </GuestGuard>
  );
};
