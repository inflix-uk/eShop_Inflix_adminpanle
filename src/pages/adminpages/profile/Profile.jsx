import { useState } from "react";
import { Helmet } from "react-helmet-async";
import LoadingBar from "react-top-loading-bar";
import Side from "../nav/Side";
import Top from "../nav/Top";
import { useAuth } from "../../../context/Auth";
import { generateImageFromInitial } from "./utils/avatarUtils";
import { useProfile } from "./hooks/useProfile";
import ProfileHeader from "./components/ProfileHeader";
import ProfileForm from "./components/ProfileForm";
import ResetPasswordModal from "./components/ResetPasswordModal";

/**
 * Profile Page Component
 * Main page for viewing and editing user profile information
 */
export default function Profile() {
    const auth = useAuth();
    const [progress, setProgress] = useState(0);
    const [selectedPage, setSelectedPage] = useState("profile");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Use custom profile hook
    const {
        isEditMode,
        isModalOpen,
        formData,
        dateofBirth,
        oldPassword,
        newPassword,
        confirmPassword,
        toggleEditMode,
        handleInputChange,
        handleDateChange,
        handlePasswordChange,
        openModal,
        closeModal,
        saveProfile,
        resetPassword,
    } = useProfile(auth.user);

    // Generate avatar image from first name initial
    const imageUrl = generateImageFromInitial(
        formData.firstName.charAt(0).toUpperCase()
    );

    // Sidebar handlers
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    return (
        <>
            <LoadingBar
                color="#2563EB"
                progress={progress}
                onLoaderFinished={() => setProgress(0)}
            />
            <Helmet>
                <title>Profile | Admin</title>
            </Helmet>

            <Side
                selectedPage={selectedPage}
                setSelectedPage={setSelectedPage}
                isSidebarOpen={isSidebarOpen}
                closeSidebar={closeSidebar}
            />

            <div className={`lg:pl-72 ${isSidebarOpen ? 'pl-0' : ''}`}>
                <Top toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

                <main className="py-4 bg-gray-50">
                    <div className="px-4 sm:px-6 lg:px-8">
                        <form
                            onSubmit={(e) => e.preventDefault()}
                            className="space-y-4"
                        >
                            {/* Profile Header with Avatar and Buttons */}
                            <ProfileHeader
                                imageUrl={imageUrl}
                                isEditMode={isEditMode}
                                onEditClick={toggleEditMode}
                                onSaveClick={saveProfile}
                                onCancelClick={toggleEditMode}
                                onResetPasswordClick={openModal}
                            />

                            {/* Profile Form Fields */}
                            <ProfileForm
                                formData={formData}
                                dateofBirth={dateofBirth}
                                isEditMode={isEditMode}
                                onInputChange={handleInputChange}
                                onDateChange={handleDateChange}
                            />
                        </form>
                    </div>
                </main>
            </div>

            {/* Reset Password Modal */}
            <ResetPasswordModal
                isOpen={isModalOpen}
                onClose={closeModal}
                oldPassword={oldPassword}
                newPassword={newPassword}
                confirmPassword={confirmPassword}
                onOldPasswordChange={handlePasswordChange('old')}
                onNewPasswordChange={handlePasswordChange('new')}
                onConfirmPasswordChange={handlePasswordChange('confirm')}
                onSubmit={resetPassword}
            />
        </>
    );
}
