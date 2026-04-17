import { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import imageCompression from 'browser-image-compression';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const ADMIN_ID = '66cdf5f6dec61c826428d298';

/**
 * ReturnOrderMessageModal Component
 * Modal for starting/continuing a conversation about a return order
 */
const ReturnOrderMessageModal = ({ isOpen, onClose, returnOrder }) => {
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState('');
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [isSending, setIsSending] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);

    // Get user ID from return order
    const getUserId = useCallback(() => {
        return returnOrder?.requestOrder?.userId?._id || returnOrder?.userId || null;
    }, [returnOrder]);

    // Get conversation ID for return order (uses return_ prefix)
    const getConversationId = useCallback(() => {
        return returnOrder?._id ? `return_${returnOrder._id}` : null;
    }, [returnOrder]);

    // Fetch messages for this return order conversation
    const fetchMessages = useCallback(async () => {
        const userId = getUserId();
        const conversationId = getConversationId();

        if (!userId || !conversationId) return;

        setIsLoading(true);
        try {
            const response = await fetch(`${BACKEND_URL}get/messages/${userId}/${conversationId}`);
            const data = await response.json();

            if (data.messages) {
                const mappedMessages = data.messages.map((msg) => ({
                    ...msg,
                    files: (msg.attachments || []).map(
                        (attachment) => `${BACKEND_URL}${attachment.path}`
                    )
                }));
                setMessages(mappedMessages);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setIsLoading(false);
        }
    }, [getUserId, getConversationId]);

    // Fetch messages when modal opens
    useEffect(() => {
        if (isOpen && returnOrder) {
            fetchMessages();
        }
    }, [isOpen, returnOrder, fetchMessages]);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Handle file upload with compression
    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        const newFiles = [];

        for (const file of files) {
            if (file.type.startsWith('image/')) {
                try {
                    const options = {
                        maxSizeMB: 1,
                        maxWidthOrHeight: 1920,
                        useWebWorker: true
                    };
                    const compressedBlob = await imageCompression(file, options);
                    const finalFile = new File([compressedBlob], file.name, {
                        type: compressedBlob.type,
                        lastModified: compressedBlob.lastModified
                    });
                    newFiles.push(finalFile);
                } catch (error) {
                    console.error('Image compression error:', error);
                    newFiles.push(file);
                }
            } else {
                newFiles.push(file);
            }
        }

        setUploadedFiles((prev) => [...prev, ...newFiles]);
    };

    // Remove file from upload list
    const removeFile = (index) => {
        setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    // Send message
    const handleSendMessage = async () => {
        const userId = getUserId();
        const conversationId = getConversationId();

        if (!userId || (!messageText.trim() && uploadedFiles.length === 0)) return;
        if (isSending) return;

        setIsSending(true);

        try {
            const formData = new FormData();
            formData.append('sender', ADMIN_ID);
            formData.append('receiver', userId);
            formData.append('message', messageText);
            formData.append('orderId', conversationId);

            uploadedFiles.forEach((file) => formData.append('files', file));

            const response = await fetch(
                `${BACKEND_URL}send/messages/senderid/${userId}`,
                {
                    method: 'POST',
                    body: formData
                }
            );

            const data = await response.json();

            if (data.newMessage) {
                const newMessage = {
                    ...data.newMessage,
                    files: (data.newMessage.attachments || []).map(
                        (attachment) => `${BACKEND_URL}${attachment.path}`
                    )
                };

                setMessages((prev) => [...prev, newMessage]);
                setMessageText('');
                setUploadedFiles([]);
                toast.success('Message sent successfully');
            } else {
                toast.error('Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Error sending message');
        } finally {
            setIsSending(false);
        }
    };

    // Handle Enter key to send
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Format date for messages
    const formatMessageTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatMessageDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    // Check if file is image
    const isImage = (file) => {
        if (file instanceof File) {
            return file.type.startsWith('image/');
        }
        if (typeof file === 'string') {
            return /\.(jpg|jpeg|png|gif|webp)$/i.test(file);
        }
        return false;
    };

    if (!isOpen) return null;

    const customerName = returnOrder?.requestOrder?.userId
        ? `${returnOrder.requestOrder.userId.firstname || ''} ${returnOrder.requestOrder.userId.lastname || ''}`.trim()
        : returnOrder?.customerName || 'Customer';

    const hasUser = getUserId() !== null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl transform transition-all">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">
                                    Message - {returnOrder?.rma || 'Return Order'}
                                </h3>
                                <p className="text-sm text-blue-100">
                                    {customerName}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Return Order Info */}
                    <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                        <div className="flex flex-wrap gap-4 text-sm">
                            <div>
                                <span className="text-gray-500">RMA:</span>
                                <span className="ml-1 font-medium text-gray-900">{returnOrder?.rma}</span>
                            </div>
                            {returnOrder?.orderNumber && (
                                <div>
                                    <span className="text-gray-500">Order:</span>
                                    <span className="ml-1 font-medium text-gray-900">{returnOrder.orderNumber}</span>
                                </div>
                            )}
                            <div>
                                <span className="text-gray-500">Status:</span>
                                <span className={`ml-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                                    returnOrder?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    returnOrder?.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                                    returnOrder?.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                    {returnOrder?.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* No User Warning */}
                    {!hasUser && (
                        <div className="px-6 py-4 bg-yellow-50 border-b border-yellow-200">
                            <div className="flex items-center gap-2 text-yellow-800">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <span className="text-sm font-medium">
                                    No user account linked to this return order. Messages cannot be sent.
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Messages Area */}
                    <div className="h-80 overflow-y-auto px-6 py-4 bg-gray-50">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                                </svg>
                                <p className="text-sm">No messages yet</p>
                                <p className="text-xs text-gray-400 mt-1">Start the conversation about this return order</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {messages.map((msg, index) => {
                                    const isAdmin = msg.sender === ADMIN_ID;
                                    const showDate = index === 0 ||
                                        formatMessageDate(msg.createdAt) !== formatMessageDate(messages[index - 1].createdAt);

                                    return (
                                        <div key={msg._id}>
                                            {showDate && (
                                                <div className="flex justify-center my-4">
                                                    <span className="px-3 py-1 text-xs text-gray-500 bg-gray-200 rounded-full">
                                                        {formatMessageDate(msg.createdAt)}
                                                    </span>
                                                </div>
                                            )}
                                            <div className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                                <div
                                                    className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                                                        isAdmin
                                                            ? 'bg-blue-600 text-white rounded-br-md'
                                                            : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
                                                    }`}
                                                >
                                                    {msg.message && (
                                                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                                    )}
                                                    {msg.files && msg.files.length > 0 && (
                                                        <div className="mt-2 space-y-2">
                                                            {msg.files.map((file, i) => (
                                                                isImage(file) ? (
                                                                    <img
                                                                        key={i}
                                                                        src={file}
                                                                        alt="Attachment"
                                                                        className="max-w-full rounded-lg cursor-pointer hover:opacity-90"
                                                                        onClick={() => window.open(file, '_blank')}
                                                                    />
                                                                ) : (
                                                                    <a
                                                                        key={i}
                                                                        href={file}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className={`flex items-center gap-2 text-sm ${
                                                                            isAdmin ? 'text-blue-100 hover:text-white' : 'text-blue-600 hover:text-blue-800'
                                                                        }`}
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                                        </svg>
                                                                        Attachment
                                                                    </a>
                                                                )
                                                            ))}
                                                        </div>
                                                    )}
                                                    <p className={`text-xs mt-1 ${isAdmin ? 'text-blue-200' : 'text-gray-400'}`}>
                                                        {formatMessageTime(msg.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    {/* Uploaded Files Preview */}
                    {uploadedFiles.length > 0 && (
                        <div className="px-6 py-2 bg-gray-100 border-t border-gray-200">
                            <div className="flex flex-wrap gap-2">
                                {uploadedFiles.map((file, index) => (
                                    <div
                                        key={index}
                                        className="relative group bg-white rounded-lg p-2 border border-gray-200"
                                    >
                                        {isImage(file) ? (
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={file.name}
                                                className="h-16 w-16 object-cover rounded"
                                            />
                                        ) : (
                                            <div className="h-16 w-16 flex items-center justify-center bg-gray-100 rounded">
                                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                        )}
                                        <button
                                            onClick={() => removeFile(index)}
                                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="px-6 py-4 border-t border-gray-200 bg-white rounded-b-xl">
                        <div className="flex items-end gap-3">
                            {/* File Upload Button */}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={!hasUser}
                                className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                </svg>
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                multiple
                                className="hidden"
                                accept="image/*,.pdf,.doc,.docx"
                            />

                            {/* Message Input */}
                            <div className="flex-1">
                                <textarea
                                    value={messageText}
                                    onChange={(e) => setMessageText(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={hasUser ? "Type your message..." : "Cannot send messages - no user linked"}
                                    disabled={!hasUser}
                                    rows={1}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    style={{ minHeight: '40px', maxHeight: '120px' }}
                                />
                            </div>

                            {/* Send Button */}
                            <button
                                onClick={handleSendMessage}
                                disabled={!hasUser || isSending || (!messageText.trim() && uploadedFiles.length === 0)}
                                className="flex-shrink-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSending ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

ReturnOrderMessageModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    returnOrder: PropTypes.shape({
        _id: PropTypes.string,
        rma: PropTypes.string,
        orderNumber: PropTypes.string,
        customerName: PropTypes.string,
        status: PropTypes.string,
        userId: PropTypes.string,
        requestOrder: PropTypes.shape({
            userId: PropTypes.shape({
                _id: PropTypes.string,
                firstname: PropTypes.string,
                lastname: PropTypes.string
            })
        })
    })
};

export default ReturnOrderMessageModal;
