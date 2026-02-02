import { AuthGuard } from "../../components/guard/AuthGuard";
import { UsernameEditForm } from "../../components/profileEdit/UsernameEditForm";
import { LoginEditForm } from "../../components/profileEdit/LoginEditForm";
import { DeleteEditForm } from "../../components/profileEdit/DeleteEditForm";

export const EditProfilePage = () => {
  return (
    <AuthGuard>
      <h2>Edit Account</h2>
      <UsernameEditForm />
      <hr />
      <LoginEditForm />
      <hr />
      <DeleteEditForm />
    </AuthGuard>
  );
};
