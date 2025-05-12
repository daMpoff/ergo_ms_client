export const endpoints = {
    auth: {
        login: 'cms/adp/authorization/',
        validateRegistration: 'cms/adp/validate_registration/',
        sendCode: 'cms/adp/send_code/',
        verifyCode: 'cms/adp/verify_code/',
        registration: 'cms/adp/registration/',
        protected: 'cms/adp/protected/',
    },
    cms: {
        checkAccessToPage: 'cms/check_access_to_page/',
        checkAccessToComponent: 'cms/check_access_to_component/',
        checkAccessToAdminPanel: 'cms/check_access_to_admin_panel/',
        
        addGroupCategory: 'cms/post_group_category/',
        changeGroupCategory: 'cms/change_group_category/',
        deleteGroupCategory: 'cms/delete_group_category/',
        getGroupCategories: 'cms/get_group_categories/',
        
        addGroup: 'cms/add_group/',
        deleteGroup: 'cms/delete_group/',
        getGroups: 'cms/get_groups/',
        changeGroup: 'cms/change_group/',

        addPermission: 'cms/add_permission/',
        deletePermission: 'cms/delete_permission/',
        changePermission: 'cms/change_permission/',
        getPermissions: 'cms/get_permissions/',

        addUserPermission: 'cms/add_user_permission/',
        removeUserPermission: 'cms/remove_user_permission/',
        addUserGroup: 'cms/add_user_group/',
        removeUserGroup: 'cms/remove_user_group/',
        getUserGroupsAndPermissions: 'cms/get_user_groups_and_permissions/',
        getUserGroups: 'cms/get_user_groups/',
        getUserPermissions: 'cms/get_user_permissions/',

        addGroupsPermissions: 'cms/add_groups_permissions/',
        removeGroupsPermissions: 'cms/remove_groups_permissions/',
        getPermissionsByCategory: 'cms/get_permissions_by_category/',
        getUserName: 'cms/get_user_name/',
    },
    expsys: {
        getSkills: 'expsys_module/get-skills',
        addUserSkill: 'expsys_module/add-user-skill',
        getUserSkills: 'expsys_module/get-user-skills',
        getUserNewSkills: 'expsys_module/get-user-new-skills',
        putskillresult: 'expsys_module/put-skill-result'
    }
}; 