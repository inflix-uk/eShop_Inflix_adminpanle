import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import LoadingBar from "react-top-loading-bar";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet-async";
import {
  resetPasswordWithToken,
  validatePasswordStrength,
  validatePasswordMatch
} from "./services/profileService";

export default function ResetPass() {
  const { token } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = location.state?.path || "/";
  const [password, setPassword] = useState("");
  const [Cpassword, setCPassword] = useState("");
  const [progress, setProgress] = useState(0);

  const handleLogin = async (e) => {
    e.preventDefault();
    setProgress(50);

    // Validate password strength
    const strengthValidation = validatePasswordStrength(password);
    if (!strengthValidation.isValid) {
      toast.error(strengthValidation.message);
      setProgress(100);
      return;
    }

    // Validate passwords match
    const matchValidation = validatePasswordMatch(password, Cpassword);
    if (!matchValidation.isValid) {
      toast.error(matchValidation.message);
      setProgress(100);
      return;
    }

    // Reset password using token
    const response = await resetPasswordWithToken(token, password);

    if (response.success) {
      toast.success(response.message);
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 3000);
    } else {
      toast.error(response.message);
    }

    setProgress(100);
  };
  return (
    <>
      <LoadingBar
        color="#2563EB"
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
      />
      <Helmet>
        <title>Reset Password</title>
      </Helmet>
      <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img
            className="mx-auto h-20 w-auto"
            src="/inflix_logo.png"
            alt="Inflix"
          />
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Enter New Password
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Password
                </label>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 px-2"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="Cpassword"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Confirm Password
                </label>
              </div>
              <div className="mt-2">
                <input
                  id="Cpassword"
                  name="Cpassword"
                  type="password"
                  autoComplete="new-password"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 px-2"
                  value={Cpassword}
                  onChange={(e) => setCPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              // onClick={handleLogin}
              >
                Reset Password
              </button>
            </div>
          </form>
          {/* <p className="mt-10 text-center text-sm text-gray-500">
            Don't have an accocunt?{" "}
            <Link
              to={"/admin/create-account"}
              className="font-semibold text-primary hover:text-primary"
            >
              Create Now
            </Link>
          </p> */}
        </div>
      </div>
    </>
  );
}
