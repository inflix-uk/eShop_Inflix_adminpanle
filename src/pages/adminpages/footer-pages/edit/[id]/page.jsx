"use client";

import { useParams } from "react-router-dom";
import CreateFooterPage from "../../create/page";

export default function EditFooterPage() {
  // The CreateFooterPage component will handle getting the id from useParams
  return <CreateFooterPage />;
}
