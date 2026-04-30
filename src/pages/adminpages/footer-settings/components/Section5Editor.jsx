// import { useState, useEffect } from "react";
// import { toast } from "react-toastify";
// import { FaPlus, FaTrash, FaArrowUp, FaArrowDown } from "react-icons/fa";

// const Section5Editor = ({ data, onSave, onUploadImage, backendUrl, isSaving }) => {
//   const [formData, setFormData] = useState({
//     title: "Our Climate Impact",
//     text: "We plant a tree with every order",
//     ecologiLogo: "",
//     ecologiLink: "",
//     paymentMethods: {
//       heading: "We accept the following payment methods:",
//       logos: [],
//     },
//   });

//   useEffect(() => {
//     if (data) {
//       setFormData({
//         title: data.title || "Our Climate Impact",
//         text: data.text || "We plant a tree with every order",
//         ecologiLogo: data.ecologiLogo || "",
//         ecologiLink: data.ecologiLink || "",
//         paymentMethods: data.paymentMethods || {
//           heading: "We accept the following payment methods:",
//           logos: [],
//         },
//       });
//     }
//   }, [data]);

//   const handleFieldChange = (field, value) => {
//     setFormData((prev) => ({
//       ...prev,
//       [field]: value,
//     }));
//   };

//   const handleEcologiLogoUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     if (!file.type.startsWith("image/")) {
//       toast.error("Please select an image file");
//       return;
//     }

//     try {
//       toast.info("Uploading Ecologi logo...");
//       const result = await onUploadImage(file, "logo", backendUrl);
//       if (result.success) {
//         const imagePath = result.imagePath || result.data?.path || result.data?.imagePath;
//         console.log("Ecologi logo upload result:", result);
//         console.log("Ecologi logo image path:", imagePath);
//         setFormData((prev) => ({
//           ...prev,
//           ecologiLogo: imagePath,
//         }));
//         toast.success("Ecologi logo uploaded successfully!");
//       } else {
//         toast.error(result.message || "Failed to upload logo");
//       }
//     } catch (error) {
//       console.error("Error uploading Ecologi logo:", error);
//       toast.error("Failed to upload logo");
//     }
//   };

//   const handleAddPaymentLogo = () => {
//     const newLogo = {
//       name: "",
//       image: "",
//       isActive: true,
//       order: formData.paymentMethods.logos.length,
//     };
//     setFormData((prev) => ({
//       ...prev,
//       paymentMethods: {
//         ...prev.paymentMethods,
//         logos: [...prev.paymentMethods.logos, newLogo],
//       },
//     }));
//   };

//   const handleRemovePaymentLogo = (index) => {
//     setFormData((prev) => ({
//       ...prev,
//       paymentMethods: {
//         ...prev.paymentMethods,
//         logos: prev.paymentMethods.logos.filter((_, i) => i !== index),
//       },
//     }));
//   };

//   const handlePaymentLogoChange = (index, field, value) => {
//     setFormData((prev) => ({
//       ...prev,
//       paymentMethods: {
//         ...prev.paymentMethods,
//         logos: prev.paymentMethods.logos.map((item, i) =>
//           i === index ? { ...item, [field]: value } : item
//         ),
//       },
//     }));
//   };

//   const handlePaymentLogoUpload = async (index, file) => {
//     if (!file.type.startsWith("image/")) {
//       toast.error("Please select an image file");
//       return;
//     }

//     try {
//       toast.info("Uploading payment logo...");
//       const result = await onUploadImage(file, "payment-logo", backendUrl);
//       if (result.success) {
//         const imagePath = result.imagePath || result.data?.path || result.data?.imagePath;
//         console.log("Payment logo upload result:", result);
//         console.log("Payment logo image path:", imagePath);
//         handlePaymentLogoChange(index, "image", imagePath);
//         toast.success("Payment logo uploaded successfully!");
//       } else {
//         toast.error(result.message || "Failed to upload logo");
//       }
//     } catch (error) {
//       console.error("Error uploading payment logo:", error);
//       toast.error("Failed to upload logo");
//     }
//   };

//   const handleMovePaymentLogo = (index, direction) => {
//     const newIndex = direction === "up" ? index - 1 : index + 1;
//     if (
//       newIndex < 0 ||
//       newIndex >= formData.paymentMethods.logos.length
//     )
//       return;

//     const newLogos = [...formData.paymentMethods.logos];
//     [newLogos[index], newLogos[newIndex]] = [
//       newLogos[newIndex],
//       newLogos[index],
//     ];
//     // Update order
//     newLogos.forEach((item, i) => {
//       item.order = i;
//     });

//     setFormData((prev) => ({
//       ...prev,
//       paymentMethods: {
//         ...prev.paymentMethods,
//         logos: newLogos,
//       },
//     }));
//   };

//   const handleSave = () => {
//     onSave(formData);
//   };

//   return (
//     <div className="bg-white rounded-lg shadow p-6">
//       <h2 className="text-2xl font-bold text-gray-800 mb-6">
//         Section 5: Climate Impact
//       </h2>

//       {/* Basic Info */}
//       <div className="mb-8 space-y-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Section Title
//           </label>
//           <input
//             type="text"
//             value={formData.title}
//             onChange={(e) => handleFieldChange("title", e.target.value)}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Description Text
//           </label>
//           <input
//             type="text"
//             value={formData.text}
//             onChange={(e) => handleFieldChange("text", e.target.value)}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Ecologi Link
//           </label>
//           <input
//             type="url"
//             value={formData.ecologiLink}
//             onChange={(e) => handleFieldChange("ecologiLink", e.target.value)}
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Ecologi Logo
//           </label>
//           <div className="flex items-center gap-4">
//             {formData.ecologiLogo && (
//               <img
//                 key={formData.ecologiLogo}
//                 src={(() => {
//                   const imagePath = formData.ecologiLogo;
//                   if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
//                     return imagePath;
//                   }
//                   const cleanBackendUrl = backendUrl.replace(/\/$/, "");
//                   if (imagePath.startsWith("/uploads/")) {
//                     return `${cleanBackendUrl}${imagePath}`;
//                   }
//                   if (imagePath.startsWith("/footer/")) {
//                     return `${cleanBackendUrl}/uploads${imagePath}`;
//                   }
//                   if (imagePath.startsWith("/")) {
//                     return `${cleanBackendUrl}/uploads${imagePath}`;
//                   }
//                   return `${cleanBackendUrl}/uploads/${imagePath}`;
//                 })()}
//                 alt="Ecologi logo preview"
//                 className="h-20 w-auto object-contain border border-gray-300 rounded"
//                 onError={(e) => {
//                   console.error("Ecologi logo load error:", e.target.src);
//                 }}
//               />
//             )}
//             <label className="cursor-pointer bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700">
//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={handleEcologiLogoUpload}
//                 className="hidden"
//               />
//               {formData.ecologiLogo ? "Change Logo" : "Upload Ecologi Logo"}
//             </label>
//           </div>
//         </div>
//       </div>

//       {/* Payment Methods */}
//       <div className="mb-8">
//         <div className="mb-4">
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Payment Methods Heading
//           </label>
//           <input
//             type="text"
//             value={formData.paymentMethods.heading}
//             onChange={(e) =>
//               setFormData((prev) => ({
//                 ...prev,
//                 paymentMethods: {
//                   ...prev.paymentMethods,
//                   heading: e.target.value,
//                 },
//               }))
//             }
//             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
//           />
//         </div>

//         <div className="flex justify-between items-center mb-4">
//           <h3 className="text-lg font-semibold text-gray-700">
//             Payment Method Logos
//           </h3>
//           <button
//             onClick={handleAddPaymentLogo}
//             className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
//           >
//             <FaPlus /> Add Payment Logo
//           </button>
//         </div>

//         <div className="space-y-4">
//           {formData.paymentMethods.logos.map((logo, index) => (
//             <div
//               key={index}
//               className="border border-gray-300 rounded-lg p-4 bg-gray-50"
//             >
//               <div className="flex justify-between items-start mb-4">
//                 <h4 className="font-medium text-gray-700">
//                   Payment Logo #{index + 1}
//                 </h4>
//                 <div className="flex gap-2">
//                   <button
//                     onClick={() => handleMovePaymentLogo(index, "up")}
//                     disabled={index === 0}
//                     className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
//                     title="Move up"
//                   >
//                     <FaArrowUp />
//                   </button>
//                   <button
//                     onClick={() => handleMovePaymentLogo(index, "down")}
//                     disabled={
//                       index === formData.paymentMethods.logos.length - 1
//                     }
//                     className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
//                     title="Move down"
//                   >
//                     <FaArrowDown />
//                   </button>
//                   <button
//                     onClick={() => handleRemovePaymentLogo(index)}
//                     className="text-red-600 hover:text-red-800"
//                     title="Delete"
//                   >
//                     <FaTrash />
//                   </button>
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Payment Method Name
//                   </label>
//                   <input
//                     type="text"
//                     value={logo.name}
//                     onChange={(e) =>
//                       handlePaymentLogoChange(index, "name", e.target.value)
//                     }
//                     placeholder="e.g., Visa, PayPal"
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Logo Image
//                   </label>
//                   <div className="flex items-center gap-4">
//                     {logo.image && (
//                       <img
//                         key={logo.image}
//                         src={(() => {
//                           const imagePath = logo.image;
//                           if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
//                             return imagePath;
//                           }
//                           const cleanBackendUrl = backendUrl.replace(/\/$/, "");
//                           if (imagePath.startsWith("/uploads/")) {
//                             return `${cleanBackendUrl}${imagePath}`;
//                           }
//                           if (imagePath.startsWith("/footer/")) {
//                             return `${cleanBackendUrl}/uploads${imagePath}`;
//                           }
//                           if (imagePath.startsWith("/")) {
//                             return `${cleanBackendUrl}/uploads${imagePath}`;
//                           }
//                           return `${cleanBackendUrl}/uploads/${imagePath}`;
//                         })()}
//                         alt={`${logo.name} logo`}
//                         className="h-10 w-auto object-contain border border-gray-300 rounded"
//                         onError={(e) => {
//                           console.error("Payment logo load error:", e.target.src);
//                         }}
//                       />
//                     )}
//                     <label className="cursor-pointer bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 text-sm">
//                       <input
//                         type="file"
//                         accept="image/*"
//                         onChange={(e) => {
//                           if (e.target.files[0]) {
//                             handlePaymentLogoUpload(index, e.target.files[0]);
//                           }
//                         }}
//                         className="hidden"
//                       />
//                       {logo.image ? "Change Logo" : "Upload Logo"}
//                     </label>
//                   </div>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Status
//                   </label>
//                   <label className="flex items-center gap-2">
//                     <input
//                       type="checkbox"
//                       checked={logo.isActive}
//                       onChange={(e) =>
//                         handlePaymentLogoChange(
//                           index,
//                           "isActive",
//                           e.target.checked
//                         )
//                       }
//                       className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
//                     />
//                     <span className="text-sm text-gray-700">Active</span>
//                   </label>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Save Button */}
//       <div className="flex justify-end">
//         <button
//           onClick={handleSave}
//           disabled={isSaving}
//           className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-md"
//         >
//           {isSaving ? "Saving..." : "Save Section 5"}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Section5Editor;

const Section5Editor = ({ data, onSave, onUploadImage, backendUrl, isSaving }) => {
  return null;
};