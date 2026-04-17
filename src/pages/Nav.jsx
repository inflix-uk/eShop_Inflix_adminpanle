import { React, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/Auth";
export default function Nav() {
  const auth = useAuth();
  const [isSticky, setIsSticky] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth > 768) {
        if (window.scrollY > window.innerHeight * 0.3) {
          setIsSticky(true);
        } else {
          setIsSticky(false);
        }
      } else {  
        setIsSticky(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const determineDestination = () => {
    if (!auth.user) {
      return '/';
    } else if (auth.user.role === 'admin') {
      return '/admin/dashboard';
    } else if (auth.user.role === 'user') {
      return '/';
    } else {
      return '/';
    }
  };
  return (
    <>
      {/* upper nav with search icon */}
      <div className={`bg-white border-b border-primary py-4 ${isSticky ? 'fixed top-0 left-0 w-full z-10' : ''}`}>
        <div className="mx-auto max-w-7xl lg:px-8 ">
          <nav className="px-4 py-0">
            <div className="max-w-screen-xl mx-auto flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex items-center lg:flex-1 lg:items-center me-20 md:me-0">
                  <Link to={"/"}>
                    <img src="/inflix_logo.png" className="w-40 md:ps-0" alt="Inflix" width={360} height={192} />
                  </Link>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Link
                  to={determineDestination()}
                  aria-label="Go to profile" // Provide a clear description
                >
                  <div className="flex flex-col items-center space-x-2 cursor-pointer">
                    <svg
                      className="lg:h-9 h-6 lg:w-9 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      aria-hidden="true" // Marks the icon as decorative
                    >
                      <g fill="none" stroke="#000" strokeWidth="2">
                        <circle cx="12" cy="7" r="5" />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17 14h.352a3 3 0 0 1 2.976 2.628l.391 3.124A2 2 0 0 1 18.734 22H5.266a2 2 0 0 1-1.985-2.248l.39-3.124A3 3 0 0 1 6.649 14H7"
                        />
                      </g>
                    </svg>
                    <p className="text-base font-medium text-gray-500">Account</p>
                  </div>
                </Link>

              </div>
            </div>
          </nav>

        </div>
      </div>
    </>
  );
}
