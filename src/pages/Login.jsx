import  { useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/Auth";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import Nav from "./Nav";
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
export default function Login() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpRequired, setOtpRequired] = useState(false);
  const [otpExpired, setOtpExpired] = useState(false); // Track if the OTP has expired
  const [errState, setErrState] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = useCallback((setter) => (e) => {
    setter(e.target.value);
    setErrState(false);
  }, []);

  const handleLogin = useCallback(async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Enter a valid Email");
      setErrState(true);
      return;
    }

    if (!password) {
      toast.error("Enter a valid Password");
      setErrState(true);
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}logout`, {}, { withCredentials: true });
      const response = await axios.post(`${API_BASE_URL}login`, { email, password }, { withCredentials: true });

      if (response.data.status === 201) {
        toast.success(response.data.message);

        if (response.data.otpRequired) {
          setOtpRequired(true);
          setOtpExpired(false); // Reset expired state when a new OTP is requested
        } else {
          const user = response.data.user;
          auth.login(user);
          if (user.role === "admin" || user.role === "superadmin") {
            navigate("/admin/landing", { replace: true });
          } else if (user.role === "user") {
            navigate("/customer/dashboard", { replace: true });
          } else {
            toast.error("Invalid user role");
          }
        }
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Login failed. Please try again.");
    }
  }, [email, password, auth, navigate]);

  const handleOtpSubmit = useCallback(async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${API_BASE_URL}logout`, {}, { withCredentials: true });
      const response = await axios.post(`${API_BASE_URL}login`, { email, password, enteredOtp: otp }, { withCredentials: true });

      if (response.data.status === 201) {
        toast.success(response.data.message);
        const user = response.data.user;
        auth.login(user);
        navigate("/admin/landing", { replace: true });
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("OTP verification failed. Please try again.");
    }
  }, [otp, email, password, auth, navigate]);
  return (
    <>
      <Nav />
      {/* <LoadingBar color="#2563EB" progress={progress} onLoaderFinished={() => setProgress(0)} /> */}
      <div className="flex  flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          {/* <Link to="/">
            <img className="mx-auto h-20 w-auto" src={our store} alt="Your Company" />
          </Link> */}
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            {otpRequired ? "Enter OTP" : "Admin Sign in"}
          </h2>
        </div>
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          {otpRequired ? (
            // OTP input section with timer
            <form className="space-y-6" onSubmit={handleOtpSubmit}>
              <div>
                <label htmlFor="otp" className="block text-sm font-medium leading-6 text-gray-900">
                  OTP {otpExpired && <span className="text-red-600">(Expired)</span>}
                </label>
                <div className="mt-2">
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    autoComplete="one-time-code"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 px-2"
                    value={otp}
                    onChange={handleInputChange(setOtp)}
                    disabled={otpExpired} // Disable input if OTP is expired
                  />
                </div>
              </div>
              <div className="flex justify-center">
                <CountdownCircleTimer
                  isPlaying
                  duration={600} // 10 minutes in seconds
                  colors={['#2563EB', '#F7B801', '#A30000']}
                  colorsTime={[600, 300, 0]}
                  onComplete={() => {
                    setOtpExpired(true); // Set the OTP as expired when the timer finishes
                    toast.error("OTP has expired. Please request a new one.");
                    return { shouldRepeat: false };
                  }}
                >
                  {({ remainingTime }) => {
                    const minutes = Math.floor(remainingTime / 60);
                    const seconds = remainingTime % 60;
                    return (
                      <div className="text-xl">
                        {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
                      </div>
                    );
                  }}
                </CountdownCircleTimer>
              </div>
              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  disabled={otpExpired} // Disable the submit button if OTP has expired
                >
                  Verify OTP
                </button>
              </div>
            </form>
          ) : (
            // Email/Password input section
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 px-2"
                    value={email}
                    onChange={handleInputChange(setEmail)}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                    Password
                  </label>
                  <div className="text-sm">
                    <Link
                      to={"/admin/forgot-password"}
                      className="font-semibold text-primary hover:text-primary"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>
                <div className="mt-2 relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder="Password"
                    value={password}
                    onChange={handleInputChange(setPassword)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  />
                  <span
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#2563EB" className="h-6 w-6 text-blue-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="gray" className="h-6 w-6 text-gray-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    )}
                  </span>
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  Sign in
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
