import React from "react";
import { Link } from "react-router-dom";

export default function BreadCrumb({ breadCrumb }) {
  return (
    <div className="container max-w-screen-xl mx-auto flex md:flex-row mt-10 px-10 ">
      <nav className="flex mb-4 text-sm text-gray-600" aria-label="Breadcrumb">
        <ol role="list" className="flex items-center">
          <li>
            <div>
              <Link to="/" className="hover:underline">
                Home
                <span className="sr-only">Home</span>
              </Link>
            </div>
          </li>
          <li>
            <span className="mx-2">»</span>
          </li>
          {breadCrumb.map((page) => (
            <li key={page.name}>
              <div className="flex items-center">
                <Link
                  to={page.link}
                  className="text-sm font-medium text-gray-500 hover:text-gray-700 hover:underline"
                  aria-current={page.current ? "page" : undefined}
                >
                  {page.name}
                </Link>
              </div>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}
