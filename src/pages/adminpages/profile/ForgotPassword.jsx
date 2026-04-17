import {  useState } from "react";
import LoadingBar from "react-top-loading-bar";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet-async";
import { sendPasswordResetEmail, validateEmail } from "./services/profileService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [progress, setProgress] = useState(0);

  const resetPass = async (e) => {
    e.preventDefault();
    setProgress(50);

    // Validate email
    const validation = validateEmail(email);
    if (!validation.isValid) {
      toast.error(validation.message);
      setProgress(100);
      return;
    }

    // Send password reset email
    const response = await sendPasswordResetEmail(email);

    if (response.success) {
      toast.success(response.message);
    } else {
      toast.error(response.message);
    }

    setProgress(100);
  };
  return (
    <>
      <Helmet>
        <title>Forgot Password</title>
      </Helmet>
      <LoadingBar
        color="#2563EB"
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
      />

      <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img
            className="mx-auto h-20 w-auto"
            src="/inflix_logo.png"
            alt="Inflix"
          />
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Reset Password
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" onSubmit={resetPass}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 px-2"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                onClick={resetPass}
              >
                Send Password reset link
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
