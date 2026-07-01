/**
 * PermissionsManagement Page
 * Manage permissions for each role
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Helmet } from "react-helmet-async";
import { toast } from 'react-toastify';
import Side from "../nav/Side";
import Top from "../nav/Top";
import { RoleSelector, PermissionSection, SaveButton } from './components';
import { getAllRoles, getRoleById } from './services/rolesService';
import {
    saveRolePermissions,
    buildPermissionsPayload,
    initializePermissions,
    isRolesPermission as checkIsRolesPermission,
    containsRolesPermission
} from './services/permissionsService';
import { PERMISSION_GROUPS } from './constants/permissionGroups';

const PermissionsManagement = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedPage] = useState("permissions");
    const [roles, setRoles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRole, setSelectedRole] = useState(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [rolePermissions, setRolePermissions] = useState({});
    const [selectedRoleName, setSelectedRoleName] = useState('');
    const hasFetchedRoles = useRef(false);

    // Handle role change
    const handleRoleChange = useCallback(async (roleId, roleName) => {
        try {
            setIsLoading(true);
            setSelectedRole(roleId);

            // Find the role name if not provided
            if (!roleName) {
                const role = roles.find(r => r._id === roleId);
                roleName = role ? role.name : '';
            }
            setSelectedRoleName(roleName);

            if (roleId) {
                const result = await getRoleById(roleId);

                if (result.success) {
                    const roleData = result.data;

                    // Initialize permissions using service function
                    const initializedPermissions = initializePermissions(
                        roleData,
                        PERMISSION_GROUPS,
                        roleName
                    );

                    setRolePermissions(prev => ({
                        ...prev,
                        [roleId]: initializedPermissions
                    }));
                } else {
                    toast.error(result.message);
                }
            } else {
                // Clear permissions if no role is selected
                setRolePermissions({});
            }

            setHasChanges(false);
        } catch (error) {
            toast.error("Failed to fetch role permissions: " + error.message);
        } finally {
            setIsLoading(false);
        }
    }, [roles]);

    // Fetch all roles
    const fetchRoles = useCallback(async () => {
        setIsLoading(true);
        const result = await getAllRoles();

        if (result.success) {
            setRoles(result.data);
            if (result.data.length > 0) {
                setSelectedRole(result.data[0]._id);
                setSelectedRoleName(result.data[0].name);
                await handleRoleChange(result.data[0]._id, result.data[0].name);
            }
        } else {
            toast.error(result.message);
        }

        setIsLoading(false);
    }, [handleRoleChange]);

    useEffect(() => {
        if (!hasFetchedRoles.current) {
            hasFetchedRoles.current = true;
            fetchRoles();
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Handle individual permission toggle
    const handlePermissionToggle = (permissionId) => {
        if (!selectedRole) return;

        // Check if this is a rolesandpermissions permission
        const isRolesPermission = checkIsRolesPermission(permissionId, PERMISSION_GROUPS);

        // If it's a rolesandpermissions permission, don't allow changes
        if (isRolesPermission) return;

        setRolePermissions(prev => ({
            ...prev,
            [selectedRole]: {
                ...prev[selectedRole],
                [permissionId]: !prev[selectedRole]?.[permissionId]
            }
        }));
        setHasChanges(true);
    };

    // Handle group permissions toggle
    const handleGroupPermissions = (groupPermissions, value) => {
        if (!selectedRole) return;

        // Check if any of these are rolesandpermissions permissions
        const hasRolesPermission = containsRolesPermission(groupPermissions, PERMISSION_GROUPS);

        // If it contains rolesandpermissions permissions, don't allow changes
        if (hasRolesPermission) return;

        const updatedPermissions = { ...rolePermissions[selectedRole] };
        groupPermissions.forEach(permission => {
            updatedPermissions[permission.id] = value;
        });

        setRolePermissions(prev => ({
            ...prev,
            [selectedRole]: updatedPermissions
        }));
        setHasChanges(true);
    };

    const handleGroupToggle = (groupPermissions, value) => {
        handleGroupPermissions(groupPermissions, value);
    };

    // Handle section-wide toggle
    const handleSectionToggle = (section, value) => {
        if (!selectedRole) return;

        // If it's the rolesandpermissions section, don't allow changes
        if (section === 'rolesandpermissions') return;

        const updatedPermissions = { ...rolePermissions[selectedRole] };
        PERMISSION_GROUPS[section].forEach(group => {
            group.permissions.forEach(permission => {
                updatedPermissions[permission.id] = value;
            });
        });

        setRolePermissions(prev => ({
            ...prev,
            [selectedRole]: updatedPermissions
        }));
        setHasChanges(true);
    };

    // Save permissions
    const savePermissions = async () => {
        if (!selectedRole) return;

        try {
            setIsLoading(true);

            // Get the selected role details
            const selectedRoleData = roles.find(role => role._id === selectedRole);

            // Build payload using service function
            const payload = buildPermissionsPayload(
                selectedRole,
                selectedRoleData?.name || selectedRoleName,
                rolePermissions[selectedRole] || {},
                PERMISSION_GROUPS
            );

            const result = await saveRolePermissions(payload);

            if (result.success) {
                toast.success(result.message);
                setHasChanges(false);
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("Failed to update permissions: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Sidebar handlers
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    const isAdministrator = selectedRoleName.toLowerCase() === 'administrator';
    const currentRolePermissions = rolePermissions[selectedRole] || {};

    return (
        <>
            <Helmet>
                <title>Permissions Management - Admin</title>
            </Helmet>

            <Side selectedPage={selectedPage} isSidebarOpen={isSidebarOpen} closeSidebar={closeSidebar} />

            <div className={`lg:pl-72 ${isSidebarOpen ? 'pl-0' : ''}`}>
                <Top toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

                <main className="py-10">
                    <div className="px-4 sm:px-6 lg:px-8">
                        {/* Header Section */}
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                                    Permissions Management
                                </h1>
                                <p className="mt-2 text-sm text-gray-700">
                                    Configure permissions for each role
                                </p>
                            </div>
                            <SaveButton
                                onClick={savePermissions}
                                hasChanges={hasChanges}
                                isLoading={isLoading}
                            />
                        </div>

                        {/* Role Selector */}
                        <RoleSelector
                            roles={roles}
                            selectedRole={selectedRole}
                            onChange={handleRoleChange}
                            hasChanges={hasChanges}
                        />

                        {/* Permissions Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Permissions Section */}
                            <PermissionSection
                                title="Permissions"
                                permissionGroups={PERMISSION_GROUPS.store}
                                rolePermissions={currentRolePermissions}
                                selectedRole={selectedRole}
                                onToggle={handlePermissionToggle}
                                onGroupToggle={handleGroupToggle}
                                onSectionToggle={(value) => handleSectionToggle('store', value)}
                                isRolesSection={false}
                                isAdministrator={isAdministrator}
                            />

                            {/* Roles and Permissions Section */}
                            <PermissionSection
                                title="Roles and Permissions"
                                permissionGroups={PERMISSION_GROUPS.rolesandpermissions}
                                rolePermissions={currentRolePermissions}
                                selectedRole={selectedRole}
                                onToggle={handlePermissionToggle}
                                onGroupToggle={handleGroupToggle}
                                onSectionToggle={(value) => handleSectionToggle('rolesandpermissions', value)}
                                isRolesSection={true}
                                isAdministrator={isAdministrator}
                            />

                            {/* Static Meta Section */}
                            <PermissionSection
                                title="Static Meta Permissions"
                                permissionGroups={PERMISSION_GROUPS.staticMeta}
                                rolePermissions={currentRolePermissions}
                                selectedRole={selectedRole}
                                onToggle={handlePermissionToggle}
                                onGroupToggle={handleGroupToggle}
                                onSectionToggle={(value) => handleSectionToggle('staticMeta', value)}
                                isRolesSection={false}
                                isAdministrator={isAdministrator}
                            />
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
};

export default PermissionsManagement;
