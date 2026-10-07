import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../context/Auth";
import classNames from "classnames";

// The spreadsheet code brings the Excel library with it (about 1 MB), so it is
// loaded when Export / Import is used, not with every Edit Product page.
const loadFaqSpreadsheet = () => import("./faqSpreadsheet");

const plural = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`;

export default function ProductFAQ({ productId, productSlug }) {
  const auth = useAuth();
  const [faqs, setFaqs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Import / Export State
  const fileInputRef = useRef(null);
  const [busy, setBusy] = useState(null); // null | "export" | "import"
  const [importReport, setImportReport] = useState(null);
  // Slug reported by the FAQ endpoint — names the export when no productSlug prop is given.
  const [fetchedSlug, setFetchedSlug] = useState("");

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");
  const [editStatus, setEditStatus] = useState("Published");

  // Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [newStatus, setNewStatus] = useState("Published");

  // Fetch FAQs for this product
  const fetchFaqs = async () => {
    if (!productId) return;
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${auth.ip}get/all/product/faqs/${productId}`
      );
      if (response.data.status === 201) {
        setFaqs(response.data.product.faqDetails || []);
        setFetchedSlug(response.data.product.producturl || "");
      } else {
        setFaqs([]);
      }
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      setFaqs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, [productId]);

  // Open Edit Modal
  const openEditModal = (faq) => {
    setSelectedFaq(faq);
    setEditQuestion(faq.question || "");
    setEditAnswer(faq.answer || "");
    setEditStatus(faq.status || "Published");
    setIsEditModalOpen(true);
  };

  // Close Edit Modal
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedFaq(null);
  };

  // Handle Edit Submit
  const handleEditSubmit = async () => {
    if (!selectedFaq) return;
    if (!editQuestion.trim() || !editAnswer.trim()) {
      toast.error("Please fill in both question and answer.");
      return;
    }

    try {
      const response = await axios.patch(
        `${auth.ip}update/product/faq/${selectedFaq._id}`,
        {
          question: editQuestion,
          answer: editAnswer,
          status: editStatus,
        }
      );

      if (response.status === 200) {
        toast.success("FAQ updated successfully!");
        setFaqs((prevFaqs) =>
          prevFaqs.map((faq) =>
            faq._id === selectedFaq._id
              ? {
                  ...faq,
                  question: editQuestion,
                  answer: editAnswer,
                  status: editStatus,
                }
              : faq
          )
        );
        closeEditModal();
      } else {
        toast.error("Failed to update the FAQ.");
      }
    } catch (error) {
      console.error("Error updating FAQ:", error);
      toast.error("An error occurred while updating the FAQ.");
    }
  };

  // Handle Delete
  const handleDelete = async (faqId) => {
    if (window.confirm("Are you sure you want to delete this FAQ?")) {
      try {
        const response = await axios.delete(
          `${auth.ip}delete/product/faq/${faqId}`
        );
        if (response.status === 200) {
          toast.success("FAQ deleted successfully!");
          fetchFaqs();
        } else {
          toast.error(response.data.message || "Failed to delete the FAQ.");
        }
      } catch (error) {
        console.error("Error deleting FAQ:", error);
        toast.error("An error occurred while deleting the FAQ.");
      }
    }
  };

  // Open Add Modal
  const openAddModal = () => {
    setNewQuestion("");
    setNewAnswer("");
    setNewStatus("Published");
    setIsAddModalOpen(true);
  };

  // Close Add Modal
  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  // Handle Add Submit
  const handleAddSubmit = async () => {
    if (!newQuestion.trim() || !newAnswer.trim()) {
      toast.error("Please fill in both question and answer.");
      return;
    }

    try {
      const response = await axios.post(`${auth.ip}post/product/faq`, {
        faqDetails: {
          productId: productId,
          question: newQuestion,
          answer: newAnswer,
          status: newStatus,
        },
      });

      if (response.status === 201) {
        toast.success("FAQ added successfully!");
        fetchFaqs();
        closeAddModal();
      } else {
        toast.error("Failed to add the FAQ.");
      }
    } catch (error) {
      console.error("Error adding FAQ:", error);
      toast.error("An error occurred while adding the FAQ.");
    }
  };

  // Move FAQ up/down
  const moveFaq = async (index, direction) => {
    const newFaqs = [...faqs];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newFaqs.length) return;

    // Swap
    [newFaqs[index], newFaqs[targetIndex]] = [newFaqs[targetIndex], newFaqs[index]];
    setFaqs(newFaqs);

    // Update order in backend
    try {
      await axios.post(`${auth.ip}reorder/product/faqs`, {
        productId: productId,
        faqOrder: newFaqs.map((faq, idx) => ({ id: faq._id, order: idx })),
      });
    } catch (error) {
      console.error("Error reordering FAQs:", error);
      // Revert on error
      fetchFaqs();
    }
  };

  // Export the on-screen FAQs (in their current order) as a spreadsheet
  const handleExport = async () => {
    setBusy("export");
    try {
      const { buildFaqWorkbook, faqExportFilename } = await loadFaqSpreadsheet();
      const workbook = await buildFaqWorkbook(faqs);
      const buffer = await workbook.xlsx.writeBuffer();
      const url = URL.createObjectURL(
        new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        })
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = faqExportFilename(productSlug || fetchedSlug || productId);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(
        faqs.length
          ? `Exported ${plural(faqs.length, "FAQ")}.`
          : "Exported a template — this product has no FAQs yet."
      );
    } catch (error) {
      console.error("Error exporting FAQs:", error);
      toast.error("Could not build the Excel file.");
    } finally {
      setBusy(null);
    }
  };

  // Import FAQs from a picked .xlsx / .csv file
  const handleFilePicked = async (event) => {
    const file = event.target.files?.[0];
    // Reset immediately so picking the same file twice still fires onChange.
    event.target.value = "";
    if (!file || !productId) return;

    const isExcel = /\.xlsx$/i.test(file.name);
    if (!isExcel && !/\.csv$/i.test(file.name)) {
      toast.error("Please choose a .xlsx or .csv file.");
      return;
    }

    setBusy("import");
    setImportReport(null);

    try {
      const { planFaqImport, readFaqCsv, readFaqWorkbook } =
        await loadFaqSpreadsheet();

      let parsed;
      try {
        parsed = isExcel
          ? await readFaqWorkbook(await file.arrayBuffer())
          : readFaqCsv(await file.text());
      } catch (error) {
        console.error("Error reading FAQ file:", error);
        toast.error("Could not read that file — is it a valid .xlsx or .csv?");
        return;
      }

      const missing = ["question", "answer"].filter(
        (column) => !parsed.headers.includes(column)
      );
      if (missing.length > 0) {
        toast.error(
          `Missing the ${missing.map((column) => `'${column}'`).join(" and ")} ` +
            `column${missing.length === 1 ? "" : "s"} — export a file first to get the right headers.`
        );
        return;
      }

      // Duplicates are checked against the live list, not the on-screen one:
      // that is emptied when a fetch fails, which would re-add every FAQ.
      let currentFaqs;
      try {
        const response = await axios.get(
          `${auth.ip}get/all/product/faqs/${productId}`
        );
        if (response.data.status !== 201) {
          throw new Error(response.data.message || "Unexpected response");
        }
        currentFaqs = response.data.product.faqDetails || [];
      } catch (error) {
        console.error("Error loading FAQs before import:", error);
        toast.error("Could not check the existing FAQs — nothing was imported.");
        return;
      }
      setFaqs(currentFaqs);

      const plan = planFaqImport(parsed.rows, currentFaqs);
      const summary =
        `${plural(plan.toAdd.length, "new FAQ")} to add, ` +
        `${plural(plan.duplicates, "duplicate")} skipped, ` +
        `${plural(plan.invalid.length, "invalid row")}`;
      const report = {
        fileName: file.name,
        cancelled: false,
        added: 0,
        ready: plan.toAdd.length,
        duplicates: plan.duplicates,
        invalid: plan.invalid.length,
        failed: 0,
        samples: plan.samples,
        problems: plan.invalid,
      };

      if (plan.toAdd.length === 0) {
        if (plan.duplicates + plan.invalid.length + plan.samples === 0) {
          toast.error("That file has no FAQ rows.");
        } else {
          setImportReport(report);
          toast.info(`Nothing to import — ${summary}.`);
        }
        return;
      }

      const confirmed = window.confirm(
        `Import FAQs from "${file.name}":\n\n` +
          `• ${plural(plan.toAdd.length, "new FAQ")} to add\n` +
          `• ${plural(plan.duplicates, "duplicate")} skipped\n` +
          `• ${plural(plan.invalid.length, "invalid row")}\n` +
          `\nProceed with the import?`
      );
      if (!confirmed) {
        // Leave the counts on screen so invalid rows can be fixed in the file.
        setImportReport({ ...report, cancelled: true });
        return;
      }

      // One request at a time: the backend appends each FAQ after the last,
      // so sequential posts keep the file's order.
      let added = 0;
      const failures = [];
      for (const faq of plan.toAdd) {
        try {
          const response = await axios.post(`${auth.ip}post/product/faq`, {
            faqDetails: {
              productId: productId,
              question: faq.question,
              answer: faq.answer,
              status: faq.status,
            },
          });
          if (response.status === 201) {
            added += 1;
          } else {
            failures.push({
              rowNumber: faq.rowNumber,
              reason: `Not added — ${response.data?.message || "the server rejected it"}`,
            });
          }
        } catch (error) {
          console.error("Error importing FAQ:", error);
          failures.push({
            rowNumber: faq.rowNumber,
            reason: `Not added — ${
              error.response?.data?.message || error.message || "request failed"
            }`,
          });
        }
      }

      await fetchFaqs();

      setImportReport({
        ...report,
        added,
        failed: failures.length,
        problems: [...plan.invalid, ...failures].sort(
          (a, b) => a.rowNumber - b.rowNumber
        ),
      });

      if (failures.length === 0) {
        toast.success(`Imported ${plural(added, "FAQ")}.`);
      } else if (added > 0) {
        toast.warn(
          `Imported ${added} of ${plural(plan.toAdd.length, "FAQ")} — ${failures.length} failed, see the report.`
        );
      } else {
        toast.error("Import failed — no FAQs were added.");
      }
    } catch (error) {
      console.error("Error importing FAQs:", error);
      toast.error("An error occurred while importing FAQs.");
    } finally {
      setBusy(null);
    }
  };

  // Calculate stats
  const totalFaqs = faqs.length;
  const publishedCount = faqs.filter((f) => f.status === "Published").length;
  const draftCount = faqs.filter((f) => f.status === "Draft").length;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Product FAQs</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage frequently asked questions for this product
          </p>
        </div>
        <div className="flex flex-wrap items-stretch gap-2">
          {/* Export */}
          <button
            type="button"
            onClick={handleExport}
            disabled={busy !== null || isLoading}
            title="Excel file with the FAQs in their current order, plus an Instructions sheet"
            className="inline-flex items-center gap-2 rounded-md bg-white border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
            </svg>
            {busy === "export" ? "Building…" : "Export FAQs"}
          </button>

          {/* Import */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={busy !== null || !productId}
            title="Add FAQs from a .xlsx or .csv file — existing questions are skipped"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 9l5-5 5 5M12 4v12" />
            </svg>
            {busy === "import" ? "Importing…" : "Import FAQs"}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={handleFilePicked}
            className="hidden"
          />

          <button
            onClick={openAddModal}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Add FAQ
          </button>
        </div>
      </div>

      {/* Import Report */}
      {importReport && (
        <div className="mb-6 rounded-md border border-gray-200 bg-gray-50 p-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="font-medium text-gray-800">
              {importReport.cancelled
                ? "Import cancelled — nothing was added"
                : "Import report"}
              <span className="font-normal text-gray-500"> · {importReport.fileName}</span>
            </span>
            <button
              type="button"
              onClick={() => setImportReport(null)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Dismiss
            </button>
          </div>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-gray-700">
            {importReport.cancelled ? (
              <span>Ready to add: <b>{importReport.ready}</b></span>
            ) : (
              <span>Added: <b>{importReport.added}</b></span>
            )}
            <span>Skipped (duplicates): <b>{importReport.duplicates}</b></span>
            <span className={importReport.invalid ? "text-amber-700" : ""}>
              Invalid: <b>{importReport.invalid}</b>
            </span>
            {importReport.failed > 0 && (
              <span className="text-red-600">Failed: <b>{importReport.failed}</b></span>
            )}
          </div>

          {importReport.samples > 0 && (
            <p className="mt-2 text-gray-600">
              Ignored {plural(importReport.samples, "template row")}.
            </p>
          )}

          {importReport.problems.length > 0 && (
            <ul className="mt-2 max-h-40 overflow-y-auto list-disc pl-5 text-gray-600">
              {importReport.problems.map((problem) => (
                <li key={`${problem.rowNumber}-${problem.reason}`}>
                  Row {problem.rowNumber}: {problem.reason}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{totalFaqs}</div>
          <div className="text-sm text-gray-500">Total FAQs</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{publishedCount}</div>
          <div className="text-sm text-gray-500">Published</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{draftCount}</div>
          <div className="text-sm text-gray-500">Draft</div>
        </div>
      </div>

      {/* FAQs List */}
      {isLoading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading FAQs...</p>
        </div>
      ) : faqs.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-12 h-12 mx-auto text-gray-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
            />
          </svg>
          <p className="mt-2 text-gray-500">No FAQs yet for this product.</p>
          <button
            onClick={openAddModal}
            className="mt-4 text-primary hover:text-primary/80 font-medium"
          >
            Add the first FAQ
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={faq._id || index}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-primary font-semibold">Q{index + 1}.</span>
                    <span
                      className={classNames(
                        "text-xs font-medium px-2 py-0.5 rounded-full",
                        {
                          "bg-blue-100 text-blue-600": faq.status === "Published",
                          "bg-yellow-100 text-yellow-600": faq.status === "Draft",
                        }
                      )}
                    >
                      {faq.status}
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">{faq.question}</h4>
                  <p className="text-gray-600 text-sm">{faq.answer}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {/* Move Up */}
                  <button
                    onClick={() => moveFaq(index, "up")}
                    disabled={index === 0}
                    className={`p-1 rounded ${
                      index === 0
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    }`}
                    title="Move Up"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m4.5 15.75 7.5-7.5 7.5 7.5"
                      />
                    </svg>
                  </button>
                  {/* Move Down */}
                  <button
                    onClick={() => moveFaq(index, "down")}
                    disabled={index === faqs.length - 1}
                    className={`p-1 rounded ${
                      index === faqs.length - 1
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    }`}
                    title="Move Down"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m19.5 8.25-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </button>
                  {/* Edit */}
                  <button
                    onClick={() => openEditModal(faq)}
                    className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                    title="Edit"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z"
                      />
                    </svg>
                  </button>
                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(faq._id)}
                    className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                    title="Delete"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit FAQ Modal */}
      {isEditModalOpen && selectedFaq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Edit FAQ</h3>
              <button
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question *
                </label>
                <input
                  type="text"
                  value={editQuestion}
                  onChange={(e) => setEditQuestion(e.target.value)}
                  placeholder="Enter the question..."
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Answer *
                </label>
                <textarea
                  rows="5"
                  value={editAnswer}
                  onChange={(e) => setEditAnswer(e.target.value)}
                  placeholder="Enter the answer..."
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary"
                >
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button
                onClick={closeEditModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update FAQ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add FAQ Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Add New FAQ</h3>
              <button
                onClick={closeAddModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question *
                </label>
                <input
                  type="text"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Enter the question..."
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Answer *
                </label>
                <textarea
                  rows="5"
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  placeholder="Enter the answer..."
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary"
                >
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button
                onClick={closeAddModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add FAQ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

ProductFAQ.propTypes = {
  productId: PropTypes.string,
  /** Only used to name the exported file; falls back to productId. */
  productSlug: PropTypes.string,
};
