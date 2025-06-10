export const endpoints = {
    auth: {
        login: 'cms/adp/authorization/',
        validateRegistration: 'cms/adp/validate_registration/',
        sendCode: 'cms/adp/send_code/',
        verifyCode: 'cms/adp/verify_code/',
        registration: 'cms/adp/registration/',
        protected: 'cms/adp/protected/',
    },
    crm: {
        tasks: {
            sectionTasks: 'crm/tasks/section-tasks/',
            add_task:'crm/tasks/task-new/',
            add_section:'crm/tasks/section-new/',
            delete_task:'crm/tasks/delete-task/{id}/',
            delete_section:'crm/tasks/delete-section/{id}/',
            update_section:'crm/tasks/update-section/{id}/',
            add_subtask:'crm/tasks/new-subtask/',
            toggle_task:'crm/tasks/toggle-task/{id}/',
            update_task:'crm/tasks/update-task/{id}/',

        },
        projects:
        {
            allprojects:'crm/projects/project-all/',
            personalprojects:'crm/projects/project-personal/',
            invitedprojects:'crm/projects/project-invited/',
            addproject:'crm/projects/project-new-add/',
            delete_project:'crm/projects/delete-project/{id}/',
            leave_project:'crm/projects/leave-project/{id}/{project_id}',
            counttasks:'crm/projects/tasks-count/',
        }
    },
    expsys: {
        subjects: {
            allsubjects: '/expsys_module/subjects-all/',
            create:'/expsys_module/subject-create/',
            delete_subject:'/expsys_module/delete-subject/{id}/',
            create_competencies:'/expsys_module/competence-create/',
            create_indicator:'/expsys_module/indicator-create/',
            allcompenencies:'/expsys_module/subjectsindicators/',
            competencies:'/expsys_module/allcompetencies',
            countsubjectsind:'/expsys_module/indicator-subjects-count',
            indicators:'/expsys_module/allindicators',
            indicatorscompenencies:'/expsys_module/competenceindicators/',
            delete_competence:'/expsys_module/delete-competence/{id}/',
            delete_indicator:'/expsys_module/delete-indicator/{id}/',

        },
    
    },   
}; 