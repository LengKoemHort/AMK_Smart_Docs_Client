// // This has been depreciated and use the message-card.tsx instead
// import { ChatMessage } from "@/types/message-type";
// import { Bot, Copy, ThumbsUp, ThumbsDown, Share } from "lucide-react";
// import Image from "next/image";
// import React, { useState } from "react";
// import PDFViewer from "@/components/PDFViewer/PDFViewer";
// import PDFModal from "@/app/(main)/_document-management/(components)/pdf-modal";
// import { viewDocumentDownloadPrivilege } from "@/services/documents/document.service";

// interface MessageCardProps {
//   messages: ChatMessage[];
//   userRole?: "admin" | "downloader" | "user"; // Add role prop
// }

// export default function MessageCard({ messages, userRole = "user" }: MessageCardProps) {
//   const [copiedMessage, setCopiedMessage] = useState<string | null>(null);
//   const [selectedPdf, setSelectedPdf] = useState<{
//     url: string;
//     name: string;
//   } | null>(null);
  
//   // State for PDFModal (view-only)
//   const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);
//   const [selectedDocumentId, setSelectedDocumentId] = useState("");

//   const handleCopyMessage = async (content: string, messageId: string) => {
//     try {
//       await navigator.clipboard.writeText(content);
//       setCopiedMessage(messageId);
//       setTimeout(() => setCopiedMessage(null), 2000);
//     } catch (err) {
//       console.error("Failed to copy message:", err);
//     }
//   };

//   // Handle PDF viewing based on user role
//   const handleViewPdf = async (pdfUrl: string, fileName: string, documentId?: string) => {
//     if (userRole === "admin" || userRole === "downloader") {
//       // For admin/downloader: Use PDFViewer with download capability
//       if (documentId) {
//         // If we have documentId, trigger download privilege
//         try {
//           await viewDocumentDownloadPrivilege(documentId);
//         } catch (error) {
//           console.error("Failed to access document:", error);
//           // Fallback to regular PDFViewer
//           setSelectedPdf({ url: pdfUrl, name: fileName });
//         }
//       } else {
//         // Use regular PDFViewer
//         setSelectedPdf({ url: pdfUrl, name: fileName });
//       }
//     } else {
//       // For regular users: Use PDFModal (view-only, no download)
//       if (documentId) {
//         setSelectedDocumentId(documentId);
//         setIsPDFModalOpen(true);
//       } else {
//         // If no documentId, show error or fallback
//         console.warn("Document ID required for view-only access");
//         // You could show a toast/notification here
//       }
//     }
//   };

//   // Mock PDF files for demonstration - in real app, this would come from props or API
//   const mockPdfFiles = [
//     {
//       name: "Memo_012-Mini Agent_2024",
//       size: "2.4 MB",
//       publishedDate: "2012-06-21",
//       url: "/E-GEN 2025 .pdf",
//       documentId: "doc_123", // Add document ID for API calls
//     },
//   ];

//   return (
//     <div className="flex flex-col gap-4 sm:gap-6">
//       {messages.map((message) => (
//         <div key={message.id} className="w-full">
//           <div
//             className={`max-w-[85%] sm:max-w-[80%] flex items-end gap-2 sm:gap-3 py-1 sm:py-2
//                         ${
//                           message.sender === "user"
//                             ? "ml-auto flex-row-reverse"
//                             : "mr-auto flex-row"
//                         }`}
//           >
//             {/* Bot avatar/icon */}
//             {message.sender === "bot" && (
//               <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-[#EDD8E2] rounded-full flex items-center justify-center shadow-sm">
//                 <Bot className="text-[#A53C6F] w-5 h-5 sm:w-7 sm:h-7" />
//               </div>
//             )}

//             <div className="flex flex-col max-w-full min-w-0">
//               <div
//                 className={`flex flex-col px-3 py-2 sm:px-4 sm:py-3 shadow-xs
//                                 ${
//                                   message.sender === "user"
//                                     ? "bg-[#A53C6F] text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-none"
//                                     : "text-black font-normal border-gray-100 border rounded-tl-2xl rounded-tr-2xl rounded-bl-none rounded-br-2xl"
//                                 }`}
//               >
//                 <span className="whitespace-pre-line break-words text-sm sm:text-base leading-relaxed">
//                   {message.content}
//                 </span>
//                 {/* Show timestamp only for user messages */}
//                 {message.sender === "user" && (
//                   <span className="text-xs opacity-75 mt-2 text-right">
//                     {message.timestamp}
//                   </span>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* PDF Files showcase */}
//           {message.sender === "bot" &&
//             message.content.toLowerCase().includes("file") && (
//               <div className="mr-auto flex">
//                 {/* pdf display */}
//                 <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 mr-2 sm:mr-3"></div>

//                 <div className="space-y-2 max-w-sm sm:max-w-md">
//                   {mockPdfFiles.map((file, index) => (
//                     <div
//                       key={index}
//                       className="flex items-center gap-2 p-1 pr-3 rounded-2xl border border-gray-200 hover:border-[#A53C6F]/30 hover:bg-[#A53C6F]/5 transition-all duration-200 cursor-pointer"
//                       onClick={() => handleViewPdf(file.url, file.name, file.documentId)}
//                     >
//                       <div className="flex-shrink-0">
//                         <Image
//                           src="/PDFicon.svg"
//                           alt="PDF"
//                           width={40}
//                           height={40}
//                           className="w-10 h-10 sm:w-12 sm:h-12"
//                         />
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <p
//                           className="text-sm sm:text-base font-medium text-gray-900 truncate mb-1 hover:text-[#A53C6F] transition-colors"
//                           title={file.name}
//                         >
//                           {file.name}
//                         </p>
//                         <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
//                           <span className="font-medium">{file.size}</span>
//                           <span>•</span>
//                           {message.published_date?.trim() && (
//                             <div className="text-primary">
//                               <span className="text-primary text-sm m-1">
//                                 Published:{" "}
//                                 {message.published_date
//                                   ? new Date(
//                                       message.published_date
//                                     ).toLocaleDateString("en-GB", {
//                                       day: "2-digit",
//                                       month: "2-digit",
//                                       year: "numeric",
//                                     })
//                                   : ""}
//                               </span>
//                             </div>
//                           )}
//                         </div>
//                       </div>
                      
//                       {/* Role indicator (optional visual feedback) */}
//                       <div className="flex-shrink-0">
//                         {userRole === "admin" || userRole === "downloader" ? (
//                           <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
//                             Download
//                           </span>
//                         ) : (
//                           <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
//                             View Only
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//           {/* Action buttons for bot messages */}
//           {message.sender === "bot" && (
//             <div className="mr-auto flex mt-2">
//               {/* Avatar spacer to align with message */}
//               <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 mr-2 sm:mr-3"></div>

//               <div className="flex flex-col">
//                 <div className="flex items-center gap-5">
//                   <button
//                     onClick={() =>
//                       handleCopyMessage(message.content, message.id)
//                     }
//                     className="text-gray-600 hover:text-gray-800 transition-all duration-200 hover:scale-125 "
//                     title="Copy message"
//                   >
//                     <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
//                   </button>
//                   <button
//                     className="text-gray-600 hover:text-green-600 transition-all duration-200 hover:scale-125 "
//                     title="Good response"
//                   >
//                     <ThumbsUp className="w-3 h-3 sm:w-4 sm:h-4" />
//                   </button>
//                   <button
//                     className="text-gray-600 hover:text-red-600 transition-all duration-200 hover:scale-125 "
//                     title="Poor response"
//                   >
//                     <ThumbsDown className="w-3 h-3 sm:w-4 sm:h-4" />
//                   </button>
//                   <button
//                     className="text-gray-600 hover:text-blue-600 transition-all duration-200 hover:scale-125 "
//                     title="Share message"
//                   >
//                     <Share className="w-3 h-3 sm:w-4 sm:h-4" />
//                   </button>
//                 </div>

//                 {/* Copy confirmation */}
//                 {copiedMessage === message.id && (
//                   <div className="text-xs sm:text-sm text-green-600 mt-2 font-medium">
//                     ✓ Copied to clipboard
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       ))}

//       {/* PDF Viewer Modal for Admin/Downloader (with download capability) */}
//       {selectedPdf && (userRole === "admin" || userRole === "downloader") && (
//         <PDFViewer
//           isOpen={!!selectedPdf}
//           onClose={() => setSelectedPdf(null)}
//           pdfUrl={selectedPdf.url}
//           fileName={selectedPdf.name}
//         />
//       )}

//       {/* PDF Modal for regular users (view-only, no download) */}
//       <PDFModal 
//         isOpen={isPDFModalOpen}
//         onClose={() => {
//           setIsPDFModalOpen(false);
//           setSelectedDocumentId("");
//         }}
//         documentId={selectedDocumentId}
//       />
//     </div>
//   );
// }