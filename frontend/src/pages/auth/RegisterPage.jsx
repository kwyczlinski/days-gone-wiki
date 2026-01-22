import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";

const schema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
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

  const onSubmit = async (data) => {
    const isEmailUsed = false;
    // #TMP ADD VERIFY EMAIL IN API & DB
    if (isEmailUsed) {
      setError("email", { type: "manual", message: "Email is already used" });
      return;
    }
    try {
      // #TMP ADD API & DB CREATE ACCOUNT
      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <h2>Create Account</h2>

        <label>Email</label>
        <input {...register("email")} autoFocus />
        <p>{errors.email?.message}</p>

        <label>Password</label>
        <input {...register("password")} type="password" />
        <p>{errors.password?.message}</p>

        <label>Confirm Password</label>
        <input {...register("confirmPassword")} type="password" />
        <p>{errors.confirmPassword?.message}</p>

        <div>
          <button>Complete</button>
        </div>

        <Link to="/login">Already have an account? Log in</Link>
      </form>
    </div>
  );
};
