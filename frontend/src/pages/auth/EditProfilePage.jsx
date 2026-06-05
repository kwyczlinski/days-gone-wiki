import { AuthGuard } from "../../components/guard/AuthGuard";
import { UsernameEditForm } from "../../components/profileEdit/UsernameEditForm";
import { LoginEditForm } from "../../components/profileEdit/LoginEditForm";
import { DeleteEditForm } from "../../components/profileEdit/DeleteEditForm";
import { Navbar } from "../../components/navbar/Navbar";

export const EditProfilePage = () => {
  return (
    <AuthGuard>
      <Navbar />
      <h2>Edit Account</h2>
      <UsernameEditForm />
      <hr />
      <LoginEditForm />
      <hr />
      <DeleteEditForm />
    </AuthGuard>
  );
};
