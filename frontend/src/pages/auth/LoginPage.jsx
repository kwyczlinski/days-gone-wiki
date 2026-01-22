import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { GuestGuard } from "../../components/guard/GuestGuard";
import { useUserCtx } from "../../contexts/UserContext";
import { Link, useNavigate } from "react-router-dom";

const schema = yup
  .object({
    email: yup.string().email("Invalid email").required("Email is required"),
    password: yup
      .string()
      .min(8, "Password must be at least 8 characters")
      .required("Password is required"),
  })
  .required();

export const LoginPage = () => {
  const { setUser } = useUserCtx();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      const [session_token, userId] = [null, null];
      // #TMP ADD CREATE SESSION TO API & DB
      setUser({ session_token, userId });
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <GuestGuard>
      <form onSubmit={handleSubmit(onSubmit)}>
        <h1>Log in</h1>

        <label htmlFor="email">Email</label>
        <input
          {...register("email")}
          id="email"
          type="email"
          placeholder="Email"
          autoFocus
        />
        <p>{errors.email?.message}</p>

        <label htmlFor="password">Password</label>
        <input
          {...register("password")}
          id="password"
          type="password"
          placeholder="Password"
        />
        <p>{errors.password?.message}</p>

        <button type="submit">Log in</button>

        <Link to="/register">Register</Link>
      </form>
    </GuestGuard>
  );
};
